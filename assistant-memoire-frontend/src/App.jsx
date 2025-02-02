import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LinkGrid from "./components/LinkGrid";
import "react-icons/fi";

const API_URL = "https://assistant-memoire-numerique.onrender.com/data";

const App = () => {
    const [links, setLinks] = useState([]);
    const [filteredLinks, setFilteredLinks] = useState([]);
    const [categories, setCategories] = useState(["Tous", "Articles", "Vidéos", "Projets"]);
    const [tags, setTags] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(API_URL);
                setLinks(response.data);
                setFilteredLinks(response.data);
                
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

    const handleSearch = (query) => {
        setSearchQuery(query);
        const lowerQuery = query.toLowerCase();
        setFilteredLinks(links.filter(link => link.url.toLowerCase().includes(lowerQuery) || link.tags.some(tag => tag.toLowerCase().includes(lowerQuery))));
    };

    const handleFilter = (filter) => {
        if (filter === "Tous") {
            setFilteredLinks(links);
        } else {
            setFilteredLinks(links.filter(link => link.tags.includes(filter)));
        }
    };

    return (
        <div style={{ display: "flex", height: "100vh", backgroundColor: isDarkMode ? "#1e1e1e" : "#f8f9fa", color: isDarkMode ? "#fff" : "#000", transition: "background 0.3s" }}>
            <Sidebar categories={categories} tags={tags} onFilter={handleFilter} />
            <div style={{ flex: 1, padding: "20px" }}>
                <Header onSearch={handleSearch} />
                <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ margin: "10px", padding: "8px 12px", borderRadius: "5px", cursor: "pointer", background: "#007bff", color: "white", border: "none", fontSize: "16px" }}>
                    {isDarkMode ? "☀️ Mode Clair" : "🌙 Mode Sombre"}
                </button>
                <LinkGrid links={filteredLinks} />
            </div>
        </div>
    );
};

export default App;