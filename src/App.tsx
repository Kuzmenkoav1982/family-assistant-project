import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import Welcome from "./pages/Welcome";
import NotFound from "./pages/NotFound";
import AIAssistantWidget from "@/components/AIAssistantWidget";
import GlobalTopBar from "@/components/GlobalTopBar";
import GlobalSidebar from "@/components/GlobalSidebar";
import GlobalBottomBar from "@/components/GlobalBottomBar";
import PageWrapper from "@/components/PageWrapper";
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

const Index = lazy(() => import("./pages/Index"));
const Instructions = lazy(() => import("./pages/Instructions"));
const Garage = lazy(() => import("./pages/Garage"));
const Health = lazy(() => import("./pages/HealthNew"));
const Finance = lazy(() => import("./pages/Finance"));
const Education = lazy(() => import("./pages/Education"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const CreateEventPage = lazy(() => import("./pages/CreateEventPage"));
const EditEventPage = lazy(() => import("./pages/EditEventPage"));
const EventDetailsPage = lazy(() => import("./pages/EventDetailsPage"));
const SharedEventPage = lazy(() => import("./pages/SharedEventPage"));
const Pets = lazy(() => import("./pages/Pets"));
const Faith = lazy(() => import("./pages/Faith"));
const Tree = lazy(() => import("./pages/Tree"));
const Shopping = lazy(() => import("./pages/Shopping"));
const Meals = lazy(() => import("./pages/Meals"));
const Calendar = lazy(() => import("./pages/Calendar"));
const PermissionsManagement = lazy(() => import("./pages/PermissionsManagement"));
const Community = lazy(() => import("./pages/Community"));
const MemberProfile = lazy(() => import("./pages/MemberProfile"));
const FamilyCode = lazy(() => import("./pages/FamilyCode"));
const Presentation = lazy(() => import("./pages/Presentation"));
const FamilyPsychologist = lazy(() => import("./pages/FamilyPsychologist"));
const FamilyRules = lazy(() => import("./pages/FamilyRules"));
const LaunchPlan = lazy(() => import("./pages/LaunchPlan"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Documentation = lazy(() => import("./pages/Documentation"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ResetPasswordConfirm = lazy(() => import("./pages/ResetPasswordConfirm"));
const OAuthDebug = lazy(() => import("./pages/OAuthDebug"));
const DemoMode = lazy(() => import("./pages/DemoMode"));
const VotingPage = lazy(() => import("./pages/VotingPage"));
const JoinFamily = lazy(() => import("./pages/JoinFamily"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const SuggestionsPage = lazy(() => import("./pages/SuggestionsPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const AdminSupport = lazy(() => import("./pages/AdminSupport"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const NationalitiesPage = lazy(() => import("./pages/NationalitiesPage"));
const NationalityDetailPage = lazy(() => import("./pages/NationalityDetailPage"));
const Children = lazy(() => import("./pages/Children"));
const AssessmentReport = lazy(() => import("./pages/AssessmentReport"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminTraffic = lazy(() => import("./pages/AdminTraffic"));
const Recipes = lazy(() => import("./pages/Recipes"));
const Purchases = lazy(() => import("./pages/Purchases"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const Development = lazy(() => import("./pages/Development"));
const LifeRoad = lazy(() => import("./pages/LifeRoad"));
const FamilyManagement = lazy(() => import("./pages/FamilyManagement"));
const InDevelopmentList = lazy(() => import("./pages/InDevelopmentList"));
const FamilyInvite = lazy(() => import("./pages/FamilyInvite"));
const Nutrition = lazy(() => import("./pages/Nutrition"));
const NutritionHub = lazy(() => import("./pages/NutritionHub"));
const DietQuiz = lazy(() => import("./pages/DietQuiz"));
const DietProgramCatalog = lazy(() => import("./pages/DietProgramCatalog"));
const DietMiniQuiz = lazy(() => import("./pages/DietMiniQuiz"));
const RecipeFromProducts = lazy(() => import("./pages/RecipeFromProducts"));
const DietProgress = lazy(() => import("./pages/DietProgress"));
const FamilyWallet = lazy(() => import("./pages/FamilyWallet"));
const Trips = lazy(() => import("./pages/Trips"));
const TripDetails = lazy(() => import("./pages/TripDetails"));
const TripWishlist = lazy(() => import("./pages/TripWishlist"));
const Leisure = lazy(() => import("./pages/Leisure"));
const TelegramServices = lazy(() => import("./pages/TelegramServices"));
const StateSupport = lazy(() => import("./pages/StateSupport"));
const FamilyPolicy = lazy(() => import("./pages/FamilyPolicy"));
const WhatIsFamily = lazy(() => import("./pages/WhatIsFamily"));
const FamilyNews = lazy(() => import("./pages/FamilyNews"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const InvestorDeck = lazy(() => import("./pages/InvestorDeck"));
const AdminSubscriptions = lazy(() => import("./pages/AdminSubscriptions"));
const IdeasBoard = lazy(() => import("./pages/IdeasBoard"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AdminDomovoy = lazy(() => import("./pages/AdminDomovoy"));
const DomovoyPage = lazy(() => import("./pages/DomovoyPage"));
const AliceIntegration = lazy(() => import("./pages/AliceIntegration"));
const AdminAlice = lazy(() => import("./pages/AdminAlice"));
const AdminMAX = lazy(() => import("./pages/AdminMAX"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminWelcomeAnalytics = lazy(() => import("./pages/AdminWelcomeAnalytics"));
const ActivateChild = lazy(() => import("./pages/ActivateChild"));
const ActivateCallback = lazy(() => import("./pages/ActivateCallback"));
const FamilyTracker = lazy(() => import("./pages/FamilyTracker"));
const LocationHistory = lazy(() => import("./pages/LocationHistory"));
const DebugAuth = lazy(() => import("./pages/DebugAuth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const FamilyHub = lazy(() => import("./pages/FamilyHub"));
const ValuesHub = lazy(() => import("./pages/ValuesHub"));
const PlanningHub = lazy(() => import("./pages/PlanningHub"));
const HouseholdHub = lazy(() => import("./pages/HouseholdHub"));
const DevelopmentHub = lazy(() => import("./pages/DevelopmentHub"));
const StateHub = lazy(() => import("./pages/StateHub"));
const HealthHub = lazy(() => import("./pages/HealthHub"));
const LeisureHub = lazy(() => import("./pages/LeisureHub"));
const Values = lazy(() => import("./pages/Values"));
const Culture = lazy(() => import("./pages/Culture"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Goals = lazy(() => import("./pages/Goals"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = storage.getItem('authToken');
        const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
        const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
        
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
                    <GlobalTopBar />
                    <GlobalSidebar />
                    <GlobalBottomBar />
                    <PageWrapper>
                    <Suspense fallback={<PageLoader />}>
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
                      <Route path="/wallet" element={<FamilyWallet />} />
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
                      <Route path="/family-hub" element={<FamilyHub />} />
                      <Route path="/values-hub" element={<ValuesHub />} />
                      <Route path="/planning-hub" element={<PlanningHub />} />
                      <Route path="/household-hub" element={<HouseholdHub />} />
                      <Route path="/development-hub" element={<DevelopmentHub />} />
                      <Route path="/state-hub" element={<StateHub />} />
                      <Route path="/health-hub" element={<HealthHub />} />
                      <Route path="/leisure-hub" element={<LeisureHub />} />
                      <Route path="/values" element={<Values />} />
                      <Route path="/culture" element={<Culture />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/goals" element={<Goals />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/family" element={<Navigate to="/?section=family" replace />} />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    </Suspense>
                    </PageWrapper>
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