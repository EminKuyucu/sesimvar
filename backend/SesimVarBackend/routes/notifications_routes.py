# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify
from db import get_db_connection
from auth import token_required

notifications_bp = Blueprint('notifications', __name__, url_prefix='/user')


# 🔹 GET - Bildirim Ayarlarını Getir
@notifications_bp.route('/notifications', methods=['GET'])
@token_required
def get_notification_settings():
    """
    Bildirim Ayarlarını Getir
    ---
    tags:
      - Bildirim
    security:
      - Bearer: []
    responses:
      200:
        description: Bildirim ayarları getirildi
        schema:
          type: object
          properties:
            general:
              type: boolean
              example: false
            emergency:
              type: boolean
              example: true
            silentMode:
              type: boolean
              example: false
      500:
        description: Sunucu hatası
    """
    try:
        user_id = request.user_id
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM notification_settings WHERE user_id = %s", (user_id,))
        settings = cursor.fetchone()
        conn.close()

        if not settings:
            return jsonify({
                "general": False,
                "emergency": True,
                "silentMode": False
            }), 200

        return jsonify({
            "general": bool(settings["general"]),
            "emergency": bool(settings["emergency"]),
            "silentMode": bool(settings["silent_mode"])
        }), 200

    except Exception as e:
        print(f"[NOTIFICATIONS_GET_ERROR] {e}")
        return jsonify({"message": "Sunucu hatası"}), 500


# 🔄 PUT - Bildirim Ayarlarını Güncelle
@notifications_bp.route('/notifications', methods=['PUT'])
@token_required
def update_notification_settings():
    """
    Bildirim Ayarlarını Güncelle
    ---
    tags:
      - Bildirim
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
            general:
              type: boolean
              example: false
            emergency:
              type: boolean
              example: true
            silentMode:
              type: boolean
              example: false
    responses:
      200:
        description: Ayarlar başarıyla güncellendi
      500:
        description: Sunucu hatası
    """
    try:
        user_id = request.user_id
        data = request.get_json()

        general = data.get("general", False)
        emergency = data.get("emergency", True)
        silent_mode = data.get("silentMode", False)

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM notification_settings WHERE user_id = %s", (user_id,))
        exists = cursor.fetchone()

        if exists:
            cursor.execute("""
                UPDATE notification_settings
                SET general = %s, emergency = %s, silent_mode = %s
                WHERE user_id = %s
            """, (general, emergency, silent_mode, user_id))
        else:
            cursor.execute("""
                INSERT INTO notification_settings (user_id, general, emergency, silent_mode)
                VALUES (%s, %s, %s, %s)
            """, (user_id, general, emergency, silent_mode))

        conn.commit()
        conn.close()

        return jsonify({"message": "Bildirim ayarları güncellendi."}), 200

    except Exception as e:
        print(f"[NOTIFICATIONS_UPDATE_ERROR] {e}")
        return jsonify({"message": "Sunucu hatası"}), 500

    # 🔸 Expo token kaydetme
@notifications_bp.route('/token', methods=['POST'])
@token_required
def save_notification_token():
    """
    Expo Token Kaydet
    ---
    tags:
      - Bildirim
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
            expo_token:
              type: string
              example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
    responses:
      200:
        description: Token başarıyla kaydedildi
      400:
        description: Eksik veri
      500:
        description: Sunucu hatası
    """
    try:
        data = request.get_json()
        expo_token = data.get("expo_token")
        user_id = request.user_id

        if not expo_token:
            return jsonify({"status": "error", "message": "Token eksik."}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO notification_tokens (user_id, expo_token)
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE expo_token = VALUES(expo_token)
        """, (user_id, expo_token))
        conn.commit()
        conn.close()

        return jsonify({"status": "success", "message": "Token kaydedildi."}), 200

    except Exception as e:
        print(f"[TOKEN_SAVE_ERROR] {str(e)}")
        return jsonify({"status": "error", "message": "Token kaydedilirken hata oluştu."}), 500