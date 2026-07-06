import MessageList from "../components/MessageList";
import Link from "next/link";
import Parentsprops from "../components/Greeting";
import Sidebar from "../components/Sidebar";
function Home() {
    return (
        <main>
            <h1>Next.js Components Practice</h1>

            <MessageList />
         <Link href="/login">
        Login
      </Link>

      <br />

      <Link href="/dashboard">
        Dashboard
      </Link>
      
      <Parentsprops />
        <Sidebar />
        </main>
    );
}

export default Home;