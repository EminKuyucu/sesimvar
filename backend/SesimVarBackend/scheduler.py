# scheduler.py
# -*- coding: utf-8 -*-

from apscheduler.schedulers.background import BackgroundScheduler
from db import get_db_connection
from utils.notifications import send_push_notification

def send_earthquake_notifications():
    print("[SIMULATION] Deprem bildirimi gönderiliyor...")

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT expo_token FROM notification_tokens")
        tokens = cursor.fetchall()
        conn.close()

        title = "Deprem Uyarısı"
        message = "📢 Deprem tespit edildi. Güvende misiniz?"

        for t in tokens:
            expo_token = t["expo_token"]
            if expo_token:
                send_push_notification(expo_token, title, message)

        print("[SIMULATION] Bildirimler başarıyla gönderildi.")

    except Exception as e:
        print(f"[SIMULATION ERROR] {str(e)}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(send_earthquake_notifications, 'interval', seconds=30)  # Test için 30 saniyede bir
    scheduler.start()
    print("✅ Zamanlayıcı başlatıldı.")
