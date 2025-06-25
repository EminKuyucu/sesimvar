# routes/help_routes.py

from flask import Blueprint, request, jsonify
from db import get_db_connection
from auth import token_required

help_bp = Blueprint('help', __name__, url_prefix='/user')

# 🔍 AI destekli risk analiz fonksiyonları
def classify_zone_risk(latitude, longitude, conn):
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT COUNT(*) AS nearby_calls
        FROM help_requests
        WHERE ABS(latitude - %s) < 0.01 AND ABS(longitude - %s) < 0.01
    """, (latitude, longitude))
    count = cursor.fetchone()["nearby_calls"]

    if count > 20:
        return "yüksek"
    elif count > 10:
        return "orta"
    else:
        return "düşük"

def determine_user_risk(message):
    critical_words = ["enkaz", "yangın", "nefes", "kan", "yaralı", "çökme", "sıkıştım"]
    for word in critical_words:
        if word in message.lower():
            return "kritik"
    return "orta"

# 🔸 POST - Yardım Çağrısı Oluştur
@help_bp.route('/help-calls', methods=['POST'])
@token_required
def create_help_call():
    """
    Yardım Çağrısı Oluştur
    ---
    tags:
      - Yardım
    security:
      - Bearer: []
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Enkaz altındayım"
            latitude:
              type: number
              example: 37.001
            longitude:
              type: number
              example: 35.321
    responses:
      201:
        description: Çağrı oluşturuldu
    """
    try:
        user_id = request.user_id
        data = request.get_json()
        message = data.get("message")
        latitude = data.get("latitude")
        longitude = data.get("longitude")

        if not all([message, latitude, longitude]):
            return jsonify({"status": "error", "message": "Tüm alanlar zorunludur."}), 400

        conn = get_db_connection()
        zone_risk = classify_zone_risk(latitude, longitude, conn)
        user_risk = determine_user_risk(message)

        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO help_requests (user_id, message, latitude, longitude, zone_risk, user_risk, status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
        """, (user_id, message, latitude, longitude, zone_risk, user_risk, "aktif"))
        conn.commit()
        conn.close()

        return jsonify({
            "status": "success",
            "message": "Yardım çağrısı oluşturuldu.",
            "zone_risk": zone_risk,
            "user_risk": user_risk
        }), 201

    except Exception as e:
        print(f"[HELP_CALL ERROR] {str(e)}")
        return jsonify({"status": "error", "message": "İşlem başarısız"}), 500

# 🔹 GET - Yardım Çağrılarını Getir
@help_bp.route('/help-calls', methods=['GET'])
@token_required
def get_help_calls():
    """
    Yardım Çağrılarını Getir
    ---
    tags:
      - Yardım
    security:
      - Bearer: []
    responses:
      200:
        description: Yardım verileri getirildi
    """
    try:
        user_id = request.user_id
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, user_id, message, latitude, longitude, status, created_at 
            FROM help_requests 
            WHERE user_id = %s 
            ORDER BY created_at DESC
        """, (user_id,))
        result = cursor.fetchall()
        conn.close()

        formatted = []
        for row in result:
            created = row["created_at"]
            created_str = created.strftime("%Y-%m-%d %H:%M:%S") if created else None

            formatted.append({
                "id": row["id"],
                "user_id": row["user_id"],
                "message": row["message"],
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "status": row["status"],
                "created_at": created_str
            })

        return jsonify({"status": "success", "message": "Veriler getirildi", "data": formatted}), 200

    except Exception as e:
        print(f"[GET_HELP_CALLS ERROR] {str(e)}")
        return jsonify({"status": "error", "message": "Veri alınamadı"}), 500

# 🔄 PUT - Yardım Çağrısı Güncelle
@help_bp.route('/help-calls/<int:help_id>', methods=['PUT'])
@token_required
def update_help_call(help_id):
    """
    Yardım Çağrısı Güncelle
    ---
    tags:
      - Yardım
    security:
      - Bearer: []
    parameters:
      - name: help_id
        in: path
        type: integer
        required: true
        description: Güncellenecek çağrı ID'si
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Durum değişti"
            latitude:
              type: number
              example: 37.123
            longitude:
              type: number
              example: 35.987
    responses:
      200:
        description: Güncelleme başarılı
    """
    try:
        user_id = request.user_id
        data = request.get_json()
        message = data.get("message")
        latitude = data.get("latitude")
        longitude = data.get("longitude")

        if not all([message, latitude, longitude]):
            return jsonify({"status": "error", "message": "Lütfen tüm alanları girin."}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM help_requests WHERE id = %s AND user_id = %s", (help_id, user_id))
        existing = cursor.fetchone()

        if not existing:
            conn.close()
            return jsonify({"status": "error", "message": "Yardım çağrısı bulunamadı."}), 404

        cursor.execute("""
            UPDATE help_requests
            SET message = %s, latitude = %s, longitude = %s
            WHERE id = %s AND user_id = %s
        """, (message, latitude, longitude, help_id, user_id))
        conn.commit()
        conn.close()

        return jsonify({"status": "success", "message": "Güncellendi."}), 200

    except Exception as e:
        print(f"[UPDATE_HELP_CALL ERROR] {e}")
        return jsonify({"status": "error", "message": "Güncelleme hatası"}), 500

# 🔄 PUT - Yardım Durumu Güncelle
@help_bp.route('/help-calls/<int:help_id>/status', methods=['PUT'])
@token_required
def update_help_status(help_id):
    """
    Yardım Durumu Güncelle
    ---
    tags:
      - Yardım
    security:
      - Bearer: []
    parameters:
      - name: help_id
        in: path
        required: true
        type: integer
        description: Yardım çağrısı ID
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            status:
              type: string
              example: "tamamlandı"  # aktif, tamamlandı, iptal
    responses:
      200:
        description: Durum güncellendi
    """
    try:
        user_id = request.user_id
        data = request.get_json()
        new_status = data.get("status")

        if not new_status:
            return jsonify({"status": "error", "message": "Yeni durum girilmedi."}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE help_requests
            SET status = %s
            WHERE id = %s AND user_id = %s
        """, (new_status, help_id, user_id))
        conn.commit()
        conn.close()

        return jsonify({"status": "success", "message": "Durum güncellendi."}), 200

    except Exception as e:
        print(f"[UPDATE_STATUS ERROR] {str(e)}")
        return jsonify({"status": "error", "message": "Durum güncellenemedi."}), 500

# ❌ DELETE - Yardım Çağrısı Sil
@help_bp.route('/help-calls/<int:help_id>', methods=['DELETE'])
@token_required
def delete_help_call(help_id):
    """
    Yardım Çağrısı Sil
    ---
    tags:
      - Yardım
    security:
      - Bearer: []
    parameters:
      - name: help_id
        in: path
        type: integer
        required: true
        description: Silinecek çağrı ID'si
    responses:
      200:
        description: Silme başarılı
    """
    try:
        user_id = request.user_id
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM help_requests WHERE id = %s AND user_id = %s", (help_id, user_id))
        existing = cursor.fetchone()

        if not existing:
            conn.close()
            return jsonify({"status": "error", "message": "Çağrı bulunamadı."}), 404

        cursor.execute("DELETE FROM help_requests WHERE id = %s", (help_id,))
        conn.commit()
        conn.close()

        return jsonify({"status": "success", "message": "Silindi."}), 200

    except Exception as e:
        print(f"[DELETE_HELP_CALL ERROR] {e}")
        return jsonify({"status": "error", "message": "Silme sırasında hata"}), 500
