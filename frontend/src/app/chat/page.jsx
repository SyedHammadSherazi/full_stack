"use client";

import { useEffect, useRef, useState } from "react";

export default function ChatPage() {

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    const socketRef = useRef(null);

    useEffect(() => {

        socketRef.current = new WebSocket(
            "ws://127.0.0.1:8000/ws/chat/general/"
        );

        socketRef.current.onopen = () => {
            console.log("✅ Connected");
        };

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            setMessages((prev) => [...prev, data]);
        };

        socketRef.current.onclose = () => {
            console.log("❌ Disconnected");
        };

        return () => {
            socketRef.current.close();
        };

    }, []);

    const sendMessage = () => {

        const username = localStorage.getItem("username");

        if (!message.trim()) return;

        socketRef.current.send(
            JSON.stringify({
                sender: username,
                message: message,
            })
        );

        setMessage("");
    };

    return (
        <div>

            <h1>Real-Time Chat</h1>

            <div
                style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    height: "300px",
                    overflowY: "auto",
                    marginBottom: "20px",
                }}
            >
                {messages.map((msg, index) => (
                    <p key={index}>
                        <strong>{msg.sender}</strong>: {msg.message}
                    </p>
                ))}
            </div>

            <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />

            <button onClick={sendMessage}>
                Send
            </button>

        </div>
    );
}