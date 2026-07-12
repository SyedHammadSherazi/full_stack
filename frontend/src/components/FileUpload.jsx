"use client";

import { useRef, useState } from "react";

export default function FileUpload({ workspaceId }) {

    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const inputRef = useRef(null);

    const uploadFile = async () => {

        if (!selectedFile) {
            alert("Select a file");
            return;
        }

        setLoading(true);

        const token = localStorage.getItem("access");

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {

            const response = await fetch(
                `http://127.0.0.1:8000/files/workspace/${workspaceId}/upload-file/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (response.ok) {

                setSelectedFile(null);

                if (inputRef.current) {
                    inputRef.current.value = "";
                }

            } else {
                alert(data.message);
            }

        } catch (err) {
            console.log(err);
        }

        setLoading(false);
    };

    return (

        <div
            style={{
                marginTop: 20,
                display: "flex",
                alignItems: "center",
                gap: 10,
            }}
        >

            <input
                ref={inputRef}
                type="file"
                onChange={(e) =>
                    setSelectedFile(e.target.files[0])
                }
            />

            <button
                onClick={uploadFile}
                disabled={loading}
            >
                {
                    loading
                        ? "Uploading..."
                        : "📎 Upload File"
                }
            </button>

        </div>

    );

}