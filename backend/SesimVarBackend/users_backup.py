# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify
from db import get_db_connection
from auth import token_required
import bcrypt
import jwt
import os
from datetime import datetime, timedelta

print("✅ users.py yüklendi")

user_bp = Blueprint('user', __name__, url_prefix='/user')
JWT_SECRET = os.getenv("JWT_SECRET")

# Kullanıcı Kaydı
@user_bp.route('/register', methods=['POST'])
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

# Kullanıcı Girişi
@user_bp.route('/login', methods=['POST'])
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

        return jsonify({"status": "success", "message": "Giriş başarılı", "data": {"token": token}}), 200

    except Exception as e:
        print(f"[LOGIN ERROR] {str(e)}")
        return jsonify({"status": "error", "message": "Giriş sırasında hata oluştu."}), 500

# Profil Getirme
@user_bp.route('/profile', methods=['GET'])
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

# Yardım Çağrısı Oluşturma
@user_bp.route('/help-calls', methods=['POST'])
@token_required
def create_help_call():
    """
    Yardım Çağrısı Oluştur
    ---
    tags:
      - Yardım
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
            message:
              type: string
              example: "Enkaz altındayım"
            latitude:
              type: number
              example: 37.001
            longitude:
              type: number
              example: 35.321
    responses:
      201:
        description: Çağrı oluşturuldu
      400:
        description: Eksik bilgi
    """
    try:
        user_id = request.user_id
        data = request.json
        message = data.get('message')
        latitude = data.get('latitude')
        longitude = data.get('longitude')

        if not all([message, latitude, longitude]):
            return jsonify({"status": "error", "message": "Tüm alanlar zorunlu."}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO help_requests (user_id, message, latitude, longitude, created_at)
            VALUES (%s, %s, %s, %s, NOW())
        """, (user_id, message, latitude, longitude))
        conn.commit()
        conn.close()

        return jsonify({"status": "success", "message": "Yardım çağrısı oluşturuldu."}), 201

    except Exception as e:
        print(f"[HELP_CALL ERROR] {str(e)}")
        return jsonify({"status": "error", "message": "İşlem başarısız."}), 500

# Yardım Çağrılarını Getir
@user_bp.route('/help-calls', methods=['GET'])
@token_required
def get_help_calls():
    """
    Yardım Çağrılarını Getir
    ---
    tags:
      - Yardım
    security:
      - Bearer: []
    responses:
      200:
        description: Yardım verileri getirildi
    """
    try:
        user_id = request.user_id
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, message, latitude, longitude, created_at FROM help_requests WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
        data = cursor.fetchall()
        conn.close()

        return jsonify({"status": "success", "message": "Veriler getirildi", "data": data}), 200

    except Exception as e:
        print(f"[GET_HELP_CALLS ERROR] {str(e)}")
        return jsonify({"status": "error", "message": "Veri alınamadı"}), 500

# Güvendeyim Bildirimi
@user_bp.route('/safe-status', methods=['POST'])
@token_required
def create_safe_status():
    """
    Güvendeyim Bildirimi Gönder
    ---
    tags:
      - Güvende
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
            latitude:
              type: number
              example: 37.002
            longitude:
              type: number
              example: 35.322
    responses:
      201:
        description: Bildirim gönderildi
      400:
        description: Eksik bilgi
    """
    try:
        user_id = request.user_id
        data = request.json
        latitude = data.get('latitude')
        longitude = data.get('longitude')

        if not all([latitude, longitude]):
            return jsonify({"status": "error", "message": "Konum bilgisi gerekli."}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO safe_status (user_id, latitude, longitude, created_at)
            VALUES (%s, %s, %s, NOW())
        """, (user_id, latitude, longitude))
        conn.commit()
        conn.close()

        return jsonify({"status": "success", "message": "Bildiriminiz alındı."}), 201

    except Exception as e:
        print(f"[SAFE_STATUS ERROR] {str(e)}")
        return jsonify({"status": "error", "message": "İşlem başarısız."}), 500

