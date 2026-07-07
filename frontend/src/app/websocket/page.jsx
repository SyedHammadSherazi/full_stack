"use client";

import { useEffect, useRef, useState } from "react";

export default function WebSocketPage() {
  const socket = useRef(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    console.log("Creating WebSocket...");

    socket.current = new WebSocket("ws://127.0.0.1:8000/ws/chat/");

    socket.current.onopen = () => {
      // console.log("✅ Connected");
      setStatus("Connected");
    };

    socket.current.onmessage = (event) => {
      // console.log("Message:", event.data);

      const data = JSON.parse(event.data);

      setMessages((prev) => [...prev, data.message]);
    };

    socket.current.onerror = (error) => {
      // console.error("❌ WebSocket Error:", error);
      setStatus("Error");
    };

    socket.current.onclose = (event) => {
      // console.log("❌ Disconnected");
      // console.log("Close Code:", event.code);
      // console.log("Reason:", event.reason);

      setStatus("Disconnected");
    };

    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, []);

  function sendMessage() {
    if (!socket.current) return;

    if (socket.current.readyState !== WebSocket.OPEN) {
      alert("WebSocket is not connected.");
      return;
    }

    socket.current.send(
      JSON.stringify({
        message: message,
      })
    );

    setMessage("");
  }

  return (
    <main style={{ padding: "20px" }}>
      <h1>WebSocket Echo Demo</h1>

      <h3>Status: {status}</h3>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
      />

      <button onClick={sendMessage}>Send</button>

      <hr />

      {messages.map((msg, index) => (
        <p key={index}>{msg}</p>
      ))}
    </main>
  );
}