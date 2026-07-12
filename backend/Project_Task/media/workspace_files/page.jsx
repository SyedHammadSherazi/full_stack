"use client";

import { useEffect, useRef, useState } from "react";
import NotificationBell from "../../components/NotificationBell";
import FileUpload from "../../components/FileUpload";

export default function ChatPage() {

    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    const [onlineUsers, setOnlineUsers] = useState([]);

    const socketRef = useRef(null);
    const presenceSocketRef = useRef(null);
    const bottomRef = useRef(null);

    // ----------------------------------
    // Auto Scroll
    // ----------------------------------

    useEffect(() => {

        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    }, [messages]);

    // ----------------------------------
    // Load Workspaces
    // ----------------------------------

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

            }

            catch (err) {

                console.log(err);

            }

        }

        loadWorkspaces();

    }, []);

    // ----------------------------------
    // Chat Socket
    // ----------------------------------

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

            console.log("Chat Connected");

        };

        socketRef.current.onmessage = (event) => {

            const data = JSON.parse(event.data);

            console.log(data);

            setMessages(prev => [...prev, data]);

        };

        socketRef.current.onclose = () => {

            console.log("Chat Closed");

        };

        socketRef.current.onerror = (err) => {

            console.log(err);

        };

        return () => {

            if (socketRef.current) {

                socketRef.current.close();

            }

        };

    }, [selectedWorkspace]);

    // ----------------------------------
    // Presence Socket
    // ----------------------------------

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

        presenceSocketRef.current.onmessage = (event) => {

            const data = JSON.parse(event.data);

            if (data.type === "presence") {

                setOnlineUsers(prev => {

                    const users = [...prev];

                    const index = users.findIndex(
                        u => u.user === data.user
                    );

                    if (index !== -1) {

                        users[index] = data;

                    }

                    else {

                        users.push(data);

                    }

                    return users;

                });

            }

        };

        return () => {

            if (presenceSocketRef.current) {

                presenceSocketRef.current.close();

            }

        };

    }, [selectedWorkspace]);

    // ----------------------------------
    // Send Message
    // ----------------------------------

    const sendMessage = () => {

        const username = localStorage.getItem("username");

        if (!message.trim()) return;

        if (
            !socketRef.current ||
            socketRef.current.readyState !== WebSocket.OPEN
        ) {
            console.log("Chat socket is not connected");
            return;
        }

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
                height: "100vh",
            }}
        >

            {/* Sidebar */}

            <div
                style={{
                    width: 250,
                    borderRight: "1px solid #ddd",
                    padding: 20,
                }}
            >

                <h2>Workspaces</h2>

                {
                    workspaces.map(workspace => (

                        <button
                            key={workspace.id}
                            onClick={() =>
                                setSelectedWorkspace(workspace)
                            }
                            style={{
                                width: "100%",
                                padding: 10,
                                marginBottom: 10,
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

            {/* Chat Section */}

            <div
                style={{
                    flex: 3,
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                }}
            >

                <h2>
                    {
                        selectedWorkspace
                            ? selectedWorkspace.name
                            : "Select Workspace"
                    }
                </h2>

                {/* Messages */}

                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        border: "1px solid #ddd",
                        padding: 15,
                        borderRadius: 10,
                        marginBottom: 15,
                    }}
                >

                    {
                        messages.map((msg, index) => {

                            const myMessage =
                                msg.sender === localStorage.getItem("username");

                            return (

                                <div
                                    key={index}
                                    style={{
                                        display: "flex",
                                        justifyContent: myMessage
                                            ? "flex-end"
                                            : "flex-start",
                                        marginBottom: 15,
                                    }}
                                >

                                    <div
                                        style={{
                                            background: myMessage
                                                ? "#DCF8C6"
                                                : "#F1F0F0",
                                            padding: "10px 15px",
                                            borderRadius: 10,
                                            maxWidth: "70%",
                                            boxShadow:
                                                "0 1px 3px rgba(0,0,0,.2)",
                                        }}
                                    >

                                        <strong>
                                            {msg.sender}
                                        </strong>

                                        {
                                            msg.type === "file"

                                                ?

                                                <div
                                                    style={{
                                                        marginTop: 10,
                                                    }}
                                                >

                                                    📎

                                                    <a
                                                        href={msg.file_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{
                                                            marginLeft: 5,
                                                            color: "#1976d2",
                                                            textDecoration: "none",
                                                        }}
                                                    >
                                                        {msg.file_name}
                                                    </a>

                                                </div>

                                                :

                                                <p
                                                    style={{
                                                        marginTop: 8,
                                                    }}
                                                >
                                                    {msg.message}
                                                </p>

                                        }

                                    </div>

                                </div>

                            );

                        })
                    }

                    <div ref={bottomRef}></div>

                </div>

                {/* Input */}

                <div
                    style={{
                        display: "flex",
                        gap: 10,
                    }}
                >

                    <input
                        style={{
                            flex: 1,
                            padding: 12,
                            borderRadius: 8,
                            border: "1px solid #ccc",
                        }}
                        placeholder="Type message..."
                        value={message}
                        onChange={(e) =>
                            setMessage(e.target.value)
                        }
                        onKeyDown={(e) => {

                            if (e.key === "Enter") {

                                sendMessage();

                            }

                        }}
                    />

                    <button
                        onClick={sendMessage}
                        style={{
                            padding: "12px 20px",
                            cursor: "pointer",
                        }}
                    >
                        Send
                    </button>

                </div>

                <FileUpload
                    workspaceId={selectedWorkspace?.id}
                />

            </div>

            {/* Online Users */}

            <div
                style={{
                    width: 250,
                    borderLeft: "1px solid #ddd",
                    padding: 20,
                }}
            >

                <h3>
                    Online Users
                </h3>

                {
                    onlineUsers.length === 0

                        ?

                        <p>No Users Online</p>

                        :

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
                }

                <hr />

                <NotificationBell />

            </div>

        </div>

    );

}
