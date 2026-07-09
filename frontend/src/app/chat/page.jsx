"use client";

import { useEffect, useRef, useState } from "react";
import NotificationBell from "../../components/NotificationBell";
export default function ChatPage() {

    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    const [onlineUsers, setOnlineUsers] = useState([]);

    const socketRef = useRef(null);
    const presenceSocketRef = useRef(null);

    // -------------------------------------
    // Load Workspaces
    // -------------------------------------
    useEffect(() => {

        async function loadWorkspaces() {

            const token = localStorage.getItem("access");

            if (!token) return;

            try {

                const response = await fetch(
                    "http://127.0.0.1:8000/api/workspaces/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                setWorkspaces(data);

                if (data.length > 0) {
                    setSelectedWorkspace(data[0]);
                }

            } catch (err) {
                console.error(err);
            }

        }

        loadWorkspaces();

    }, []);

    // -------------------------------------
    // Chat Socket
    // -------------------------------------
    useEffect(() => {

        if (!selectedWorkspace) return;

        setMessages([]);

        if (socketRef.current) {
            socketRef.current.close();
        }

        socketRef.current = new WebSocket(
            `ws://127.0.0.1:8000/ws/chat/${selectedWorkspace.id}/`
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

        socketRef.current.onerror = (err) => {
            console.error(err);
        };

        return () => {

            if (socketRef.current) {
                socketRef.current.close();
            }

        };

    }, [selectedWorkspace]);

    // -------------------------------------
    // Presence Socket
    // -------------------------------------
    useEffect(() => {

        if (!selectedWorkspace) return;

        const token = localStorage.getItem("access");

        if (!token) return;

        setOnlineUsers([]);

        if (presenceSocketRef.current) {
            presenceSocketRef.current.close();
        }

        presenceSocketRef.current = new WebSocket(
            `ws://127.0.0.1:8000/ws/workspace/${selectedWorkspace.id}/?token=${token}`
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

        presenceSocketRef.current.onerror = (err) => {
            console.error(err);
        };

        return () => {

            if (presenceSocketRef.current) {
                presenceSocketRef.current.close();
            }

        };

    }, [selectedWorkspace]);

    // -------------------------------------
    // Send Message
    // -------------------------------------
    const sendMessage = () => {

        const username = localStorage.getItem("username");

        if (!message.trim()) return;

        if (
            socketRef.current &&
            socketRef.current.readyState === WebSocket.OPEN
        ) {

            socketRef.current.send(
                JSON.stringify({
                    sender: username,
                    message: message,
                })
            );

            setMessage("");

        }

    };

    return (

        <div
            style={{
                display: "flex",
                height: "100vh",
            }}
        >

            {/* Workspace Sidebar */}

            <div
                style={{
                    width: "250px",
                    borderRight: "1px solid #ccc",
                    padding: "20px",
                }}
            >

                <h2>Workspaces</h2>

                {
                    workspaces.map((workspace) => (

                        <button
                            key={workspace.id}
                            onClick={() => setSelectedWorkspace(workspace)}
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginBottom: "10px",
                                cursor: "pointer",
                                background:
                                    selectedWorkspace?.id === workspace.id
                                        ? "#ddd"
                                        : "#fff",
                            }}
                        >
                            {workspace.name}
                        </button>

                    ))
                }

            </div>

            {/* Chat */}

            <div
                style={{
                    flex: 3,
                    padding: "20px",
                }}
            >

                <h1>
                    {selectedWorkspace
                        ? selectedWorkspace.name
                        : "Select Workspace"}
                </h1>

                <div
                    style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        height: "350px",
                        overflowY: "auto",
                        marginBottom: "20px",
                    }}
                >

                    {
                        messages.map((msg, index) => (

                            <p key={index}>
                                <strong>{msg.sender}</strong> : {msg.message}
                            </p>

                        ))
                    }

                </div>

                <input
                    type="text"
                    value={message}
                    placeholder="Type your message..."
                    onChange={(e) => setMessage(e.target.value)}
                />

                <button
                    onClick={sendMessage}
                    style={{
                        marginLeft: "10px",
                    }}
                >
                    Send
                </button>

            </div>

            {/* Presence */}

            <div
                style={{
                    width: "250px",
                    borderLeft: "1px solid #ccc",
                    padding: "20px",
                }}
            >

                <h2>Online Users</h2>

                {
                    onlineUsers.length === 0
                        ? (
                            <p>No Users Online</p>
                        )
                        : (
                            onlineUsers.map((user) => (

                                <p key={user.user}>

                                    {
                                        user.status === "online"
                                            ? "🟢"
                                            : "🔴"
                                    }

                                    {" "}

                                    {user.user}

                                </p>

                            ))
                        )
                }

            </div>
            <div
    style={{
        marginTop: "30px",
    }}
>
    <NotificationBell />
</div>

        </div>

    );

}