import MessageList from "../../components/MessageList";
import Greeting from "../../components/Greeting";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";

export default function Practice() {
  return (
    <main>
      <h1>Next.js Components Practice</h1>

      <MessageList />

      <br />

      <Link href="/login">Login</Link>

      <br />

      <Link href="/dashboard">Dashboard</Link>

      <br />

      <Greeting />

      <br />

      <Sidebar />
    </main>
  );
}