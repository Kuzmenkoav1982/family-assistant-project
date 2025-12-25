
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import Index from "./pages/Index";
import Instructions from "./pages/Instructions";
import Garage from "./pages/Garage";
import Health from "./pages/Health";
import Finance from "./pages/Finance";
import Education from "./pages/Education";

import Pets from "./pages/Pets";
import Faith from "./pages/Faith";
import Tree from "./pages/Tree";
import Shopping from "./pages/Shopping";
import Meals from "./pages/Meals";
import Calendar from "./pages/Calendar";
import PermissionsManagement from "./pages/PermissionsManagement";
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
import RefundPolicy from "./pages/RefundPolicy";
import Login from "./pages/Login";
import OAuthDebug from "./pages/OAuthDebug";
import Welcome from "./pages/Welcome";
import VotingPage from "./pages/VotingPage";
import JoinFamily from "./pages/JoinFamily";
import FeedbackPage from "./pages/FeedbackPage";
import SuggestionsPage from "./pages/SuggestionsPage";
import SupportPage from "./pages/SupportPage";
import AdminSupport from "./pages/AdminSupport";
import AdminLogin from "./pages/AdminLogin";
import NationalitiesPage from "./pages/NationalitiesPage";
import NationalityDetailPage from "./pages/NationalityDetailPage";
import Children from "./pages/Children";
import AssessmentReport from "./pages/AssessmentReport";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import Recipes from "./pages/Recipes";
import AIAssistant from "./pages/AIAssistant";
import Development from "./pages/Development";
import LifeRoad from "./pages/LifeRoad";
import FamilyManagement from "./pages/FamilyManagement";
import InDevelopmentList from "./pages/InDevelopmentList";
import FamilyInvite from "./pages/FamilyInvite";
import Nutrition from "./pages/Nutrition";
import Trips from "./pages/Trips";
import TripDetails from "./pages/TripDetails";
import TripWishlist from "./pages/TripWishlist";
import StateSupport from "./pages/StateSupport";
import FamilyPolicy from "./pages/FamilyPolicy";
import WhatIsFamily from "./pages/WhatIsFamily";
import FamilyNews from "./pages/FamilyNews";
import Pricing from "./pages/Pricing";
import InvestorDeck from "./pages/InvestorDeck";
import AdminSubscriptions from "./pages/AdminSubscriptions";
import AdminDomovoy from "./pages/AdminDomovoy";
import DomovoyPage from "./pages/DomovoyPage";
import AliceIntegration from "./pages/AliceIntegration";
import AdminAlice from "./pages/AdminAlice";
import AIAssistantWidget from "@/components/AIAssistantWidget";
import { AuthProvider } from "@/lib/auth-context";
import { queryClient } from "@/lib/queryClient";
import { DialogLockProvider } from "@/contexts/DialogLockContext";
import { FamilyMembersProvider } from "@/contexts/FamilyMembersContext";
import { AIAssistantProvider } from "@/contexts/AIAssistantContext";

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
      <AuthProvider>
        <DialogLockProvider>
          <FamilyMembersProvider>
            <AIAssistantProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
            <PWAInstallPrompt />
            <AIAssistantWidget />
            <Routes>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/join" element={<JoinFamily />} />
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

              <Route path="/pets" element={<Pets />} />
              <Route path="/faith" element={<Faith />} />
              <Route path="/tree" element={<Tree />} />
              <Route path="/shopping" element={<Shopping />} />
              <Route path="/meals" element={<Meals />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/permissions" element={<PermissionsManagement />} />
              <Route path="/community" element={<Community />} />
              <Route path="/member/:memberId" element={<MemberProfile />} />
              <Route path="/family-code" element={<FamilyCode />} />
              <Route path="/state-support" element={<StateSupport />} />
              <Route path="/family-policy" element={<FamilyPolicy />} />
              <Route path="/what-is-family" element={<WhatIsFamily />} />
              <Route path="/family-news" element={<FamilyNews />} />
              <Route path="/family-invite" element={<FamilyInvite />} />
              <Route path="/presentation" element={<Presentation />} />
              <Route path="/psychologist" element={<FamilyPsychologist />} />
              <Route path="/rules" element={<FamilyRules />} />
              <Route path="/voting" element={<VotingPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/suggestions" element={<SuggestionsPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/support" element={<AdminSupport />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/alice" element={<AdminAlice />} />
              <Route path="/alice" element={<AliceIntegration />} />
              <Route path="/nationalities" element={<NationalitiesPage />} />
              <Route path="/nationalities/:id" element={<NationalityDetailPage />} />
              <Route path="/children" element={<Children />} />
              <Route path="/children/assessment-report" element={<AssessmentReport />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/trips/:id" element={<TripDetails />} />
              <Route path="/trips/wishlist" element={<TripWishlist />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/development" element={<Development />} />
              <Route path="/life-road" element={<LifeRoad />} />
              <Route path="/in-development" element={<InDevelopmentList />} />
              <Route path="/family-management" element={<FamilyManagement />} />
              <Route path="/launch-plan" element={<LaunchPlan />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/investor-deck" element={<InvestorDeck />} />
              <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
              <Route path="/admin/domovoy" element={<AdminDomovoy />} />
              <Route path="/domovoy" element={<DomovoyPage />} />
              <Route path="/family" element={<Navigate to="/?section=family" replace />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
              </BrowserRouter>
              </TooltipProvider>
            </AIAssistantProvider>
          </FamilyMembersProvider>
        </DialogLockProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;