import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../supabaseClient";

interface AuthContextType {
  user: any | null;
  loading: boolean; // ✅ Added loading property
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true, // ✅ Updated default value
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true); // ✅ Added loading state

  // 🔹 Google Sign-in function
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  // 🔹 Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  useEffect(() => {
    // Handle OAuth redirect: exchange code/hash for a session
    (async () => {
      try {
        if (typeof window !== "undefined") {
          const hasTokensInUrl =
            window.location.hash.includes("access_token") ||
            window.location.search.includes("access_token") ||
            window.location.search.includes("code");
          if (hasTokensInUrl) {
            const { data, error } = await supabase.auth.exchangeCodeForSession({ storeSession: true });
            if (!error && data?.session?.user) {
              setUser(data.session.user);
            }
            // Clean URL to remove tokens
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      } catch (e) {
        // noop; will fall back to getSession below
      }
    })();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false); // ✅ Set loading to false after the auth state is known

        // Clean URL after OAuth redirect to avoid re-parsing tokens and warnings
        if (typeof window !== "undefined") {
          const hasTokensInUrl =
            window.location.hash.includes("access_token") ||
            window.location.search.includes("access_token") ||
            window.location.search.includes("code");
          if (hasTokensInUrl) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }
    );

    // Initial check for session to handle page load
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setLoading(false);

      // Also clean URL on initial load if tokens are present
      if (typeof window !== "undefined") {
        const hasTokensInUrl =
          window.location.hash.includes("access_token") ||
          window.location.search.includes("access_token") ||
          window.location.search.includes("code");
        if (hasTokensInUrl) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    });

    return () => {
      subscription?.subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);