"use client";

import { useEffect, useRef, useState } from "react";

export default function ChatPage() {

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState([]);

    // Online users
    const [onlineUsers, setOnlineUsers] = useState([]);

    const socketRef = useRef(null);
    const presenceSocketRef = useRef(null);

    const workspaceId = 1;

    // ----------------------------
    // Chat Socket
    // ----------------------------
    useEffect(() => {

        socketRef.current = new WebSocket(
            "ws://127.0.0.1:8000/ws/chat/general/"
        );

        socketRef.current.onopen = () => {
            console.log("✅ Chat Connected");
        };

        socketRef.current.onmessage = (event) => {

            const data = JSON.parse(event.data);

            setMessages((prev) => [...prev, data]);

        };

        socketRef.current.onclose = () => {
            console.log("❌ Chat Disconnected");
        };

        return () => {

            if (socketRef.current) {
                socketRef.current.close();
            }

        };

    }, []);

    // ----------------------------
    // Presence Socket
    // ----------------------------
    useEffect(() => {

        const token = localStorage.getItem("access");

        if (!token) return;

        presenceSocketRef.current = new WebSocket(
            `ws://127.0.0.1:8000/ws/workspace/${workspaceId}/?token=${token}`
        );

        presenceSocketRef.current.onopen = () => {
            console.log("✅ Presence Connected");
        };

        presenceSocketRef.current.onmessage = (event) => {

            const data = JSON.parse(event.data);

            if (data.type === "presence") {

                setOnlineUsers((prev) => {

                    const users = [...prev];

                    const index = users.findIndex(
                        (u) => u.user === data.user
                    );

                    if (index !== -1) {
                        users[index] = data;
                    } else {
                        users.push(data);
                    }

                    return users;
                });

            }

        };

        presenceSocketRef.current.onclose = () => {
            console.log("❌ Presence Disconnected");
        };

        return () => {

            if (presenceSocketRef.current) {
                presenceSocketRef.current.close();
            }

        };

    }, []);

    // ----------------------------
    // Send Chat Message
    // ----------------------------
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

        <div
            style={{
                display: "flex",
                gap: "30px",
                padding: "20px",
            }}
        >

            {/* Chat */}

            <div
                style={{
                    flex: 3,
                }}
            >

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
                            <strong>{msg.sender}</strong> : {msg.message}
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

            {/* Online Users */}

            <div
                style={{
                    flex: 1,
                    border: "1px solid #ccc",
                    padding: "15px",
                    minHeight: "350px",
                }}
            >

                <h2>Online Users</h2>

                {onlineUsers.length === 0 ? (

                    <p>No Users</p>

                ) : (

                    onlineUsers.map((user) => (

                        <p key={user.user}>

                            {user.status === "online"
                                ? "🟢"
                                : "🔴"}{" "}

                            {user.user}

                        </p>

                    ))

                )}

            </div>

        </div>

    );

}