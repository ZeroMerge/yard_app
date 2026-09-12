import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { Campaign } from "@/api/types";
import { PageHeader, Stat, StatusPill } from "@/components/ui-bits";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusIcon as Plus, MagnifyingGlassIcon as Search, VideoCameraIcon as Video, ArrowRightIcon as ArrowRight, ChevronRightIcon } from '@heroicons/react/24/outline';
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
    <div className="space-y-8 lg:space-y-10 pb-20 animate-in fade-in duration-300">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "Brand"}`}
        subtitle="Real-time workspace activity, active campaigns, and creator deliverables."
        action={
          <Link to="/brand/campaigns/new">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-md px-4 py-2 text-xs transition-colors shadow-xs">
              <Plus className="h-4 w-4 mr-1.5" /> New Campaign
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Stat label="Active Campaigns" value={active} />
        <Stat label="Total Allocated" value={money(totalBudget)} tone="gold" />
        <Stat label="Pending Applications" value={pendingApps.length} hint="Awaiting your review" />
        <Stat label="Creators Engaged" value={creatorsEngaged} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { to: "/brand/campaigns/new", icon: Plus, label: "Create Campaign", desc: "Define brief and budget slots" },
            { to: "/brand/discover", icon: Search, label: "Discover Creators", desc: "Filter by rate card and niche" },
            { to: "/brand/budget", icon: Video, label: "Budget & Payouts", desc: "View real-time disbursements" },
          ].map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="bg-card hover:bg-surface-2/40 border border-border/60 hover:border-transparent p-4 sm:p-5 rounded-md shadow-2xs transition-all duration-150 group flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-10 w-10 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 grid place-items-center font-bold shrink-0">
                  <a.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">{a.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{a.desc}</div>
                </div>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border/60 rounded-md p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-base text-foreground">Active Workspace Campaigns</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Campaigns currently live or awaiting deliverables.</p>
            </div>
            <Link to="/brand/campaigns" className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
              <span>View all</span>
              <ChevronRightIcon className="h-3.5 w-3.5 stroke-[2.2]" />
            </Link>
          </div>
          <div className="space-y-2.5 pt-1">
            {myCampaigns.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                to={`/brand/campaigns/${c.id}`}
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-md bg-surface-2/40 border border-border/40 hover:bg-surface-2/70 hover:border-transparent transition-all duration-150"
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm text-foreground">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground capitalize mt-0.5">{c.category} • {c.country}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-extrabold text-xs sm:text-sm font-numeric text-foreground">{money(c.budgetPerCreator, c.currency)}</span>
                  <StatusPill status={c.status} />
                </div>
              </Link>
            ))}
            {myCampaigns.length === 0 && !isLoading && (
              <div className="p-10 text-center text-xs text-muted-foreground">
                No campaigns yet. <Link to="/brand/campaigns/new" className="text-teal-600 font-bold hover:underline">Create one now</Link>.
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-md p-6 shadow-2xs space-y-4">
          <div>
            <h2 className="font-display font-bold text-base text-foreground">Pending Applicants</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Creators awaiting your approval.</p>
          </div>
          <div className="space-y-2.5 pt-1">
            {pendingApps.slice(0, 6).map((a) => (
              <Link
                key={a.id}
                to={`/brand/campaigns/${a.campaignId}`}
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-md bg-surface-2/40 border border-border/40 hover:bg-surface-2/70 hover:border-transparent transition-all duration-150"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs sm:text-sm font-bold text-foreground truncate">{a.creator?.displayName || "Applicant"}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{a.campaignName}</div>
                </div>
                <StatusPill status="pending" />
              </Link>
            ))}
            {pendingApps.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-xs">You're all caught up.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;
