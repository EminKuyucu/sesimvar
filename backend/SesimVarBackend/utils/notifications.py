# utils/notifications.py
# -*- coding: utf-8 -*-

import requests
from db import get_db_connection

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"
import requests
from db import get_db_connection

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

def send_push_notification(title, message):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get user notification tokens and settings
        cursor.execute("""
            SELECT nt.expo_token, ns.emergency, ns.silent_mode
            FROM notification_tokens nt
            JOIN notification_settings ns ON nt.user_id = ns.user_id
        """)
        users = cursor.fetchall()
        conn.close()

        # Filter users to be notified
        tokens = []
        for user in users:
            if user["expo_token"] and user["emergency"] and not user["silent_mode"]:
                tokens.append(user["expo_token"])

        # Send notification
        for token in tokens:
            payload = {
                "to": token,
                "sound": "default",
                "title": title,
                "body": message,
                "priority": "high",
            }

            response = requests.post(EXPO_PUSH_URL, json=payload)
            print(f"[Push] Sent to: {token} | Status: {response.status_code}")

    except Exception as e:
        print(f"[Push Error] {e}")
