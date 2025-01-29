# backend/models.py
from extensions import db

class SavedContent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(2048), nullable=False)
    tags = db.Column(db.String(512), nullable=False)
