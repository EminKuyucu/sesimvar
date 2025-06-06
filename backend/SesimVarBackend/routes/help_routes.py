from flask import Blueprint, request, jsonify
from db import get_db_connection
from auth import token_required

help_bp = Blueprint('help', __name__, url_prefix='/user')

# 🔸 Yeni Yardım Çağrısı
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
      400:
        description: Eksik bilgi
    """
    try:
        user_id = request.user_id
        data = request.json
        message = data.get('message')
        latitude = data.get('latitude')
        longitude = data.get('longitude')

        if not all([message, latitude, longitude]):
            return jsonify({"status": "error", "message": "Tüm alanlar zorunlu."}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO help_requests (user_id, message, latitude, longitude, created_at)
            VALUES (%s, %s, %s, %s, NOW())
        """, (user_id, message, latitude, longitude))
        conn.commit()
        conn.close()

        return jsonify({"status": "success", "message": "Yardım çağrısı oluşturuldu."}), 201

    except Exception as e:
        print(f"[HELP_CALL ERROR] {str(e)}")
        return jsonify({"status": "error", "message": "İşlem başarısız."}), 500

# 🔹 Yardım Çağrılarını Getir
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
        cursor.execute("SELECT id, message, latitude, longitude, created_at FROM help_requests WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
        data = cursor.fetchall()
        conn.close()

        return jsonify({"status": "success", "message": "Veriler getirildi", "data": data}), 200

    except Exception as e:
        print(f"[GET_HELP_CALLS ERROR] {str(e)}")
        return jsonify({"status": "error", "message": "Veri alınamadı"}), 500

# 🔄 Yardım Çağrısı Güncelle
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
      400:
        description: Eksik bilgi
      404:
        description: Kayıt bulunamadı
    """
    try:
        user_id = request.user_id
        data = request.json
        message = data.get('message')
        latitude = data.get('latitude')
        longitude = data.get('longitude')

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
        print(f"[UPDATE_HELP_CALL ERROR] {str(e)}")
        return jsonify({"status": "error", "message": "Güncelleme hatası"}), 500

# ❌ Yardım Çağrısı Sil
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
      404:
        description: Kayıt bulunamadı
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
        print(f"[DELETE_HELP_CALL ERROR] {str(e)}")
        return jsonify({"status": "error", "message": "Silme sırasında hata"}), 500
