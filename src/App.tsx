// src/App.tsx

import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import SplashScreen from "./pages/SplashScreen";
import AuthPage from "./pages/auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import CheckIn from "./pages/CheckIn";
import RescueMe from "./pages/RescueMe";
import SecureChat from "./pages/SecureChat";
import BeforeYouRest from "./pages/BeforeYouRest";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// This component handles the routing based on auth and onboarding status
const AppRoutes = () => {
  const [hasSeenSplash, setHasSeenSplash] = useState(() => localStorage.getItem("hasSeenSplash") === "true");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect Logic
  useEffect(() => {
    if (loading) return;

    // If OAuth tokens are present in the URL, wait for Supabase to establish the session
    const hasOAuthTokens =
      (typeof window !== "undefined") && (
        window.location.hash.includes("access_token") ||
        window.location.search.includes("access_token") ||
        window.location.search.includes("code")
      );
    if (hasOAuthTokens) return;

    const isOnboardingComplete = localStorage.getItem("onboardingComplete") === "true";

    let targetPath = "/";
    // Prioritize authenticated user first to avoid loops after OAuth
    if (user) {
      targetPath = isOnboardingComplete ? "/dashboard" : "/onboarding";
    } else if (!hasSeenSplash) {
      targetPath = "/";
    } else {
      targetPath = "/auth";
    }

    if (window.location.pathname !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  }, [hasSeenSplash, user, loading, navigate]);


  // Show a loading state while waiting for auth
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<SplashScreen onContinue={() => { setHasSeenSplash(true); localStorage.setItem("hasSeenSplash", "true"); navigate("/auth", { replace: true }); }} />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <Onboarding onComplete={() => {
              localStorage.setItem("onboardingComplete", "true");
              navigate("/dashboard", { replace: true });
            }} />
          </RequireAuth>
        }
      />
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/check-in" element={<RequireAuth><CheckIn /></RequireAuth>} />
      <Route path="/rescue-me" element={<RequireAuth><RescueMe /></RequireAuth>} />
      <Route path="/secure-chat" element={<RequireAuth><SecureChat /></RequireAuth>} />
      <Route path="/before-you-rest" element={<RequireAuth><BeforeYouRest /></RequireAuth>} />
      <Route path="/progress" element={<RequireAuth><Progress /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen bg-gradient-calm">
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

export default App;