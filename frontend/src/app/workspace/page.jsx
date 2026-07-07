"use client";

import { useEffect, useRef, useState } from "react";

export default function WorkspacePage() {
  const [content, setContent] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket("ws://127.0.0.1:8000/ws/notes/1/");

    socketRef.current.onopen = () => {
      console.log("WebSocket Connected");
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setContent(data.content);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => {
      socketRef.current.close();
    };
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setContent(value);

    socketRef.current.send(
      JSON.stringify({
        content: value,
      })
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Workspace Notes</h2>

      <textarea
        rows={10}
        cols={80}
        value={content}
        onChange={handleChange}
      />
    </div>
  );
}