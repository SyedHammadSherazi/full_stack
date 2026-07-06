"use client";

import { useEffect, useState } from "react";
import { getProjects } from "../../services/api";
import ProjectList from "../../components/ProjectList";

export default function ProjectsPage() {

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        async function fetchProjects() {

            try {
                const data = await getProjects();
                setProjects(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load projects.");
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();

    }, []);

    if (loading) {
        return <h2>Loading...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
        <main>
            <h1>Projects</h1>
            <ProjectList projects={projects} />
        </main>
    );
}