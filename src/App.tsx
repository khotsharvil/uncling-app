// src/App.tsx

import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

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

// A simple component to handle authentication and onboarding checks for protected routes
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isOnboardingComplete = localStorage.getItem("onboardingComplete") === "true";

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isOnboardingComplete && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return children;
};

const AppRoutes = () => {
  const [hasSeenSplash, setHasSeenSplash] = useState(() => localStorage.getItem("hasSeenSplash") === "true");

  const handleSplashContinue = () => {
    setHasSeenSplash(true);
    localStorage.setItem("hasSeenSplash", "true");
  };

  const isOnboardingComplete = localStorage.getItem("onboardingComplete") === "true";

  return (
    <Routes>
      <Route path="/" element={!hasSeenSplash ? <SplashScreen onContinue={handleSplashContinue} /> : <Navigate to={isOnboardingComplete ? "/dashboard" : "/auth"} replace />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* Protected Routes */}
      <Route path="/onboarding" element={<RequireAuth><Onboarding onComplete={() => localStorage.setItem("onboardingComplete", "true")} /></RequireAuth>} />
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

export default App;