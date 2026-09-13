import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { Campaign } from "@/api/types";
import { PageHeader, StatusPill, Empty } from "@/components/ui-bits";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusIcon as Plus,
  UsersIcon as Users,
  ChevronRightIcon,
  MagnifyingGlassIcon as Search,
  LockClosedIcon,
  GlobeAltIcon,
  FunnelIcon,
  XMarkIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

export const money = (amount: number, currency: string = "NGN") =>
  `${currency === "NGN" ? "₦" : "$"}${Number(amount || 0).toLocaleString()}`;

type FilterTab = "all" | "active" | "private" | "drafts" | "completed" | "archived";

const Campaigns = () => {
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: list = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  const tabCounts = useMemo(() => {
    const unarchived = list.filter((c) => !c.isArchived);
    return {
      all: unarchived.length,
      active: unarchived.filter((c) => c.status === "open" || c.status === "in_progress" || c.status === "review").length,
      private: unarchived.filter((c) => c.isPrivate && c.status !== "draft").length,
      drafts: unarchived.filter((c) => c.status === "draft").length,
      completed: unarchived.filter((c) => c.status === "completed" || c.status === "closed").length,
      archived: list.filter((c) => c.isArchived).length,
    };
  }, [list]);

  const filteredCampaigns = useMemo(() => {
    return list.filter((c) => {
      // Archived tab filter
      if (filterTab === "archived") {
        if (!c.isArchived) return false;
      } else {
        if (c.isArchived) return false;

        // Non-archived tab filters
        if (filterTab === "active") {
          if (!(c.status === "open" || c.status === "in_progress" || c.status === "review")) return false;
        } else if (filterTab === "private") {
          if (!c.isPrivate || c.status === "draft") return false;
        } else if (filterTab === "drafts") {
          if (c.status !== "draft") return false;
        } else if (filterTab === "completed") {
          if (!(c.status === "completed" || c.status === "closed")) return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name?.toLowerCase().includes(q);
        const matchCategory = c.category?.toLowerCase().includes(q);
        const matchBrief = c.brief?.toLowerCase().includes(q);
        if (!matchName && !matchCategory && !matchBrief) return false;
      }

      return true;
    });
  }, [list, filterTab, searchQuery]);

  return (
    <div className="space-y-6 lg:space-y-8 pb-20 animate-in fade-in duration-300">
      <PageHeader
        title="Campaigns"
        subtitle="Manage and track your creator marketing briefs and deliverables."
        action={
          <Link to="/brand/campaigns/new">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-md px-4 py-2 text-xs transition-colors shadow-xs">
              <Plus className="h-4 w-4 mr-1.5" /> New Campaign
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Segmented Filter Tabs */}
        <div className="flex items-center p-1 rounded-md bg-surface-2 border border-border/40 shadow-2xs overflow-x-auto scrollbar-hide max-w-full">
          {[
            { id: "all", label: "All Briefs", count: tabCounts.all },
            { id: "active", label: "Active & Open", count: tabCounts.active },
            { id: "private", label: "Invitation-Only", count: tabCounts.private },
            { id: "drafts", label: "Drafts", count: tabCounts.drafts },
            { id: "completed", label: "Completed", count: tabCounts.completed },
            { id: "archived", label: "Archived", count: tabCounts.archived },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as FilterTab)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-sm transition-all duration-150 whitespace-nowrap flex items-center gap-1.5",
                filterTab === tab.id
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-sm text-[10px] font-bold font-numeric transition-colors",
                  filterTab === tab.id
                    ? "bg-teal-500/15 text-teal-600 dark:text-teal-400"
                    : "bg-surface-2 text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9 pr-7 h-9 rounded-md bg-card border border-border/60 focus-visible:ring-teal-500/20 text-xs"
            placeholder="Search campaigns by name, niche..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-sm"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-xs text-muted-foreground p-12 text-center">Loading campaigns from server...</div>
      ) : list.length === 0 ? (
        <Empty
          title="No campaigns created yet"
          hint="Create your first campaign brief in under a minute to start matching with African creators."
          action={
            <Link to="/brand/campaigns/new">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-md px-4 py-2 shadow-xs">Create Campaign</Button>
            </Link>
          }
        />
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-md p-10 sm:p-14 text-center shadow-2xs">
          <div className="h-11 w-11 rounded-md bg-surface-2 text-muted-foreground mx-auto grid place-items-center mb-3">
            <FunnelIcon className="h-5 w-5" />
          </div>
          <h3 className="font-display font-bold text-base text-foreground">No campaigns match your filters</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-4">
            Try adjusting your search keywords or switching to another filter tab.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setFilterTab("all");
              setSearchQuery("");
            }}
            className="text-xs font-semibold rounded-md h-8"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredCampaigns.map((c) => {
            const budget = Number(c.budgetPerCreator || 0) * (c.quantity || 1);
            return (
              <Link
                key={c.id}
                to={`/brand/campaigns/${c.id}`}
                className="bg-card hover:bg-surface-2/40 border border-border/60 hover:border-transparent p-5 sm:p-6 rounded-md shadow-2xs transition-all duration-150 flex flex-col justify-between group h-full"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-sm bg-surface-2 text-muted-foreground text-[11px] font-semibold capitalize border border-border/30">
                        {c.category}
                      </span>
                      {c.status === "open" && (
                        c.isPrivate ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                            <LockClosedIcon className="h-2.5 w-2.5" /> Private
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold uppercase tracking-wider">
                            <GlobeAltIcon className="h-2.5 w-2.5" /> Public
                          </span>
                        )
                      )}
                      {c.isArchived && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-surface-2 text-muted-foreground text-[10px] font-bold uppercase tracking-wider border border-border/30">
                          <ArchiveBoxIcon className="h-3 w-3 shrink-0" /> Archived
                        </span>
                      )}
                    </div>
                    <StatusPill status={c.status} />
                  </div>
                  <h3 className="mt-3 font-display text-base sm:text-lg font-bold group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors text-foreground">
                    {c.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{c.brief}</p>
                </div>
                
                <div className="mt-5 pt-3.5 border-t border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Users className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{c.quantity} Slots • <span className="capitalize">{c.deliverableType}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-sm text-foreground font-numeric">{money(budget, c.currency)}</span>
                    <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Campaigns;
