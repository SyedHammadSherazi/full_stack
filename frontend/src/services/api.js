export async function getProjects() {

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const token = localStorage.getItem("access");

    console.log("Token:", token);
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    console.log("Status:", response.status);

    if (!response.ok) {
    const error = await response.text();
    console.log("Backend Error:", error);
    throw new Error("Failed to fetch projects");
    }
    return response.json();
}