# routes/simulation_routes.py
# -*- coding: utf-8 -*-
from flask import Blueprint, jsonify
from db import get_db_connection
from utils.notifications import send_push_notification

simulation_bp = Blueprint('simulation', __name__, url_prefix='/simulate')

@simulation_bp.route('/earthquake', methods=['POST'])
def simulate_earthquake():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT expo_token FROM notification_tokens")
        tokens = cursor.fetchall()
        conn.close()

        title = "Deprem Uyarısı"
        message = "📢 Deprem tespit edildi. Güvende misiniz? Lütfen bildirimden giriş yapın."

        results = []
        for t in tokens:
            expo_token = t["expo_token"]
            status, response = send_push_notification(expo_token, title, message)
            results.append({"token": expo_token, "status": status, "response": response})

        return jsonify({
            "status": "success",
            "message": "Deprem bildirimi gönderildi.",
            "results": results
        }), 200

    except Exception as e:
        print(f"[SIMULATE_EARTHQUAKE_ERROR] {e}")
        return jsonify({"status": "error", "message": "Bildirim gönderilemedi."}), 500
