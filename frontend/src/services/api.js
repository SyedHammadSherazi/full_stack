export async function getProjects() {

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // localStorage se token lo
    const token = localStorage.getItem("access");

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch projects");
    }

    return response.json();
}