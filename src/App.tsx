// src/App.tsx

import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

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

    const isOnboardingComplete = localStorage.getItem("onboardingComplete") === "true";

    let targetPath = "/";
    if (!hasSeenSplash) {
      targetPath = "/";
    } else if (!user) {
      targetPath = "/auth";
    } else if (!isOnboardingComplete) {
      targetPath = "/onboarding";
    } else {
      targetPath = "/dashboard";
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
        element={<Onboarding onComplete={() => {
          localStorage.setItem("onboardingComplete", "true");
          navigate("/dashboard", { replace: true });
        }} />}
      />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/check-in" element={<CheckIn />} />
      <Route path="/rescue-me" element={<RescueMe />} />
      <Route path="/secure-chat" element={<SecureChat />} />
      <Route path="/before-you-rest" element={<BeforeYouRest />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/settings" element={<Settings />} />
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

export default App;