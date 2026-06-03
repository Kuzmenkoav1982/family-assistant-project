import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import PageWrapper from "@/components/PageWrapper";

// Публичные роуты — глобальные UI-компоненты там не нужны
const PUBLIC_ROUTES = ['/welcome', '/login', '/register', '/reset-password', '/demo'];

function GlobalUI() {
  const { pathname } = useLocation();
  const isPublic = PUBLIC_ROUTES.some(r => pathname === r || (pathname.startsWith(r + '/') && r !== '/'));
  if (isPublic) return null;
  return (
    <Suspense fallback={null}>
      <PWAInstallPrompt />
      <AppUpdateBanner />
      <AIAssistantWidget />
      <DemoModeIndicator />
      <BlogCoverJobIndicator />
      <GlobalTopBar />
      <GlobalStatusBanner />
      <GlobalSidebar />
      <GlobalBottomBar />
      <RecentHubsTracker />
    </Suspense>
  );
}

// Welcome и NotFound — синхронные импорты: они отвечают за первый экран гостя и 404.
// Lazy здесь напрямую убивает LCP — браузер ждёт JS-чанк до первой отрисовки.
import Welcome from "./pages/Welcome";
import NotFound404 from "./pages/NotFound404";

// Тяжёлые UI-компоненты авторизованной части — лениво, гостям не нужны
const PWAInstallPrompt = lazy(() => import("@/components/PWAInstallPrompt").then(m => ({ default: m.PWAInstallPrompt })));
const AppUpdateBanner = lazy(() => import("@/components/AppUpdateBanner").then(m => ({ default: m.AppUpdateBanner })));
const AIAssistantWidget = lazy(() => import("@/components/AIAssistantWidget"));
const GlobalTopBar = lazy(() => import("@/components/GlobalTopBar"));
const GlobalStatusBanner = lazy(() => import("@/components/GlobalStatusBanner"));
const GlobalSidebar = lazy(() => import("@/components/GlobalSidebar"));
const GlobalBottomBar = lazy(() => import("@/components/GlobalBottomBar"));
const RecentHubsTracker = lazy(() => import("@/components/RecentHubsTracker"));
const DemoModeIndicator = lazy(() => import("@/components/DemoModeIndicator").then(m => ({ default: m.DemoModeIndicator })));
import { AuthProvider } from "@/lib/auth-context";
import { queryClient } from "@/lib/queryClient";
import { DialogLockProvider } from "@/contexts/DialogLockContext";
import { FamilyMembersProvider } from "@/contexts/FamilyMembersContext";
import { AIAssistantProvider } from "@/contexts/AIAssistantContext";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { BlogCoverJobProvider } from "@/contexts/BlogCoverJobContext";
import { FamilyTraditionsProvider } from "@/contexts/FamilyTraditionsContext";
import { DEFAULT_TRADITIONS } from "@/data/defaultTraditions";

// Админский индикатор фоновых задач — лениво, гостям не нужен
const BlogCoverJobIndicator = lazy(() => import("@/components/admin/blog/BlogCoverJobIndicator"));
import { clearAuthSession, AUTH_SESSION_EVENT } from "@/lib/authStorage";
import { analyticsTracker } from "@/lib/analytics-tracker";
import { installFetchInterceptor } from "@/lib/fetch-interceptor";
import { initBuildInfo } from "@/lib/buildInfo";
import { medicationNotificationService } from "@/services/medicationNotifications";
import CookieConsent from "@/components/CookieConsent";
import PageLoader from "@/components/PageLoader";
import { ProtectedRoute, AdminRoute } from "@/components/RouteGuards";

