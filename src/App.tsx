import { useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import SplashScreen from "./pages/SplashScreen";
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
  const [hasSeenSplash, setHasSeenSplash] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // fetch users on mount
  useEffect(() => {
    const testFetch = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Error fetching users:', error);
      } else {
        console.log('Fetched users:', data);
      }
    };
    testFetch();
  }, []);

  // save test user
  const saveUser = async () => {
    const { data, error } = await supabase.from('users').insert([
      {
        attachment_style: 'anxious',
        tone_preference: 'kind',
        summary_notes: 'test user'
      }
    ]).select();

    if (error) {
      console.error('Error saving user:', error);
    } else {
      console.log('User saved:', data);
    }
  };

  // save test chat
  const saveChatMessage = async () => {
    const { data, error } = await supabase.from('chat_history').insert([
      {
        user_id: '7eb8f894-ca27-4c0d-87d4-c3a18bb6fedf',
        feature: 'SecureSelfChat',
        user_message: 'This is a test message.',
        ai_response: 'This is a test AI response.'
      }
    ]).select();

    if (error) {
      console.error('Error saving chat message:', error);
    } else {
      console.log('Chat message saved:', data);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-calm">
            

            <Routes>
              <Route 
                path="/" 
                element={
                  !hasSeenSplash ? (
                    <SplashScreen onContinue={() => setHasSeenSplash(true)} />
                  ) : !hasCompletedOnboarding ? (
                    <Onboarding onComplete={() => setHasCompletedOnboarding(true)} />
                  ) : (
                    <Dashboard />
                  )
                } 
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
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;