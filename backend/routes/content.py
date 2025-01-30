from flask import Blueprint, jsonify, request, send_file
from models import SavedContent
import csv, os
import logging
from marshmallow import Schema, fields, ValidationError
from extensions import db

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