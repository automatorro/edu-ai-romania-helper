
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ConfirmEmail from "./pages/ConfirmEmail";
import Dashboard from "./pages/Dashboard";
import Generator from "./pages/Generator";
import Consultant from "./pages/Consultant";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import { useEffect } from "react";
import { supabase } from "./integrations/supabase/client";

const OAuthRedirectHandler = () => {
  useEffect(() => {
    const handleRedirect = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
      } else if (data?.session) {
        console.log("Session restored:", data.session.user?.email);
      }
    };
    handleRedirect();
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <OAuthRedirectHandler />
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/generator" element={<Generator />} />
            <Route path="/consultant" element={<Consultant />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/account" element={<Account />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
