import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <button onClick={signInWithGoogle}>
      Sign in with Google
    </button>
  );
};

export default Login;
