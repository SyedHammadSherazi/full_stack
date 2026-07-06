import { getProjects } from "../../services/api";
import ProjectList from "../../components/ProjectList";

export default async function ProjectsPage() {

    try {
        const projects = await getProjects();

        return (
            <main>
                <h1>Projects</h1>

                <ProjectList projects={projects} />
            </main>
        );

    } catch (error) {

        return (
            <main>
                <h1>Projects</h1>

                <p>Failed to load projects.</p>
            </main>
        );
    }
}