// Side-effect: глобальный fetch-перехватчик (auth header proxy и т.п.).
// Должен инициализироваться до первого fetch в приложении, поэтому стоит
// сразу после импортов на module level. SSR-safe гард: на prerender-фазе
// `window` отсутствует — инициализацию пропускаем (на клиенте отработает
// при гидрации, см. AuthProvider).
if (typeof window !== 'undefined') {
  installFetchInterceptor();
  initBuildInfo();
}

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
const InviteOnboarding = lazy(() => import("./pages/InviteOnboarding"));
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
const FamilyId = lazy(() => import("./pages/FamilyId"));
const Memory = lazy(() => import("./pages/Memory"));
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
const SphereDetail = lazy(() => import("./pages/SphereDetail"));
const FamilyPortfolio = lazy(() => import("./pages/FamilyPortfolio"));
const PortfolioCompare = lazy(() => import("./pages/PortfolioCompare"));
const PortfolioAbout = lazy(() => import("./pages/PortfolioAbout"));
const Development = lazy(() => import("./pages/Development"));
const DevelopmentHub = lazy(() => import("./pages/DevelopmentHub"));
const Workshop = lazy(() => import("./pages/Workshop"));
const WorkshopGoal = lazy(() => import("./pages/WorkshopGoal"));
// Dev-only QA manifest. Маршрут регистрируется только при import.meta.env.DEV.
const DevGoalsQa = lazy(() => import("./pages/DevGoalsQa"));
const LifeRoad = lazy(() => import("./pages/LifeRoad"));
// ⚠️ Legacy /goals (V0, localStorage). Скрыт в Wave 2 R2 (см.
// docs/development/R2_MASTERPLAN.md, §1.4). Маршрут оставлен как redirect
// на /workshop, чтобы не ломать внешние/закладочные ссылки. Полное удаление
// кода запланировано на Wave 3 (Section integration).
// const Goals = lazy(() => import("./pages/Goals"));
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
const MyTicketsPage = lazy(() => import("./pages/MyTicketsPage"));

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
const StrategyDeckV21 = lazy(() => import("./pages/StrategyDeckV21"));
const ProofDeck = lazy(() => import("./pages/ProofDeck"));
const AppendixDeck = lazy(() => import("./pages/AppendixDeck"));
const StrategyHub = lazy(() => import("./pages/StrategyHub"));
const BankDeck = lazy(() => import("./pages/BankDeck"));
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
const AdminSupportDesk = lazy(() => import("./pages/AdminSupportDesk"));
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
const AdminStatusBanners = lazy(() => import("./pages/AdminStatusBanners"));

