
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { queryClient } from "@/lib/queryClient";



const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
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
              <Route path="/admin/traffic" element={<AdminTraffic />} />
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
              <Route path="/family-settings" element={<FamilySettings />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/nutrition" element={<Nutrition />} />
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
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/ideas" element={<IdeasBoard />} />
              <Route path="/ideas-board" element={<IdeasBoard />} />
              <Route path="/investor-deck" element={<InvestorDeck />} />
              <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
              <Route path="/admin/domovoy" element={<AdminDomovoy />} />
              <Route path="/domovoy" element={<DomovoyPage />} />
              <Route path="/services" element={<TelegramServices />} />
              <Route path="/debug-auth" element={<DebugAuth />} />
              <Route path="/family" element={<Navigate to="/?section=family" replace />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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