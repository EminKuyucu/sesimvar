from flask import Blueprint, request, jsonify
from db import get_db_connection
import bcrypt
import jwt
import os
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__, url_prefix='/user')
JWT_SECRET = os.getenv("JWT_SECRET")

# 🔐 Kullanıcı Kaydı
@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Kullanıcı Kaydı
    ---
    tags:
      - Kullanıcı
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            tc_no:
              type: string
              example: "12345678901"
            full_name:
              type: string
              example: "Ali Veli"
            phone_number:
              type: string
              example: "05551234567"
            password:
              type: string
              example: "test1234"
    responses:
      201:
        description: Kayıt başarılı
      400:
        description: Eksik bilgi gönderildi
      500:
        description: Sunucu hatası
    """
    try:
        data = request.json
        tc_no = data.get('tc_no')
        full_name = data.get('full_name')
        phone_number = data.get('phone_number')
        password = data.get('password')

        if not all([tc_no, full_name, phone_number, password]):
            return jsonify({"status": "error", "message": "Lütfen tüm alanları doldurun."}), 400

        hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (tc_no, full_name, phone_number, password)
            VALUES (%s, %s, %s, %s)
        """, (tc_no, full_name, phone_number, hashed_pw))
        conn.commit()
        conn.close()

        return jsonify({"status": "success", "message": "Kayıt başarılı."}), 201

    except Exception as e:
        print(f"[REGISTER ERROR] {str(e)}")
        return jsonify({"status": "error", "message": "Kayıt sırasında hata oluştu."}), 500

# 🔐 Kullanıcı Girişi
@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Kullanıcı Girişi
    ---
    tags:
      - Kullanıcı
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            tc_no:
              type: string
              example: "12345678901"
            password:
              type: string
              example: "test1234"
    responses:
      200:
        description: Giriş başarılı
      401:
        description: Hatalı giriş
      400:
        description: Eksik bilgi
    """
    try:
        data = request.json
        tc_no = data.get('tc_no')
        password = data.get('password')

        if not tc_no or not password:
            return jsonify({"status": "error", "message": "TC ve şifre zorunludur."}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE tc_no = %s", (tc_no,))
        user = cursor.fetchone()
        conn.close()

        if not user or not bcrypt.checkpw(password.encode(), user['password'].encode()):
            return jsonify({"status": "error", "message": "Hatalı TC veya şifre."}), 401

        token = jwt.encode({
            "user_id": user['id'],
            "exp": datetime.utcnow() + timedelta(hours=12)
        }, JWT_SECRET, algorithm="HS256")

        return jsonify({
            "status": "success",
            "message": "Giriş başarılı",
            "data": {
                "token": token,
                "full_name": user["full_name"]}
        }), 200

    except Exception as e:
        print(f"[LOGIN ERROR] {str(e)}")
        return jsonify({"status": "error", "message": "Giriş sırasında hata oluştu."}), 500
