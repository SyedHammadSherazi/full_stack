"use client";

import { useEffect, useState } from "react";

export default function FileUpload({ workspaceId }) {

    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // ----------------------------
    // Load Files
    // ----------------------------
    const loadFiles = async () => {

        if (!workspaceId) return;

        const token = localStorage.getItem("access");

        try {

            const response = await fetch(
                `http://127.0.0.1:8000/files/workspace/${workspaceId}/upload-file/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            setFiles(data);

        } catch (err) {

            console.error(err);

        }

    };

    // ----------------------------
    // Upload File
    // ----------------------------
    const uploadFile = async () => {

        if (!selectedFile) {
            alert("Please select a file.");
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

                alert("✅ File uploaded successfully.");

                setSelectedFile(null);

                loadFiles();

            } else {

                alert(data.message);

            }

        } catch (err) {

            console.error(err);

        }

        setLoading(false);

    };

    useEffect(() => {

        loadFiles();

    }, [workspaceId]);

    return (

        <div
            style={{
                marginTop: "30px",
                border: "1px solid #ddd",
                padding: "20px",
                borderRadius: "10px",
            }}
        >

            <h2>📁 Workspace Files</h2>

            <input
                type="file"
                onChange={(e) =>
                    setSelectedFile(e.target.files[0])
                }
            />

            <button
                onClick={uploadFile}
                disabled={loading}
                style={{
                    marginLeft: "10px",
                }}
            >
                {
                    loading
                        ? "Uploading..."
                        : "Upload"
                }
            </button>

            <hr />

            {
                files.length === 0 ? (

                    <p>No Files</p>

                ) : (

                    files.map((file) => (

                        <div
                            key={file.id}
                            style={{
                                marginBottom: "15px",
                                paddingBottom: "10px",
                                borderBottom: "1px solid #eee",
                            }}
                        >

                            <h4>
                                📄 {file.original_name}
                            </h4>

                            <p>

                                Uploaded By :

                                {" "}

                                <strong>
                                    {file.uploaded_by}
                                </strong>

                            </p>

                            <a
                                href={file.file_url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                ⬇ Download
                            </a>

                        </div>

                    ))

                )
            }

        </div>

    );

}