import { useAuth } from "@/lib/auth";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BriefcaseIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ChevronRightIcon,
  ArrowUpTrayIcon as UploadIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import { creatorsApi } from "@/api/creators";
import { campaignsApi } from "@/api/campaigns";
import { Campaign } from "@/api/types";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const money = (amount: number, currency: string = "NGN") =>
  `${currency === "NGN" ? "₦" : "$"}${Number(amount || 0).toLocaleString()}`;

export default function CreatorHome() {
  const user = useAuth()!;

  const { data: homeData, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: () => creatorsApi.getHome(),
    retry: 1,
  });

  const { data: openCampaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const items = homeData?.items || [];
  const identitySignals = items.filter((i: any) => i?.type === 'PROFILE_READINESS');
  const opportunitySignals = items.filter((i: any) => i?.type === 'OPPORTUNITY');
  const workSignals = items.filter((i: any) => !['PROFILE_READINESS', 'OPPORTUNITY', 'PAYMENT_PROCESSING', 'PAYMENT_COMPLETED'].includes(i?.type));
  const moneySignals = items.filter((i: any) => ['PAYMENT_PROCESSING', 'PAYMENT_COMPLETED'].includes(i?.type));

  // Capitalize first letter of name
  const formattedName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : "Creator";

  const isProfileComplete = identitySignals.length === 0;

  return (
    <div className="space-y-8 lg:space-y-10 pb-20 animate-in fade-in duration-300">

      {/* ── Gumloop Header (Clean, Confident, Spacious) ───────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-foreground tracking-tight">
            Welcome back, {formattedName}
          </h1>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            to="/creator/campaigns"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-all shadow-xs"
          >
            <SparklesIcon className="h-4 w-4" />
            Find Campaigns
          </Link>
          <Link
            to="/creator/work"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-card hover:bg-surface-2 text-foreground text-xs font-semibold transition-all border border-border/60 shadow-2xs"
          >
            Active Work
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* My Work */}
        <Link to="/creator/work" className="group block">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-card hover:bg-surface-2/40 border border-border/60 hover:border-transparent p-4 sm:p-5 lg:p-6 rounded-md shadow-2xs transition-all duration-150 relative overflow-hidden flex flex-col justify-between h-full"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">My Work</span>
              <div className="h-7 w-7 rounded-md bg-surface-2/80 grid place-items-center text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                <BriefcaseIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div>
              <div className="font-geist-mono font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
                {workSignals.length}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
                Work in progress
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Payments */}
        <Link to="/creator/wallet" className="group block">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-card hover:bg-surface-2/40 border border-border/60 hover:border-transparent p-4 sm:p-5 lg:p-6 rounded-md shadow-2xs transition-all duration-150 relative overflow-hidden flex flex-col justify-between h-full"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">Payments</span>
              <div className="h-7 w-7 rounded-md bg-surface-2/80 grid place-items-center text-muted-foreground group-hover:text-yellow-600 transition-colors shrink-0">
                <CurrencyDollarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div>
              <div className="font-geist-mono font-bold text-2xl sm:text-3xl text-yellow-600 dark:text-yellow-400 tracking-tight">
                {moneySignals.length}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
                Payments on the way
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Campaigns for You */}
        <Link to="/creator/campaigns" className="group block">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-card hover:bg-surface-2/40 border border-border/60 hover:border-transparent p-4 sm:p-5 lg:p-6 rounded-md shadow-2xs transition-all duration-150 relative overflow-hidden flex flex-col justify-between h-full"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">Campaigns for You</span>
              <div className="h-7 w-7 rounded-md bg-surface-2/80 grid place-items-center text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                <SparklesIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div>
              <div className="font-geist-mono font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
                {opportunitySignals.length}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
                Recommended Campaigns
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Identity */}
        <Link to="/creator/profile" className="group block">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-card hover:bg-surface-2/40 border border-border/60 hover:border-transparent p-4 sm:p-5 lg:p-6 rounded-md shadow-2xs transition-all duration-150 relative overflow-hidden flex flex-col justify-between h-full"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">Identity</span>
              <div className="h-7 w-7 rounded-md bg-surface-2/80 grid place-items-center text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                <UserCircleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
                {isProfileComplete ? (
                  <>
                    <span>100%</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </>
                ) : (
                  <>
                    <span className="text-amber-600 dark:text-amber-400">Action</span>
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  </>
                )}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
                {isProfileComplete ? "Profile verified" : "Setup needed"}
              </div>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* ── Main Content Grid (Spacious 8:4 Ratio & Rounded-MD Containers) ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* Left Column (8/12): Needs Your Attention + Campaigns You Can Apply For */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-8">

          {/* Needs Your Attention */}
          <div className="bg-card border border-border/60 rounded-md overflow-hidden shadow-2xs">
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between bg-surface-2/20">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                <h2 className="font-display font-bold text-sm text-foreground">Needs Your Attention</h2>
              </div>
            </div>

            {workSignals.length > 0 ? (
              <div className="divide-y divide-border/30">
                {workSignals.map((item: any) => (
                  <div key={item.id} className="p-5 flex items-center justify-between gap-4 hover:bg-surface-2/40 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-foreground truncate">
                          {item.summary.brandName || 'Deliverable Item'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/10 text-primary">
                          Due
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {item.summary.campaignName || item.type}
                      </div>
                      <div className="text-xs text-foreground/80 mt-1 line-clamp-1 flex items-center gap-1.5">
                        <ClockIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        {item.summary.message || 'Action required.'}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Link
                        to={item.actionUrl || "/creator/work"}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-all shadow-xs"
                      >
                        <UploadIcon className="h-3.5 w-3.5" /> Fulfill
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Reassuring Status Banner */
              <div className="p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
                    <CheckCircleIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm text-foreground">Nothing Needs Attention</div>
                    <div className="text-xs text-muted-foreground mt-0.5">All deliverables, submissions, and payments are up to date.</div>
                  </div>
                </div>

                <Link
                  to="/creator/work"
                  className="px-3.5 py-2 rounded-md bg-surface-2 hover:bg-surface-2/80 text-foreground text-xs font-semibold transition-colors shrink-0"
                >
                  View My Work
                </Link>
              </div>
            )}
          </div>

          {/* Campaigns You Can Apply For */}
          <div className="bg-card border border-border/60 rounded-md p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-primary" />
                <h2 className="font-display font-bold text-sm text-foreground">Campaigns You Can Apply For</h2>
              </div>
              <Link to="/creator/campaigns"
                className="px-3.5 py-2 rounded-md bg-surface-2 hover:bg-surface-2/80 text-foreground text-xs font-semibold transition-colors shrink-0"
              >
                Explore all campaigns
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {openCampaigns.slice(0, 2).map((c) => (
                <Link
                  key={c.id}
                  to={`/creator/campaigns/${c.id}`}
                  className="p-4 rounded-md bg-surface-2/40 hover:bg-surface-2/80 border border-border/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      {c.organization?.name || "Verified Brand"}
                    </div>
                    <div className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {c.name}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <VideoCameraIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="capitalize">{c.quantity}x {c.deliverableType.replace("_", " ")}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
                    <span className="font-display font-extrabold text-sm text-foreground">
                      {money(c.budgetPerCreator, c.currency)}
                    </span>
                    <span className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                      <span>Review</span>
                      <ChevronRightIcon className="h-3.5 w-3.5 stroke-[2.2]" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (4/12): Structured Bento Containers */}
        <div className="lg:col-span-4 space-y-6 lg:space-y-8">

          {/* Profile Health Alert (if incomplete) */}
          {!isProfileComplete && (
            <div className="bg-card border border-amber-500/30 rounded-md p-5 shadow-2xs bg-amber-500/5">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-8 w-8 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
                  <UserCircleIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground">Setup Incomplete</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add payout bank details to unlock direct invites.
                  </p>
                </div>
              </div>
              <Link
                to="/creator/profile"
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-bold text-center block transition-colors shadow-xs"
              >
                Complete Profile Setup
              </Link>
            </div>
          )}

          {/* Recommended for You Card */}
          <div className="bg-card border border-border/60 rounded-md p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-violet-500" />
                <h2 className="font-display font-bold text-sm text-foreground">Recommended for You</h2>
              </div>
              <Link to="/creator/campaigns" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                <span>View all</span>
                <ChevronRightIcon className="h-3.5 w-3.5 stroke-[2.2]" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {opportunitySignals.length === 0 ? (
                <div className="text-xs text-muted-foreground py-3">
                  No direct matches right now. Browse open briefs in the marketplace.
                </div>
              ) : (
                opportunitySignals.slice(0, 3).map((op: any) => (
                  <div key={op.id} className="p-3 rounded-md bg-surface-2/50 hover:bg-surface-2 transition-all group">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span className="font-bold uppercase tracking-wider">{op.summary.brandName}</span>
                      <span className="font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-1.5 py-0.2 rounded">Match</span>
                    </div>
                    <div className="font-display font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                      {op.summary.campaignName}
                    </div>
                    <div className="mt-2 text-right">
                      <Link to={op.actionUrl || "/creator/campaigns"} className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                        <span>Review</span>
                        <ChevronRightIcon className="h-3.5 w-3.5 stroke-[2.2]" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-card border border-border/60 rounded-md p-6 shadow-2xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-0.5">
              Quick Links
            </h2>
            <div className="space-y-1">
              <Link
                to="/creator/profile"
                className="group flex items-center justify-between p-2.5 rounded-md hover:bg-surface-2 transition-colors text-xs font-semibold text-foreground"
              >
                <span>Edit Profile & Social Accounts</span>
                <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors stroke-[2]" />
              </Link>
              <Link
                to="/creator/wallet"
                className="group flex items-center justify-between p-2.5 rounded-md hover:bg-surface-2 transition-colors text-xs font-semibold text-foreground"
              >
                <span>Payout Details</span>
                <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors stroke-[2]" />
              </Link>
              <Link
                to="/creator/settings"
                className="group flex items-center justify-between p-2.5 rounded-md hover:bg-surface-2 transition-colors text-xs font-semibold text-foreground"
              >
                <span>Account Settings</span>
                <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors stroke-[2]" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
