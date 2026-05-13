import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import Welcome from "./pages/Welcome";
import NotFound404 from "./pages/NotFound404";
import AIAssistantWidget from "@/components/AIAssistantWidget";
import GlobalTopBar from "@/components/GlobalTopBar";
import GlobalSidebar from "@/components/GlobalSidebar";
import GlobalBottomBar from "@/components/GlobalBottomBar";
import RecentHubsTracker from "@/components/RecentHubsTracker";
import PageWrapper from "@/components/PageWrapper";
import { DemoModeIndicator } from "@/components/DemoModeIndicator";
import { AuthProvider } from "@/lib/auth-context";
import { queryClient } from "@/lib/queryClient";
import { DialogLockProvider } from "@/contexts/DialogLockContext";
import { FamilyMembersProvider } from "@/contexts/FamilyMembersContext";
import { AIAssistantProvider } from "@/contexts/AIAssistantContext";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { BlogCoverJobProvider } from "@/contexts/BlogCoverJobContext";
import BlogCoverJobIndicator from "@/components/admin/blog/BlogCoverJobIndicator";
import { storage } from "@/lib/storage";
import { clearAuthSession } from "@/lib/authStorage";
import { analyticsTracker } from "@/lib/analytics-tracker";
import { installFetchInterceptor } from "@/lib/fetch-interceptor";
import { medicationNotificationService } from "@/services/medicationNotifications";
import CookieConsent from "@/components/CookieConsent";

// Side-effect: глобальный fetch-перехватчик (auth header proxy и т.п.).
// Должен инициализироваться до первого fetch в приложении, поэтому стоит
// сразу после импортов на module level.
installFetchInterceptor();

