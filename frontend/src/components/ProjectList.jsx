function ProjectList({ projects }) {
    return (
        <div>
            <h2>Projects List</h2>

            <ul>
                {projects.map((project) => (
                    <li key={project.id}>
                        <h3>{project.title}</h3>

                        <p>{project.description}</p>

                        <strong>Status:</strong> {project.status}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ProjectList;