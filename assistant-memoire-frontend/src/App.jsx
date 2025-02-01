import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://assistant-memoire-numerique.onrender.com";

function App() {
    const [links, setLinks] = useState([]);
    const [filteredLinks, setFilteredLinks] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [sortOrder, setSortOrder] = useState("date-desc");
    const [searchQuery, setSearchQuery] = useState("");
    const [summaries, setSummaries] = useState({});
    const [loadingSummary, setLoadingSummary] = useState({});
	const [categories, setCategories] = useState({});

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await axios.get(`${API_URL}/data`);
				setLinks(response.data);
				setFilteredLinks(response.data);

				// 🔹 Extraire toutes les tags et catégories uniques
				const allTags = new Set();
				const allCategories = {};

				response.data.forEach(link => {
					link.tags.forEach(tag => allTags.add(tag));
					allCategories[link.url] = link.category || "Non classé";
				});

				setTags(Array.from(allTags));
				setCategories(allCategories);
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

    // ✅ Fonction pour filtrer par recherche
    const handleSearch = (query) => {
        setSearchQuery(query);
        const lowerQuery = query.toLowerCase();
        
        const results = links.filter(link =>
            link.url.toLowerCase().includes(lowerQuery) || 
            link.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );

        setFilteredLinks(results);
    };

    // ✅ Fonction pour générer un résumé avec OpenAI
    const generateSummary = async (url) => {
        setLoadingSummary(prev => ({ ...prev, [url]: true }));
        try {
            const response = await axios.post(`${API_URL}/summarize`, { url });
            setSummaries(prev => ({ ...prev, [url]: response.data.summary }));
        } catch (error) {
            console.error("Erreur lors de la génération du résumé :", error);
            setSummaries(prev => ({ ...prev, [url]: "Erreur lors du résumé." }));
        }
        setLoadingSummary(prev => ({ ...prev, [url]: false }));
    };
	
	const classifyLink = async (url) => {
		try {
			const response = await axios.post(`${API_URL}/classify`, { url });
			setCategories(prev => ({ ...prev, [url]: response.data.category }));
		} catch (error) {
			console.error("Erreur de classification :", error);
		}
	};


    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>📌 Liens sauvegardés</h1>

            {/* 🔹 Champ de recherche */}
            <input 
                type="text" 
                placeholder="🔍 Rechercher un lien ou un tag..." 
                value={searchQuery} 
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "15px",
                    borderRadius: "5px",
                    border: "1px solid #ddd"
                }}
            />

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
                    <li key={link.id} style={{ marginBottom: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.url}
                        </a>
                        <p><strong>Tags:</strong> {link.tags.join(", ")}</p>

                        {/* 🔹 Bouton pour générer un résumé */}
                        <button 
                            onClick={() => generateSummary(link.url)} 
                            style={{ padding: "5px", margin: "5px", cursor: "pointer" }}
                            disabled={loadingSummary[link.url]}
                        >
                            {loadingSummary[link.url] ? "⏳ Génération..." : "📄 Générer un résumé"}
                        </button>

                        {/* 🔹 Affichage du résumé */}
                        {summaries[link.url] && (
                            <p style={{ marginTop: "5px", fontStyle: "italic", color: "#555" }}>
                                {summaries[link.url]}
                            </p>
                        )}
						
						{/* 🔹 Bouton pour classifier */}
						<button 
							onClick={() => classifyLink(link.url)} 
							style={{ padding: "5px", margin: "5px", cursor: "pointer" }}
						>
							📂 Classifier
						</button>

						{/* 🔹 Affichage de la catégorie */}
						<p><strong>Catégorie :</strong> {categories[link.url] || "Non classé"}</p>

                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