# Güvendeyim Verilerini Getir
@user_bp.route('/safe-status', methods=['GET'])
@token_required
def get_safe_status():
    """
    Güvendeyim Bildirimlerini Getir
    ---
    tags:
      - Güvende
    security:
      - Bearer: []
    responses:
      200:
        description: Veriler getirildi
    """
    try:
        user_id = request.user_id
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, latitude, longitude, created_at FROM safe_status WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
        data = cursor.fetchall()
        conn.close()

        return jsonify({"status": "success", "message": "Veriler getirildi", "data": data}), 200

    except Exception as e:
        print(f"[GET_SAFE_STATUS ERROR] {str(e)}")
        return jsonify({"status": "error", "message": "Veri alınamadı"}), 500
#Yardım Çağrısı Verilerini Güncelleme
@user_bp.route('/help-calls/<int:help_id>', methods=['PUT'])
@token_required
def update_help_call(help_id):
    """
    Yardım Çağrısı Güncelle
    ---
    tags:
      - Yardım Çağrısı
    parameters:
      - name: help_id
        in: path
        type: integer
        required: true
        description: Güncellenecek yardım çağrısının ID'si
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Durum değişti, ambulans gerekmez"
            latitude:
              type: number
              example: 37.123456
            longitude:
              type: number
              example: 35.987654
    responses:
      200:
        description: Güncelleme başarılı
      400:
        description: Eksik bilgi
      404:
        description: Kayıt bulunamadı veya yetkiniz yok
      500:
        description: Sunucu hatası
    """
    try:
        user_id = request.user_id
        data = request.json
        message = data.get('message')
        latitude = data.get('latitude')
        longitude = data.get('longitude')

        if not all([message, latitude, longitude]):
            return jsonify({
                "status": "error",
                "message": "Lütfen mesaj, enlem ve boylam bilgisini girin."
            }), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM help_requests WHERE id = %s AND user_id = %s",
            (help_id, user_id)
        )
        existing = cursor.fetchone()

        if not existing:
            conn.close()
            return jsonify({
                "status": "error",
                "message": "Güncellenecek yardım çağrısı bulunamadı."
            }), 404

        cursor.execute("""
            UPDATE help_requests
            SET message = %s, latitude = %s, longitude = %s
            WHERE id = %s AND user_id = %s
        """, (message, latitude, longitude, help_id, user_id))
        conn.commit()
        conn.close()

        return jsonify({
            "status": "success",
            "message": "Yardım çağrısı güncellendi."
        }), 200

    except Exception as e:
        print(f"[UPDATE_HELP_CALL ERROR] {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Güncelleme sırasında hata oluştu."
        }), 500
#Yardım Çağrısı Verilerini Silme
@user_bp.route('/help-calls/<int:help_id>', methods=['DELETE'])
@token_required
def delete_help_call(help_id):
    """
    Yardım Çağrısı Sil
    ---
    tags:
      - Yardım Çağrısı
    parameters:
      - name: help_id
        in: path
        type: integer
        required: true
        description: Silinecek yardım çağrısının ID'si
    responses:
      200:
        description: Silme başarılı
      404:
        description: Kayıt bulunamadı veya yetkiniz yok
      500:
        description: Sunucu hatası
    """
    try:
        user_id = request.user_id

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM help_requests WHERE id = %s AND user_id = %s",
            (help_id, user_id)
        )
        existing = cursor.fetchone()

        if not existing:
            conn.close()
            return jsonify({
                "status": "error",
                "message": "Silinecek yardım çağrısı bulunamadı."
            }), 404

        cursor.execute("DELETE FROM help_requests WHERE id = %s", (help_id,))
        conn.commit()
        conn.close()

        return jsonify({
            "status": "success",
            "message": "Yardım çağrısı silindi."
        }), 200

    except Exception as e:
        print(f"[DELETE_HELP_CALL ERROR] {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Silme sırasında bir hata oluştu."
        }), 500


# Doğrudan çalıştırılmasın
if __name__ == '__main__':
    print("users.py doğrudan çalıştırılmamalı, lütfen app.py'den başlatın.")
