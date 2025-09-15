import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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

const AppRoutes = () => {
  const [hasSeenSplash, setHasSeenSplash] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          !hasSeenSplash ? (
            <SplashScreen onContinue={() => setHasSeenSplash(true)} />
          ) : !user ? (
            // 👇 After splash → show login
            <AuthPage />
          ) : !hasCompletedOnboarding ? (
            <Onboarding onComplete={() => setHasCompletedOnboarding(true)} />
          ) : (
            <Dashboard />
          )
        }
      />

      {/* Protected pages */}
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" replace />} />
      <Route path="/check-in" element={user ? <CheckIn /> : <Navigate to="/" replace />} />
      <Route path="/rescue-me" element={user ? <RescueMe /> : <Navigate to="/" replace />} />
      <Route path="/secure-chat" element={user ? <SecureChat /> : <Navigate to="/" replace />} />
      <Route path="/before-you-rest" element={user ? <BeforeYouRest /> : <Navigate to="/" replace />} />
      <Route path="/progress" element={user ? <Progress /> : <Navigate to="/" replace />} />
      <Route path="/settings" element={user ? <Settings /> : <Navigate to="/" replace />} />

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
