"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotesPage() {
  const router = useRouter();

  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [content, setContent] = useState("");

  const socketRef = useRef(null);
  const debounceRef = useRef(null); // Debounce timer

  const workspaceId = 1;

  // Load Notes
  useEffect(() => {
    async function loadNotes() {
      const token = localStorage.getItem("access");

      // Redirect if not logged in
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/workspaces/${workspaceId}/notes/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // JWT expired or invalid
        if (res.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          router.replace("/login");
          return;
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Unexpected Response:", data);
          setNotes([]);
          return;
        }

        setNotes(data);

        if (data.length > 0) {
          setSelectedNote(data[0]);
          setContent(data[0].content || "");
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadNotes();
  }, [router]);

  // WebSocket
  useEffect(() => {
    if (!selectedNote) return;

    // Close previous socket
    if (socketRef.current) {
      socketRef.current.close();
    }

    socketRef.current = new WebSocket(
      `ws://127.0.0.1:8000/ws/note/${selectedNote.id}/`
    );

    socketRef.current.onopen = () => {
      console.log("✅ Connected");
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.content !== undefined) {
        setContent(data.content);
      }
    };

    socketRef.current.onclose = () => {
      console.log("❌ Socket Closed");
    };

    socketRef.current.onerror = (err) => {
      console.error(err);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [selectedNote]);

  // Typing with Debounce
  const handleChange = (e) => {
    const value = e.target.value;

    // Update textarea instantly
    setContent(value);

    // Clear previous timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Wait 500ms before sending update
    debounceRef.current = setTimeout(() => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.send(
          JSON.stringify({
            content: value,
          })
        );
      }
    }, 500);
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
          width: "250px",
          borderRight: "1px solid #ccc",
          padding: "20px",
        }}
      >
        <h2>Notes</h2>

        {notes.length === 0 ? (
          <p>No Notes Found</p>
        ) : (
          notes.map((note) => (
            <div key={note.id}>
              <button
                onClick={() => {
                  setSelectedNote(note);
                  setContent(note.content || "");
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  cursor: "pointer",
                  background:
                    selectedNote?.id === note.id ? "#ddd" : "#fff",
                }}
              >
                {note.title}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Editor */}
      <div
        style={{
          flex: 1,
          padding: "20px",
        }}
      >
        <h2>
          {selectedNote ? selectedNote.title : "Select Note"}
        </h2>

        <textarea
          value={content}
          onChange={handleChange}
          rows={25}
          style={{
            width: "100%",
            fontSize: "16px",
            padding: "10px",
          }}
        />
      </div>
    </div>
  );
}