import React from "react";

const LinkGrid = ({ links }) => {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "15px", padding: "20px" }}>
            {links.map((link, index) => (
                <div key={index} style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "5px" }}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <h3>{link.url}</h3>
                    </a>
                    <p><strong>Tags:</strong> {link.tags.join(", ")}</p>
                </div>
            ))}
        </div>
    );
};

export default LinkGrid;