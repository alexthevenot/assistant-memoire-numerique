document.addEventListener("DOMContentLoaded", () => {
  const urlField = document.getElementById("url");
  const tagsField = document.getElementById("tags");
  const saveButton = document.getElementById("saveButton");
  const status = document.getElementById("status");
  const suggestions = document.getElementById("suggestions");

  const API_URL = "http://127.0.0.1:5000"; // URL du backend Flask

  // Récupère l'URL de l'onglet actif
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    const activeTab = tabs[0];
    if (activeTab) {
      urlField.value = activeTab.url;
    }
  });

  // Envoie une requête POST pour enregistrer les données
  async function saveData(url, tags) {
    try {
      const response = await fetch(`${API_URL}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, tags }),
      });
      if (response.ok) {
        status.textContent = "Enregistré avec succès !";
        tagsField.value = "";
      } else {
        status.textContent = "Erreur lors de l'enregistrement.";
      }
    } catch (error) {
      console.error("Erreur lors de la connexion au backend :", error);
      status.textContent = "Impossible de se connecter au serveur.";
    }
    setTimeout(() => {
      status.textContent = "";
    }, 3000);
  }

  // Récupère les données pour les suggestions de tags
  async function fetchTags() {
    try {
      const response = await fetch(`${API_URL}/data`);
      if (response.ok) {
        const data = await response.json();
        const tags = new Set();
        data.forEach(entry => {
          entry.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags);
      } else {
        console.error("Erreur lors de la récupération des tags.");
        return [];
      }
    } catch (error) {
      console.error("Erreur de connexion au backend :", error);
      return [];
    }
  }

  // Met à jour les suggestions de tags dynamiquement
  async function updateSuggestions(input) {
    const allTags = await fetchTags();
    const filteredTags = allTags.filter(tag => tag.toLowerCase().startsWith(input.toLowerCase()));
    suggestions.innerHTML = "";
    filteredTags.forEach(tag => {
      const suggestionDiv = document.createElement("div");
      suggestionDiv.textContent = tag;
      suggestionDiv.addEventListener("click", () => {
        const currentTags = tagsField.value.split(",").slice(0, -1).map(tag => tag.trim());
        currentTags.push(tag);
        tagsField.value = currentTags.join(", ") + ", ";
        suggestions.innerHTML = "";
      });
      suggestions.appendChild(suggestionDiv);
    });
  }

  // Sauvegarde l'URL et les tags en appelant l'API
  saveButton.addEventListener("click", () => {
    const url = urlField.value;
    const tags = tagsField.value.split(",").map(tag => tag.trim()).filter(tag => tag !== "");

    if (url && tags.length > 0) {
      saveData(url, tags);
    } else {
      status.textContent = "Veuillez ajouter au moins un tag.";
      setTimeout(() => {
        status.textContent = "";
      }, 3000);
    }
  });

  // Affiche les suggestions lors de la saisie des tags
  tagsField.addEventListener("input", () => {
    const input = tagsField.value.split(",").pop().trim();
    if (input) {
      updateSuggestions(input);
    } else {
      suggestions.innerHTML = "";
    }
  });

  // Masque les suggestions si on clique ailleurs
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#tags") && !e.target.closest("#suggestions")) {
      suggestions.innerHTML = "";
    }
  });
});