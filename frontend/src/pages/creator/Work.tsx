import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { Campaign } from "@/api/types";
import { cn } from "@/lib/utils";
import { money } from "./Campaigns";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowUpTrayIcon as UploadIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ChatBubbleLeftEllipsisIcon,
  SparklesIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type WorkStatus = "invited" | "applied" | "in_progress" | "revision" | "submitted" | "approved" | "completed";

const StatusBadge = ({ status }: { status: WorkStatus }) => {
  const styles: Record<WorkStatus, string> = {
    invited: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    applied: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    in_progress: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    revision: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    submitted: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };
  
  const labels: Record<WorkStatus, string> = {
    invited: "Invitation",
    applied: "Application In Review",
    in_progress: "In Production",
    revision: "Revision Needed",
    submitted: "Reviewing Deliverable",
    approved: "Approved & Escrow Released",
    completed: "Paid & Completed",
  };

  return (
    <span className={cn("px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider", styles[status])}>
      {labels[status]}
    </span>
  );
};

const PipelineStage = ({ label, active, completed }: { label: string; active: boolean; completed?: boolean }) => (
  <div className={cn(
    "flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-sm transition-colors",
    active
      ? "bg-card text-foreground font-bold shadow-2xs"
      : completed
      ? "text-muted-foreground line-through opacity-70"
      : "text-muted-foreground/60"
  )}>
    {completed ? "✓" : "•"} {label}
  </div>
);

