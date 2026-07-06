"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {

    const router = useRouter();

    const [username, setUsername] = useState("");

    useEffect(() => {

        const token = localStorage.getItem("access");

        // Agar token nahi hai to login page par bhej do
        if (!token) {
            router.push("/login");
            return;
        }

        // Logged-in user ka naam fetch karo
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

    // Logout Function
    const handleLogout = () => {

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        router.push("/login");
    };

    return (
        <div>

            <h1>Dashboard</h1>

            <h2>Welcome, {username}</h2>

            <br />

            <button onClick={handleLogout}>
                Logout
            </button>

        </div>
    );
}