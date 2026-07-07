"use client";

import { useState } from "react";

export default function SimpleWebSocket() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const sendMessage = () => {
    const socket = new WebSocket("ws://localhost:8000/ws/echo/");

    socket.onopen = () => {
      console.log("Connected");

      // Simple text send
      socket.send(message);
    };

    socket.onmessage = (event) => {
      console.log("Received:", event.data);

      // Plain text receive
      setResponse(event.data);

      socket.close();
    };

    socket.onclose = () => {
      console.log("Disconnected");
    };
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Simple WebSocket Echo Test</h2>

      <input
        type="text"
        placeholder="Enter message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>
        Send
      </button>

      <h3>Server Response:</h3>

      <p>{response}</p>
    </div>
  );
}