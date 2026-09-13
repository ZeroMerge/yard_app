import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { creatorsApi } from "@/api/creators";
import { Campaign } from "@/api/types";
import { cn } from "@/lib/utils";
import { money } from "./Campaigns";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  ArrowUpTrayIcon as UploadIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ChatBubbleLeftEllipsisIcon,
  SparklesIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SubmitDeliverableDialog } from "@/components/deliverables/SubmitDeliverableDialog";

type WorkStatus =
  | "invited"
  | "in_progress"
  | "revision"
  | "submitted"
  | "approved"
  | "completed"
  | "applied"
  | "not_accepted"
  | "declined";

const StatusBadge = ({ status }: { status: WorkStatus }) => {
  const styles: Record<WorkStatus, string> = {
    revision: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    in_progress: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    submitted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    invited: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    applied: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    not_accepted: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    declined: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };

  const labels: Record<WorkStatus, string> = {
    revision: "Revision Needed",
    in_progress: "In Production",
    submitted: "Reviewing Deliverable",
    approved: "Approved & Escrow Released",
    completed: "Paid & Completed",
    invited: "Invitation",
    applied: "Application In Review",
    not_accepted: "Not Moved Forward",
    declined: "Invitation Declined",
  };

  return (
    <span className={cn("px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider", styles[status])}>
      {labels[status]}
    </span>
  );
};

export const getWorkInfo = (camp: Campaign): {
  status: WorkStatus;
  notes?: string;
  latestDeliverable?: any;
} => {
  const app = camp.applications?.[0];
  if (!app) return { status: "in_progress" };

  const allDeliverables = [
    ...(camp.deliverables || []),
    ...(app.deliverables || []),
  ];

  // Deduplicate deliverables by ID
  const map = new Map();
  for (const d of allDeliverables) {
    if (d && d.id) map.set(d.id, d);
  }
  const deliverables = Array.from(map.values());

  // Sort descending by version, or submittedAt
  deliverables.sort((a: any, b: any) => {
    if ((b.version || 0) !== (a.version || 0)) {
      return (b.version || 0) - (a.version || 0);
    }
    const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    return timeB - timeA;
  });

  const latest = deliverables[0] || null;

  if (app.source === "invited" && app.status === "pending") {
    return { status: "invited", latestDeliverable: latest };
  }
  if (app.status === "declined") {
    return { status: "declined", latestDeliverable: latest };
  }
  if (app.status === "rejected") {
    return { status: "not_accepted", latestDeliverable: latest };
  }
  if (app.status === "pending") {
    return { status: "applied", latestDeliverable: latest };
  }

  if (app.status === "accepted") {
    const hasPaymentTriggered =
      camp.status === "completed" ||
      camp.status === "closed" ||
      app.payments?.some((p: any) =>
        ["payment_initiated", "payment_confirmed", "creator_payout_pending", "paid"].includes(p.status)
      ) ||
      camp.payments?.some((p: any) =>
        ["payment_initiated", "payment_confirmed", "creator_payout_pending", "paid"].includes(p.status)
      );

    if (hasPaymentTriggered) {
      return { status: "completed", latestDeliverable: latest };
    }
    if (!latest) {
      return { status: "in_progress", latestDeliverable: latest };
    }
    if (latest.status === "revision_requested") {
      return { status: "revision", notes: latest.revisionNotes, latestDeliverable: latest };
    }
    if (latest.status === "submitted") {
      return { status: "submitted", latestDeliverable: latest };
    }
    if (latest.status === "approved") {
      return { status: "approved", latestDeliverable: latest };
    }
    return { status: "in_progress", latestDeliverable: latest };
  }

  return { status: "in_progress", latestDeliverable: latest };
};

const PipelineStage = ({ label, active, completed }: { label: string; active: boolean; completed?: boolean }) => (
  <div
    className={cn(
      "flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-sm transition-colors",
      active
        ? "bg-card text-foreground font-bold shadow-2xs"
        : completed
        ? "text-muted-foreground line-through opacity-70"
        : "text-muted-foreground/60"
    )}
  >
    {completed ? (
      <CheckIcon className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
    ) : (
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full shrink-0",
          active ? "bg-teal-600 dark:bg-teal-400" : "bg-muted-foreground/40"
        )}
      />
    )}
    <span>{label}</span>
  </div>
);

type FilterTab = "all" | "action" | "review" | "completed";

// Strict sorting priority:
// 1. Revision Needed (top priority)
// 2. Current in Production / Direct Invites
// 3. Review Deliverable
// 4. Accepted / Payment / Cleared
const STATUS_PRIORITY: Record<WorkStatus, number> = {
  revision: 1,
  in_progress: 2,
  invited: 2,
  submitted: 3,
  approved: 4,
  completed: 4,
  applied: 99,
  not_accepted: 99,
  declined: 99,
};

