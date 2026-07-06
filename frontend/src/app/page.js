import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Full Stack Project</h1>

      <p>Welcome to my Next.js + Django Project</p>

      <ul>
        <li><Link href="/practice">Stage 1 - Practice</Link></li>
        <li><Link href="/projects">Projects</Link></li>
        <li><Link href="/login">Login</Link></li>
        <li><Link href="/dashboard">Dashboard</Link></li>
      </ul>
    </main>
  );
}