const App = () => {
  const handleLogout = () => {
    clearAuthSession();
    window.location.href = '/login';
  };

  useEffect(() => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const path = window.location.pathname;
    const search = window.location.search;

    // Редирект с poehali.dev на основной домен
    if (hostname.includes('poehali.dev') && !hostname.includes('cdn')) {
      window.location.replace(`https://nasha-semiya.ru${path}${search}`);
      return;
    }

    // Редирект www → без www (канонический домен)
    if (hostname === 'www.nasha-semiya.ru') {
      window.location.replace(`https://nasha-semiya.ru${path}${search}`);
      return;
    }

    // Редирект http → https
    if (protocol === 'http:' && hostname === 'nasha-semiya.ru') {
      window.location.replace(`https://nasha-semiya.ru${path}${search}`);
      return;
    }

    // Убираем дублирующий слеш в конце URL (кроме корня)
    if (path.length > 1 && path.endsWith('/')) {
      const cleanPath = path.replace(/\/+$/, '');
      window.history.replaceState(null, '', `${cleanPath}${search}`);
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

    // Сервис уведомлений нужен только авторизованным — на публичных роутах не запускаем
    const isPublicRoute = PUBLIC_ROUTES.some(r => window.location.pathname === r);
    if (!isPublicRoute) {
      medicationNotificationService.start();
    }

    const onAuthChanged = () => medicationNotificationService.onAuthChanged();
    window.addEventListener(AUTH_SESSION_EVENT, onAuthChanged);
    window.addEventListener('storage', onAuthChanged);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', trackPageChange);
      window.removeEventListener(AUTH_SESSION_EVENT, onAuthChanged);
      window.removeEventListener('storage', onAuthChanged);
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
              <FamilyTraditionsProvider defaultItems={DEFAULT_TRADITIONS}>
              <AIAssistantProvider>
                <BlogCoverJobProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <GlobalUI />
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
                      <Route path="/invite-onboarding" element={<InviteOnboarding />} />
                      <Route path="/activate/:inviteToken" element={<ActivateChild />} />
                      <Route path="/activate-callback" element={<ActivateCallback />} />
                      {/* SEC-1.4: debug routes только в dev-сборке, не попадают в prod bundle. */}
                      {import.meta.env.DEV && (
                        <Route path="/oauth-debug" element={<OAuthDebug />} />
                      )}
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
                      {/* SEC-1.2b: MEDIUM-risk — гараж (личные данные об авто) */}
                      <Route path="/garage" element={<ProtectedRoute><Garage /></ProtectedRoute>} />
                      {/* SEC-1.2a: HIGH-risk routes (медицина, финансы) обёрнуты в ProtectedRoute. */}
                      <Route path="/health" element={<ProtectedRoute><Health /></ProtectedRoute>} />
                      <Route path="/finance" element={<ProtectedRoute><FinanceHub /></ProtectedRoute>} />
                      <Route path="/finance/budget" element={<ProtectedRoute><FinanceBudget /></ProtectedRoute>} />
                      <Route path="/finance/debts" element={<ProtectedRoute><FinanceDebts /></ProtectedRoute>} />
                      <Route path="/finance/accounts" element={<ProtectedRoute><FinanceAccounts /></ProtectedRoute>} />
                      <Route path="/finance/goals" element={<ProtectedRoute><FinanceGoals /></ProtectedRoute>} />
                      <Route path="/finance/literacy" element={<ProtectedRoute><FinanceLiteracy /></ProtectedRoute>} />
                      <Route path="/finance/recurring" element={<ProtectedRoute><FinanceRecurring /></ProtectedRoute>} />
                      <Route path="/finance/assets" element={<ProtectedRoute><FinanceAssets /></ProtectedRoute>} />
                      <Route path="/finance/loyalty" element={<ProtectedRoute><FinanceLoyalty /></ProtectedRoute>} />
                      <Route path="/finance/antiscam" element={<ProtectedRoute><AntiScam /></ProtectedRoute>} />
                      <Route path="/finance/analytics" element={<ProtectedRoute><FinanceAnalytics /></ProtectedRoute>} />
                      <Route path="/finance/strategy" element={<ProtectedRoute><FinanceStrategy /></ProtectedRoute>} />
                      <Route path="/finance/cashflow" element={<ProtectedRoute><FinanceCashflow /></ProtectedRoute>} />
                      <Route path="/education" element={<Education />} />
                      {/* SEC-1.2b: MEDIUM-risk — семейные события */}
                      <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
                      <Route path="/events/create" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
                      <Route path="/events/edit/:id" element={<ProtectedRoute><EditEventPage /></ProtectedRoute>} />
                      <Route path="/events/:id" element={<ProtectedRoute><EventDetailsPage /></ProtectedRoute>} />
                      {/* SEC-1.2b: MEDIUM-risk — питомцы */}
                      <Route path="/pets" element={<ProtectedRoute><Pets /></ProtectedRoute>} />
                      <Route path="/faith" element={<Faith />} />
                      {/* SEC-1.2b: MEDIUM-risk — семейное древо */}
                      <Route path="/tree" element={<ProtectedRoute><Tree /></ProtectedRoute>} />
                      <Route path="/family-id" element={<FamilyId />} />
                      <Route path="/memory" element={
                        <ProtectedRoute>
                          <Memory />
                        </ProtectedRoute>
                      } />
                      {/* SEC-1.2b: MEDIUM-risk — личные покупки и питание */}
                      <Route path="/shopping" element={<ProtectedRoute><Shopping /></ProtectedRoute>} />
                      <Route path="/meals" element={<ProtectedRoute><Meals /></ProtectedRoute>} />
                      {/* SEC-1.2b: MEDIUM-risk — личный календарь */}
                      <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                      <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
                      <Route path="/permissions" element={<ProtectedRoute><PermissionsManagement /></ProtectedRoute>} />
                      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                      <Route path="/member/:memberId" element={<ProtectedRoute><MemberProfile /></ProtectedRoute>} />
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
                      <Route path="/portfolio/:memberId/sphere/:sphereKey" element={
                        <ProtectedRoute>
                          <SphereDetail />
                        </ProtectedRoute>
                      } />
                      <Route path="/family-code" element={<FamilyCode />} />
                      {/* SEC-1.2b: MEDIUM-risk — личная переписка */}
                      <Route path="/chat" element={<ProtectedRoute><FamilyChat /></ProtectedRoute>} />
                      <Route path="/family-chat" element={<ProtectedRoute><FamilyChat /></ProtectedRoute>} />
                      <Route path="/state-support" element={<StateSupport />} />
                      <Route path="/support-navigator" element={<SupportNavigator />} />
                      <Route path="/family-policy" element={<FamilyPolicy />} />
                      <Route path="/what-is-family" element={<WhatIsFamily />} />
                      {/* SEC-1.2b: MEDIUM-risk — семейные новости */}
                      <Route path="/family-news" element={<ProtectedRoute><FamilyNews /></ProtectedRoute>} />
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
                      <Route path="/bank-deck" element={<BankDeck />} />
                      <Route path="/strategy" element={<StrategyDeckV21 />} />
                      <Route path="/strategy/proof" element={<ProofDeck />} />
                      <Route path="/strategy/appendix" element={<AppendixDeck />} />
                      <Route path="/strategy/hub" element={<StrategyHub />} />
                      <Route path="/strategy-legacy" element={<StrategyDeck />} />
                      <Route path="/matryoshka" element={<MatryoshkaDeck />} />
                      <Route path="/award-card" element={<AwardCard />} />
                      {/* SEC-1.2b: MEDIUM-risk — психолог (личные данные) */}
                      <Route path="/psychologist" element={<ProtectedRoute><FamilyPsychologist /></ProtectedRoute>} />
                      <Route path="/rules" element={<FamilyRules />} />
                      {/* SEC-1.2b: MEDIUM-risk — пользовательские данные (голосования, обратная связь) */}
                      <Route path="/voting" element={<ProtectedRoute><VotingPage /></ProtectedRoute>} />
                      <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
                      <Route path="/suggestions" element={<ProtectedRoute><SuggestionsPage /></ProtectedRoute>} />
                      <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
                      <Route path="/my-tickets" element={<ProtectedRoute><MyTicketsPage /></ProtectedRoute>} />
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/admin/support" element={<AdminRoute><AdminSupport /></AdminRoute>} />
                      <Route path="/admin/support-desk" element={<AdminRoute><AdminSupportDesk /></AdminRoute>} />
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
                      {/* SEC-1.2b: MEDIUM-risk — голосовой ИИ */}
                      <Route path="/alice" element={<ProtectedRoute><AliceIntegration /></ProtectedRoute>} />
                      <Route path="/nationalities" element={<NationalitiesPage />} />
                      <Route path="/nationalities/:id" element={<NationalityDetailPage />} />
                      <Route path="/children" element={<Children />} />
                      <Route path="/children/assessment-report" element={<AssessmentReport />} />
                      {/* SEC-1.2a: HIGH-risk (геолокация, личная аналитика, настройки). */}
                      <Route path="/family-tracker" element={<ProtectedRoute><FamilyTracker /></ProtectedRoute>} />
                      <Route path="/location-history" element={<ProtectedRoute><LocationHistory /></ProtectedRoute>} />
                      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                      <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
                      {/* SEC-1.2b: MEDIUM-risk — личные данные питания */}
                      <Route path="/nutrition" element={<ProtectedRoute><NutritionHub /></ProtectedRoute>} />
                      <Route path="/nutrition/tracker" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
                      <Route path="/nutrition/diet" element={<ProtectedRoute><DietQuiz /></ProtectedRoute>} />
                      <Route path="/nutrition/programs" element={<ProtectedRoute><DietProgramCatalog /></ProtectedRoute>} />
                      <Route path="/nutrition/programs/:slug/quiz" element={<ProtectedRoute><DietMiniQuiz /></ProtectedRoute>} />
                      <Route path="/nutrition/recipe-from-products" element={<ProtectedRoute><RecipeFromProducts /></ProtectedRoute>} />
                      <Route path="/nutrition/progress" element={<ProtectedRoute><DietProgress /></ProtectedRoute>} />
                      <Route path="/wallet" element={<ProtectedRoute><FamilyWallet /></ProtectedRoute>} />
                      {/* SEC-1.2b: MEDIUM-risk — поездки */}
                      <Route path="/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
                      <Route path="/trips/:id" element={<ProtectedRoute><TripDetails /></ProtectedRoute>} />
                      <Route path="/trips/wishlist" element={<ProtectedRoute><TripWishlist /></ProtectedRoute>} />
                      {/* SEC-1.2b: MEDIUM-risk — досуг */}
                      <Route path="/leisure" element={<ProtectedRoute><Leisure /></ProtectedRoute>} />
                      {/* SEC-1.2b: MEDIUM-risk — персональный ИИ */}
                      <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
                      <Route path="/development" element={<Development />} />
                      {/* SEC-1.2b: MEDIUM-risk — личные цели и планирование */}
                      <Route path="/life-road" element={<ProtectedRoute><LifeRoad /></ProtectedRoute>} />
                      <Route path="/workshop" element={<ProtectedRoute><Workshop /></ProtectedRoute>} />
                      <Route path="/workshop/goal/:id" element={<ProtectedRoute><WorkshopGoal /></ProtectedRoute>} />
                      {/* Goals V1 QA manifest — только в dev-сборке, не попадает в production-навигацию. */}
                      {import.meta.env.DEV && (
                        <Route path="/dev/goals-qa" element={<DevGoalsQa />} />
                      )}
                      <Route path="/in-development" element={<InDevelopmentList />} />
                      <Route path="/family-management" element={<ProtectedRoute><FamilyManagement /></ProtectedRoute>} />
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
                      {/* SEC-1.2a: admin-роуты без guard'а — закрываем AdminRoute. */}
                      <Route path="/admin/domovoy" element={<AdminRoute><AdminDomovoy /></AdminRoute>} />
                      <Route path="/admin/domovoy/studio" element={<AdminRoute><DomovoyStudio /></AdminRoute>} />
                      <Route path="/admin/dev-agent" element={<AdminRoute><DevAgentStudio /></AdminRoute>} />
                      <Route path="/admin/status-banners" element={
                        <AdminRoute>
                          <AdminStatusBanners />
                        </AdminRoute>
                      } />
                      {/* SEC-1.2b: MEDIUM-risk — Домовой (персональный ИИ-ассистент) */}
                      <Route path="/domovoy" element={<ProtectedRoute><DomovoyPage /></ProtectedRoute>} />
                      <Route path="/services" element={<TelegramServices />} />
                      {/* SEC-1.4: debug routes только в dev-сборке. */}
                      {import.meta.env.DEV && (
                        <Route path="/debug-auth" element={<DebugAuth />} />
                      )}
                      {/* SEC-1.2b: MEDIUM-risk — все хабы (семейные данные) */}
                      <Route path="/family-hub" element={<ProtectedRoute><FamilyHub /></ProtectedRoute>} />
                      <Route path="/values-hub" element={<ProtectedRoute><ValuesHub /></ProtectedRoute>} />
                      <Route path="/planning-hub" element={<ProtectedRoute><PlanningHub /></ProtectedRoute>} />
                      <Route path="/household-hub" element={<ProtectedRoute><HouseholdHub /></ProtectedRoute>} />
                      <Route path="/home-hub" element={<ProtectedRoute><HomeModule /></ProtectedRoute>} />
                      <Route path="/development-hub" element={<ProtectedRoute><DevelopmentHub /></ProtectedRoute>} />
                      <Route path="/pari-test" element={<PariTest />} />
                      <Route path="/pari-results/:id" element={<PariResults />} />
                      <Route path="/state-hub" element={<ProtectedRoute><StateHub /></ProtectedRoute>} />
                      <Route path="/health-hub" element={<ProtectedRoute><HealthHub /></ProtectedRoute>} />
                      <Route path="/leisure-hub" element={<ProtectedRoute><LeisureHub /></ProtectedRoute>} />
                      <Route path="/values" element={<Values />} />
                      <Route path="/culture" element={<Culture />} />
                      <Route path="/wisdom" element={<Wisdom />} />
                      {/* SEC-1.2b: MEDIUM-risk — задачи и уведомления */}
                      <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                      {/* Legacy /goals → redirect на новый Workshop (Goals V1). См. R2 Wave 2. */}
                      <Route path="/goals" element={<Navigate to="/workshop" replace />} />
                      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
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
              </FamilyTraditionsProvider>
            </FamilyMembersProvider>
          </DialogLockProvider>
        </DemoModeProvider>
      </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;