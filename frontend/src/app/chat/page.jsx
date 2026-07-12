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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isUsersOpen, setIsUsersOpen] = useState(false);

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

    // ----------------------------------
    // Close sidebars on outside click (mobile)
    // ----------------------------------

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsSidebarOpen(false);
                setIsUsersOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (

        <div
            style={{
                display: "flex",
                height: "100vh",
                position: "relative",
                overflow: "hidden",
            }}
        >

            {/* Mobile Menu Button */}

            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                    position: "fixed",
                    top: 10,
                    left: 10,
                    zIndex: 1000,
                    padding: "10px 15px",
                    background: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: window.innerWidth <= 768 ? "block" : "none",
                    fontSize: "20px",
                }}
            >
                ☰
            </button>

            {/* Mobile Users Button */}

            <button
                onClick={() => setIsUsersOpen(!isUsersOpen)}
                style={{
                    position: "fixed",
                    top: 10,
                    right: 10,
                    zIndex: 1000,
                    padding: "10px 15px",
                    background: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: window.innerWidth <= 768 ? "block" : "none",
                    fontSize: "20px",
                }}
            >
                👥
            </button>

            {/* Sidebar Overlay (Mobile) */}

            {isSidebarOpen && window.innerWidth <= 768 && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        zIndex: 998,
                    }}
                />
            )}

            {/* Sidebar */}

            <div
                style={{
                    width: 250,
                    borderRight: "1px solid #ddd",
                    padding: 20,
                    backgroundColor: "white",
                    position: window.innerWidth <= 768 ? "fixed" : "relative",
                    left: window.innerWidth <= 768 ? (isSidebarOpen ? 0 : "-300px") : 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 999,
                    transition: "left 0.3s ease",
                    overflowY: "auto",
                    boxShadow: window.innerWidth <= 768 ? "2px 0 10px rgba(0,0,0,0.1)" : "none",
                }}
            >

                <h2 style={{ marginTop: window.innerWidth <= 768 ? 50 : 0 }}>Workspaces</h2>

                {
                    workspaces.map(workspace => (

                        <button
                            key={workspace.id}
                            onClick={() => {
                                setSelectedWorkspace(workspace);
                                if (window.innerWidth <= 768) setIsSidebarOpen(false);
                            }}
                            style={{
                                width: "100%",
                                padding: 10,
                                marginBottom: 10,
                                cursor: "pointer",
                                background:
                                    selectedWorkspace?.id === workspace.id
                                        ? "#ddd"
                                        : "#fff",
                                border: "1px solid #ccc",
                                borderRadius: 5,
                                textAlign: "left",
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
                    flex: 1,
                    padding: window.innerWidth <= 768 ? "60px 15px 15px 15px" : "20px",
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    height: "100vh",
                }}
            >

                <h2
                    style={{
                        fontSize: window.innerWidth <= 768 ? "1.2rem" : "1.5rem",
                        marginBottom: 15,
                        paddingTop: window.innerWidth <= 768 ? 0 : 0,
                    }}
                >
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
                        padding: window.innerWidth <= 768 ? 10 : 15,
                        borderRadius: 10,
                        marginBottom: 15,
                        minHeight: 0,
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
                                            padding: "8px 12px",
                                            borderRadius: 10,
                                            maxWidth: window.innerWidth <= 768 ? "85%" : "70%",
                                            boxShadow:
                                                "0 1px 3px rgba(0,0,0,.2)",
                                            wordWrap: "break-word",
                                        }}
                                    >

                                        <strong style={{ fontSize: window.innerWidth <= 768 ? "0.9rem" : "1rem" }}>
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
                                                            wordBreak: "break-all",
                                                        }}
                                                    >
                                                        {msg.file_name}
                                                    </a>

                                                </div>

                                                :

                                                <p
                                                    style={{
                                                        marginTop: 8,
                                                        marginBottom: 0,
                                                        fontSize: window.innerWidth <= 768 ? "0.95rem" : "1rem",
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
                        flexWrap: "wrap",
                    }}
                >

                    <input
                        style={{
                            flex: 1,
                            padding: "12px 15px",
                            borderRadius: 8,
                            border: "1px solid #ccc",
                            fontSize: window.innerWidth <= 768 ? "0.95rem" : "1rem",
                            minWidth: window.innerWidth <= 768 ? "150px" : "200px",
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
                            background: "#1976d2",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            fontSize: window.innerWidth <= 768 ? "0.95rem" : "1rem",
                            flex: window.innerWidth <= 768 ? "1" : "0",
                        }}
                    >
                        Send
                    </button>

                </div>

                <FileUpload
                    workspaceId={selectedWorkspace?.id}
                />

            </div>

            {/* Users Overlay (Mobile) */}

            {isUsersOpen && window.innerWidth <= 768 && (
                <div
                    onClick={() => setIsUsersOpen(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        zIndex: 998,
                    }}
                />
            )}

            {/* Online Users */}

            <div
                style={{
                    width: 250,
                    borderLeft: "1px solid #ddd",
                    padding: 20,
                    backgroundColor: "white",
                    position: window.innerWidth <= 768 ? "fixed" : "relative",
                    right: window.innerWidth <= 768 ? (isUsersOpen ? 0 : "-300px") : 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 999,
                    transition: "right 0.3s ease",
                    overflowY: "auto",
                    boxShadow: window.innerWidth <= 768 ? "-2px 0 10px rgba(0,0,0,0.1)" : "none",
                }}
            >

                <h3 style={{ marginTop: window.innerWidth <= 768 ? 50 : 0 }}>
                    Online Users
                </h3>

                {
                    onlineUsers.length === 0

                        ?

                        <p>No Users Online</p>

                        :

                        onlineUsers.map((user) => (

                            <p key={user.user} style={{ fontSize: window.innerWidth <= 768 ? "0.95rem" : "1rem" }}>

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

                <hr style={{ margin: "20px 0" }} />

                <NotificationBell />

            </div>

        </div>

    );

}