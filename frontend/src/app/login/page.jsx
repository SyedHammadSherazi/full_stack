import Link from "next/link";
import LoginForm from "../../components/LoginForm";
function Login() {
  return (
    <div>
      <h1>Welcome to Login Page</h1>

      <Link href="/dashboard">
        Go to Dashboard
      </Link>
      <LoginForm />
    </div>
  );
}

export default Login;