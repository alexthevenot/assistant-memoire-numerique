// src/components/LinkGrid.jsx
import React from "react";

const LinkGrid = ({ links, onClassify }) => {
    return (
        <div>
            <h2>🔗 Liens sauvegardés</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {links.map((link) => (
                    <li key={link.id} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", backgroundColor: "#fff" }}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", marginBottom: "5px" }}>
                            {link.url}
                        </a>
                        <p><strong>Tags:</strong> {link.tags.join(", ")}</p>
                        <button 
                            onClick={() => onClassify(link.url)}
                            style={{
                                marginTop: "5px",
                                padding: "5px 10px",
                                borderRadius: "5px",
                                cursor: "pointer",
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                fontSize: "14px"
                            }}
                        >
                            📌 Classifier
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LinkGrid;
