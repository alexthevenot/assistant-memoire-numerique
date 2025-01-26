document.addEventListener("DOMContentLoaded", () => {
  const urlField = document.getElementById("url");
  const tagsField = document.getElementById("tags");
  const saveButton = document.getElementById("saveButton");
  const status = document.getElementById("status");
  const history = document.getElementById("history");
  const suggestions = document.getElementById("suggestions");
  const searchField = document.getElementById("search");

  // Récupère l'URL de l'onglet actif
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    const activeTab = tabs[0];
    if (activeTab) {
      urlField.value = activeTab.url;
    }
  });

  // Charge et affiche l'historique des sauvegardes
  function loadHistory(filter = "") {
    history.innerHTML = ""; // Réinitialise l'affichage
    const storedData = JSON.parse(localStorage.getItem("savedContent")) || [];
    const filteredData = storedData.filter(entry => {
      return (
        entry.url.toLowerCase().includes(filter.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
      );
    });

    filteredData.forEach((entry, index) => {
      const entryDiv = document.createElement("div");
      entryDiv.className = "entry";
      entryDiv.innerHTML = `
        <strong>URL :</strong> <a href="${entry.url}" target="_blank">${entry.url}</a><br>
        <strong>Tags :</strong> ${entry.tags.join(", ")}<br>
        <button data-index="${index}">Supprimer</button>
      `;
      history.appendChild(entryDiv);
    });
  }

  // Récupère tous les tags existants pour l'autocomplétion
  function getAllTags() {
    const storedData = JSON.parse(localStorage.getItem("savedContent")) || [];
    const tagsSet = new Set();
    storedData.forEach(entry => {
      entry.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }

  // Met à jour les suggestions de tags
  function updateSuggestions(input) {
    const allTags = getAllTags();
    const filteredTags = allTags.filter(tag => tag.toLowerCase().startsWith(input.toLowerCase()));
    suggestions.innerHTML = "";
    filteredTags.forEach(tag => {
      const suggestionDiv = document.createElement("div");
      suggestionDiv.textContent = tag;
      suggestionDiv.addEventListener("click", () => {
        tagsField.value = tagsField.value ? tagsField.value + ", " + tag : tag;
        suggestions.innerHTML = "";
      });
      suggestions.appendChild(suggestionDiv);
    });
  }

  // Sauvegarde l'URL et les tags dans localStorage
  saveButton.addEventListener("click", () => {
    const url = urlField.value;
    const tags = tagsField.value.split(",").map(tag => tag.trim()).filter(tag => tag !== "");

    if (url && tags.length > 0) {
      const storedData = JSON.parse(localStorage.getItem("savedContent")) || [];
      storedData.push({ url, tags });
      localStorage.setItem("savedContent", JSON.stringify(storedData));
      status.textContent = "Enregistré avec succès !";
      tagsField.value = "";
      loadHistory();
    } else {
      status.textContent = "Veuillez ajouter au moins un tag.";
    }

    setTimeout(() => {
      status.textContent = "";
    }, 3000);
  });

  // Supprime une entrée sauvegardée
  history.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const index = e.target.getAttribute("data-index");
      const storedData = JSON.parse(localStorage.getItem("savedContent")) || [];
      storedData.splice(index, 1); // Supprime l'entrée
      localStorage.setItem("savedContent", JSON.stringify(storedData));
      loadHistory();
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

  // Filtre l'historique lors de la saisie dans le champ de recherche
  searchField.addEventListener("input", () => {
    const filter = searchField.value.trim();
    loadHistory(filter);
  });

  // Masque les suggestions si on clique ailleurs
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#tags") && !e.target.closest("#suggestions")) {
      suggestions.innerHTML = "";
    }
  });

  // Charger l'historique au démarrage
  loadHistory();
});