from flask import Blueprint, jsonify, request, send_file
from models import SavedContent
import csv, os
import logging
from marshmallow import Schema, fields, ValidationError
from extensions import db
from flask_cors import cross_origin
import requests

# Initialisation des logs
logger = logging.getLogger("ContentRoutes")

content_bp = Blueprint('content', __name__)

# Schéma de validation des données
class ContentSchema(Schema):
    url = fields.Url(required=True, error_messages={"invalid": "URL invalide"})
    tags = fields.List(fields.Str(), required=True, error_messages={"required": "Les tags sont requis"})

schema = ContentSchema()

@content_bp.route('/save', methods=['POST'])
def save_content():
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        logger.error("Validation échouée: %s", err.messages)
        return jsonify(err.messages), 400

    url = data.get('url')
    tags = data.get('tags')

    new_content = SavedContent(url=url, tags=",".join(tags))
    db.session.add(new_content)
    db.session.commit()

    logger.info("Contenu enregistré: URL=%s, Tags=%s", url, tags)
    return jsonify({"message": "Contenu enregistré avec succès"}), 201

@content_bp.route('/data', methods=['GET'])
@cross_origin()  # ✅ Autorise toutes les origines pour cette route
def get_data():
    contents = SavedContent.query.all()
    result = [
        {
            "id": content.id,
            "url": content.url,
            "tags": content.tags.split(',')
        }
        for content in contents
    ]
    logger.info("Données récupérées: %d enregistrements", len(result))
    return jsonify(result)

@content_bp.route('/export', methods=['GET'])
def export_data():
    contents = SavedContent.query.all()
    if not contents:
        logger.warning("Aucune donnée à exporter")
        return jsonify({"error": "Aucune donnée disponible pour l'exportation"}), 400

    csv_file = os.path.join(os.path.dirname(__file__), "../exported_data.csv")
    with open(csv_file, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["ID", "URL", "Tags"])
        for content in contents:
            writer.writerow([content.id, content.url, content.tags])

    logger.info("Données exportées dans %s", csv_file)
    return send_file(csv_file, as_attachment=True, mimetype='text/csv')
    
# 🔹 Route pour générer un résumé avec OpenAI GPT (ou autre LLM)
@content_bp.route('/summarize', methods=['POST'])
@cross_origin()  # ✅ Active CORS pour cette route
def summarize():
    data = request.json
    url = data.get("url")

    if not url:
        return jsonify({"error": "URL manquante"}), 400

    # Exemple de requête vers OpenAI GPT (nécessite une clé API)
    API_KEY = os.getenv("OPENAI_API_KEY")  # Clé API à ajouter dans Render
    API_URL = "https://api.openai.com/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    prompt = f"Résumé de l'article disponible à cette adresse : {url}. Donne-moi un résumé court et concis."

    payload = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "system", "content": prompt}],
        "temperature": 0.7,
    }

    response = requests.post(API_URL, headers=headers, json=payload)

    if response.status_code == 200:
        summary = response.json()["choices"][0]["message"]["content"]
        return jsonify({"url": url, "summary": summary})
    else:
        return jsonify({"error": "Impossible de générer le résumé"}), 500
        
# 🔹 Route pour classifier un lien automatiquement
@content_bp.route('/classify', methods=['POST'])
@cross_origin()  # ✅ Active CORS pour cette route
def classify():
    data = request.json
    url = data.get("url")

    if not url:
        return jsonify({"error": "URL manquante"}), 400

    API_KEY = os.getenv("OPENAI_API_KEY")
    API_URL = "https://api.openai.com/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    prompt = f"""
    L'URL suivante contient un article ou une page web. 
    Attribue une **seule** catégorie pertinente parmi : 
    - Technologie
    - Science
    - Finance
    - Santé
    - Sport
    - Divertissement
    - Éducation
    - Autre

    Lien : {url}

    Retourne **seulement le nom de la catégorie** sans autre texte.
    """

    payload = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "system", "content": prompt}],
        "temperature": 0.7,
    }

    response = requests.post(API_URL, headers=headers, json=payload)

    if response.status_code == 200:
        category = response.json()["choices"][0]["message"]["content"]
        return jsonify({"url": url, "category": category.strip()})
    else:
        return jsonify({"error": "Impossible de classifier"}), 500 