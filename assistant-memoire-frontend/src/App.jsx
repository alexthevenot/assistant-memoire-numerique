import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://assistant-memoire-numerique.onrender.com/data";

function App() {
    const [links, setLinks] = useState([]);
    const [filteredLinks, setFilteredLinks] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [sortOrder, setSortOrder] = useState("date-desc");

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(API_URL);
                setLinks(response.data);
                setFilteredLinks(response.data);

                // 🔹 Extraire tous les tags uniques
                const allTags = new Set();
                response.data.forEach(link => {
                    link.tags.forEach(tag => allTags.add(tag));
                });
                setTags(Array.from(allTags));
            } catch (error) {
                console.error("Erreur lors du chargement des liens :", error);
            }
        }
        fetchData();
    }, []);

    // ✅ Fonction pour filtrer les liens par tag
    const filterByTag = (tag) => {
        if (selectedTag === tag) {
            setSelectedTag(null);
            setFilteredLinks(links);
        } else {
            setSelectedTag(tag);
            setFilteredLinks(links.filter(link => link.tags.includes(tag)));
        }
    };

    // ✅ Fonction pour trier les liens
    const sortLinks = (order) => {
        setSortOrder(order);
        const sorted = [...filteredLinks].sort((a, b) => {
            if (order === "date-desc") {
                return b.id - a.id; // Du plus récent au plus ancien
            } else if (order === "date-asc") {
                return a.id - b.id; // Du plus ancien au plus récent
            }
            return 0;
        });
        setFilteredLinks(sorted);
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>📌 Liens sauvegardés</h1>

            {/* 🔹 Filtre par tags */}
            <div style={{ marginBottom: "15px" }}>
                <strong>Filtrer par tag :</strong>
                {tags.map(tag => (
                    <button
                        key={tag}
                        onClick={() => filterByTag(tag)}
                        style={{
                            margin: "5px",
                            padding: "5px 10px",
                            cursor: "pointer",
                            backgroundColor: selectedTag === tag ? "#007bff" : "#ddd",
                            color: selectedTag === tag ? "#fff" : "#000",
                            borderRadius: "5px",
                            border: "none",
                        }}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* 🔹 Tri des liens */}
            <div style={{ marginBottom: "15px" }}>
                <label htmlFor="sort">Trier par :</label>
                <select
                    id="sort"
                    value={sortOrder}
                    onChange={(e) => sortLinks(e.target.value)}
                    style={{ marginLeft: "10px", padding: "5px" }}
                >
                    <option value="date-desc">📅 Plus récent</option>
                    <option value="date-asc">📅 Plus ancien</option>
                </select>
            </div>

            {/* 🔹 Affichage des liens filtrés et triés */}
            <ul>
                {filteredLinks.map(link => (
                    <li key={link.id} style={{ marginBottom: "10px" }}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.url}
                        </a>
                        <p><strong>Tags:</strong> {link.tags.join(", ")}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
