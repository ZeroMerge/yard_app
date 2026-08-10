import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { Campaign } from "@/api/types";
import { PageHeader, Stat, StatusPill } from "@/components/ui-bits";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Search, Video, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const money = (amount: number, currency: string = "NGN") =>
  `${currency === "NGN" ? "₦" : "$"}${Number(amount || 0).toLocaleString()}`;

const BrandDashboard = () => {
  const user = useAuth()!;

  const { data: myCampaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  const active = myCampaigns.filter((c) => ["open", "in_progress", "review"].includes(c.status)).length;
  const totalBudget = myCampaigns.reduce((sum, c) => sum + Number(c.budgetPerCreator || 0) * (c.quantity || 1), 0);
  const pendingApps = myCampaigns.flatMap((c) =>
    (c.applications || []).filter((a) => a.status === "pending").map((a) => ({ ...a, campaignName: c.name }))
  );
  const creatorsEngaged = myCampaigns.flatMap((c) =>
    (c.applications || []).filter((a) => a.status === "accepted")
  ).length;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "Brand"}`}
        subtitle="Real-time workspace activity, active campaigns, and creator deliverables."
        action={
          <Link to="/brand/campaigns/new">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-5 shadow-sm">
              <Plus className="h-4 w-4 mr-1.5" /> New Campaign
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Active Campaigns" value={active} />
        <Stat label="Total Allocated" value={money(totalBudget)} tone="gold" />
        <Stat label="Pending Applications" value={pendingApps.length} hint="Awaiting your review" />
        <Stat label="Creators Engaged" value={creatorsEngaged} />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        {[
          { to: "/brand/campaigns/new", icon: Plus, label: "Create Campaign", desc: "Define brief and budget slots" },
          { to: "/brand/discover", icon: Search, label: "Discover Creators", desc: "Filter by rate card and niche" },
          { to: "/brand/budget", icon: Video, label: "Budget & Payouts", desc: "View real-time disbursements" },
        ].map((a, i) => (
          <motion.div key={a.to} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={a.to} className="cy-card p-5 flex items-center gap-3.5 hover:shadow-elevated transition-all group block">
              <div className="h-11 w-11 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 grid place-items-center font-bold">
                <a.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{a.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 cy-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Active Workspace Campaigns</h2>
            <Link to="/brand/campaigns" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {myCampaigns.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                to={`/brand/campaigns/${c.id}`}
                className="cy-row flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-foreground">{c.name}</div>
                  <div className="text-xs text-muted-foreground capitalize mt-0.5">{c.category} • {c.country}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-extrabold text-sm">{money(c.budgetPerCreator, c.currency)}</span>
                  <StatusPill status={c.status} />
                </div>
              </Link>
            ))}
            {myCampaigns.length === 0 && !isLoading && (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No campaigns yet. <Link to="/brand/campaigns/new" className="text-teal-600 font-semibold underline">Create one now</Link>.
              </div>
            )}
          </div>
        </div>

        <div className="cy-card p-6">
          <div className="mb-4">
            <h2 className="font-display font-bold text-lg">Pending Applicants</h2>
          </div>
          <div className="space-y-2">
            {pendingApps.slice(0, 6).map((a) => (
              <Link key={a.id} to={`/brand/campaigns/${a.campaignId}`} className="cy-row flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-foreground">{a.creator?.displayName || "Applicant"}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.campaignName}</div>
                </div>
                <StatusPill status="pending" />
              </Link>
            ))}
            {pendingApps.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">You're all caught up.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;
