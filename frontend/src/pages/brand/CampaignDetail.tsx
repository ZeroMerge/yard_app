import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { applicationsApi } from "@/api/applications";
import { deliverablesApi } from "@/api/deliverables";
import { paymentsApi } from "@/api/payments";
import { activityApi } from "@/api/activity";
import { Campaign, Payment, CampaignActivity } from "@/api/types";
import { PageHeader, Stat, StatusPill, Empty } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeftIcon as ArrowLeft,
  CheckIcon as Check,
  ArrowTopRightOnSquareIcon as ExternalLink,
  ArrowPathIcon as RefreshCw,
  XMarkIcon as X,
  PaperAirplaneIcon as Send,
  SparklesIcon as Sparkles,
  DocumentTextIcon as FileText,
  ClockIcon as Clock,
  UserIcon as User,
  LockClosedIcon,
  UserPlusIcon,
  UserGroupIcon,
  TrashIcon,
  NoSymbolIcon,
  ArchiveBoxIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CornerDownRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const money = (amount: number, currency: string = "NGN") =>
  `${currency === "NGN" ? "₦" : "$"}${Number(amount || 0).toLocaleString()}`;

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [revisionNote, setRevisionNote] = useState<{ [deliverableId: string]: string }>({});
  const [commentText, setCommentText] = useState("");
  const [rejectDialogTarget, setRejectDialogTarget] = useState<{ id: string; creatorName: string } | null>(null);
  const [blockReApplyOnReject, setBlockReApplyOnReject] = useState(false);
  const [expandedChainAppId, setExpandedChainAppId] = useState<string | null>(null);
  const [policyAllow, setPolicyAllow] = useState<boolean | null>(null);
  const [policyCooldown, setPolicyCooldown] = useState<number | null>(null);

  const { data: campaign, isLoading } = useQuery<Campaign>({
    queryKey: ["campaign", id],
    queryFn: () => campaignsApi.getById(id!),
    enabled: !!id,
    refetchInterval: 5000,
  });

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["payments", id],
    queryFn: () => paymentsApi.getPayments(id!),
    enabled: !!id,
    refetchInterval: 4000,
  });

  const { data: activities = [] } = useQuery<CampaignActivity[]>({
    queryKey: ["activity", id],
    queryFn: () => activityApi.getActivity(id!),
    enabled: !!id,
  });

  const publishMutation = useMutation({
    mutationFn: () => campaignsApi.publish(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      toast.success("Campaign published to creators!");
    },
    onError: (err: any) => toast.error(err.message || "Failed to publish campaign"),
  });

  const cancelMutation = useMutation({
    mutationFn: () => campaignsApi.cancel(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign cancelled.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to cancel campaign"),
  });

  const closeMutation = useMutation({
    mutationFn: () => campaignsApi.close(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign intake closed. No new applications will be accepted.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to close campaign intake"),
  });

  const archiveMutation = useMutation({
    mutationFn: () => campaignsApi.archive(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign moved to archives.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to archive campaign"),
  });

  const unarchiveMutation = useMutation({
    mutationFn: () => campaignsApi.unarchive(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign restored from archives.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to restore campaign"),
  });

  const deleteDraftMutation = useMutation({
    mutationFn: () => campaignsApi.deleteDraft(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Draft campaign permanently deleted.");
      navigate("/brand/campaigns");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete draft"),
  });

  const acceptAppMutation = useMutation({
    mutationFn: applicationsApi.accept,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      toast.success("Application accepted! Campaign moved to in_progress.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to accept application"),
  });

  const rejectAppMutation = useMutation({
    mutationFn: ({ applicationId, block }: { applicationId: string; block: boolean }) =>
      applicationsApi.reject(applicationId, block),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      setRejectDialogTarget(null);
      setBlockReApplyOnReject(false);
      toast.success("Application marked as not moved forward.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to reject application"),
  });

  const reconsiderAppMutation = useMutation({
    mutationFn: (applicationId: string) => applicationsApi.reconsider(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      toast.success("Application reconsidered and returned to pending review.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to reconsider application"),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (payload: { allowReApplication?: boolean; reApplicationCooldownDays?: number }) =>
      campaignsApi.updateReApplicationSettings(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      toast.success("Re-application policy updated.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update policy"),
  });

  const approveDeliverableMutation = useMutation({
    mutationFn: deliverablesApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["payments", id] });
      toast.success("Deliverable approved! Payout initiated.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to approve deliverable"),
  });

  const requestRevisionMutation = useMutation({
    mutationFn: ({ deliverableId, notes }: { deliverableId: string; notes: string }) =>
      deliverablesApi.requestRevision(deliverableId, { revisionNotes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      toast.success("Revision requested from creator.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to request revision"),
  });

  const commentMutation = useMutation({
    mutationFn: (body: string) => activityApi.postComment(id!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity", id] });
      setCommentText("");
      toast.success("Comment posted to campaign activity timeline.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to post comment"),
  });

  const apps = campaign?.applications || [];
  const deliverables = campaign?.deliverables || [];
  const totalBudget = Number(campaign?.budgetPerCreator || 0) * (campaign?.quantity || 1);

  const creatorDeliverableChains = useMemo(() => {
    const chains: {
      applicationId: string;
      creator: {
        id: string;
        displayName?: string;
        profileImageUrl?: string | null;
        verified?: boolean;
        user?: { email?: string };
      };
      deliverables: typeof deliverables;
    }[] = [];

    const appMap = new Map<string, typeof chains[0]>();

    // 1. Populate from accepted applications
    for (const a of apps) {
      if (a.status === "accepted") {
        appMap.set(a.id, {
          applicationId: a.id,
          creator: a.creator || { id: a.creatorId, displayName: "Creator" },
          deliverables: [],
        });
      }
    }

    // 2. Distribute deliverables to application chains
    for (const d of deliverables) {
      const appId = d.applicationId || (d.application as any)?.id;
      if (appId && appMap.has(appId)) {
        appMap.get(appId)!.deliverables.push(d);
      } else {
        const creator = (d.application as any)?.creator || {
          id: appId || d.id,
          displayName: "Creator",
        };
        const entry = appMap.get(appId) || {
          applicationId: appId,
          creator,
          deliverables: [],
        };
        entry.deliverables.push(d);
        appMap.set(appId, entry);
      }
    }

    // 3. Deduplicate and sort deliverables ascending by version (v1 -> v2 -> v3)
    for (const entry of appMap.values()) {
      const dMap = new Map();
      for (const item of entry.deliverables) {
        if (item && item.id) dMap.set(item.id, item);
      }
      const unique = Array.from(dMap.values());
      unique.sort((a, b) => a.version - b.version);
      chains.push({
        ...entry,
        deliverables: unique,
      });
    }

    return chains;
  }, [apps, deliverables]);

  if (isLoading) {
    return <div className="p-12 text-center text-sm text-muted-foreground">Loading campaign from server...</div>;
  }

  if (!campaign) {
    return <Empty title="Campaign not found" action={<Button onClick={() => navigate("/brand/campaigns")} className="rounded-md bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold h-9 px-4 shadow-xs">Back to campaigns</Button>} />;
  }

  return (
    <div className="space-y-6 pb-16">
      <button
        onClick={() => navigate("/brand/campaigns")}
        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 font-medium transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to campaigns
      </button>

      <PageHeader
        title={campaign.name}
        subtitle={`${campaign.category.toUpperCase()} • ${campaign.country} • Format: ${campaign.deliverableType}${
          campaign.status === "open"
            ? campaign.isPrivate
              ? " • Invitation-Only"
              : " • Public Board"
            : campaign.status === "draft"
            ? " • Unpublished Draft"
            : ""
        }`}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {campaign.isArchived && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-surface-2 text-muted-foreground border border-border/40">
                <ArchiveBoxIcon className="h-3 w-3 shrink-0" /> Archived
              </span>
            )}
            {campaign.status === "open" && (
              <span className={cn("px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider", campaign.isPrivate ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" : "bg-teal-500/10 text-teal-600 dark:text-teal-400")}>
                {campaign.isPrivate ? "Invitation-Only" : "Public"}
              </span>
            )}
            <StatusPill status={campaign.status} />

            {/* Draft: Publish or Delete Draft */}
            {campaign.status === "draft" && (
              <>
                <Button
                  onClick={() => publishMutation.mutate()}
                  disabled={publishMutation.isPending}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md px-4 h-9 text-xs shadow-xs"
                >
                  {publishMutation.isPending ? "Publishing..." : "Publish Campaign"}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="rounded-md text-xs h-9 px-2.5 text-destructive hover:bg-destructive/10"
                    >
                      <TrashIcon className="h-3.5 w-3.5 mr-1" /> Delete Draft
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border/60">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-base font-bold text-foreground">Delete Draft Campaign?</AlertDialogTitle>
                      <AlertDialogDescription className="text-xs text-muted-foreground">
                        Are you sure you want to permanently delete this draft campaign brief? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteDraftMutation.mutate()}
                        className="bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold"
                      >
                        {deleteDraftMutation.isPending ? "Deleting..." : "Delete Draft"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}

            {/* Open: Close Intake */}
            {campaign.status === "open" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-md text-xs h-9 px-3 text-muted-foreground hover:text-foreground font-semibold"
                  >
                    <NoSymbolIcon className="h-3.5 w-3.5 mr-1" /> Close Intake
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border/60">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-base font-bold text-foreground">Close Campaign Intake?</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-muted-foreground">
                      Closing intake immediately stops new creator applications. The brief will be removed from the open creator board, while accepted creators continue submitting their deliverables.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => closeMutation.mutate()}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
                    >
                      {closeMutation.isPending ? "Closing..." : "Close Intake"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Open / In Progress: Cancel Brief */}
            {["open", "in_progress"].includes(campaign.status) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="rounded-md text-xs h-9 px-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border/60">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-base font-bold text-foreground">Cancel Campaign?</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-muted-foreground">
                      Cancelling terminates the campaign. Active creator contracts will be cancelled and unallocated escrow funds will be reconciled.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="text-xs">Keep Campaign</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => cancelMutation.mutate()}
                      className="bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold"
                    >
                      {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancel"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Terminal (Completed / Closed / Cancelled): Archive or Unarchive */}
            {["completed", "closed", "cancelled"].includes(campaign.status) && (
              campaign.isArchived ? (
                <Button
                  variant="outline"
                  onClick={() => unarchiveMutation.mutate()}
                  disabled={unarchiveMutation.isPending}
                  className="rounded-md text-xs h-9 px-3 text-muted-foreground hover:text-foreground font-semibold"
                >
                  <ArrowUpTrayIcon className="h-3.5 w-3.5 mr-1" />
                  {unarchiveMutation.isPending ? "Restoring..." : "Restore from Archive"}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => archiveMutation.mutate()}
                  disabled={archiveMutation.isPending}
                  className="rounded-md text-xs h-9 px-3 text-muted-foreground hover:text-foreground font-semibold"
                >
                  <ArchiveBoxIcon className="h-3.5 w-3.5 mr-1" />
                  {archiveMutation.isPending ? "Archiving..." : "Archive Campaign"}
                </Button>
              )
            )}
          </div>
        }
      />

      {/* Draft Notice */}
      {campaign.status === "draft" && (
        <div className="p-3.5 sm:p-4 rounded-md bg-amber-500/10 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1 sm:mt-0" />
            <p>
              <span className="font-bold">Unpublished Draft:</span> This brief is strictly private to your team and is not visible to creators. Publish it to start accepting applicants{campaign.isPrivate ? " or inviting creators" : ""}.
            </p>
          </div>
          <Button
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md px-3.5 h-8 text-xs shrink-0 shadow-xs"
          >
            {publishMutation.isPending ? "Publishing..." : "Publish Campaign"}
          </Button>
        </div>
      )}

      {/* Closed Intake Notice */}
      {campaign.status === "closed" && (
        <div className="p-3.5 sm:p-4 rounded-md bg-slate-500/10 text-slate-800 dark:text-slate-200 text-xs flex items-center gap-3">
          <NoSymbolIcon className="h-5 w-5 text-slate-600 dark:text-slate-400 shrink-0" />
          <div>
            <span className="font-bold">Campaign Intake Closed:</span> This brief is no longer accepting new creator applications. Creators already accepted into the campaign can continue submitting deliverables.
          </div>
        </div>
      )}

      {/* Creator Sifting / Invitation Callout Banner — ONLY for active Open campaigns */}
      {campaign.status === "open" && !campaign.isArchived && (
        campaign.isPrivate ? (
          <div className="p-4 sm:p-5 rounded-md bg-purple-500/10 dark:bg-purple-950/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 grid place-items-center shrink-0 mt-0.5">
                <LockClosedIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-foreground">Private / Invitation-Only Campaign</h4>
                  <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-purple-500/20 text-purple-700 dark:text-purple-300">
                    Hidden from Public Board
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                  This brief is hidden from the creator board. Creators cannot self-apply — handpick and invite creators directly to join your campaign.
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate(`/brand/discover?campaignId=${campaign.id}`)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md px-4 h-9 text-xs shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <UserPlusIcon className="h-4 w-4" />
              Invite Creators to Campaign
            </Button>
          </div>
        ) : (
          <div className="p-3.5 sm:p-4 rounded-md bg-teal-500/10 dark:bg-teal-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400 grid place-items-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-foreground font-medium">
                  <span className="font-bold">Want to handpick specific talent?</span> While your campaign is live on the public creator board, you can also sift through verified creators and send direct invites.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/brand/discover?campaignId=${campaign.id}`)}
              className="border-none bg-card hover:bg-surface-2 text-teal-700 dark:text-teal-300 font-semibold rounded-md px-3.5 h-8 text-xs shrink-0 flex items-center gap-1.5 shadow-2xs"
            >
              <UserGroupIcon className="h-3.5 w-3.5" />
              Browse & Invite Creators
            </Button>
          </div>
        )
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        <Stat label="Total Budget" value={money(totalBudget, campaign.currency)} />
        <Stat label="Per Creator" value={money(campaign.budgetPerCreator, campaign.currency)} tone="gold" />
        <Stat label="Creator Slots" value={campaign.quantity} />
        <Stat label="Applicants" value={apps.length} />
      </div>

      <Tabs defaultValue="overview" className="w-full pt-6 sm:pt-8">
        <div className="mb-6 sm:mb-8 overflow-x-auto scrollbar-hide pb-1">
          <TabsList className="w-fit justify-start bg-surface-2 dark:bg-surface p-1 rounded-md border border-border/40 shadow-2xs h-auto flex items-center gap-1.5 shrink-0">
            <TabsTrigger
              value="overview"
              className="group rounded-sm px-3 py-1.5 text-xs font-semibold text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:font-bold data-[state=active]:shadow-xs transition-all whitespace-nowrap"
            >
              Overview & Brief
            </TabsTrigger>
            <TabsTrigger
              value="applicants"
              className="group rounded-sm px-3 py-1.5 text-xs font-semibold text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:font-bold data-[state=active]:shadow-xs transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <span>Applicants</span>
              <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-bold font-numeric transition-colors group-data-[state=active]:bg-teal-500/15 group-data-[state=active]:text-teal-600 dark:group-data-[state=active]:text-teal-400 group-data-[state=inactive]:text-muted-foreground">
                {apps.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="deliverables"
              className="group rounded-sm px-3 py-1.5 text-xs font-semibold text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:font-bold data-[state=active]:shadow-xs transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <span>Deliverables</span>
              <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-bold font-numeric transition-colors group-data-[state=active]:bg-teal-500/15 group-data-[state=active]:text-teal-600 dark:group-data-[state=active]:text-teal-400 group-data-[state=inactive]:text-muted-foreground">
                {deliverables.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="group rounded-sm px-3 py-1.5 text-xs font-semibold text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:font-bold data-[state=active]:shadow-xs transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <span>Payments</span>
              <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-bold font-numeric transition-colors group-data-[state=active]:bg-teal-500/15 group-data-[state=active]:text-teal-600 dark:group-data-[state=active]:text-teal-400 group-data-[state=inactive]:text-muted-foreground">
                {payments.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="group rounded-sm px-3 py-1.5 text-xs font-semibold text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:font-bold data-[state=active]:shadow-xs transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <span>Activity</span>
              <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-bold font-numeric transition-colors group-data-[state=active]:bg-teal-500/15 group-data-[state=active]:text-teal-600 dark:group-data-[state=active]:text-teal-400 group-data-[state=inactive]:text-muted-foreground">
                {activities.length}
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <div className="bg-card border border-border/60 rounded-md p-5 sm:p-6 shadow-2xs space-y-5">
            <h2 className="font-display font-bold text-base text-foreground tracking-tight">Campaign Brief & Objectives</h2>
            <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{campaign.brief}</p>
            <div className="pt-4 border-t border-border/40 flex flex-wrap gap-6 text-xs text-muted-foreground font-medium">
              <span>Goal: <strong className="text-foreground capitalize">{campaign.goal}</strong></span>
              <span>Category: <strong className="text-foreground capitalize">{campaign.category}</strong></span>
              <span>Country: <strong className="text-foreground">{campaign.country}</strong></span>
              {campaign.deliveryDeadline && (
                <span>Deadline: <strong className="text-foreground">{new Date(campaign.deliveryDeadline).toLocaleDateString()}</strong></span>
              )}
            </div>
          </div>

          {!campaign.isPrivate && (
            <div className="bg-card border border-border/60 rounded-md p-5 sm:p-6 shadow-2xs space-y-4 mt-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground">Creator Re-Application Policy</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure whether creators whose pitches weren&apos;t accepted can revise their concept and re-apply.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-2/40 border border-border/40 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-xs text-foreground block">Allow Re-Application</span>
                    <span className="text-[11px] text-muted-foreground">
                      Creators can submit a new pitch after the cooldown period has elapsed.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={policyAllow ?? (campaign.allowReApplication ?? true)}
                    onChange={(e) => setPolicyAllow(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                </div>

                {(policyAllow ?? (campaign.allowReApplication ?? true)) && (
                  <div className="pt-2 border-t border-border/30 flex flex-wrap items-center gap-3">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Cooldown Period (Days):
                    </span>
                    <Input
                      type="number"
                      min={0}
                      max={30}
                      value={policyCooldown ?? (campaign.reApplicationCooldownDays ?? 3)}
                      onChange={(e) => setPolicyCooldown(Math.max(0, Math.min(30, Number(e.target.value))))}
                      className="w-20 h-8 text-xs font-numeric rounded-md"
                    />
                    <span className="text-[11px] text-muted-foreground">
                      (0 = immediate re-application permitted)
                    </span>
                  </div>
                )}
              </div>

              {(policyAllow !== null || policyCooldown !== null) && (
                <div className="flex justify-end pt-1">
                  <Button
                    size="sm"
                    onClick={() => {
                      updateSettingsMutation.mutate({
                        allowReApplication: policyAllow ?? campaign.allowReApplication,
                        reApplicationCooldownDays: policyCooldown ?? campaign.reApplicationCooldownDays,
                      });
                      setPolicyAllow(null);
                      setPolicyCooldown(null);
                    }}
                    disabled={updateSettingsMutation.isPending}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-md h-8 shadow-xs"
                  >
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Policy Changes"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applicants">
          <div className="bg-card border border-border/60 rounded-md p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-base text-foreground tracking-tight">Creator Applications</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Review and accept creator pitches for this campaign.</p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {apps.filter(a => a.status === "accepted").length} / {campaign.quantity} slots filled
              </span>
            </div>

            <div className="space-y-3">
              {apps.length === 0 ? (
                <div className="p-10 text-center text-xs sm:text-sm text-muted-foreground">
                  No applications received yet. Creators will appear here when they pitch to this campaign.
                </div>
              ) : (
                apps.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-4 sm:p-5 rounded-md bg-surface-2/40 border border-border/40 hover:bg-surface-2/70 transition-all duration-150 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        {a.creator?.profileImageUrl ? (
                          <img
                            src={a.creator.profileImageUrl}
                            alt={a.creator.displayName}
                            className="w-10 h-10 rounded-full object-cover border border-border/60 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center border border-teal-500/20 shrink-0">
                            {a.creator?.displayName?.slice(0, 2).toUpperCase() || "CR"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-foreground text-sm">{a.creator?.displayName || "Creator"}</span>
                            {a.creator?.verified && (
                              <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-bold bg-teal-500/10 text-teal-600">
                                Verified
                              </span>
                            )}
                            {a.creator?.user?.email && (
                              <span className="text-xs text-muted-foreground">
                                {a.creator.user.email}
                              </span>
                            )}
                            <span className="text-[10px] uppercase font-bold text-muted-foreground px-1.5 py-0.2 rounded-sm bg-surface-2 border border-border/40">
                              {a.source === "invited" ? "Invited" : "Applied"}
                            </span>
                            <StatusPill status={a.status} />
                            {a.reApplicationCount !== undefined && a.reApplicationCount > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <RefreshCw className="h-2.5 w-2.5 shrink-0" />
                                <span>Re-application #{a.reApplicationCount + 1}</span>
                              </span>
                            )}
                            {a.blockedFromReApply && (
                              <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                Re-apply Blocked
                              </span>
                            )}
                          </div>

                          {a.creator?.bio && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                              {a.creator.bio}
                            </p>
                          )}

                          {a.creator?.socialAccounts && a.creator.socialAccounts.length > 0 && (
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {a.creator.socialAccounts.map((soc) => (
                                <a
                                  key={soc.id}
                                  href={soc.profileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline bg-teal-500/5 px-2 py-0.5 rounded-sm border border-teal-500/20 inline-flex items-center gap-1"
                                >
                                  <span>{soc.platform}: @{soc.handle}</span>
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      {a.status === "pending" && (
                        <div className="flex items-center gap-2 shrink-0 sm:self-start">
                          <Button
                            size="sm"
                            onClick={() => acceptAppMutation.mutate(a.id)}
                            disabled={acceptAppMutation.isPending}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md h-8 px-3 text-xs shadow-xs"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setRejectDialogTarget({ id: a.id, creatorName: a.creator?.displayName || "Creator" });
                              setBlockReApplyOnReject(false);
                            }}
                            disabled={rejectAppMutation.isPending}
                            className="rounded-md h-8 px-3 text-xs hover:bg-rose-500/10 hover:text-rose-600"
                          >
                            <X className="h-3.5 w-3.5 mr-1" /> Decline
                          </Button>
                        </div>
                      )}

                      {a.status === "accepted" && (
                        <span className="shrink-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-sm border border-emerald-500/20 inline-flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Selected Creator
                        </span>
                      )}

                      {a.status === "rejected" && (
                        <div className="flex items-center gap-2 shrink-0 sm:self-start flex-wrap">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-500/10 px-2.5 py-1 rounded-sm">
                            Not Moved Forward
                          </span>
                          {a.source === "applied" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => reconsiderAppMutation.mutate(a.id)}
                              disabled={reconsiderAppMutation.isPending}
                              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground font-semibold rounded-md flex items-center gap-1 shadow-2xs"
                            >
                              <RefreshCw className="h-3 w-3" /> Reconsider
                            </Button>
                          )}
                        </div>
                      )}

                      {a.status === "declined" && (
                        <span className="shrink-0 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-sm inline-flex items-center gap-1">
                          Invitation Declined by Creator
                        </span>
                      )}
                    </div>

                    {/* Creator's Pitch */}
                    <div className="bg-card border border-border/40 p-3 rounded-md text-xs space-y-1">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Creator Pitch & Concept
                      </div>
                      <p className="text-foreground leading-relaxed whitespace-pre-line">
                        {a.pitch || "No written pitch submitted."}
                      </p>
                      <div className="text-[10px] text-muted-foreground pt-1">
                        Submitted on {new Date(a.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>

                      {/* Application History Chain Accordion */}
                      {(a.parentApplication || (a.reApplicationCount !== undefined && a.reApplicationCount > 0)) && (
                        <div className="pt-2 border-t border-border/30 mt-2">
                          <button
                            type="button"
                            onClick={() => setExpandedChainAppId(expandedChainAppId === a.id ? null : a.id)}
                            className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                          >
                            <span>{expandedChainAppId === a.id ? "Hide" : "View"} application history ({a.reApplicationCount} previous attempt{a.reApplicationCount && a.reApplicationCount > 1 ? "s" : ""})</span>
                          </button>
                          {expandedChainAppId === a.id && (
                            <div className="mt-2 pl-3 border-l-2 border-teal-500/40 space-y-2 text-xs">
                              {a.parentApplication ? (
                                <div className="p-3 rounded bg-surface-2/70 border border-border/40 space-y-1">
                                  <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                                    <span>Previous Pitch (Attempt #{(a.parentApplication.reApplicationCount ?? 0) + 1})</span>
                                    <span>{new Date(a.parentApplication.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-foreground whitespace-pre-line leading-relaxed">{a.parentApplication.pitch || "No pitch text"}</p>
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground italic">
                                  Prior pitch recorded in application history.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="deliverables">
          <div className="bg-card border border-border/60 rounded-md p-5 sm:p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/40">
              <div>
                <h2 className="font-display font-bold text-base text-foreground tracking-tight">Creator Deliverables & Revision Chains</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Track creator submissions sequentially from initial draft to revisions and escrow release.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  {deliverables.filter(d => d.status === "approved").length} approved • {deliverables.filter(d => d.status === "submitted").length} awaiting review
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {creatorDeliverableChains.length === 0 ? (
                <div className="p-12 text-center text-xs sm:text-sm text-muted-foreground bg-surface-2/30 rounded-md border border-dashed border-border/60">
                  No creators selected for this campaign yet. Accept creators from the Applicants tab to start receiving deliverable submissions.
                </div>
              ) : (
                creatorDeliverableChains.map((chain) => {
                  const latest = chain.deliverables.length > 0 ? chain.deliverables[chain.deliverables.length - 1] : null;
                  const isCompleted = latest?.status === "approved";
                  const isNeedsReview = latest?.status === "submitted";
                  const isRevisionActive = latest?.status === "revision_requested";

                  return (
                    <div
                      key={chain.applicationId}
                      className="rounded-md border border-border/60 bg-surface-2/30 overflow-hidden shadow-2xs space-y-4"
                    >
                      {/* Creator Identification Header */}
                      <div className="p-4 sm:p-5 bg-card border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          {chain.creator.profileImageUrl ? (
                            <img
                              src={chain.creator.profileImageUrl}
                              alt={chain.creator.displayName}
                              className="w-11 h-11 rounded-full object-cover border border-border/60 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-sm flex items-center justify-center border border-teal-500/20 shrink-0">
                              {chain.creator.displayName?.slice(0, 2).toUpperCase() || "CR"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-foreground text-sm sm:text-base">
                                {chain.creator.displayName || "Creator Partner"}
                              </span>
                              {chain.creator.verified && (
                                <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-bold bg-teal-500/10 text-teal-600">
                                  Verified
                                </span>
                              )}
                              {chain.creator.user?.email && (
                                <span className="text-xs text-muted-foreground font-mono">
                                  {chain.creator.user.email}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                              <span className="capitalize">{campaign.deliverableType.replace("_", " ")}</span>
                              <span>•</span>
                              <span>{chain.deliverables.length} {chain.deliverables.length === 1 ? 'version' : 'versions'} submitted</span>
                            </div>
                          </div>
                        </div>

                        {/* Overall Creator State Pill */}
                        <div className="shrink-0 sm:self-center">
                          {chain.deliverables.length === 0 && (
                            <span className="px-2.5 py-1 rounded-sm text-xs font-semibold bg-surface-2 text-muted-foreground border border-border/40 inline-flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" /> Content In Production
                            </span>
                          )}
                          {isNeedsReview && (
                            <span className="px-2.5 py-1 rounded-sm text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 inline-flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" /> v{latest.version} Awaiting Brand Review
                            </span>
                          )}
                          {isRevisionActive && (
                            <span className="px-2.5 py-1 rounded-sm text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 inline-flex items-center gap-1.5">
                              <RefreshCw className="h-3.5 w-3.5" /> Revision Requested (Waiting for creator)
                            </span>
                          )}
                          {isCompleted && (
                            <span className="px-2.5 py-1 rounded-sm text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5" /> Approved & Completed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Deliverables Linked Chain / Timeline */}
                      <div className="p-4 sm:p-5 pt-0">
                        {chain.deliverables.length === 0 ? (
                          <div className="p-6 text-center text-xs text-muted-foreground bg-card/60 rounded-md border border-dashed border-border/60">
                            Waiting for creator to submit their initial cut. The submission chain will start here once submitted.
                          </div>
                        ) : (
                          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/60">
                            {chain.deliverables.map((d, index) => {
                              const isLatest = index === chain.deliverables.length - 1;
                              const isRevised = d.version > 1;

                              return (
                                <div key={d.id} className="relative">
                                  {/* Timeline Node Badge */}
                                  <div className={cn(
                                    "absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ring-4 ring-card shadow-xs",
                                    d.status === "approved"
                                      ? "bg-emerald-600 text-white"
                                      : d.status === "revision_requested"
                                      ? "bg-rose-500 text-white"
                                      : "bg-teal-600 text-white"
                                  )}>
                                    {d.status === "approved" ? <Check className="h-3.5 w-3.5 stroke-[2.5]" /> : `v${d.version}`}
                                  </div>

                                  {/* Version Details Card */}
                                  <div className={cn(
                                    "p-4 sm:p-5 rounded-md bg-card border border-border/50 hover:border-border/80 transition-all space-y-3.5 shadow-2xs",
                                    isLatest && d.status === "submitted" && "ring-1 ring-teal-500/40 border-teal-500/30 bg-teal-500/5",
                                    d.status === "approved" && "border-emerald-500/30 bg-emerald-500/5"
                                  )}>
                                    {/* Version Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-bold text-sm text-foreground">
                                            {isRevised ? `Version ${d.version}: Revised Deliverable` : `Version 1: Initial Submission`}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            ({d.file?.fileType || "video/mp4"})
                                          </span>
                                          {isLatest && (
                                            <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-bold bg-teal-500/10 text-teal-600 uppercase">
                                              Latest Cut
                                            </span>
                                          )}
                                        </div>
                                        {d.submittedAt && (
                                          <div className="text-[11px] text-muted-foreground mt-0.5">
                                            Submitted on {new Date(d.submittedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                          </div>
                                        )}
                                      </div>
                                      <StatusPill status={d.status} />
                                    </div>

                                    {/* Media Link Button */}
                                    {d.file?.providerUrl && (
                                      <div className="pt-0.5">
                                        <a
                                          href={d.file.providerUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-500/20 transition-colors shadow-2xs"
                                        >
                                          <ExternalLink className="h-3.5 w-3.5" />
                                          <span>Open / Review Media Asset (v{d.version})</span>
                                        </a>
                                      </div>
                                    )}

                                    {/* Creator Notes & Details */}
                                    {d.notes && (
                                      <div className="bg-surface-2/60 dark:bg-surface border border-border/40 rounded-md p-3.5 text-xs space-y-1.5 shadow-2xs">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                          <FileText className="h-3.5 w-3.5 text-primary" />
                                          <span>Creator Submission Notes (v{d.version})</span>
                                        </div>
                                        <p className="text-foreground leading-relaxed whitespace-pre-wrap font-mono text-[11px] sm:text-xs">
                                          {d.notes}
                                        </p>
                                      </div>
                                    )}

                                    {/* Brand Revision Feedback Given (Chain link to the next revision) */}
                                    {d.revisionNotes && (
                                      <div className="bg-rose-500/10 rounded-md p-3.5 text-xs text-rose-900 dark:text-rose-200 space-y-1.5">
                                        <div className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                                          <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                                          <span>Brand Revision Instructions on Version {d.version}:</span>
                                        </div>
                                        <p className="leading-relaxed whitespace-pre-wrap pl-5">{d.revisionNotes}</p>
                                        {index < chain.deliverables.length - 1 ? (
                                          <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 pl-5 pt-1 flex items-center gap-1.5">
                                            <CornerDownRight className="h-3.5 w-3.5 shrink-0" />
                                            <span>Addressed by Creator in Version {chain.deliverables[index + 1].version} below:</span>
                                          </div>
                                        ) : (
                                          <div className="text-[11px] text-muted-foreground pl-5 pt-1 italic">
                                            Awaiting revised submission (v{d.version + 1}) from creator...
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Approved Escrow Released Confirmation */}
                                    {d.status === "approved" && (
                                      <div className="p-3.5 rounded-md bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-semibold">
                                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                                        <span>Version {d.version} Approved & Finalized • Escrow Payout Successfully Initiated</span>
                                      </div>
                                    )}

                                    {/* Brand Review Controls (Active only on latest version when submitted) */}
                                    {isLatest && d.status === "submitted" && (
                                      <div className="space-y-3 pt-3 border-t border-border/30">
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            onClick={() => approveDeliverableMutation.mutate(d.id)}
                                            disabled={approveDeliverableMutation.isPending}
                                            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md h-8 px-3.5 text-xs shadow-xs"
                                          >
                                            <Check className="h-3.5 w-3.5 mr-1.5" /> Approve & Release Payout
                                          </Button>
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                          <Input
                                            placeholder="Reason for revision (e.g. adjust lighting, show product close-up)..."
                                            value={revisionNote[d.id] || ""}
                                            onChange={(e) => setRevisionNote({ ...revisionNote, [d.id]: e.target.value })}
                                            className="text-xs rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 h-8"
                                          />
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                              if (!revisionNote[d.id]) {
                                                toast.error("Please provide revision instructions.");
                                                return;
                                              }
                                              requestRevisionMutation.mutate({ deliverableId: d.id, notes: revisionNote[d.id] });
                                            }}
                                            disabled={requestRevisionMutation.isPending}
                                            className="rounded-md h-8 px-3 text-xs border border-border/40 hover:bg-surface-2"
                                          >
                                            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Request Revision
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="bg-card border border-border/60 rounded-md p-5 sm:p-6 shadow-2xs space-y-4">
            <div>
              <h2 className="font-display font-bold text-base text-foreground tracking-tight">Payment Transaction Ledger</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Automated payouts triggered upon deliverable approval.</p>
            </div>
            <div className="space-y-2">
              {payments.length === 0 ? (
                <div className="p-10 text-center text-xs sm:text-sm text-muted-foreground">
                  No payments initiated yet. Payouts trigger automatically upon deliverable approval.
                </div>
              ) : (
                payments.map((p) => (
                  <div key={p.id} className="p-3.5 sm:p-4 rounded-md bg-surface-2/40 border border-border/40 hover:bg-surface-2/70 hover:border-transparent transition-all duration-150 flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-teal-600 dark:text-teal-400">[{p.status}]</span>
                      <span className="ml-2.5 font-bold font-numeric text-foreground">{money(p.amount, p.currency)}</span>
                      <span className="text-xs text-muted-foreground ml-2">via {p.provider} {p.providerRef ? `(Ref: ${p.providerRef})` : ''}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{new Date(p.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="bg-card border border-border/60 rounded-md p-5 sm:p-6 shadow-2xs space-y-4">
            <h2 className="font-display font-bold text-base text-foreground tracking-tight">Activity Timeline</h2>
            <div className="space-y-2.5">
              {activities.length === 0 ? (
                <div className="p-8 text-center text-xs sm:text-sm text-muted-foreground">No timeline activity yet.</div>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="p-3.5 rounded-md bg-surface-2/40 border border-border/40 hover:bg-surface-2/70 hover:border-transparent transition-all duration-150">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono font-bold text-[11px] text-foreground uppercase tracking-wider">{act.eventType}</span>
                      <span className="text-[11px] font-mono">{new Date(act.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs sm:text-sm mt-1.5 text-foreground leading-relaxed">{act.body}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-border/40 flex gap-2">
              <Input
                placeholder="Post a comment or update to the campaign timeline..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && commentText) commentMutation.mutate(commentText);
                }}
                className="rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 h-9 text-xs sm:text-sm focus:ring-teal-500/20"
              >
              </Input>
              <Button
                onClick={() => commentText && commentMutation.mutate(commentText)}
                disabled={commentMutation.isPending || !commentText}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md px-4 h-9 text-xs shadow-xs shrink-0"
              >
                Post
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reject Application Dialog */}
      <AlertDialog open={!!rejectDialogTarget} onOpenChange={(open) => !open && setRejectDialogTarget(null)}>
        <AlertDialogContent className="bg-card border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Decline Application?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you do not want to move forward with {rejectDialogTarget?.creatorName}&apos;s pitch for this campaign?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {!campaign.isPrivate && (
            <div className="p-3 rounded-md bg-surface-2/40 border border-border/40 text-xs flex items-start gap-2.5 mt-2">
              <input
                type="checkbox"
                id="blockReApplyCheckbox"
                checked={blockReApplyOnReject}
                onChange={(e) => setBlockReApplyOnReject(e.target.checked)}
                className="h-4 w-4 rounded border-border text-rose-600 focus:ring-rose-500 mt-0.5 cursor-pointer"
              />
              <label htmlFor="blockReApplyCheckbox" className="cursor-pointer select-none">
                <span className="font-bold text-foreground block">Block creator from re-applying</span>
                <span className="text-[11px] text-muted-foreground">
                  Check this if you do not want this creator to submit any further revised pitches to this brief.
                </span>
              </label>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (rejectDialogTarget) {
                  rejectAppMutation.mutate({
                    applicationId: rejectDialogTarget.id,
                    block: blockReApplyOnReject,
                  });
                }
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
            >
              {rejectAppMutation.isPending ? "Declining..." : "Confirm Decline"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CampaignDetail;
