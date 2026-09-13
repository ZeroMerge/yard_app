import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi, AdminCampaignRecord } from "@/api/admin";
import { PageHeader, StatusPill } from "@/components/ui-bits";
import { money, formatDate } from "@/lib/utils";
import {
  MagnifyingGlassIcon,
  LockClosedIcon,
  GlobeAltIcon,
  MapPinIcon,
  DocumentTextIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "open" | "in_progress" | "review" | "completed";

export const Campaigns = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["admin-campaigns", search, statusFilter],
    queryFn: () =>
      adminApi.getCampaigns({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
  });

  const statusTabs: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All Campaigns" },
    { id: "open", label: "Open Briefs" },
    { id: "in_progress", label: "In Production" },
    { id: "review", label: "In Review" },
    { id: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-8 lg:space-y-10 pb-16 animate-in fade-in duration-300">
      {/* ── Editorial Header ── */}
      <PageHeader
        title="Campaigns"
        subtitle="Supervise briefs, deliverable throughput, and creator allocations across all organizations."
      />

      {/* ── Filter Controls ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns by name or brand…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-card border border-border/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-teal-500 shadow-2xs"
          />
        </div>

        {/* Status Segmented Control */}
        <div className="flex items-center p-1 rounded-md bg-surface-2 border border-border/40 shadow-2xs overflow-x-auto scrollbar-hide">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-sm transition-all duration-150 whitespace-nowrap",
                statusFilter === tab.id
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Campaigns Cards Grid ── */}
      {isLoading ? (
        <div className="py-24 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading campaigns…</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-md p-10 sm:p-14 text-center shadow-2xs">
          <h3 className="font-display font-bold text-base text-foreground">No campaigns found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            No campaigns currently match your search query or status filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="bg-card hover:bg-surface-2/40 border border-border/60 hover:border-border p-5 sm:p-6 rounded-md shadow-2xs transition-all duration-150 flex flex-col justify-between group relative space-y-4"
            >
              <div className="space-y-3">
                {/* Top Meta Bar */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                      {c.organization?.name || "Independent Brand"}
                    </span>
                    {c.isPrivate ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase">
                        <LockClosedIcon className="h-2.5 w-2.5" />
                        Private
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold uppercase">
                        <GlobeAltIcon className="h-2.5 w-2.5" />
                        Public
                      </span>
                    )}
                  </div>
                  <StatusPill status={c.status} />
                </div>

                {/* Campaign Title */}
                <h3 className="font-display font-bold text-base sm:text-lg text-foreground leading-snug group-hover:text-primary transition-colors">
                  {c.name}
                </h3>

                {/* Deliverable & Location Chips */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground/90 bg-surface-2/50 p-2.5 rounded-md">
                    <DocumentTextIcon className="h-4 w-4 text-primary shrink-0" />
                    <span className="capitalize">
                      {c.quantity}x {c.deliverableType.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs px-0.5">
                    <span className="text-muted-foreground flex items-center gap-1 text-[11px] sm:text-xs truncate">
                      <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                      <span>{c.country || "Global"}</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-0.5 rounded-sm bg-surface-2 shrink-0">
                      {c.category || "General"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-border/30 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold font-numeric text-foreground text-sm">
                    {money(c.budgetPerCreator, c.currency)}
                  </span>
                  <span className="text-muted-foreground text-[11px]"> / creator ({c.quantity} slots)</span>
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <UsersIcon className="h-3.5 w-3.5" />
                  <span>{c._count?.applications || 0} Pitches</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
