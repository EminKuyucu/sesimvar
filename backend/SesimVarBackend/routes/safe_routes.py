from flask import Blueprint, request, jsonify
from db import get_db_connection
from auth import token_required

safe_bp = Blueprint('safe', __name__, url_prefix='/user')

# ✅ Güvendeyim Bildirimi Gönder
@safe_bp.route('/safe-status', methods=['POST'])
@token_required
def create_safe_status():
    """
    Güvendeyim Bildirimi Gönder
    ---
    tags:
      - Güvende
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
            latitude:
              type: number
              example: 37.002
            longitude:
              type: number
              example: 35.322
    responses:
      201:
        description: Bildirim gönderildi
      400:
        description: Eksik bilgi
    """
    try:
        user_id = request.user_id
        data = request.json
        latitude = data.get('latitude')
        longitude = data.get('longitude')

        if not all([latitude, longitude]):
            return jsonify({"status": "error", "message": "Konum bilgisi gerekli."}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO safe_status (user_id, latitude, longitude, created_at)
            VALUES (%s, %s, %s, NOW())
        """, (user_id, latitude, longitude))
        conn.commit()
        conn.close()

        return jsonify({"status": "success", "message": "Bildiriminiz alındı."}), 201

    except Exception as e:
        print(f"[SAFE_STATUS ERROR] {str(e)}")
        return jsonify({"status": "error", "message": "İşlem başarısız."}), 500


# ✅ Güvendeyim Verilerini Getir (Harita uyumlu)
@safe_bp.route('/safe-status', methods=['GET'])
@token_required
def get_safe_status():
    """
    Güvendeyim Bildirimlerini Getir
    ---
    tags:
      - Güvende
    security:
      - Bearer: []
    responses:
      200:
        description: Veriler getirildi
    """
    try:
        user_id = request.user_id
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, user_id, latitude, longitude, created_at 
            FROM safe_status 
            WHERE user_id = %s 
            ORDER BY created_at DESC
        """, (user_id,))
        result = cursor.fetchall()
        conn.close()

        # ✅ Harita uyumlu JSON cevabı
        formatted = []
        for row in result:
            created = row["created_at"]
            created_str = created.strftime("%Y-%m-%d %H:%M:%S") if created else None

            formatted.append({
                "id": row["id"],
                "user_id": row["user_id"],
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "created_at": created_str
            })

        return jsonify({
            "status": "success",
            "message": "Veriler getirildi",
            "data": formatted
        }), 200

    except Exception as e:
        print(f"[GET_SAFE_STATUS ERROR] {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Veri alınamadı"
        }), 500
