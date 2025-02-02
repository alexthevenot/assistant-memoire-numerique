import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Sidebar = ({ categories, tags, onFilter }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    return (
        <aside style={{ width: isCollapsed ? "60px" : "250px", padding: "15px", borderRight: "1px solid #ddd", backgroundColor: "#f8f9fa", transition: "width 0.3s", position: "relative" }}>
            <button onClick={() => setIsCollapsed(!isCollapsed)} style={{ position: "absolute", top: "10px", right: "-20px", background: "#007bff", color: "white", border: "none", padding: "5px", borderRadius: "5px", cursor: "pointer" }}>
                {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
            {!isCollapsed && (
                <>
                    <h3 style={{ color: "#007bff" }}>📂 Catégories</h3>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {categories.map((cat, index) => (
                            <li key={index} onClick={() => onFilter(cat)} style={{ cursor: "pointer", padding: "5px", borderRadius: "5px", transition: "background 0.3s", backgroundColor: "#e9ecef", margin: "5px 0" }}>{cat}</li>
                        ))}
                    </ul>
                    <h3 style={{ color: "#007bff" }}>🏷 Tags</h3>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {tags.map((tag, index) => (
                            <li key={index} onClick={() => onFilter(tag)} style={{ cursor: "pointer", padding: "5px", borderRadius: "5px", transition: "background 0.3s", backgroundColor: "#e9ecef", margin: "5px 0" }}>#{tag}</li>
                        ))}
                    </ul>
                </>
            )}
        </aside>
    );
};

export default Sidebar;