export default function Work() {
  const [filterTab, setFilterTab] = useState<"all" | "action" | "review" | "completed">("all");

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  const activeCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const app = c.applications?.[0];
      return !!app;
    });
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    if (filterTab === "all") return activeCampaigns;
    if (filterTab === "action") {
      return activeCampaigns.filter((c) => {
        const app = c.applications?.[0];
        const deliv = c.deliverables?.[0];
        return (app?.source === "invited" && app?.status === "pending") || 
               deliv?.status === "revision_requested" || 
               (app?.status === "accepted" && !deliv);
      });
    }
    if (filterTab === "review") {
      return activeCampaigns.filter((c) => {
        const app = c.applications?.[0];
        const deliv = c.deliverables?.[0];
        return (app?.status === "pending" && app?.source !== "invited") || deliv?.status === "submitted";
      });
    }
    if (filterTab === "completed") {
      return activeCampaigns.filter((c) => {
        const deliv = c.deliverables?.[0];
        return c.status === "closed" || deliv?.status === "approved";
      });
    }
    return activeCampaigns;
  }, [activeCampaigns, filterTab]);

  return (
    <div className="space-y-8 lg:space-y-10 pb-20 animate-in fade-in duration-300">
      
      {/* ── Editorial Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-foreground tracking-tight">
            My Work
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            Manage your work in progress, deadlines, and brand approvals.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center p-1 rounded-md bg-surface-2 border border-border/40 shadow-2xs overflow-x-auto scrollbar-hide max-w-full">
          {[
            { id: "all", label: "All Work" },
            { id: "action", label: "Needs Action" },
            { id: "review", label: "In Review" },
            { id: "completed", label: "Cleared" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-sm transition-all duration-150 whitespace-nowrap",
                filterTab === tab.id
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Deliverable Pipeline Cards ──────────────────────────────────────── */}
      {isLoading ? (
        <div className="py-24 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading work contracts...</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-md p-10 sm:p-14 text-center shadow-2xs">
          <div className="h-11 w-11 rounded-md bg-surface-2 text-muted-foreground mx-auto grid place-items-center mb-3">
            <BriefcaseIcon className="h-5 w-5" />
          </div>
          <h3 className="font-display font-bold text-base text-foreground">No active work in this view</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-4">
            {filterTab === "all"
              ? "You don't have any active campaigns right now. Explore open briefs in Find Campaigns!"
              : "No items currently match this filter tab."}
          </p>
          <Link
            to="/creator/campaigns"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <SparklesIcon className="h-4 w-4" /> Find Campaigns
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((camp, i) => {
            const app = camp.applications![0];
            const latestDeliverable = camp.deliverables?.[0];

            let status: WorkStatus = "applied";
            let notes = undefined;

            if (app.source === "invited" && app.status === "pending") {
              status = "invited";
            } else if (app.status === "pending") {
              status = "applied";
            } else if (app.status === "accepted") {
              if (camp.status === "closed") status = "completed";
              else if (!latestDeliverable) status = "in_progress";
              else {
                if (latestDeliverable.status === "submitted") status = "submitted";
                else if (latestDeliverable.status === "revision_requested") {
                  status = "revision";
                  notes = latestDeliverable.revisionNotes;
                } else if (latestDeliverable.status === "approved") {
                  status = "approved";
                }
              }
            }

            return (
              <motion.div 
                key={camp.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "bg-card hover:bg-surface-2/40 border border-border/60 hover:border-transparent p-5 sm:p-6 rounded-md shadow-2xs transition-all duration-150",
                  status === "revision" && "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/40 hover:bg-rose-500/10"
                )}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  {/* Left Info Area */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        {camp.organization?.name || "Brand Partner"}
                      </span>
                      <StatusBadge status={status} />
                    </div>

                    <Link to={`/creator/campaigns/${camp.id}`} className="block">
                      <h3 className="font-display font-bold text-lg sm:text-xl text-foreground mb-2 hover:text-primary transition-colors">
                        {camp.name}
                      </h3>
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-medium text-foreground capitalize">
                        <DocumentTextIcon className="h-4 w-4 text-primary" />
                        {camp.quantity}x {camp.deliverableType.replace("_", " ")}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5 font-bold text-foreground font-numeric tabular-nums">
                        <BanknotesIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        {money(camp.budgetPerCreator, camp.currency)}
                      </span>
                      {camp.deliveryDeadline && (
                        <>
                          <span>•</span>
                          <span className={cn(
                            "flex items-center gap-1.5 font-semibold",
                            status === "revision" ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
                          )}>
                            <ClockIcon className="h-4 w-4" />
                            Due {new Date(camp.deliveryDeadline).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Brand Revision Notes Banner */}
                    {notes && (
                      <div className="mt-4 p-3.5 rounded-md bg-rose-500/10 text-rose-900 dark:text-rose-200 text-xs border border-rose-500/20">
                        <div className="font-bold mb-0.5 flex items-center gap-1.5">
                          <ChatBubbleLeftEllipsisIcon className="h-4 w-4" /> Brand Revision Feedback:
                        </div>
                        {notes}
                      </div>
                    )}
                  </div>

                  {/* Right Actions & Milestone Stepper */}
                  <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
                    {/* Pipeline Milestones */}
                    <div className="hidden lg:flex items-center gap-1 p-1 rounded-md bg-surface-2/60 border border-border/30">
                      <PipelineStage label="Applied" active={status === "applied"} completed={status !== "applied" && status !== "invited"} />
                      <PipelineStage label="In Production" active={status === "in_progress" || status === "revision"} completed={status === "submitted" || status === "approved" || status === "completed"} />
                      <PipelineStage label="Review" active={status === "submitted"} completed={status === "approved" || status === "completed"} />
                      <PipelineStage label="Cleared" active={status === "approved" || status === "completed"} />
                    </div>

                    {/* Contextual Action Button */}
                    <div className="flex items-center gap-2 w-full lg:w-auto mt-1">
                      {status === "invited" && (
                        <>
                          <button
                            onClick={() => toast.info("Invitation declined")}
                            className="flex-1 lg:flex-none px-4 py-2 bg-surface-2 hover:bg-surface-2/80 text-foreground text-xs font-bold rounded-md transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => toast.success("Invitation accepted!")}
                            className="flex-1 lg:flex-none px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-md transition-colors shadow-xs"
                          >
                            Accept Brief
                          </button>
                        </>
                      )}

                      {status === "applied" && (
                        <div className="px-4 py-2 bg-surface-2 text-muted-foreground text-xs font-semibold rounded-md">
                          Pitch Awaiting Brand Review
                        </div>
                      )}

                      {(status === "in_progress" || status === "revision") && (
                        <button
                          onClick={() => toast.info("Opening deliverable upload dialog...")}
                          className="w-full lg:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-md transition-all shadow-xs hover:shadow-teal flex items-center justify-center gap-2"
                        >
                          <UploadIcon className="h-4 w-4" />
                          {status === "revision" ? "Upload Revised Content" : "Upload Deliverable"}
                        </button>
                      )}

                      {status === "submitted" && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3.5 py-2 rounded-md">
                          <ClockIcon className="h-4 w-4" />
                          Brand Review in Progress
                        </div>
                      )}

                      {(status === "approved" || status === "completed") && (
                        <Link
                          to="/creator/wallet"
                          className="w-full lg:w-auto px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-md transition-colors inline-flex items-center justify-center gap-1.5"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          <span>View Payout Ledger</span>
                          <ChevronRightIcon className="h-3.5 w-3.5 stroke-[2.2]" />
                        </Link>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
