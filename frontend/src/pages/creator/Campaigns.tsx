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
  let uiStatus: "open" | "applied" | "invited" = "open";
  const app = campaign.applications?.[0];
  
  if (app) {
    if (app.source === "invited" && app.status === "pending") uiStatus = "invited";
    else uiStatus = "applied";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      whileHover={{ y: -2 }}
      className="bg-card hover:bg-surface-2/40 border border-border/60 hover:border-transparent p-5 sm:p-6 rounded-md shadow-2xs transition-all duration-150 flex flex-col justify-between group relative h-full"
    >
      <div>
        {/* Top Meta Bar */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              {campaign.organization?.name || "Verified Brand"}
            </div>
            <Link to={`/creator/campaigns/${campaign.id}`} className="block">
              <h3 className="font-display font-bold text-base sm:text-lg text-foreground leading-snug group-hover:text-primary transition-colors">
                {campaign.name}
              </h3>
            </Link>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {uiStatus === "applied" && (
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Applied
              </span>
            )}
            {uiStatus === "invited" && (
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Invited
              </span>
            )}
            <button
              onClick={() => setBookmarked(!bookmarked)}
              aria-label="Bookmark campaign"
              className="p-1 rounded-md text-muted-foreground hover:text-primary transition-colors"
            >
              {bookmarked ? (
                <BookmarkSolid className="h-4 w-4 text-primary" />
              ) : (
                <BookmarkOutline className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Deliverable & Compensation Chips */}
        <div className="space-y-2.5 my-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground/90 bg-surface-2/50 border border-border/40 p-2.5 rounded-md">
            <VideoCameraIcon className="h-4 w-4 text-primary shrink-0" />
            <span className="capitalize">{campaign.quantity}x {campaign.deliverableType.replace("_", " ")}</span>
          </div>

          <div className="flex items-center justify-between text-xs px-0.5">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px] sm:text-xs">
              <MapPinIcon className="h-3.5 w-3.5" />
              {campaign.country || "Global"} {campaign.city ? `· ${campaign.city}` : ""}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-0.5 rounded-sm bg-surface-2 border border-border/40">
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
          {uiStatus === "applied" ? (
            <Link
              to="/creator/work"
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md bg-surface-2 hover:bg-surface-2/80 text-muted-foreground hover:text-foreground text-xs font-bold transition-colors"
            >
              <span>Track Status</span>
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

// ── Main Discovery Page ───────────────────────────────────────────────────

export default function Campaigns() {
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const { data: openCampaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  const filterOptions = [
    { id: "all", label: "All Briefs" },
    { id: "reels", label: "Video Reels" },
    { id: "ugc", label: "UGC / Creator" },
    { id: "high_payout", label: "High Payout (₦100k+)" },
  ];

  const filteredCampaigns = useMemo(() => {
    return openCampaigns.filter((c) => {
      const matchesSearch = 
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.brief.toLowerCase().includes(search.toLowerCase()) ||
        (c.organization?.name && c.organization.name.toLowerCase().includes(search.toLowerCase())) ||
        (c.deliverableType && c.deliverableType.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedFilter === "reels") {
        return c.deliverableType.toLowerCase().includes("reel") || c.deliverableType.toLowerCase().includes("video");
      }
      if (selectedFilter === "ugc") {
        return c.category.toLowerCase().includes("ugc") || c.deliverableType.toLowerCase().includes("ugc");
      }
      if (selectedFilter === "high_payout") {
        return Number(c.budgetPerCreator) >= 100000;
      }

      return true;
    });
  }, [openCampaigns, search, selectedFilter]);

  return (
    <div className="space-y-8 lg:space-y-10 pb-20 animate-in fade-in duration-300">
      
      {/* ── Editorial Header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-foreground tracking-tight">
          Find Campaigns
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
          Browse verified brand briefs matched to your creator niche, audience profile, and rate expectations.
        </p>
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

        {/* Filter Pills */}
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
            Showing <strong className="text-foreground">{filteredCampaigns.length}</strong> campaigns
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
          <h3 className="font-display font-bold text-base text-foreground">No campaigns found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {search
              ? "No campaigns matched your search filter. Try clearing your search keyword."
              : "There are no campaigns matching this filter right now. Check back soon!"}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-4 px-4 py-2 rounded-md bg-surface-2 hover:bg-surface-2/80 text-foreground text-xs font-semibold transition-colors"
            >
              Clear search
            </button>
          )}
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
