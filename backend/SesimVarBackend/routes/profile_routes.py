from flask import Blueprint, request, jsonify
from db import get_db_connection
from auth import token_required

profile_bp = Blueprint('profile', __name__, url_prefix='/user')

# 🔍 Profil Getirme
@profile_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    """
    Profil Getir
    ---
    tags:
      - Kullanıcı
    security:
      - Bearer: []
    responses:
      200:
        description: Profil bilgisi getirildi
      404:
        description: Kullanıcı bulunamadı
    """
    try:
        user_id = request.user_id
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, tc_no, full_name, phone_number FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        conn.close()

        if not user:
            return jsonify({"status": "error", "message": "Kullanıcı bulunamadı."}), 404

        return jsonify({"status": "success", "message": "Profil getirildi.", "data": user}), 200

    except Exception as e:
        print(f"[GET_PROFILE ERROR] {str(e)}")
        return jsonify({"status": "error", "message": "Profil alınırken hata oluştu."}), 500