// ─── Core / Index ──────────────────────────────────────────────────────────
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const HomeModule = lazy(() => import("./pages/HomeModule"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Instructions = lazy(() => import("./pages/Instructions"));
const Documentation = lazy(() => import("./pages/Documentation"));
const InstallationGuide = lazy(() => import("./pages/InstallationGuide"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));
const Referral = lazy(() => import("./pages/Referral"));
const Analytics = lazy(() => import("./pages/Analytics"));

// ─── Auth ──────────────────────────────────────────────────────────────────
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ResetPasswordConfirm = lazy(() => import("./pages/ResetPasswordConfirm"));
const JoinFamily = lazy(() => import("./pages/JoinFamily"));
const ActivateChild = lazy(() => import("./pages/ActivateChild"));
const ActivateCallback = lazy(() => import("./pages/ActivateCallback"));
const OAuthDebug = lazy(() => import("./pages/OAuthDebug"));
const DemoMode = lazy(() => import("./pages/DemoMode"));
const DebugAuth = lazy(() => import("./pages/DebugAuth"));

// ─── Family ────────────────────────────────────────────────────────────────
const FamilyHub = lazy(() => import("./pages/FamilyHub"));
const FamilyChat = lazy(() => import("./pages/FamilyChat"));
const FamilyManagement = lazy(() => import("./pages/FamilyManagement"));
const FamilyInvite = lazy(() => import("./pages/FamilyInvite"));
const FamilyTracker = lazy(() => import("./pages/FamilyTracker"));
const FamilyPsychologist = lazy(() => import("./pages/FamilyPsychologist"));
const FamilyRules = lazy(() => import("./pages/FamilyRules"));
const FamilyPolicy = lazy(() => import("./pages/FamilyPolicy"));
const FamilyNews = lazy(() => import("./pages/FamilyNews"));
const WhatIsFamily = lazy(() => import("./pages/WhatIsFamily"));
const Tree = lazy(() => import("./pages/Tree"));
const Children = lazy(() => import("./pages/Children"));
const AssessmentReport = lazy(() => import("./pages/AssessmentReport"));
const MemberProfile = lazy(() => import("./pages/MemberProfile"));
const PermissionsManagement = lazy(() => import("./pages/PermissionsManagement"));
const Community = lazy(() => import("./pages/Community"));
const LocationHistory = lazy(() => import("./pages/LocationHistory"));

// ─── Family Code / Matrix ──────────────────────────────────────────────────
const FamilyCode = lazy(() => import("./pages/FamilyCode"));
const FamilyCodeHub = lazy(() => import("./pages/FamilyCodeHub"));
const FamilyMatrixPersonal = lazy(() => import("./pages/FamilyMatrixPersonal"));
const FamilyMatrixCouple = lazy(() => import("./pages/FamilyMatrixCouple"));
const FamilyMatrixFamily = lazy(() => import("./pages/FamilyMatrixFamily"));
const FamilyMatrixRituals = lazy(() => import("./pages/FamilyMatrixRituals"));
const FamilyMatrixChild = lazy(() => import("./pages/FamilyMatrixChild"));
const FamilyMatrixName = lazy(() => import("./pages/FamilyMatrixName"));
const FamilyMatrixAstrology = lazy(() => import("./pages/FamilyMatrixAstrology"));

// ─── Portfolio / Development ───────────────────────────────────────────────
const MemberPortfolio = lazy(() => import("./pages/MemberPortfolio"));
const FamilyPortfolio = lazy(() => import("./pages/FamilyPortfolio"));
const PortfolioCompare = lazy(() => import("./pages/PortfolioCompare"));
const PortfolioAbout = lazy(() => import("./pages/PortfolioAbout"));
const Development = lazy(() => import("./pages/Development"));
const DevelopmentHub = lazy(() => import("./pages/DevelopmentHub"));
const Workshop = lazy(() => import("./pages/Workshop"));
const WorkshopGoal = lazy(() => import("./pages/WorkshopGoal"));
const LifeRoad = lazy(() => import("./pages/LifeRoad"));
const Goals = lazy(() => import("./pages/Goals"));
const Tasks = lazy(() => import("./pages/Tasks"));
const InDevelopmentList = lazy(() => import("./pages/InDevelopmentList"));

// ─── Health ────────────────────────────────────────────────────────────────
const Health = lazy(() => import("./pages/HealthNew"));
const HealthHub = lazy(() => import("./pages/HealthHub"));

// ─── Finance ───────────────────────────────────────────────────────────────
const FinanceHub = lazy(() => import("./pages/FinanceHub"));
const FinanceBudget = lazy(() => import("./pages/FinanceBudget"));
const FinanceDebts = lazy(() => import("./pages/FinanceDebts"));
const FinanceAccounts = lazy(() => import("./pages/FinanceAccounts"));
const FinanceGoals = lazy(() => import("./pages/FinanceGoals"));
const FinanceLiteracy = lazy(() => import("./pages/FinanceLiteracy"));
const FinanceRecurring = lazy(() => import("./pages/FinanceRecurring"));
const FinanceAssets = lazy(() => import("./pages/FinanceAssets"));
const FinanceLoyalty = lazy(() => import("./pages/FinanceLoyalty"));
const FinanceAnalytics = lazy(() => import("./pages/FinanceAnalytics"));
const FinanceStrategy = lazy(() => import("./pages/FinanceStrategy"));
const FinanceCashflow = lazy(() => import("./pages/FinanceCashflow"));
const FamilyWallet = lazy(() => import("./pages/FamilyWallet"));
const AntiScam = lazy(() => import("./pages/AntiScam"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));

// ─── Nutrition / Meals ─────────────────────────────────────────────────────
const Nutrition = lazy(() => import("./pages/Nutrition"));
const NutritionHub = lazy(() => import("./pages/NutritionHub"));
const DietQuiz = lazy(() => import("./pages/DietQuiz"));
const DietMiniQuiz = lazy(() => import("./pages/DietMiniQuiz"));
const DietProgramCatalog = lazy(() => import("./pages/DietProgramCatalog"));
const DietProgress = lazy(() => import("./pages/DietProgress"));
const RecipeFromProducts = lazy(() => import("./pages/RecipeFromProducts"));
const Recipes = lazy(() => import("./pages/Recipes"));
const Meals = lazy(() => import("./pages/Meals"));
const Shopping = lazy(() => import("./pages/Shopping"));
const Purchases = lazy(() => import("./pages/Purchases"));

// ─── Events / Calendar ─────────────────────────────────────────────────────
const EventsPage = lazy(() => import("./pages/EventsPage"));
const CreateEventPage = lazy(() => import("./pages/CreateEventPage"));
const EditEventPage = lazy(() => import("./pages/EditEventPage"));
const EventDetailsPage = lazy(() => import("./pages/EventDetailsPage"));
const SharedEventPage = lazy(() => import("./pages/SharedEventPage"));
const Calendar = lazy(() => import("./pages/Calendar"));

// ─── Travel / Leisure ──────────────────────────────────────────────────────
const Trips = lazy(() => import("./pages/Trips"));
const TripDetails = lazy(() => import("./pages/TripDetails"));
const TripWishlist = lazy(() => import("./pages/TripWishlist"));
const Leisure = lazy(() => import("./pages/Leisure"));
const LeisureHub = lazy(() => import("./pages/LeisureHub"));

// ─── Household / Pets / Garage ─────────────────────────────────────────────
const HouseholdHub = lazy(() => import("./pages/HouseholdHub"));
const PlanningHub = lazy(() => import("./pages/PlanningHub"));
const Pets = lazy(() => import("./pages/Pets"));
const Garage = lazy(() => import("./pages/Garage"));

// ─── Culture / Values / Faith ──────────────────────────────────────────────
const Values = lazy(() => import("./pages/Values"));
const ValuesHub = lazy(() => import("./pages/ValuesHub"));
const Culture = lazy(() => import("./pages/Culture"));
const Wisdom = lazy(() => import("./pages/Wisdom"));
const Faith = lazy(() => import("./pages/Faith"));
const Education = lazy(() => import("./pages/Education"));
const NationalitiesPage = lazy(() => import("./pages/NationalitiesPage"));
const NationalityDetailPage = lazy(() => import("./pages/NationalityDetailPage"));

// ─── State / Support / Telegram ────────────────────────────────────────────
const StateHub = lazy(() => import("./pages/StateHub"));
const StateSupport = lazy(() => import("./pages/StateSupport"));
const SupportNavigator = lazy(() => import("./pages/SupportNavigator"));
const TelegramServices = lazy(() => import("./pages/TelegramServices"));

// ─── Tests / Quizzes ───────────────────────────────────────────────────────
const PariTest = lazy(() => import("./pages/PariTest"));
const PariResults = lazy(() => import("./pages/PariResults"));

// ─── AI / Assistants ───────────────────────────────────────────────────────
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const DomovoyPage = lazy(() => import("./pages/DomovoyPage"));
const DomovoyStudio = lazy(() => import("./pages/DomovoyStudio"));
const DevAgentStudio = lazy(() => import("./pages/DevAgentStudio"));
const AliceIntegration = lazy(() => import("./pages/AliceIntegration"));

// ─── Voting / Ideas ────────────────────────────────────────────────────────
const VotingPage = lazy(() => import("./pages/VotingPage"));
const IdeasBoard = lazy(() => import("./pages/IdeasBoard"));

// ─── Feedback / Support tickets ────────────────────────────────────────────
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const SuggestionsPage = lazy(() => import("./pages/SuggestionsPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));

// ─── Marketing / Articles / Blog ───────────────────────────────────────────
const MarketingStrategy = lazy(() => import("./pages/MarketingStrategy"));
const MarketingSale = lazy(() => import("./pages/MarketingSale"));
const Articles = lazy(() => import("./pages/Articles"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Videos = lazy(() => import("./pages/Videos"));

// ─── Decks / Presentations ─────────────────────────────────────────────────
const Presentation = lazy(() => import("./pages/Presentation"));
const StrategyDeck = lazy(() => import("./pages/StrategyDeck"));
const MatryoshkaDeck = lazy(() => import("./pages/MatryoshkaDeck"));
const InvestorDeck = lazy(() => import("./pages/InvestorDeck"));
const AwardCard = lazy(() => import("./pages/AwardCard"));
const LaunchPlan = lazy(() => import("./pages/LaunchPlan"));

// ─── Legal ─────────────────────────────────────────────────────────────────
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Offer = lazy(() => import("./pages/Offer"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));

// ─── Admin ─────────────────────────────────────────────────────────────────
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminTraffic = lazy(() => import("./pages/AdminTraffic"));
const AdminSupport = lazy(() => import("./pages/AdminSupport"));
const AdminSubscriptions = lazy(() => import("./pages/AdminSubscriptions"));
const AdminWelcomeAnalytics = lazy(() => import("./pages/AdminWelcomeAnalytics"));
const AdminValuation = lazy(() => import("./pages/AdminValuation"));
const AdminPortfolioHealth = lazy(() => import("./pages/AdminPortfolioHealth"));
const AdminAtlas = lazy(() => import("./pages/AdminAtlas"));
const AdminProjectV2 = lazy(() => import("./pages/AdminProjectV2"));
const AdminBlog = lazy(() => import("./pages/AdminBlog"));
const AdminAlice = lazy(() => import("./pages/AdminAlice"));
const AdminMAX = lazy(() => import("./pages/AdminMAX"));
const AdminMaxInstructions = lazy(() => import("./pages/AdminMaxInstructions"));
const AdminDomovoy = lazy(() => import("./pages/AdminDomovoy"));

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
        setIsAuthenticated(!!token || isDemoMode);
      } catch (error) {
        // Storage недоступен (private mode / disabled cookies). Считаем юзера
        // неавторизованным и показываем Welcome — это безопаснее, чем кидать.
        console.warn('[ProtectedRoute] storage unavailable, treating as logged out:', error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuth();

    const interval = setInterval(checkAuth, 300);
    return () => clearInterval(interval);
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
    return <Welcome />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        setIsAdmin(adminToken === 'admin_authenticated');
      } catch (error) {
        // Аналогично ProtectedRoute: при недоступном storage — нет admin-доступа.
        console.warn('[AdminRoute] storage unavailable, denying admin:', error);
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAdmin();

    const interval = setInterval(checkAdmin, 500);
    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50/40 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-violet-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Проверка админ-доступа…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const handleLogout = () => {
    clearAuthSession();
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
      analyticsTracker.trackHub(window.location.pathname);
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
      <LanguageProvider>
      <AuthProvider>
        <DemoModeProvider>
          <DialogLockProvider>
            <FamilyMembersProvider>
              <AIAssistantProvider>
                <BlogCoverJobProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <PWAInstallPrompt />
                    <AIAssistantWidget />
                    <DemoModeIndicator />
                    <BlogCoverJobIndicator />
                    <GlobalTopBar />
                    <GlobalSidebar />
                    <GlobalBottomBar />
                    <RecentHubsTracker />
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
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/referral" element={
                        <ProtectedRoute>
                          <Referral />
                        </ProtectedRoute>
                      } />
                      <Route path="/instructions" element={<Instructions />} />
                      <Route path="/garage" element={<Garage />} />
                      <Route path="/health" element={<Health />} />
                      <Route path="/finance" element={<FinanceHub />} />
                      <Route path="/finance/budget" element={<FinanceBudget />} />
                      <Route path="/finance/debts" element={<FinanceDebts />} />
                      <Route path="/finance/accounts" element={<FinanceAccounts />} />
                      <Route path="/finance/goals" element={<FinanceGoals />} />
                      <Route path="/finance/literacy" element={<FinanceLiteracy />} />
                      <Route path="/finance/recurring" element={<FinanceRecurring />} />
                      <Route path="/finance/assets" element={<FinanceAssets />} />
                      <Route path="/finance/loyalty" element={<FinanceLoyalty />} />
                      <Route path="/finance/antiscam" element={<AntiScam />} />
                      <Route path="/finance/analytics" element={<FinanceAnalytics />} />
                      <Route path="/finance/strategy" element={<FinanceStrategy />} />
                      <Route path="/finance/cashflow" element={<FinanceCashflow />} />
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
                      <Route path="/portfolio" element={
                        <ProtectedRoute>
                          <FamilyPortfolio />
                        </ProtectedRoute>
                      } />
                      <Route path="/portfolio/compare" element={
                        <ProtectedRoute>
                          <PortfolioCompare />
                        </ProtectedRoute>
                      } />
                      <Route path="/portfolio/about" element={<PortfolioAbout />} />
                      <Route path="/portfolio/:memberId" element={
                        <ProtectedRoute>
                          <MemberPortfolio />
                        </ProtectedRoute>
                      } />
                      <Route path="/family-code" element={<FamilyCode />} />
                      <Route path="/chat" element={<FamilyChat />} />
                      <Route path="/family-chat" element={<FamilyChat />} />
                      <Route path="/state-support" element={<StateSupport />} />
                      <Route path="/support-navigator" element={<SupportNavigator />} />
                      <Route path="/family-policy" element={<FamilyPolicy />} />
                      <Route path="/what-is-family" element={<WhatIsFamily />} />
                      <Route path="/family-news" element={<FamilyNews />} />
                      <Route path="/family-matrix" element={<FamilyCodeHub />} />
                      <Route path="/family-matrix/personal" element={<FamilyMatrixPersonal />} />
                      <Route path="/family-matrix/couple" element={<FamilyMatrixCouple />} />
                      <Route path="/family-matrix/family" element={<FamilyMatrixFamily />} />
                      <Route path="/family-matrix/rituals" element={<FamilyMatrixRituals />} />
                      <Route path="/family-matrix/child" element={<FamilyMatrixChild />} />
                      <Route path="/family-matrix/name" element={<FamilyMatrixName />} />
                      <Route path="/family-matrix/astrology" element={<FamilyMatrixAstrology />} />
                      <Route path="/articles" element={<Articles />} />
                      <Route path="/articles/:slug" element={<ArticleDetail />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/category/:category" element={<Blog />} />
                      <Route path="/blog/tag/:tag" element={<Blog />} />
                      <Route path="/blog/:slug" element={<BlogPost />} />
                      <Route path="/family-invite" element={<FamilyInvite />} />
                      <Route path="/presentation" element={<Presentation />} />
                      <Route path="/strategy" element={<StrategyDeck />} />
                      <Route path="/matryoshka" element={<MatryoshkaDeck />} />
                      <Route path="/award-card" element={<AwardCard />} />
                      <Route path="/psychologist" element={<FamilyPsychologist />} />
                      <Route path="/rules" element={<FamilyRules />} />
                      <Route path="/voting" element={<VotingPage />} />
                      <Route path="/feedback" element={<FeedbackPage />} />
                      <Route path="/suggestions" element={<SuggestionsPage />} />
                      <Route path="/support" element={<SupportPage />} />
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/admin/support" element={<AdminRoute><AdminSupport /></AdminRoute>} />
                      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                      <Route path="/admin/traffic" element={<AdminRoute><AdminTraffic /></AdminRoute>} />
                      <Route path="/admin/welcome" element={<AdminRoute><AdminWelcomeAnalytics /></AdminRoute>} />
                      <Route path="/admin/alice" element={<AdminRoute><AdminAlice /></AdminRoute>} />
                      <Route path="/admin/max" element={<AdminRoute><AdminMAX /></AdminRoute>} />
                      <Route path="/admin/max/help" element={<AdminRoute><AdminMaxInstructions /></AdminRoute>} />
                      <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
                      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                      <Route path="/admin/valuation" element={<AdminRoute><AdminValuation /></AdminRoute>} />
                      <Route path="/admin/panel" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                      <Route path="/admin/portfolio-health" element={<AdminRoute><AdminPortfolioHealth /></AdminRoute>} />
                      <Route path="/admin/atlas" element={<AdminRoute><AdminAtlas /></AdminRoute>} />
                      <Route path="/admin/project-v2" element={<AdminRoute><AdminProjectV2 /></AdminRoute>} />
                      <Route path="/admin/marketing" element={<AdminRoute><MarketingStrategy /></AdminRoute>} />
                      <Route path="/admin/marketing-sale" element={<AdminRoute><MarketingSale /></AdminRoute>} />
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
                      <Route path="/workshop" element={<Workshop />} />
                      <Route path="/workshop/goal/:id" element={<WorkshopGoal />} />
                      <Route path="/in-development" element={<InDevelopmentList />} />
                      <Route path="/family-management" element={<FamilyManagement />} />
                      <Route path="/launch-plan" element={<LaunchPlan />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-of-service" element={<TermsOfService />} />
                      <Route path="/offer" element={<Offer />} />
                      <Route path="/refund-policy" element={<RefundPolicy />} />
                      <Route path="/documentation" element={<Documentation />} />
                      <Route path="/installation-guide" element={<InstallationGuide />} />
                      <Route path="/pricing" element={<Navigate to="/wallet" replace />} />
                      <Route path="/payment-success" element={<PaymentSuccess />} />
                      <Route path="/ideas" element={<IdeasBoard />} />
                      <Route path="/ideas-board" element={<IdeasBoard />} />
                      <Route path="/investor-deck" element={<InvestorDeck />} />
                      <Route path="/videos" element={<Videos />} />
                      {/* Подписки временно скрыты — используется кошелёк */}
                      <Route path="/admin/subscriptions" element={<Navigate to="/" replace />} />
                      <Route path="/admin/domovoy" element={<AdminDomovoy />} />
                      <Route path="/admin/domovoy/studio" element={<DomovoyStudio />} />
                      <Route path="/admin/dev-agent" element={<DevAgentStudio />} />
                      <Route path="/domovoy" element={<DomovoyPage />} />
                      <Route path="/services" element={<TelegramServices />} />
                      <Route path="/debug-auth" element={<DebugAuth />} />
                      <Route path="/family-hub" element={<FamilyHub />} />
                      <Route path="/values-hub" element={<ValuesHub />} />
                      <Route path="/planning-hub" element={<PlanningHub />} />
                      <Route path="/household-hub" element={<HouseholdHub />} />
                      <Route path="/home-hub" element={<HomeModule />} />
                      <Route path="/development-hub" element={<DevelopmentHub />} />
                      <Route path="/pari-test" element={<PariTest />} />
                      <Route path="/pari-results/:id" element={<PariResults />} />
                      <Route path="/state-hub" element={<StateHub />} />
                      <Route path="/health-hub" element={<HealthHub />} />
                      <Route path="/leisure-hub" element={<LeisureHub />} />
                      <Route path="/values" element={<Values />} />
                      <Route path="/culture" element={<Culture />} />
                      <Route path="/wisdom" element={<Wisdom />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/goals" element={<Goals />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/family" element={<Navigate to="/?section=family" replace />} />
                      <Route path="/diet" element={<Navigate to="/nutrition/diet" replace />} />
                      
                      <Route path="*" element={<NotFound404 />} />
                    </Routes>
                    </Suspense>
                    </PageWrapper>
                    <CookieConsent />
                  </BrowserRouter>
                </TooltipProvider>
                </BlogCoverJobProvider>
              </AIAssistantProvider>
            </FamilyMembersProvider>
          </DialogLockProvider>
        </DemoModeProvider>
      </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;