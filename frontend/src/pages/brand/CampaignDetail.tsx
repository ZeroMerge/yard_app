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
import { ArrowLeft, Check, ExternalLink, RefreshCw, X, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export const money = (amount: number, currency: string = "NGN") =>
  `${currency === "NGN" ? "₦" : "$"}${Number(amount || 0).toLocaleString()}`;

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [revisionNote, setRevisionNote] = useState<{ [deliverableId: string]: string }>({});
  const [commentText, setCommentText] = useState("");

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
      toast.success("Campaign cancelled.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to cancel campaign"),
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
    mutationFn: applicationsApi.reject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      toast.success("Application rejected.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to reject application"),
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

  if (isLoading) {
    return <div className="p-12 text-center text-sm text-muted-foreground">Loading campaign from server...</div>;
  }

  if (!campaign) {
    return <Empty title="Campaign not found" action={<Button onClick={() => navigate("/brand/campaigns")} className="rounded-xl">Back to campaigns</Button>} />;
  }

  const apps = campaign.applications || [];
  const deliverables = campaign.deliverables || [];
  const totalBudget = Number(campaign.budgetPerCreator || 0) * (campaign.quantity || 1);

  return (
    <div>
      <button
        onClick={() => navigate("/brand/campaigns")}
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-4 font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to campaigns
      </button>

      <PageHeader
        title={campaign.name}
        subtitle={`${campaign.category.toUpperCase()} • ${campaign.country} • Format: ${campaign.deliverableType}`}
        action={
          <div className="flex items-center gap-3">
            <StatusPill status={campaign.status} />
            {campaign.status === "draft" && (
              <Button
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-5 shadow-sm"
              >
                {publishMutation.isPending ? "Publishing..." : "Publish Campaign"}
              </Button>
            )}
            {["draft", "open", "in_progress"].includes(campaign.status) && (
              <Button
                variant="ghost"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="rounded-xl text-muted-foreground hover:text-destructive"
              >
                Cancel
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Total Budget" value={money(totalBudget, campaign.currency)} />
        <Stat label="Per Creator" value={money(campaign.budgetPerCreator, campaign.currency)} tone="gold" />
        <Stat label="Creator Slots" value={campaign.quantity} />
        <Stat label="Applicants" value={apps.length} />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 bg-surface-2 dark:bg-surface p-1 rounded-2xl border-0">
          <TabsTrigger value="overview" className="rounded-xl">Overview & Brief</TabsTrigger>
          <TabsTrigger value="applicants" className="rounded-xl">Applicants ({apps.length})</TabsTrigger>
          <TabsTrigger value="deliverables" className="rounded-xl">Deliverables ({deliverables.length})</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-xl">Payments ({payments.length})</TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-xl">Activity ({activities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="cy-card p-8 space-y-5 shadow-sm">
            <h2 className="font-display font-bold text-lg">Campaign Brief & Objectives</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{campaign.brief}</p>
            <div className="pt-5 border-t border-border/30 flex flex-wrap gap-6 text-xs text-muted-foreground font-medium">
              <span>Goal: <strong className="text-foreground capitalize">{campaign.goal}</strong></span>
              <span>Category: <strong className="text-foreground capitalize">{campaign.category}</strong></span>
              <span>Country: <strong className="text-foreground">{campaign.country}</strong></span>
              {campaign.deliveryDeadline && (
                <span>Deadline: <strong className="text-foreground">{new Date(campaign.deliveryDeadline).toLocaleDateString()}</strong></span>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="applicants">
          <div className="cy-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="font-display font-bold text-lg">Creator Applications</h2>
            </div>
            <div className="space-y-3">
              {apps.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">No applications received yet.</div>
              ) : (
                apps.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="cy-row flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-foreground text-sm">{a.creator?.displayName || "Creator"}</span>
                        <StatusPill status={a.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{a.pitch || "No pitch provided."}</p>
                      <span className="text-xs text-muted-foreground mt-2 block font-medium">
                        Applied: {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {a.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => acceptAppMutation.mutate(a.id)}
                          disabled={acceptAppMutation.isPending}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => rejectAppMutation.mutate(a.id)}
                          disabled={rejectAppMutation.isPending}
                          className="rounded-xl hover:bg-rose-500/10 hover:text-rose-600"
                        >
                          <X className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="deliverables">
          <div className="cy-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="font-display font-bold text-lg">Submissions & Review</h2>
            </div>
            <div className="space-y-4">
              {deliverables.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">No deliverables submitted yet.</div>
              ) : (
                deliverables.map((d) => (
                  <div key={d.id} className="cy-row space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-foreground">
                        Deliverable Version {d.version} ({d.file?.fileType || "video/mp4"})
                      </div>
                      <StatusPill status={d.status} />
                    </div>

                    {d.file?.providerUrl && (
                      <a
                        href={d.file.providerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-teal-600 dark:text-teal-400 hover:underline font-medium"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> View Uploaded Media
                      </a>
                    )}

                    {d.status === "submitted" && (
                      <div className="space-y-3 pt-3 border-t border-border/30">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveDeliverableMutation.mutate(d.id)}
                            disabled={approveDeliverableMutation.isPending}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl"
                          >
                            <Check className="h-3.5 w-3.5 mr-1.5" /> Approve & Release Payout
                          </Button>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Input
                            placeholder="Reason for revision (e.g. adjust lighting, show product close-up)..."
                            value={revisionNote[d.id] || ""}
                            onChange={(e) => setRevisionNote({ ...revisionNote, [d.id]: e.target.value })}
                            className="text-xs rounded-xl bg-surface-2 dark:bg-surface border-0"
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
                            className="rounded-xl"
                          >
                            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Request Revision
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="cy-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="font-display font-bold text-lg">Payment Transaction Ledger</h2>
            </div>
            <div className="space-y-2">
              {payments.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  No payments initiated yet. Payouts trigger automatically upon deliverable approval.
                </div>
              ) : (
                payments.map((p) => (
                  <div key={p.id} className="cy-row flex items-center justify-between text-sm">
                    <div>
                      <span className="font-bold uppercase tracking-wide text-xs text-teal-600 dark:text-teal-400">[{p.status}]</span>
                      <span className="ml-2.5 font-extrabold text-foreground">{money(p.amount, p.currency)}</span>
                      <span className="text-xs text-muted-foreground ml-2">via {p.provider} {p.providerRef ? `(Ref: ${p.providerRef})` : ''}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="cy-card p-6 space-y-4 shadow-sm">
            <h2 className="font-display font-bold text-lg">Activity Timeline</h2>
            <div className="space-y-3">
              {activities.map((act) => (
                <div key={act.id} className="cy-row py-2.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-bold text-foreground uppercase tracking-wider">{act.eventType}</span>
                    <span>{new Date(act.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm mt-1 text-foreground leading-relaxed">{act.body}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border/30 flex gap-2">
              <Input
                placeholder="Post a comment or update to the campaign timeline..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && commentText) commentMutation.mutate(commentText);
                }}
                className="rounded-xl bg-surface-2 dark:bg-surface border-0"
              />
              <Button
                onClick={() => commentText && commentMutation.mutate(commentText)}
                disabled={commentMutation.isPending || !commentText}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-5"
              >
                Post
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignDetail;
