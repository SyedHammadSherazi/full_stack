"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {

    const router = useRouter();

    const [username, setUsername] = useState("");

    useEffect(() => {

        const token = localStorage.getItem("access");

        if (!token) {
            router.push("/login");
            return;
        }

        fetch("http://127.0.0.1:8000/api/user/", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setUsername(data.username);
            })
            .catch((error) => {
                console.log(error);
            });

    }, [router]);

    const handleLogout = () => {

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("username");

        router.push("/login");
    };

    return (

        <div
            style={{
                minHeight: "100vh",
                background: "#f5f5f5",
            }}
        >

            {/* Navbar */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "15px 40px",
                    background: "#222",
                    color: "#fff",
                }}
            >

                <h2>
                    Real-Time Collaboration
                </h2>

                <div
                    style={{
                        display: "flex",
                        gap: "15px",
                    }}
                >

                   

                    <button
                        onClick={() => router.push("/chat")}
                    >
                        💬 Chat
                    </button>

                    <button
                        onClick={() => router.push("Notes")}
                    >
                        📝 Notes
                    </button>

                    <button
                        onClick={handleLogout}
                        style={{
                            background: "red",
                            color: "#fff",
                        }}
                    >
                        🚪 Logout
                    </button>

                </div>

            </div>

            {/* Body */}

            <div
                style={{
                    padding: "50px",
                }}
            >

                <h1>
                    Welcome, {username} 👋
                </h1>

                <p>
                    Select any module from the navigation bar to continue.
                </p>

            </div>

        </div>

    );

}