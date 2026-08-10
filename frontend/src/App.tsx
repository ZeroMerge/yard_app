import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { initTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Activity from "./pages/Activity.tsx";
import { AppShell, type NavItem } from "./components/AppShell.tsx";
import { LayoutDashboard, Megaphone, Search, Wallet, User, FileUp, Compass, Activity as ActivityIcon } from "lucide-react";

import FoundersConsole from "./pages/founders/Console.tsx";
import BrandDashboard from "./pages/brand/Dashboard.tsx";
import BrandCampaigns from "./pages/brand/Campaigns.tsx";
import BrandNewCampaign from "./pages/brand/NewCampaign.tsx";
import BrandCampaignDetail from "./pages/brand/CampaignDetail.tsx";
import BrandDiscover from "./pages/brand/Discover.tsx";
import BrandBudget from "./pages/brand/Budget.tsx";

import CreatorDashboard from "./pages/creator/Dashboard.tsx";
import CreatorBrowse from "./pages/creator/BrowseCampaigns.tsx";
import CreatorCampaignDetail from "./pages/creator/CampaignDetail.tsx";
import CreatorSubmissions from "./pages/creator/Submissions.tsx";
import CreatorProfile from "./pages/creator/Profile.tsx";
import CreatorWallet from "./pages/creator/Wallet.tsx";

const queryClient = new QueryClient();

const brandNav: NavItem[] = [
  { to: "/brand", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/brand/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/brand/discover", label: "Discover creators", icon: Search },
  { to: "/brand/budget", label: "Budget & payouts", icon: Wallet },
  { to: "/brand/activity", label: "Activity", icon: ActivityIcon },
];

const creatorNav: NavItem[] = [
  { to: "/creator", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/creator/campaigns", label: "Browse campaigns", icon: Compass },
  { to: "/creator/submissions", label: "Submissions", icon: FileUp },
  { to: "/creator/wallet", label: "Wallet", icon: Wallet },
  { to: "/creator/profile", label: "Profile", icon: User },
  { to: "/creator/activity", label: "Activity", icon: ActivityIcon },
];

const RootAppRedirect = () => {
  const user = useAuth();
  if (user?.role === "brand") return <Navigate to="/brand" replace />;
  if (user?.role === "creator") return <Navigate to="/creator" replace />;
  return <Navigate to="/login" replace />;
};

const App = () => {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Pure SaaS Web App Root (Straight-Ahead on app.yard.com) */}
            <Route path="/" element={<RootAppRedirect />} />

            {/* Auth & Identity */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Founders / Admin Console */}
            <Route path="/founders/console" element={<FoundersConsole />} />

            {/* Brand Workspace */}
            <Route element={<AppShell nav={brandNav} roleLabel="Brand workspace" allowedRole="brand" />}>
              <Route path="/brand" element={<BrandDashboard />} />
              <Route path="/brand/campaigns" element={<BrandCampaigns />} />
              <Route path="/brand/campaigns/new" element={<BrandNewCampaign />} />
              <Route path="/brand/campaigns/:id" element={<BrandCampaignDetail />} />
              <Route path="/brand/discover" element={<BrandDiscover />} />
              <Route path="/brand/budget" element={<BrandBudget />} />
              <Route path="/brand/activity" element={<Activity />} />
            </Route>

            {/* Creator Workspace */}
            <Route element={<AppShell nav={creatorNav} roleLabel="Creator workspace" allowedRole="creator" />}>
              <Route path="/creator" element={<CreatorDashboard />} />
              <Route path="/creator/campaigns" element={<CreatorBrowse />} />
              <Route path="/creator/campaigns/:id" element={<CreatorCampaignDetail />} />
              <Route path="/creator/submissions" element={<CreatorSubmissions />} />
              <Route path="/creator/wallet" element={<CreatorWallet />} />
              <Route path="/creator/payouts" element={<Navigate to="/creator/wallet" replace />} />
              <Route path="/creator/profile" element={<CreatorProfile />} />
              <Route path="/creator/activity" element={<Activity />} />
            </Route>

            {/* Fallbacks */}
            <Route path="/admin/*" element={<Navigate to="/founders/console" replace />} />
            <Route path="/index" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
