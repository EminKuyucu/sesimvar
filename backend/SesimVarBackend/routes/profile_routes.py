# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify
from db import get_db_connection
from auth import token_required

profile_bp = Blueprint('profile', __name__, url_prefix='/user')

# 🔍 GET /user/profile
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
        cursor.execute("""
            SELECT id, tc_no, full_name, phone_number, blood_type, health_status
            FROM users WHERE id = %s
        """, (user_id,))
        user = cursor.fetchone()
        conn.close()

        if not user:
            return jsonify({"status": "error", "message": "Kullanıcı bulunamadı."}), 404

        return jsonify({
            "status": "success",
            "message": "Profil getirildi.",
            "data": user
        }), 200

    except Exception as e:
        print(f"[GET_PROFILE ERROR] {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Profil alınırken hata oluştu."
        }), 500


# ❌ DELETE /user/profile
@profile_bp.route('/profile', methods=['DELETE'])
@token_required
def delete_profile():
    """
    Hesap Sil
    ---
    tags:
      - Kullanıcı
    security:
      - Bearer: []
    responses:
      200:
        description: Hesap başarıyla silindi
      401:
        description: Token eksik veya geçersiz
      500:
        description: Sunucu hatası
    """
    try:
        user_id = request.user_id
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        conn.close()

        return jsonify({
            "status": "success",
            "message": "Hesap silindi. Oturum sonlandırıldı."
        }), 200

    except Exception as e:
        print("Hesap silme hatası:", e)
        return jsonify({
            "status": "error",
            "message": "Hesap silinemedi"
        }), 500


# 🔧 PUT /user/profile
@profile_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    """
    Profil Güncelle
    ---
    tags:
      - Kullanıcı
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        description: Güncellenecek kullanıcı bilgileri
        schema:
          type: object
          properties:
            full_name:
              type: string
              example: Ahmet Yılmaz
            tc_no:
              type: string
              example: "12345678901"
            phone_number:
              type: string
              example: "05001234567"
            blood_type:
              type: string
              example: "A+"
            health_status:
              type: string
              example: Astım hastası
    responses:
      200:
        description: Profil başarıyla güncellendi
      400:
        description: Güncellenecek bilgi bulunamadı
      401:
        description: Token eksik veya geçersiz
      500:
        description: Sunucu hatası
    """
    try:
        user_id = request.user_id
        data = request.get_json()

        fields = ['full_name', 'tc_no', 'phone_number', 'blood_type', 'health_status']
        updates = {k: data[k] for k in fields if k in data}

        if not updates:
            return jsonify({
                "status": "error",
                "message": "Güncellenecek bilgi bulunamadı."
            }), 400

        set_clause = ", ".join([f"{field} = %s" for field in updates])
        values = list(updates.values()) + [user_id]

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(f"UPDATE users SET {set_clause} WHERE id = %s", values)
        conn.commit()
        conn.close()

        return jsonify({
            "status": "success",
            "message": "Profil bilgileri güncellendi"
        }), 200

    except Exception as e:
        print("Profil güncelleme hatası:", e)
        return jsonify({
            "status": "error",
            "message": "Profil güncellenemedi"
        }), 500
