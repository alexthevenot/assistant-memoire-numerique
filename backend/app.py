from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import csv
import os
import logging
from extensions import db

# Initialisation de la configuration des logs
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("BackendApp")

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Configuration de la base de données
    app.config.from_object('config.Config')

    # Initialiser SQLAlchemy
    db.init_app(app)

    with app.app_context():
        # Importer les modèles pour les enregistrer
        import models
        db.create_all()

    # Enregistrer les blueprints
    from routes.content import content_bp
    app.register_blueprint(content_bp)

    @app.route("/")
    def home():
        return {"message": "API Flask est en ligne 🚀"}, 200

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=10000, debug=True)