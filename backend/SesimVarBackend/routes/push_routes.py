# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify
from db import get_db_connection
from auth import token_required
import requests

push_bp = Blueprint('push', __name__, url_prefix='/user')

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

# 🔹 Expo Push Token Kaydet
@push_bp.route('/save-token', methods=['POST'])
@token_required
def save_expo_token():
    """
    Expo Push Token Kaydet
    ---
    tags:
      - Bildirim
    security:
      - Bearer: []
    consumes:
      - application/json
    parameters:
      - in: body
        name: token
        required: true
        schema:
          type: object
          properties:
            token:
              type: string
              example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
    responses:
      200:
        description: Token başarıyla kaydedildi
      400:
        description: Token eksik
      500:
        description: Kayıt sırasında hata
    """
    try:
        user_id = request.user_id
        data = request.get_json()
        token = data.get("token")

        if not token:
            return jsonify({"status": "error", "message": "Token eksik"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO expo_push_tokens (user_id, token)
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE token = VALUES(token)
        """, (user_id, token))
        conn.commit()
        conn.close()

        return jsonify({"status": "success", "message": "Token kaydedildi"}), 200

    except Exception as e:
        print(f"[SAVE_TOKEN_ERROR] {e}")
        return jsonify({"status": "error", "message": "Token kaydedilemedi"}), 500

# 🔸 Yardımcı fonksiyon (bildirim gönderme)
def send_push_notification(expo_token, title, message):
    body = {
        "to": expo_token,
        "title": title,
        "body": message,
        "sound": "default"
    }
    response = requests.post(EXPO_PUSH_URL, json=body)
    return response.status_code, response.text

# 🔔 Test Bildirim Gönder
@push_bp.route('/send-demo', methods=['POST'])
@token_required
def send_demo_notification():
    """
    Test Bildirimi Gönder
    ---
    tags:
      - Bildirim
    security:
      - Bearer: []
    responses:
      200:
        description: Bildirim başarıyla gönderildi
      404:
        description: Token bulunamadı
      500:
        description: Bildirim gönderilirken hata oluştu
    """
    try:
        user_id = request.user_id
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT token FROM expo_push_tokens WHERE user_id = %s", (user_id,))
        result = cursor.fetchone()
        conn.close()

        if not result:
            return jsonify({"status": "error", "message": "Token bulunamadı"}), 404

        token = result["token"]
        status, response = send_push_notification(token, "SesimVar", "Bu bir test bildirimi")

        return jsonify({
            "status": "success",
            "message": "Bildirim gönderildi",
            "expo_response": response
        }), 200

    except Exception as e:
        print(f"[SEND_NOTIFICATION_ERROR] {e}")
        return jsonify({"status": "error", "message": "Bildirim gönderilemedi"}), 500