export default function Work() {
  const queryClient = useQueryClient();
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [activeSubmission, setActiveSubmission] = useState<{
    campaign: Campaign;
    applicationId: string;
    isRevision: boolean;
    revisionNotes?: string;
    currentVersion: number;
  } | null>(null);

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  const acceptInviteMutation = useMutation({
    mutationFn: (applicationId: string) => creatorsApi.acceptInvitation(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Invitation accepted! Campaign brief is now in progress.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to accept invitation");
    },
  });

  const declineInviteMutation = useMutation({
    mutationFn: (applicationId: string) => creatorsApi.declineInvitation(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.info("Invitation declined.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to decline invitation");
    },
  });

  // Only contracts that are active work (accepted) or direct invites pending creator action
  const activeCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const app = c.applications?.[0];
      if (!app) return false;
      // Exclude self-applied pending pitches and rejected pitches (they belong in Campaign Board)
      if (app.source === "applied" && (app.status === "pending" || app.status === "rejected" || app.status === "withdrawn")) {
        return false;
      }
      if (app.status === "declined" || app.status === "rejected" || app.status === "withdrawn") {
        return false;
      }
      return app.status === "accepted" || (app.source === "invited" && app.status === "pending");
    });
  }, [campaigns]);

  const tabCounts = useMemo(() => {
    const counts = { all: activeCampaigns.length, action: 0, review: 0, completed: 0 };
    for (const c of activeCampaigns) {
      const { status } = getWorkInfo(c);
      if (status === "revision" || status === "in_progress" || status === "invited") {
        counts.action++;
      }
      if (status === "submitted" || status === "revision") {
        counts.review++;
      }
      if (status === "approved" || status === "completed") {
        counts.completed++;
      }
    }
    return counts;
  }, [activeCampaigns]);

  const filteredCampaigns = useMemo(() => {
    if (filterTab === "all") return activeCampaigns;
    if (filterTab === "action") {
      return activeCampaigns.filter((c) => {
        const { status } = getWorkInfo(c);
        return status === "revision" || status === "in_progress" || status === "invited";
      });
    }
    if (filterTab === "review") {
      return activeCampaigns.filter((c) => {
        const { status } = getWorkInfo(c);
        return status === "submitted" || status === "revision";
      });
    }
    if (filterTab === "completed") {
      return activeCampaigns.filter((c) => {
        const { status } = getWorkInfo(c);
        return status === "approved" || status === "completed";
      });
    }
    return activeCampaigns;
  }, [activeCampaigns, filterTab]);

  const sortedCampaigns = useMemo(() => {
    const list = [...filteredCampaigns];
    list.sort((a, b) => {
      const { status: statusA } = getWorkInfo(a);
      const { status: statusB } = getWorkInfo(b);
      const prioA = STATUS_PRIORITY[statusA] ?? 99;
      const prioB = STATUS_PRIORITY[statusB] ?? 99;
      if (prioA !== prioB) {
        return prioA - prioB;
      }
      const timeB = new Date(b.updatedAt || b.createdAt).getTime();
      const timeA = new Date(a.updatedAt || a.createdAt).getTime();
      return timeB - timeA;
    });
    return list;
  }, [filteredCampaigns]);

  return (
    <div className="space-y-8 lg:space-y-10 pb-20 animate-in fade-in duration-300">
      {/* ── Editorial Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-foreground tracking-tight">
            My Work
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            Manage your active deliverables, production deadlines, and brand reviews.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center p-1 rounded-md bg-surface-2 border border-border/40 shadow-2xs overflow-x-auto scrollbar-hide max-w-full">
          {[
            { id: "all", label: "All Work", count: tabCounts.all },
            { id: "action", label: "Needs Action", count: tabCounts.action },
            { id: "review", label: "In Review", count: tabCounts.review },
            { id: "completed", label: "Cleared", count: tabCounts.completed },
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
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-2 text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
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
      ) : sortedCampaigns.length === 0 ? (
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
          {sortedCampaigns.map((camp, i) => {
            const app = camp.applications![0];
            const { status, notes, latestDeliverable } = getWorkInfo(camp);

            return (
              <motion.div
                key={camp.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "bg-card hover:bg-surface-2/40 border border-border/60 hover:border-border p-5 sm:p-6 rounded-md shadow-2xs transition-all duration-150",
                  status === "revision" && "bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/30 hover:border-rose-500/40"
                )}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left Info Area */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                      <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        {camp.organization?.name || "Brand Partner"}
                      </span>
                      <StatusBadge status={status} />
                    </div>

                    <Link to={`/creator/campaigns/${camp.id}`} className="block group">
                      <h3 className="font-display font-bold text-lg sm:text-xl text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                        {camp.name}
                      </h3>
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-medium text-foreground capitalize">
                        <DocumentTextIcon className="h-4 w-4 text-primary shrink-0" />
                        {camp.quantity}x {camp.deliverableType.replace("_", " ")}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5 font-bold text-foreground font-numeric tabular-nums">
                        <BanknotesIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        {money(camp.budgetPerCreator, camp.currency)}
                      </span>
                      {camp.deliveryDeadline && (
                        <>
                          <span>•</span>
                          <span
                            className={cn(
                              "flex items-center gap-1.5 font-semibold",
                              status === "revision"
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-muted-foreground"
                            )}
                          >
                            <ClockIcon className="h-4 w-4 shrink-0" />
                            Due {new Date(camp.deliveryDeadline).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Brand Revision Notes Banner */}
                    {notes && (
                      <div className="mt-3.5 p-3.5 rounded-md bg-rose-500/10 text-rose-900 dark:text-rose-200 text-xs">
                        <div className="font-bold mb-1 flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                          <ChatBubbleLeftEllipsisIcon className="h-4 w-4 shrink-0" /> Brand Revision Feedback:
                        </div>
                        <p className="leading-relaxed whitespace-pre-line text-foreground/90">{notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Actions & Milestone Stepper */}
                  <div className="flex flex-col items-stretch sm:items-end gap-3 shrink-0 pt-2 lg:pt-0 w-full lg:w-auto">
                    {/* Pipeline Milestones (Desktop) */}
                    <div className="hidden lg:flex items-center gap-1 p-1 rounded-md bg-surface-2/60">
                      <PipelineStage
                        label="In Production"
                        active={status === "in_progress" || status === "revision"}
                        completed={status === "submitted" || status === "approved" || status === "completed"}
                      />
                      <PipelineStage
                        label="Review"
                        active={status === "submitted"}
                        completed={status === "approved" || status === "completed"}
                      />
                      <PipelineStage
                        label="Cleared"
                        active={status === "approved" || status === "completed"}
                      />
                    </div>

                    {/* Contextual Action Button */}
                    <div className="flex items-center gap-2 w-full lg:w-auto">
                      {status === "invited" && (
                        <>
                          <button
                            disabled={declineInviteMutation.isPending || acceptInviteMutation.isPending}
                            onClick={() => declineInviteMutation.mutate(app.id)}
                            className="flex-1 lg:flex-none px-4 py-2 bg-surface-2 hover:bg-surface-2/80 text-foreground text-xs font-bold rounded-md transition-colors disabled:opacity-50"
                          >
                            {declineInviteMutation.isPending ? "Declining..." : "Decline"}
                          </button>
                          <button
                            disabled={declineInviteMutation.isPending || acceptInviteMutation.isPending}
                            onClick={() => acceptInviteMutation.mutate(app.id)}
                            className="flex-1 lg:flex-none px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-md transition-colors shadow-xs disabled:opacity-50"
                          >
                            {acceptInviteMutation.isPending ? "Accepting..." : "Accept Brief"}
                          </button>
                        </>
                      )}

                      {(status === "in_progress" || status === "revision") && (
                        <button
                          onClick={() =>
                            setActiveSubmission({
                              campaign: camp,
                              applicationId: app.id,
                              isRevision: status === "revision",
                              revisionNotes: notes,
                              currentVersion: latestDeliverable?.version || 0,
                            })
                          }
                          className="w-full lg:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-md transition-all shadow-xs hover:shadow-teal flex items-center justify-center gap-2"
                        >
                          <UploadIcon className="h-4 w-4 shrink-0" />
                          <span>{status === "revision" ? "Upload Revised Content" : "Upload Deliverable"}</span>
                        </button>
                      )}

                      {status === "submitted" && (
                        <div className="flex flex-col items-stretch sm:items-end gap-1.5 w-full lg:w-auto">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveSubmission({
                                campaign: camp,
                                applicationId: app.id,
                                isRevision: false,
                                revisionNotes: notes,
                                currentVersion: latestDeliverable?.version || 1,
                              })
                            }
                            className="w-full lg:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md transition-all shadow-xs flex items-center justify-center gap-2"
                          >
                            <CheckCircleIcon className="h-4 w-4 text-white shrink-0" />
                            <span>Reviewing Deliverable</span>
                          </button>
                          {latestDeliverable?.file?.providerUrl && (
                            <a
                              href={latestDeliverable.file.providerUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center justify-center sm:justify-end gap-1 font-semibold"
                            >
                              <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                              <span>View Submitted Media</span>
                            </a>
                          )}
                        </div>
                      )}

                      {(status === "approved" || status === "completed") && (
                        <Link
                          to="/creator/wallet"
                          className="w-full lg:w-auto px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-md transition-colors inline-flex items-center justify-center gap-1.5"
                        >
                          <CheckCircleIcon className="h-4 w-4 shrink-0" />
                          <span>View Payout Ledger</span>
                          <ChevronRightIcon className="h-3.5 w-3.5 stroke-[2.2] shrink-0" />
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

      {activeSubmission && (
        <SubmitDeliverableDialog
          open={!!activeSubmission}
          onOpenChange={(open) => !open && setActiveSubmission(null)}
          campaign={activeSubmission.campaign}
          applicationId={activeSubmission.applicationId}
          isRevision={activeSubmission.isRevision}
          revisionNotes={activeSubmission.revisionNotes}
          currentVersion={activeSubmission.currentVersion}
          onSubmitted={() => {
            setFilterTab("review");
          }}
        />
      )}
    </div>
  );
}
