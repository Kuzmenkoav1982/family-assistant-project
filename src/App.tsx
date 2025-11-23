
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;