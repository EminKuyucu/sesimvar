# -*- coding: utf-8 -*-
from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flasgger import Swagger
from dotenv import load_dotenv

# 🔗 Blueprint'leri import et
from routes.auth_routes import auth_bp
from routes.profile_routes import profile_bp
from routes.safe_routes import safe_bp
from routes.help_routes import help_bp
from routes.notifications_routes import notifications_bp
from routes.push_routes import push_bp
from routes.simulation_routes import simulation_bp
from routes.address import address_bp
from routes.neighborhood import neighborhood_bp
from scheduler import start_scheduler

# Diğer blueprint'leri de taşıdıkça buraya eklenecek: profile_bp, help_bp, safe_bp
load_dotenv()

app = Flask(__name__)
CORS(app)

# 🔐 Rate Limiting
limiter = Limiter(get_remote_address, app=app, default_limits=["100 per hour"])

# 📘 Swagger Yapılandırması
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'apispec_1',
            "route": '/apispec_1.json',
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/apidocs/"
}

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "SesimVar API",
        "description": "Afet destek uygulaması için API dökümantasyonu",
        "version": "1.0.0"
    },
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT token bu formattadır: **Bearer <token>**"
        }
    }
}

# 🔧 Swagger'ı başlat
swagger = Swagger(app, config=swagger_config, template=swagger_template)

# 🔗 Blueprint bağlantısı
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(safe_bp)
app.register_blueprint(help_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(push_bp)
app.register_blueprint(simulation_bp)
app.register_blueprint(address_bp)
app.register_blueprint(neighborhood_bp)
start_scheduler()

# 🚀 Uygulama Başlatma
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
