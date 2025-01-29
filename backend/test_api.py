import pytest
from app import create_app
from extensions import db
from models import SavedContent

@pytest.fixture
def app():
    """Créer une application Flask pour les tests."""
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",  # Base de données temporaire
        "SQLALCHEMY_TRACK_MODIFICATIONS": False
    })

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """Créer un client de test pour simuler des requêtes HTTP."""
    return app.test_client()

def test_save_content(client):
    """Vérifie que l'enregistrement d'un contenu fonctionne."""
    response = client.post('/save', json={"url": "https://example.com", "tags": ["example", "test"]})
    assert response.status_code == 201
    assert response.json == {"message": "Contenu enregistré avec succès"}

def test_get_data(client):
    """Vérifie que la récupération des données fonctionne."""
    # Ajout d'un enregistrement
    client.post('/save', json={"url": "https://example.com", "tags": ["example", "test"]})

    # Récupération des données
    response = client.get('/data')
    assert response.status_code == 200
    assert len(response.json) > 0
    assert response.json[0]["url"] == "https://example.com"

def test_export_data(client):
    """Vérifie que l'export des données en CSV fonctionne."""
    client.post('/save', json={"url": "https://example.com", "tags": ["example", "test"]})
    
    response = client.get('/export')
    assert response.status_code == 200
    assert "text/csv" in response.content_type

def test_validation_fail(client):
    """Vérifie que l'API renvoie une erreur si les données sont incorrectes."""
    response = client.post('/save', json={"url": "invalid-url", "tags": ["example"]})
    assert response.status_code == 400
    assert "url" in response.json  # Vérifie que l'erreur mentionne l'URL invalide
