# -*- coding: utf-8 -*-
from functools import wraps
from flask import request, jsonify
import jwt
import os
from dotenv import load_dotenv  # .env dosyasını okuyabilmek için

load_dotenv()  # .env dosyasını yükle
JWT_SECRET = os.getenv("JWT_SECRET")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        print("Gelen Authorization Header:", request.headers.get("Authorization"))

        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"status": "error", "message": "Token eksik"}), 401

        try:
            decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.user_id = decoded["user_id"]
        except jwt.ExpiredSignatureError:
            return jsonify({"status": "error", "message": "Token süresi dolmuş"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"status": "error", "message": "Geçersiz token"}), 401
        except Exception as e:
            print("Genel Token Hatası:", e)
            return jsonify({"status": "error", "message": "Token doğrulanamadı"}), 500

        return f(*args, **kwargs)
    return decorated

