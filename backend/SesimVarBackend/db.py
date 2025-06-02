# -*- coding: utf-8 -*-
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()  

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        return conn
    except Exception as e:
        print("? Veritabanı bağlantı hatası:", e)
        return None
