
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
import Login from "./pages/Login";
import OAuthDebug from "./pages/OAuthDebug";
import Welcome from "./pages/Welcome";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const handleLogout = () => {
    console.log('Logout - временно отключено');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/oauth-debug" element={<OAuthDebug />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index onLogout={handleLogout} />
              </ProtectedRoute>
            } />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;