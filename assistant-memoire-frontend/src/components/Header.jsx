import React from "react";

const Header = ({ onSearch }) => {
    return (
        <header style={{ padding: "10px", borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between" }}>
            <h1>🔍 Mes Liens</h1>
            <input type="text" placeholder="Rechercher..." onChange={(e) => onSearch(e.target.value)} />
        </header>
    );
};

export default Header;