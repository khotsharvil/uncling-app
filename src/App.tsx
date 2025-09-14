import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SplashScreen from "./pages/SplashScreen";
import AuthPage from "./pages/auth";  // login screen
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

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenSplash, setHasSeenSplash] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-calm">
            <Routes>
              {/* Root flow */}
              <Route
                path="/"
                element={
                  !hasSeenSplash ? (
                    <SplashScreen onContinue={() => setHasSeenSplash(true)} />
                  ) : !session ? (
                    <AuthPage />  // login/signup second
                  ) : !hasCompletedOnboarding ? (
                    <Onboarding onComplete={() => setHasCompletedOnboarding(true)} />
                  ) : (
                    <Dashboard />
                  )
                }
              />

              {/* Other pages (require login) */}
              <Route
                path="/dashboard"
                element={session ? <Dashboard /> : <Navigate to="/" replace />}
              />
              <Route
                path="/check-in"
                element={session ? <CheckIn /> : <Navigate to="/" replace />}
              />
              <Route
                path="/rescue-me"
                element={session ? <RescueMe /> : <Navigate to="/" replace />}
              />
              <Route
                path="/secure-chat"
                element={session ? <SecureChat /> : <Navigate to="/" replace />}
              />
              <Route
                path="/before-you-rest"
                element={session ? <BeforeYouRest /> : <Navigate to="/" replace />}
              />
              <Route
                path="/progress"
                element={session ? <Progress /> : <Navigate to="/" replace />}
              />
              <Route
                path="/settings"
                element={session ? <Settings /> : <Navigate to="/" replace />}
              />

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
