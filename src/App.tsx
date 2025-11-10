
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthForm from "./components/AuthForm";
import FamilySetup from "./components/FamilySetup";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      
      fetch('https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0?action=verify', {
        headers: {
          'X-Auth-Token': token
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setIsAuthenticated(true);
            setNeedsSetup(!user.family_id);
          } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        })
        .catch(() => {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleAuthSuccess = (token: string, user: any) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setNeedsSetup(!user.family_id);
  };
  
  const handleSetupComplete = () => {
    setNeedsSetup(false);
  };

  const handleLogout = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch('https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0?action=logout', {
        method: 'POST',
        headers: {
          'X-Auth-Token': token
        }
      });
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;