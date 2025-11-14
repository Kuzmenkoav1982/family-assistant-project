
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Instructions from "./pages/Instructions";
import Garage from "./pages/Garage";
import Health from "./pages/Health";
import Finance from "./pages/Finance";
import Education from "./pages/Education";
import Travel from "./pages/Travel";
import Pets from "./pages/Pets";
import NotFound from "./pages/NotFound";
import AuthForm from "./components/AuthForm";
import FamilySetup from "./components/FamilySetup";
import Community from "./pages/Community";
import MemberProfile from "./pages/MemberProfile";
import DebugAuth from "./pages/DebugAuth";
import FamilyCode from "./pages/FamilyCode";
import Cohesion from "./pages/Cohesion";
import TestAccountSelector from "./components/TestAccountSelector";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [useTestMode] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        setCurrentUser(parsedUser);
        setIsAuthenticated(true);
        setNeedsSetup(false);
      } catch (err) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (token: string, user: any) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setNeedsSetup(false);
  };
  
  const handleTestAccountSelect = (account: any) => {
    setCurrentUser(account);
    setIsAuthenticated(true);
    setNeedsSetup(false);
  };
  
  const handleSetupComplete = () => {
    setNeedsSetup(false);
  };

  const handleLogout = () => {
    if (!useTestMode) {
      const token = localStorage.getItem('authToken');
      if (token) {
        fetch('https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0?action=logout', {
          method: 'POST',
          headers: {
            'X-Auth-Token': token
          }
        });
      }
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                !isAuthenticated ? (
                  <Navigate to="/auth" replace />
                ) : needsSetup ? (
                  <Navigate to="/setup" replace />
                ) : (
                  <Index onLogout={handleLogout} />
                )
              } 
            />
            <Route 
              path="/auth" 
              element={
                isAuthenticated ? (
                  needsSetup ? (
                    <Navigate to="/setup" replace />
                  ) : (
                    <Navigate to="/" replace />
                  )
                ) : useTestMode ? (
                  <TestAccountSelector onSelectAccount={handleTestAccountSelect} />
                ) : (
                  <AuthForm onAuthSuccess={handleAuthSuccess} />
                )
              } 
            />
            <Route 
              path="/setup" 
              element={
                !isAuthenticated ? (
                  <Navigate to="/auth" replace />
                ) : !needsSetup ? (
                  <Navigate to="/" replace />
                ) : (
                  <FamilySetup user={currentUser} onSetupComplete={handleSetupComplete} />
                )
              } 
            />
            <Route path="/instructions" element={<Instructions />} />
            <Route path="/garage" element={<Garage />} />
            <Route path="/health" element={<Health />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/education" element={<Education />} />
            <Route path="/travel" element={<Travel />} />
            <Route path="/pets" element={<Pets />} />
            <Route path="/community" element={<Community />} />
            <Route path="/member/:memberId" element={<MemberProfile />} />
            <Route path="/family-code" element={<FamilyCode />} />
            <Route path="/cohesion" element={<Cohesion />} />
            <Route path="/debug-auth" element={<DebugAuth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;