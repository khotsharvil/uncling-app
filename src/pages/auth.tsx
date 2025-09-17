import { useState } from "react";
import { supabase } from "../supabaseClient";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Google Sign-In
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) setMessage(error.message);
  };

  // Email Magic Link Sign-In
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for the login link!");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Welcome to Uncling
        </h1>

        {message && (
          <div className="text-center mb-4 text-sm text-red-600">{message}</div>
        )}

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg mb-4 transition"
        >
          Continue with Google
        </button>

        {/* Email Login */}
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg transition"
          >
            {loading ? "Sending link..." : "Login with Email"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
