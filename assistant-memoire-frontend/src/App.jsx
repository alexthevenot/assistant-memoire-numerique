import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://assistant-memoire-numerique.onrender.com/data"; // Remplace par ton API

function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState(""); // 🔎 État pour la recherche

  // Charger les données depuis l'API
  useEffect(() => {
    axios.get(API_URL)
      .then(response => setData(response.data))
      .catch(error => console.error("Erreur lors du chargement des données:", error));
  }, []);

  // Filtrer les résultats selon la recherche
  const filteredData = data.filter(item =>
    item.url.toLowerCase().includes(search.toLowerCase()) || 
    item.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto", fontFamily: "Arial" }}>
      <h1>📚 Assistant Mémoire</h1>

      {/* 🔎 Barre de recherche */}
      <input
        type="text"
        placeholder="Rechercher par URL ou tag..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "16px",
          marginBottom: "20px",
          borderRadius: "5px",
          border: "1px solid #ccc"
        }}
      />

      {/* 📌 Liste filtrée des liens */}
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <li key={item.id} style={{ marginBottom: "15px", padding: "10px", borderBottom: "1px solid #eee" }}>
              <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "18px", fontWeight: "bold" }}>
                {item.url}
              </a>
              <br />
              <span style={{ color: "#666", fontSize: "14px" }}>
                <strong>Tags :</strong> {item.tags.join(", ")}
              </span>
            </li>
          ))
        ) : (
          <p>Aucun résultat trouvé.</p>
        )}
      </ul>
    </div>
  );
}

export default App;
