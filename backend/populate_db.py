import requests

# 🔹 API du backend Flask
API_URL = "https://assistant-memoire-numerique.onrender.com/save"

# 🔹 Liste des sites et tags à injecter
TEST_DATA = [
    {"url": "https://www.lemonde.fr", "tags": ["actualité", "politique"]},
    {"url": "https://www.bfmtv.com", "tags": ["info", "direct"]},
    {"url": "https://www.github.com", "tags": ["code", "open-source", "développement"]},
    {"url": "https://www.stackoverflow.com", "tags": ["programmation", "debug", "entraide"]},
    {"url": "https://www.openai.com", "tags": ["IA", "technologie"]},
    {"url": "https://www.liberation.fr", "tags": ["journal", "actualité"]},
    {"url": "https://www.futura-sciences.com", "tags": ["science", "recherche", "innovation"]},
    {"url": "https://www.lequipe.fr", "tags": ["sport", "football", "tennis"]},
    {"url": "https://www.allocine.fr", "tags": ["cinéma", "films", "séries"]},
    {"url": "https://www.santepubliquefrance.fr", "tags": ["santé", "prévention", "bien-être"]}
]

def populate_database():
    """ Injecte des données de test dans la base. """
    for entry in TEST_DATA:
        response = requests.post(API_URL, json=entry)
        if response.status_code == 201:
            print(f"✅ Ajouté : {entry['url']} avec tags {entry['tags']}")
        else:
            print(f"❌ Erreur pour {entry['url']} : {response.text}")

if __name__ == "__main__":
    print("📌 Début de l'injection des données de test...")
    populate_database()
    print("✅ Injection terminée !")
