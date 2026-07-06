"use client";

import { useState } from "react";

function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? "Hide Sidebar" : "Show Sidebar"}
            </button>

            {isOpen && (
                <div>
                    <h2>Sidebar</h2>
                    <p>This is the sidebar content.</p>
                </div>
            )}
        </div>
    );
}

export default Sidebar;