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
import Health from "./pages/HealthNew";
import Finance from "./pages/Finance";
import Education from "./pages/Education";
import EventsPage from "./pages/EventsPage";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import SharedEventPage from "./pages/SharedEventPage";
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
import Documentation from "./pages/Documentation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";
import OAuthDebug from "./pages/OAuthDebug";
import Welcome from "./pages/Welcome";
import DemoMode from "./pages/DemoMode";
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
import AdminTraffic from "./pages/AdminTraffic";
import Recipes from "./pages/Recipes";
import Purchases from "./pages/Purchases";
import AIAssistant from "./pages/AIAssistant";
import Development from "./pages/Development";
import LifeRoad from "./pages/LifeRoad";
import FamilyManagement from "./pages/FamilyManagement";
import InDevelopmentList from "./pages/InDevelopmentList";
import FamilyInvite from "./pages/FamilyInvite";
import Nutrition from "./pages/Nutrition";
import NutritionHub from "./pages/NutritionHub";
import DietQuiz from "./pages/DietQuiz";
import DietProgramCatalog from "./pages/DietProgramCatalog";
import DietMiniQuiz from "./pages/DietMiniQuiz";
import RecipeFromProducts from "./pages/RecipeFromProducts";
import DietProgress from "./pages/DietProgress";
import Trips from "./pages/Trips";
import TripDetails from "./pages/TripDetails";
import TripWishlist from "./pages/TripWishlist";
import Leisure from "./pages/Leisure";
import TelegramServices from "./pages/TelegramServices";
import StateSupport from "./pages/StateSupport";
import FamilyPolicy from "./pages/FamilyPolicy";
import WhatIsFamily from "./pages/WhatIsFamily";
import FamilyNews from "./pages/FamilyNews";
import Pricing from "./pages/Pricing";
import PaymentSuccess from "./pages/PaymentSuccess";
import InvestorDeck from "./pages/InvestorDeck";
import AdminSubscriptions from "./pages/AdminSubscriptions";
import IdeasBoard from "./pages/IdeasBoard";
import AdminDomovoy from "./pages/AdminDomovoy";
import DomovoyPage from "./pages/DomovoyPage";
import AliceIntegration from "./pages/AliceIntegration";
import AdminAlice from "./pages/AdminAlice";
import AdminMAX from "./pages/AdminMAX";
import AdminUsers from "./pages/AdminUsers";
import AdminWelcomeAnalytics from "./pages/AdminWelcomeAnalytics";
import ActivateChild from "./pages/ActivateChild";
import ActivateCallback from "./pages/ActivateCallback";
import FamilyTracker from "./pages/FamilyTracker";
import LocationHistory from "./pages/LocationHistory";
import DebugAuth from "./pages/DebugAuth";
import Onboarding from "./pages/Onboarding";
import AIAssistantWidget from "@/components/AIAssistantWidget";
import { DemoModeIndicator } from "@/components/DemoModeIndicator";
import { AuthProvider } from "@/lib/auth-context";
import { queryClient } from "@/lib/queryClient";
import { DialogLockProvider } from "@/contexts/DialogLockContext";
import { FamilyMembersProvider } from "@/contexts/FamilyMembersContext";
import { AIAssistantProvider } from "@/contexts/AIAssistantContext";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { storage } from "@/lib/storage";
import { analyticsTracker } from "@/lib/analytics-tracker";
import { medicationNotificationService } from "@/services/medicationNotifications";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = storage.getItem('authToken');
        const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
        console.log('[ProtectedRoute] Checking auth, token exists:', !!token, ', demo mode:', isDemoMode);
        
        const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
        
        if (isPWA && !token) {
          console.log('[ProtectedRoute] PWA mode detected, no token found');
        }
        
        setIsAuthenticated(!!token || isDemoMode);
      } catch (error) {
        console.error('[ProtectedRoute] Error checking auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuth();
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
    storage.removeItem('authToken');
    storage.removeItem('userData');
    window.location.href = '/login';
  };

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.includes('poehali.dev') && !hostname.includes('cdn')) {
      window.location.href = `https://nasha-semiya.ru${window.location.pathname}${window.location.search}`;
    }
  }, []);

  useEffect(() => {
    const trackPageChange = () => {
      analyticsTracker.trackPageView(window.location.pathname);
    };

    trackPageChange();
    
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      trackPageChange();
    };

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      trackPageChange();
    };

    window.addEventListener('popstate', trackPageChange);

    // Запускаем сервис уведомлений о лекарствах
    medicationNotificationService.start();

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', trackPageChange);
      medicationNotificationService.stop();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DemoModeProvider>
          <DialogLockProvider>
            <FamilyMembersProvider>
              <AIAssistantProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <PWAInstallPrompt />
                    <AIAssistantWidget />
                    <DemoModeIndicator />
                    <Routes>
                      <Route path="/shared/event/:token" element={<SharedEventPage />} />
                      <Route path="/welcome" element={<Welcome />} />
                      <Route path="/demo" element={<DemoMode />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/onboarding" element={<Onboarding />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/reset-password/confirm" element={<ResetPasswordConfirm />} />
                      <Route path="/join" element={<JoinFamily />} />
                      <Route path="/activate/:inviteToken" element={<ActivateChild />} />
                      <Route path="/activate-callback" element={<ActivateCallback />} />
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
                      <Route path="/events" element={<EventsPage />} />
                      <Route path="/events/create" element={<CreateEventPage />} />
                      <Route path="/events/edit/:id" element={<EditEventPage />} />
                      <Route path="/events/:id" element={<EventDetailsPage />} />
                      <Route path="/pets" element={<Pets />} />
                      <Route path="/faith" element={<Faith />} />
                      <Route path="/tree" element={<Tree />} />
                      <Route path="/shopping" element={<Shopping />} />
                      <Route path="/meals" element={<Meals />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/purchases" element={<Purchases />} />
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
                      <Route path="/admin/traffic" element={<AdminTraffic />} />
                      <Route path="/admin/welcome" element={<AdminWelcomeAnalytics />} />
                      <Route path="/admin/alice" element={<AdminAlice />} />
                      <Route path="/admin/max" element={<AdminMAX />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/alice" element={<AliceIntegration />} />
                      <Route path="/nationalities" element={<NationalitiesPage />} />
                      <Route path="/nationalities/:id" element={<NationalityDetailPage />} />
                      <Route path="/children" element={<Children />} />
                      <Route path="/children/assessment-report" element={<AssessmentReport />} />
                      <Route path="/family-tracker" element={<FamilyTracker />} />
                      <Route path="/location-history" element={<LocationHistory />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/recipes" element={<Recipes />} />
                      <Route path="/nutrition" element={<NutritionHub />} />
                      <Route path="/nutrition/tracker" element={<Nutrition />} />
                      <Route path="/nutrition/diet" element={<DietQuiz />} />
                      <Route path="/nutrition/programs" element={<DietProgramCatalog />} />
                      <Route path="/nutrition/programs/:slug/quiz" element={<DietMiniQuiz />} />
                      <Route path="/nutrition/recipe-from-products" element={<RecipeFromProducts />} />
                      <Route path="/nutrition/progress" element={<DietProgress />} />
                      <Route path="/trips" element={<Trips />} />
                      <Route path="/trips/:id" element={<TripDetails />} />
                      <Route path="/trips/wishlist" element={<TripWishlist />} />
                      <Route path="/leisure" element={<Leisure />} />
                      <Route path="/ai-assistant" element={<AIAssistant />} />
                      <Route path="/development" element={<Development />} />
                      <Route path="/life-road" element={<LifeRoad />} />
                      <Route path="/in-development" element={<InDevelopmentList />} />
                      <Route path="/family-management" element={<FamilyManagement />} />
                      <Route path="/launch-plan" element={<LaunchPlan />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-of-service" element={<TermsOfService />} />
                      <Route path="/refund-policy" element={<RefundPolicy />} />
                      <Route path="/documentation" element={<Documentation />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/payment-success" element={<PaymentSuccess />} />
                      <Route path="/ideas" element={<IdeasBoard />} />
                      <Route path="/ideas-board" element={<IdeasBoard />} />
                      <Route path="/investor-deck" element={<InvestorDeck />} />
                      <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
                      <Route path="/admin/domovoy" element={<AdminDomovoy />} />
                      <Route path="/domovoy" element={<DomovoyPage />} />
                      <Route path="/services" element={<TelegramServices />} />
                      <Route path="/debug-auth" element={<DebugAuth />} />
                      <Route path="/family" element={<Navigate to="/?section=family" replace />} />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </AIAssistantProvider>
            </FamilyMembersProvider>
          </DialogLockProvider>
        </DemoModeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;