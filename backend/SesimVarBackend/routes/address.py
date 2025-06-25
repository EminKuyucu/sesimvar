# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify
from db import get_db_connection
from auth import token_required

address_bp = Blueprint("address", __name__, url_prefix="/user")


# 📌 Adres Kaydetme (POST)
@address_bp.route("/address", methods=["POST"])
@token_required
def add_address():
    """
    Adres Ekle (Mahalle ID ile)
    ---
    tags:
      - Adres İşlemleri
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - neighborhood_id
          properties:
            neighborhood_id:
              type: integer
              example: 3
            street:
              type: string
              example: "1012. Sokak"
            latitude:
              type: number
              format: float
              example: 36.9182
            longitude:
              type: number
              format: float
              example: 34.8931
    responses:
      201:
        description: Adres başarıyla eklendi
      500:
        description: Adres eklenemedi
    """
    try:
        user_id = request.user_id
        data = request.get_json()

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO addresses (
                user_id, neighborhood_id, street, latitude, longitude
            ) VALUES (%s, %s, %s, %s, %s)
        """, (
            user_id,
            data["neighborhood_id"],
            data.get("street", ""),
            data.get("latitude", 0.0),
            data.get("longitude", 0.0)
        ))
        conn.commit()

        return jsonify({"status": "success", "message": "Adres kaydedildi."}), 201

    except Exception as e:
        print("Adres ekleme hatası:", e)
        return jsonify({"status": "error", "message": "Adres eklenemedi."}), 500


# 📌 Adres Getirme (GET)
@address_bp.route("/address", methods=["GET"])
@token_required
def get_address():
    """
    Adres Getir (Kullanıcının adresini getirir)
    ---
    tags:
      - Adres İşlemleri
    security:
      - Bearer: []
    responses:
      200:
        description: Adres başarıyla getirildi
        schema:
          type: object
          properties:
            status:
              type: string
              example: "success"
            data:
              type: object
              properties:
                neighborhood_id:
                  type: integer
                street:
                  type: string
                latitude:
                  type: number
                longitude:
                  type: number
                neighborhood_name:
                  type: string
                district:
                  type: string
                city:
                  type: string
      404:
        description: Adres bulunamadı
      500:
        description: Hata oluştu
    """
    try:
        user_id = request.user_id

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT a.*, n.name AS neighborhood_name, n.district, n.city
            FROM addresses a
            JOIN neighborhoods n ON a.neighborhood_id = n.id
            WHERE a.user_id = %s
        """, (user_id,))
        address = cursor.fetchone()

        if not address:
            return jsonify({"status": "error", "message": "Adres bulunamadı."}), 404

        return jsonify({"status": "success", "data": address}), 200

    except Exception as e:
        print("Adres çekme hatası:", e)
        return jsonify({"status": "error", "message": "Adres getirilemedi."}), 500
    # 📌 Adres Güncelleme (PUT)
@address_bp.route("/address", methods=["PUT"])
@token_required
def update_address():
    """
    Adres Güncelle
    ---
    tags:
      - Adres İşlemleri
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - neighborhood_id
          properties:
            neighborhood_id:
              type: integer
              example: 2
            street:
              type: string
              example: "Yeni Sokak 25"
            latitude:
              type: number
              format: float
              example: 36.9215
            longitude:
              type: number
              format: float
              example: 34.8923
    responses:
      200:
        description: Adres başarıyla güncellendi
      404:
        description: Adres bulunamadı
      500:
        description: Güncelleme sırasında hata oluştu
    """
    try:
        user_id = request.user_id
        data = request.get_json()

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM addresses WHERE user_id = %s", (user_id,))
        existing = cursor.fetchone()

        if not existing:
            return jsonify({"status": "error", "message": "Adres bulunamadı."}), 404

        cursor.execute("""
            UPDATE addresses
            SET neighborhood_id = %s,
                street = %s,
                latitude = %s,
                longitude = %s
            WHERE user_id = %s
        """, (
            data["neighborhood_id"],
            data.get("street", ""),
            data.get("latitude", 0.0),
            data.get("longitude", 0.0),
            user_id
        ))
        conn.commit()

        return jsonify({"status": "success", "message": "Adres başarıyla güncellendi."}), 200

    except Exception as e:
        print("Adres güncelleme hatası:", e)
        return jsonify({"status": "error", "message": "Adres güncellenemedi."}), 500

