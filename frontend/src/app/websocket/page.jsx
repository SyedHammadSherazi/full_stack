"use client";

import { useEffect, useRef, useState } from "react";

export default function WebSocketPage() {

    const socket = useRef(null);

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {

        socket.current = new WebSocket("ws://127.0.0.1:8000/ws/echo/");

        socket.current.onopen = () => {
            console.log("Connected");
        };

        socket.current.onmessage = (event) => {

            const data = JSON.parse(event.data);

            setMessages((prev) => [...prev, data.message]);
        };

        socket.current.onclose = () => {
            console.log("Disconnected");
        };

        return () => {
            socket.current.close();
        };

    }, []);

    function sendMessage() {

        socket.current.send(
            JSON.stringify({
                message: message,
            })
        );

        setMessage("");
    }

    return (

        <main>

            <h1>WebSocket Echo Demo</h1>

            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message"
            />

            <button onClick={sendMessage}>
                Send
            </button>

            <hr />

            {messages.map((msg, index) => (
                <p key={index}>{msg}</p>
            ))}

        </main>
    );
}