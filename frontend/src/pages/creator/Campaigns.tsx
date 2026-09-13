import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { Campaign } from "@/api/types";
import { 
  MagnifyingGlassIcon, 
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  VideoCameraIcon,
  SparklesIcon,
  XMarkIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export const money = (amount: number, currency: string = "NGN") =>
  `${currency === "NGN" ? "₦" : "$"}${Number(amount || 0).toLocaleString()}`;

// ── Campaign Bento Card ───────────────────────────────────────────────────

const CampaignCard = ({ campaign, index }: { campaign: Campaign; index: number }) => {
  const [bookmarked, setBookmarked] = useState(false);

  // Map backend application state to a UI status
  let uiStatus: "open" | "applied" | "invited" | "accepted" | "rejected" = "open";
  const app = campaign.applications?.[0];
  
  if (app) {
    if (app.status === "accepted") uiStatus = "accepted";
    else if (app.source === "invited" && app.status === "pending") uiStatus = "invited";
    else if (app.status === "rejected") uiStatus = "rejected";
    else uiStatus = "applied";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      whileHover={{ y: -2 }}
      className={cn(
        "bg-card hover:bg-surface-2/40 border border-border/60 hover:border-border p-5 sm:p-6 rounded-md shadow-2xs transition-all duration-150 flex flex-col justify-between group relative h-full",
        uiStatus === "accepted" && "bg-emerald-500/[0.02]",
        uiStatus === "invited" && "bg-amber-500/[0.02]",
        uiStatus === "rejected" && "bg-rose-500/[0.02]",
        uiStatus === "applied" && "bg-blue-500/[0.02]"
      )}
    >
      <div>
        {/* Top Meta Bar: Brand & Status on left, Bookmark on right */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              {campaign.organization?.name || "Verified Brand"}
            </span>
            {uiStatus === "applied" && (
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                Applied
              </span>
            )}
            {uiStatus === "invited" && (
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                Invited
              </span>
            )}
            {uiStatus === "accepted" && (
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                Accepted
              </span>
            )}
            {uiStatus === "rejected" && (
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-600 dark:text-slate-400 shrink-0">
                Not Moved Forward
              </span>
            )}
          </div>

          <button
            onClick={() => setBookmarked(!bookmarked)}
            aria-label="Bookmark campaign"
            className="p-1 rounded-md text-muted-foreground hover:text-primary transition-colors shrink-0 -mr-1"
          >
            {bookmarked ? (
              <BookmarkSolid className="h-4 w-4 text-primary" />
            ) : (
              <BookmarkOutline className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Campaign Title: Full width of the card */}
        <Link to={`/creator/campaigns/${campaign.id}`} className="block group mb-3">
          <h3 className="font-display font-bold text-base sm:text-lg text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {campaign.name}
          </h3>
        </Link>

        {/* Deliverable & Compensation Chips */}
        <div className="space-y-2.5 my-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground/90 bg-surface-2/50 p-2.5 rounded-md">
            <VideoCameraIcon className="h-4 w-4 text-primary shrink-0" />
            <span className="capitalize">{campaign.quantity}x {campaign.deliverableType.replace("_", " ")}</span>
          </div>

          <div className="flex items-center justify-between text-xs px-0.5">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px] sm:text-xs truncate">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
              <span>{campaign.country || "Global"} {campaign.city ? `· ${campaign.city}` : ""}</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-0.5 rounded-sm bg-surface-2 shrink-0">
              {campaign.category || "Lifestyle"}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer: Compensation & Action */}
      <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-2 mt-2">
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Compensation</div>
          <div className="font-numeric tabular-nums font-extrabold text-base sm:text-lg text-foreground">
            {money(campaign.budgetPerCreator, campaign.currency)}
          </div>
        </div>

        <div>
          {uiStatus === "accepted" ? (
            <Link
              to="/creator/work"
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>Manage Deliverables</span>
              <ChevronRightIcon className="h-3.5 w-3.5 stroke-[2.2]" />
            </Link>
          ) : uiStatus === "invited" ? (
            <Link
              to={`/creator/campaigns/${campaign.id}`}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>Review Invite</span>
              <ChevronRightIcon className="h-3.5 w-3.5 stroke-[2.2]" />
            </Link>
          ) : uiStatus === "applied" ? (
            <Link
              to={`/creator/campaigns/${campaign.id}`}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md bg-surface-2 hover:bg-surface-2/80 text-muted-foreground hover:text-foreground text-xs font-bold transition-colors"
            >
              <span>Track Application</span>
              <ChevronRightIcon className="h-3.5 w-3.5 stroke-[2.2]" />
            </Link>
          ) : uiStatus === "rejected" ? (
            <Link
              to={`/creator/campaigns/${campaign.id}`}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md bg-surface-2 hover:bg-surface-2/80 text-muted-foreground hover:text-foreground text-xs font-bold transition-colors"
            >
              <span>View Brief</span>
              <ChevronRightIcon className="h-3.5 w-3.5 stroke-[2.2]" />
            </Link>
          ) : (
            <Link
              to={`/creator/campaigns/${campaign.id}`}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>Review Brief</span>
              <ChevronRightIcon className="h-3.5 w-3.5 stroke-[2.2]" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── Campaign Clearance Helper ───────────────────────────────────────────────

export const isCampaignClearedForCreator = (c: Campaign): boolean => {
  if (c.status === "completed" || c.status === "closed") return true;

  const app = c.applications?.[0];
  if (!app) return false;

  // Check if any payment for this application or campaign has been triggered
  const hasPaymentTriggered =
    app.payments?.some((p) =>
      ["payment_initiated", "payment_confirmed", "creator_payout_pending", "paid"].includes(p.status)
    ) ||
    c.payments?.some((p) =>
      ["payment_initiated", "payment_confirmed", "creator_payout_pending", "paid"].includes(p.status)
    );

  if (hasPaymentTriggered) return true;

  // Check if deliverable has been approved
  const allDeliverables = [
    ...(c.deliverables || []),
    ...(app.deliverables || []),
  ];
  if (allDeliverables.some((d) => d?.status === "approved")) return true;

  return false;
};

// ── Main Discovery Page ───────────────────────────────────────────────────

type StatusTab = "open" | "applied" | "invited" | "accepted" | "rejected";

export default function Campaigns() {
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [statusTab, setStatusTab] = useState<StatusTab>("open");

  const { data: openCampaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  // Exclude cleared campaigns from the Campaign Hub (they belong in Cleared Work on My Work page)
  const activeHubCampaigns = useMemo(() => {
    return openCampaigns.filter((c) => !isCampaignClearedForCreator(c));
  }, [openCampaigns]);

  const counts = useMemo(() => {
    let open = 0;
    let applied = 0;
    let invited = 0;
    let accepted = 0;
    let rejected = 0;

    for (const c of activeHubCampaigns) {
      const a = c.applications?.[0];
      if (!a) {
        if (c.status === "open") open++;
      } else {
        if (a.status === "accepted") accepted++;
        else if (a.source === "invited" && a.status === "pending") invited++;
        else if (a.status === "rejected") rejected++;
        else if (a.source === "applied" && a.status === "pending") applied++;
      }
    }

    return {
      open,
      applied,
      invited,
      accepted,
      rejected,
    };
  }, [activeHubCampaigns]);

  const statusTabs: { id: StatusTab; label: string; count: number }[] = [
    { id: "open", label: "Open Campaigns", count: counts.open },
    { id: "applied", label: "Applied", count: counts.applied },
    { id: "invited", label: "Direct Invites", count: counts.invited },
    { id: "accepted", label: "Accepted", count: counts.accepted },
    { id: "rejected", label: "Not Moved Forward", count: counts.rejected },
  ];

  const filterOptions = [
    { id: "all", label: "All Formats" },
    { id: "reels", label: "Video Reels" },
    { id: "ugc", label: "UGC / Creator" },
    { id: "high_payout", label: "High Payout (₦100k+)" },
  ];

  const filteredCampaigns = useMemo(() => {
    return activeHubCampaigns.filter((c) => {
      const app = c.applications?.[0];

      // Status Tab filter
      if (statusTab === "open") {
        // Open Campaigns: Only campaigns that are open and creator has NOT applied to
        if (c.status !== "open" || !!app) return false;
      } else if (statusTab === "applied") {
        if (!app || app.source !== "applied" || app.status !== "pending") return false;
      } else if (statusTab === "invited") {
        if (!app || app.source !== "invited" || app.status !== "pending") return false;
      } else if (statusTab === "accepted") {
        if (!app || app.status !== "accepted") return false;
      } else if (statusTab === "rejected") {
        if (!app || app.status !== "rejected") return false;
      }

      // Search keyword filter
      const matchesSearch = 
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.brief.toLowerCase().includes(search.toLowerCase()) ||
        (c.organization?.name && c.organization.name.toLowerCase().includes(search.toLowerCase())) ||
        (c.deliverableType && c.deliverableType.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      // Format / Payout filter
      if (selectedFilter === "reels") {
        return c.deliverableType?.toLowerCase().includes("reel") || c.deliverableType?.toLowerCase().includes("video");
      }
      if (selectedFilter === "ugc") {
        return c.category?.toLowerCase().includes("ugc") || c.deliverableType?.toLowerCase().includes("ugc");
      }
      if (selectedFilter === "high_payout") {
        return Number(c.budgetPerCreator) >= 100000;
      }

      return true;
    });
  }, [activeHubCampaigns, statusTab, search, selectedFilter]);

  return (
    <div className="space-y-8 lg:space-y-10 pb-20 animate-in fade-in duration-300">
      
      {/* ── Editorial Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-foreground tracking-tight">
            Campaign Hub
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Browse verified brand briefs, submit creative pitches, and track your active, accepted, and past applications.
          </p>
        </div>
      </div>

      {/* ── Status Tracking Tabs ────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 p-1 bg-surface-2 border border-border/40 rounded-md w-fit max-w-full overflow-x-auto scrollbar-hide">
        {statusTabs.map((tab) => {
          const isActive = statusTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all whitespace-nowrap",
                isActive
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-sm text-[10px] font-bold font-numeric",
                  isActive
                    ? "bg-teal-500/15 text-teal-600 dark:text-teal-400"
                    : "bg-surface-3 text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search & Filter Bar ────────────────────────────────────────── */}
      <div className="space-y-3.5">
        <div className="relative max-w-2xl">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search campaigns by brand, brief keyword, or deliverable..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-card border border-border/40 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm shadow-2xs transition-all placeholder:text-muted-foreground/70"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Format Filter Pills */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-hide max-w-full pb-1">
          <div className="flex items-center gap-1.5 p-1 rounded-md bg-surface-2 border border-border/40 shrink-0">
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedFilter(opt.id)}
                className={cn(
                  "px-3 py-1.5 rounded-sm text-xs font-semibold transition-all duration-150 whitespace-nowrap",
                  selectedFilter === opt.id
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline shrink-0">
            Showing <strong className="text-foreground">{filteredCampaigns.length}</strong> {statusTab === "open" ? "open briefs" : statusTab}
          </span>
        </div>
      </div>

      {/* ── Campaign Grid ───────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="py-24 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary mx-auto mb-3" />
          <p className="text-xs sm:text-sm text-muted-foreground">Curating matching campaigns...</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-md p-10 sm:p-14 text-center shadow-2xs">
          <div className="h-11 w-11 rounded-md bg-surface-2 text-muted-foreground mx-auto grid place-items-center mb-3">
            <SparklesIcon className="h-5 w-5" />
          </div>
          <h3 className="font-display font-bold text-base text-foreground">
            {statusTab === "open" ? "No open campaigns available" :
             statusTab === "applied" ? "No applications pending" :
             statusTab === "invited" ? "No direct invitations" :
             statusTab === "accepted" ? "No active accepted campaigns" :
             statusTab === "rejected" ? "No applications that didn't move forward" :
             "No campaigns found"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
            {search
              ? "No campaigns matched your search filter. Try clearing your search keyword."
              : statusTab === "open"
              ? "You've pitched to all current open campaigns, or there are no new open briefs right now. Check back soon!"
              : statusTab === "applied"
              ? "You haven't submitted pitches for open briefs yet. Explore Open Campaigns and pitch to brands!"
              : statusTab === "invited"
              ? "When brands invite you directly based on your creator profile and rate card, they will show up here."
              : statusTab === "accepted"
              ? "Active campaigns you are working on will appear here. Once finished and payout is triggered, they move to Cleared Work."
              : statusTab === "rejected"
              ? "You don't have any past applications that didn't move forward."
              : "There are no campaigns matching this filter right now. Check back soon!"}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            {statusTab === "accepted" && (
              <Link
                to="/creator/work"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <span>View Cleared Work in My Work</span>
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </Link>
            )}
            {(search || statusTab !== "open" || selectedFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusTab("open");
                  setSelectedFilter("all");
                }}
                className="px-4 py-2 rounded-md bg-surface-2 hover:bg-surface-2/80 text-foreground text-xs font-semibold transition-colors"
              >
                Reset all filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCampaigns.map((c, i) => (
            <CampaignCard key={c.id} campaign={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
