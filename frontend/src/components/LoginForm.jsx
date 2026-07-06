"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../services/auth";

export default function LoginForm() {

    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin(event) {

        event.preventDefault();

        try {

            const data = await loginUser(username, password);

            // Token save karo
            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);

            console.log("Login Successful");
            console.log(data);

            // Dashboard par bhej do
            router.push("/dashboard");

        } catch (error) {

            alert(error.message);

        }
    }

    return (

        <form onSubmit={handleLogin}>

            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <br /><br />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <br /><br />

            <button type="submit">
                Login
            </button>

        </form>

    );
}