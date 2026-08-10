import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { creatorsApi } from "@/api/creators";
import { Campaign, Creator } from "@/api/types";
import { PageHeader, Stat, StatusPill } from "@/components/ui-bits";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const money = (amount: number, currency: string = "NGN") =>
  `${currency === "NGN" ? "₦" : "$"}${Number(amount || 0).toLocaleString()}`;

const CreatorDashboard = () => {
  const user = useAuth()!;

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  const { data: profile } = useQuery<Creator>({
    queryKey: ["creator_me"],
    queryFn: creatorsApi.getMe,
    retry: false,
  });

  const myCampaigns = campaigns.filter(
    (c) => c.applications && c.applications.length > 0
  );
  const myApps = myCampaigns.flatMap((c) => (c.applications || []).map((a) => ({ ...a, campaignName: c.name, campaignCategory: c.category })));
  const activeCount = myApps.filter((a) => a.status === "accepted").length;
  const pendingCount = myApps.filter((a) => a.status === "pending").length;

  const steps = [
    { done: !!profile?.bio && profile.bio.length > 10, label: "Complete your creator bio", to: "/creator/profile" },
    { done: !!profile?.rates && profile.rates.length > 0, label: "Set your per-deliverable rates", to: "/creator/profile" },
    { done: !!profile?.payoutAccount, label: "Add NUBAN payout details", to: "/creator/wallet" },
    { done: myApps.length > 0, label: "Apply to your first campaign", to: "/creator/campaigns" },
  ];
  const completedCount = steps.filter((s) => s.done).length;
  const showOnboarding = completedCount < steps.length;

  return (
    <div>
      <PageHeader
        title={`Hello, ${user?.name?.split(" ")[0] || "Creator"}`}
        subtitle="Your creator workspace & brand campaign collaborations."
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Applications" value={myApps.length} />
        <Stat label="Active Campaigns" value={activeCount} />
        <Stat label="Pending Review" value={pendingCount} />
        <Stat label="Account Standing" value={profile?.verified ? "Verified" : "Active"} tone="gold" />
      </div>

      {showOnboarding && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="cy-card p-6 mt-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-display font-bold text-lg">Complete your creator onboarding</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedCount} of {steps.length} complete — brands discover profiles with structured rate cards first.
              </p>
            </div>
            <div className="text-sm font-extrabold text-teal-600 dark:text-teal-400 tabular-nums">
              {Math.round((completedCount / steps.length) * 100)}%
            </div>
          </div>
          <div className="h-2 rounded-full bg-surface-2 dark:bg-surface overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / steps.length) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-full bg-gradient-teal"
            />
          </div>
          <ul className="space-y-1.5">
            {steps.map((s) => (
              <li key={s.label}>
                <Link to={s.to} className="flex items-center justify-between rounded-xl px-4 py-2.5 hover:bg-surface-2 dark:hover:bg-surface transition-colors group">
                  <span className="flex items-center gap-3 text-sm font-medium">
                    {s.done ? <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                    <span className={s.done ? "text-muted-foreground line-through" : "text-foreground"}>{s.label}</span>
                  </span>
                  {!s.done && <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 cy-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Your Applications</h2>
            <Link to="/creator/campaigns" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
              Browse open briefs →
            </Link>
          </div>
          <div className="space-y-2">
            {myApps.length === 0 && !isLoading && (
              <div className="p-10 text-center text-sm text-muted-foreground">You haven't applied to any campaigns yet.</div>
            )}
            {myApps.map((a) => (
              <Link key={a.id} to={`/creator/campaigns/${a.campaignId}`} className="cy-row flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-foreground">{a.campaignName}</div>
                  <div className="text-xs text-muted-foreground capitalize mt-0.5">{a.campaignCategory}</div>
                </div>
                <StatusPill status={a.status} />
              </Link>
            ))}
          </div>
        </div>

        <div className="cy-card p-6">
          <div className="mb-4">
            <h2 className="font-display font-bold text-lg">Reputation & Standing</h2>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-muted-foreground">Completed Campaigns:</span>
              <span className="font-extrabold text-foreground">{profile?.stats?.campaignsCompleted || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-muted-foreground">Revisions Requested:</span>
              <span className="font-extrabold text-foreground">{profile?.stats?.revisionsRequested || 0}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Network Standing:</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold">Tier 1 Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
