# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from cachetools import TTLCache
import time

app = Flask(__name__)
CORS(app)

# ✅ IP bazli manuel rate limit sayaci (60 saniyede max 5 istek)
request_counters = TTLCache(maxsize=1000, ttl=60)

# ✅ Veritabani baglantisi
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root123",
    database="sesimvar"
)
cursor = db.cursor(dictionary=True)

# ✅ Ana kontrol endpointi
@app.route("/", methods=["GET"])
def home():
    return jsonify({"mesaj": "API calisiyor"})

# ✅ Yardim cagrisı endpointi: POST, GET, PUT (rate limitli)
@app.route("/help", methods=["POST", "GET", "PUT"])
def help_request():
    # ✅ Rate limit kontrolu
    ip = request.remote_addr
    count = request_counters.get(ip, 0)

    if count >= 5:
        return jsonify({"hata": "Cok fazla istek gonderildi. Lutfen biraz bekleyin."}), 429

    request_counters[ip] = count + 1

    if request.method == "POST":
        data = request.json
        user_id = data.get("user_id")
        latitude = data.get("latitude")
        longitude = data.get("longitude")
        message = data.get("message")

        if not all([user_id, latitude, longitude, message]):
            return jsonify({"hata": "Eksik veri gonderildi. user_id, latitude, longitude ve message zorunludur."}), 400

        query = "INSERT INTO help_requests (user_id, latitude, longitude, message) VALUES (%s, %s, %s, %s)"
        values = (user_id, latitude, longitude, message)
        cursor.execute(query, values)
        db.commit()
        return jsonify({"mesaj": "Yardim cagrisı basariyla olusturuldu."}), 201

    elif request.method == "GET":
        user_id = request.args.get("user_id")
        status = request.args.get("status")

        if user_id and status:
            query = "SELECT * FROM help_requests WHERE user_id = %s AND status = %s"
            cursor.execute(query, (user_id, status))
        elif user_id:
            query = "SELECT * FROM help_requests WHERE user_id = %s"
            cursor.execute(query, (user_id,))
        elif status:
            query = "SELECT * FROM help_requests WHERE status = %s"
            cursor.execute(query, (status,))
        else:
            query = "SELECT * FROM help_requests"
            cursor.execute(query)

        result = cursor.fetchall()

        # ✅ Harita uyumlu JSON cevabi
        formatted = []
        for row in result:
            created = row["created_at"]
            if isinstance(created, str):
                created_str = created  # zaten stringse dokunma
            else:
                created_str = created.strftime("%Y-%m-%d %H:%M:%S") if created else None

            formatted.append({
                "id": row["id"],
                "user_id": row["user_id"],
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "message": row["message"],
                "status": row["status"],
                "created_at": created_str
            })

        return jsonify(formatted), 200

    elif request.method == "PUT":
        data = request.json
        help_id = data.get("id")
        new_status = data.get("status")

        if not all([help_id, new_status]):
            return jsonify({"hata": "Eksik veri. id ve status gereklidir."}), 400

        query = "UPDATE help_requests SET status = %s WHERE id = %s"
        cursor.execute(query, (new_status, help_id))
        db.commit()

        if cursor.rowcount == 0:
            return jsonify({"hata": "Belirtilen ID'ye ait yardim cagrisı bulunamadi."}), 404

        return jsonify({"mesaj": "Yardim cagrisı durumu guncellendi."}), 200

# ✅ Flask uygulamasini baslat
if __name__ == "__main__":
    app.run(debug=True)
