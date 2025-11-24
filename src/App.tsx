
import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from './components/auth/AuthPage';
import Index from "./pages/Index";
import Instructions from "./pages/Instructions";
import Garage from "./pages/Garage";
import Health from "./pages/Health";
import Finance from "./pages/Finance";
import Education from "./pages/Education";
import Travel from "./pages/Travel";
import Pets from "./pages/Pets";
import Faith from "./pages/Faith";
import NotFound from "./pages/NotFound";
import Community from "./pages/Community";
import MemberProfile from "./pages/MemberProfile";
import FamilyCode from "./pages/FamilyCode";
import Presentation from "./pages/Presentation";
import FamilyPsychologist from "./pages/FamilyPsychologist";
import FamilyRules from "./pages/FamilyRules";
import LaunchPlan from "./pages/LaunchPlan";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import FamilySettings from "./pages/FamilySettings";

const queryClient = new QueryClient();
const AUTH_URL = 'https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user_data');

      if (!storedToken) {
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch(AUTH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify', token: storedToken })
        });

        const data = await response.json();

        if (response.ok && data.valid) {
          setToken(storedToken);
          setUserData(storedUser ? JSON.parse(storedUser) : data.user);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = (newToken: string, newUserData: any) => {
    setToken(newToken);
    setUserData(newUserData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setToken(null);
    setUserData(null);
    setIsAuthenticated(false);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthPage onSuccess={handleAuthSuccess} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index onLogout={handleLogout} />} />
            <Route path="/instructions" element={<Instructions />} />
            <Route path="/garage" element={<Garage />} />
            <Route path="/health" element={<Health />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/education" element={<Education />} />
            <Route path="/travel" element={<Travel />} />
            <Route path="/pets" element={<Pets />} />
            <Route path="/faith" element={<Faith />} />
            <Route path="/community" element={<Community />} />
            <Route path="/member/:memberId" element={<MemberProfile />} />
            <Route path="/family-code" element={<FamilyCode />} />
            <Route path="/presentation" element={<Presentation />} />
            <Route path="/psychologist" element={<FamilyPsychologist />} />
            <Route path="/rules" element={<FamilyRules />} />
            <Route path="/launch-plan" element={<LaunchPlan />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/family-settings" element={<FamilySettings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;