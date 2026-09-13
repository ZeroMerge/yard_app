import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { applicationsApi } from "@/api/applications";
import { Campaign } from "@/api/types";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { money } from "./Campaigns";
import {
  ArrowLeftIcon,
  CheckBadgeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  VideoCameraIcon,
  DocumentArrowDownIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuth();
  const [pitch, setPitch] = useState("");
  const [showPriorPitch, setShowPriorPitch] = useState(false);
  const [reApplyPitch, setReApplyPitch] = useState("");

  const { data: campaign, isLoading } = useQuery<Campaign>({
    queryKey: ["campaign", id],
    queryFn: () => campaignsApi.getById(id!),
    enabled: !!id,
  });

  const { data: eligibility, isLoading: isEligibilityLoading } = useQuery({
    queryKey: ["reapply-eligibility", id],
    queryFn: () => applicationsApi.getReApplyEligibility(id!),
    enabled: !!id && !!campaign?.applications?.[0] && campaign.applications[0].status === "rejected",
    staleTime: 5000,
  });

  const withdrawMutation = useMutation({
    mutationFn: (applicationId: string) => applicationsApi.withdraw(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Application withdrawn.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to withdraw application");
    },
  });

  const reApplyMutation = useMutation({
    mutationFn: (pitchText: string) => applicationsApi.apply(id!, { pitch: pitchText, source: "applied" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setReApplyPitch("");
      toast.success("Revised pitch submitted! The brand will review your new application.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit revised pitch");
    },
  });

  const applyMutation = useMutation({
    mutationFn: (pitchText: string) => applicationsApi.apply(id!, { pitch: pitchText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Application successfully submitted to brand!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit application");
    },
  });

  const acceptInviteMutation = useMutation({
    mutationFn: (appId: string) => applicationsApi.acceptInvitation(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Invitation accepted! You are now part of this campaign.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to accept invitation");
    },
  });

  const declineInviteMutation = useMutation({
    mutationFn: (appId: string) => applicationsApi.declineInvitation(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.info("Invitation declined.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to decline invitation");
    },
  });

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading campaign brief...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="bg-card border border-border/60 rounded-md p-12 text-center shadow-2xs">
        <h2 className="font-display font-bold text-lg text-foreground">Campaign not found</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          This campaign brief may have closed or been archived.
        </p>
        <button
          onClick={() => navigate("/creator/campaigns")}
          className="px-4 py-2 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-xs"
        >
          Back to Find Campaigns
        </button>
      </div>
    );
  }

  const app = campaign.applications?.find((a) => a.creatorId === user?.creatorId) || campaign.applications?.[0];
  let status: "open" | "applied" | "invited" | "selected" | "rejected" = "open";

  if (app) {
    if (app.status === "accepted") status = "selected";
    else if (app.source === "invited" && app.status === "pending") status = "invited";
    else if (app.status === "rejected") status = "rejected";
    else status = "applied";
  }

  const handleApply = async () => {
    if (!pitch.trim() || applyMutation.isPending) return;
    applyMutation.mutate(pitch.trim());
  };

  return (
    <div className="space-y-8 lg:space-y-10 pb-20 animate-in fade-in duration-300">
      
      {/* ── Back Navigation ───────────────────────────────────────────────── */}
      <div>
        <button
          onClick={() => navigate("/creator/campaigns")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Find Campaigns</span>
        </button>
      </div>

      {/* ── Hero Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {campaign.organization?.name || "Verified Brand Partner"}
            </span>
            <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400">
              High Fit Match
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-foreground tracking-tight">
            {campaign.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <VideoCameraIcon className="h-4 w-4 text-primary" />
              {campaign.quantity}x {campaign.deliverableType.replace("_", " ")}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="h-4 w-4 text-muted-foreground" />
              {campaign.country || "Global"} {campaign.city ? `· ${campaign.city}` : ""}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              Due: {campaign.applicationDeadline ? new Date(campaign.applicationDeadline).toLocaleDateString() : "Rolling"}
            </span>
          </div>
        </div>

        <div className="shrink-0 bg-surface-2/50 px-5 py-3.5 rounded-md border border-border/40">
          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Payout</div>
          <div className="font-numeric tabular-nums font-extrabold text-2xl sm:text-3xl text-foreground">
            {money(campaign.budgetPerCreator, campaign.currency)}
          </div>
        </div>
      </div>

      {/* ── 2-Column Split: Brief & Sticky Action Box ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left 2 Columns: Brief, Assets, Requirements */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Creative Brief */}
          <section className="bg-card border border-border/60 rounded-md p-6 sm:p-8 shadow-2xs space-y-4">
            <h2 className="font-display font-bold text-base sm:text-lg text-foreground">The Creative Brief</h2>
            <div className="text-xs sm:text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
              {campaign.brief || "No detailed brief provided for this campaign."}
            </div>
          </section>

          {/* Brand Assets & Guidelines */}
          <section className="bg-card border border-border/60 rounded-md p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <DocumentArrowDownIcon className="h-5 w-5 text-primary" />
              <h2 className="font-display font-bold text-base text-foreground">Brand Assets & Guidelines</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3.5 rounded-md bg-surface-2/50 border border-border/40 hover:bg-surface-2/80 hover:border-transparent transition-all duration-150 cursor-pointer group">
                <div className="h-9 w-9 bg-teal-500/10 text-primary rounded-md grid place-items-center font-bold text-xs">
                  PDF
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    Campaign Brief & Guidelines
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Asset Pack • 3.2 MB</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3.5 rounded-md bg-surface-2/50 border border-border/40 hover:bg-surface-2/80 hover:border-transparent transition-all duration-150 cursor-pointer group">
                <div className="h-9 w-9 bg-violet-500/10 text-violet-600 rounded-md grid place-items-center font-bold text-xs">
                  ZIP
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    Logos & Media Kit
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Vector Assets • 8.1 MB</div>
                </div>
              </div>
            </div>
          </section>

          {/* Eligibility Requirements */}
          <section className="bg-card border border-border/60 rounded-md p-6 shadow-2xs space-y-4">
            <h2 className="font-display font-bold text-base text-foreground">Requirements & Eligibility</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-surface-2/40 border border-border/30">
                <CheckBadgeIcon className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-foreground">Creator Geography</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Open to creators in {campaign.country || "All Regions"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-surface-2/40 border border-border/30">
                <CheckBadgeIcon className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-foreground">Niche Alignment</div>
                  <div className="text-xs text-muted-foreground mt-0.5 capitalize">{campaign.category || "General"} content category</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-surface-2/40 border border-border/30">
                <ShieldCheckIcon className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-foreground">Escrow Protected</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Funds deposited in Yard escrow prior to brief launch</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-surface-2/40 border border-border/30">
                <ClockIcon className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-foreground">Delivery Turnaround</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Within 7 days of sample arrival or brief approval</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right 1 Column: Sticky Pitch / Status Box */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            
            <div className={cn(
              "bg-card border border-border/60 rounded-md p-6 shadow-2xs relative overflow-hidden transition-all",
              status === "applied" && "bg-blue-500/5",
              status === "invited" && "bg-amber-500/5",
              status === "rejected" && "bg-rose-500/5",
              status === "accepted" && "bg-emerald-500/5"
            )}>
              
              {/* Compensation Breakdown */}
              <div className="space-y-3 pb-5 mb-5 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Per Creator</span>
                  <span className="font-display font-extrabold text-xl text-foreground">
                    {money(campaign.budgetPerCreator, campaign.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Deliverable</span>
                  <span className="font-semibold text-foreground capitalize">
                    {campaign.quantity}x {campaign.deliverableType.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Payment Rail</span>
                  <span className="font-semibold text-foreground">Direct NUBAN</span>
                </div>
              </div>

              {/* Status Variations */}
              {status === "open" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Pitch your creative concept
                    </label>
                    <textarea 
                      rows={4}
                      value={pitch}
                      onChange={(e) => setPitch(e.target.value)}
                      placeholder="Explain your concept hook, visual angle, and why your audience connects with this brand..."
                      className="w-full p-3 bg-surface-2 dark:bg-surface border border-border/40 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    />
                  </div>

                  <button 
                    onClick={handleApply}
                    disabled={!pitch.trim() || applyMutation.isPending}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-md transition-all shadow-xs hover:shadow-teal flex items-center justify-center gap-2"
                  >
                    {applyMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Submit Pitch to Brand"
                    )}
                  </button>

                  <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                    By submitting your pitch, you agree to fulfill the deliverables within the stated campaign schedule.
                  </p>
                </div>
              )}

              {status === "applied" && (
                <div className="text-center py-3">
                  <div className="h-11 w-11 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto grid place-items-center mb-2.5">
                    <CheckBadgeIcon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground">Pitch Under Review</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-3 leading-relaxed">
                    Your application has been received by {campaign.organization?.name || "the brand"}. You&apos;ll be notified once reviewed.
                  </p>

                  {app?.pitch && (
                    <div className="p-3 bg-surface-2/60 border border-border/40 rounded-md text-xs text-left mb-3">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Your Submitted Pitch</div>
                      <p className="text-foreground leading-relaxed whitespace-pre-line text-xs">{app.pitch}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Link 
                      to="/creator/campaigns"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-card hover:bg-surface-2 border border-border/40 text-foreground text-xs font-bold rounded-md transition-colors text-center shadow-xs"
                    >
                      <span>Back to Campaign Board</span>
                      <ChevronRightIcon className="h-3.5 w-3.5 stroke-[2.2]" />
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          disabled={withdrawMutation.isPending}
                          className="w-full py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors border border-rose-500/20 disabled:opacity-50"
                        >
                          Withdraw Pitch
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border/60">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-base font-bold text-foreground">
                            Withdraw Application?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-xs text-muted-foreground">
                            Are you sure you want to withdraw your application for &quot;{campaign.name}&quot;? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="text-xs h-9">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => app?.id && withdrawMutation.mutate(app.id)}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9"
                          >
                            Withdraw Pitch
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}

              {status === "invited" && (
                <div className="text-center py-3">
                  <div className="h-11 w-11 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto grid place-items-center mb-2.5">
                    <SparklesIcon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground">Direct Invitation!</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4 leading-relaxed">
                    {campaign.organization?.name} specifically picked you for this campaign based on your rate card and content.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => app?.id && declineInviteMutation.mutate(app.id)}
                      disabled={declineInviteMutation.isPending || acceptInviteMutation.isPending}
                      className="flex-1 py-2.5 bg-card hover:bg-surface-2 border border-border/40 text-foreground text-xs font-bold rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {declineInviteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Decline"}
                    </button>
                    <button
                      onClick={() => app?.id && acceptInviteMutation.mutate(app.id)}
                      disabled={declineInviteMutation.isPending || acceptInviteMutation.isPending}
                      className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-md transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {acceptInviteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Accept"}
                    </button>
                  </div>
                </div>
              )}

              {status === "selected" && (
                <div className="text-center py-3">
                  <div className="h-11 w-11 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto grid place-items-center mb-2.5">
                    <CheckBadgeIcon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground">Selected for Campaign!</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4 leading-relaxed">
                    You have been chosen for this campaign. Proceed to My Work to manage deadlines and deliverables.
                  </p>
                  <Link 
                    to="/creator/work"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-md transition-colors text-center shadow-xs"
                  >
                    <span>Open My Work</span>
                    <ChevronRightIcon className="h-3.5 w-3.5 stroke-[2.2]" />
                  </Link>
                </div>
              )}

              {status === "rejected" && (
                <div className="py-2 text-center">
                  <div className="h-10 w-10 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 mx-auto grid place-items-center mb-2">
                    <XCircleIcon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-foreground">Not Moved Forward</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-3 leading-relaxed">
                    The brand chose other profiles for this review cycle.
                  </p>

                  {/* Collapsible Prior Pitch History */}
                  {(eligibility?.previousPitch || app?.pitch) && (
                    <div className="text-left mb-3">
                      <button
                        type="button"
                        onClick={() => setShowPriorPitch(!showPriorPitch)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline py-1 transition-colors"
                      >
                        <span>{showPriorPitch ? "Hide" : "View"} previous pitch attempt</span>
                        {showPriorPitch ? <ChevronUpIcon className="h-3.5 w-3.5" /> : <ChevronDownIcon className="h-3.5 w-3.5" />}
                      </button>
                      {showPriorPitch && (
                        <div className="mt-1.5 p-3 bg-surface-2/60 border border-border/40 rounded-md text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                          {eligibility?.previousPitch || app?.pitch}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Eligibility Outcomes */}
                  {isEligibilityLoading ? (
                    <div className="flex items-center justify-center gap-1.5 py-3 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Checking eligibility...</span>
                    </div>
                  ) : eligibility?.eligible ? (
                    <div className="text-left space-y-3 pt-1 border-t border-border/40">
                      <div>
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Submit Revised Pitch
                        </label>
                        <textarea
                          rows={4}
                          value={reApplyPitch}
                          onChange={(e) => setReApplyPitch(e.target.value)}
                          placeholder="Explain your revised idea, creative direction, and what you will deliver..."
                          className="w-full p-3 bg-surface-2 dark:bg-surface border border-border/40 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={!reApplyPitch.trim() || reApplyMutation.isPending}
                        onClick={() => reApplyMutation.mutate(reApplyPitch.trim())}
                        className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-md transition-all shadow-xs hover:shadow-teal flex items-center justify-center gap-2"
                      >
                        {reApplyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Revised Pitch"}
                      </button>
                    </div>
                  ) : eligibility?.reason === "in_cooldown" && eligibility.canReApplyAt ? (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-xs text-amber-700 dark:text-amber-300 text-left mb-3">
                      <div className="font-bold mb-0.5 flex items-center gap-1.5">
                        <ClockIcon className="h-4 w-4 shrink-0" />
                        <span>Cooldown Active</span>
                      </div>
                      <p className="leading-relaxed text-[11px] mt-1">
                        Re-application opens on {new Date(eligibility.canReApplyAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}.
                      </p>
                    </div>
                  ) : eligibility?.reason === "blocked" ? (
                    <div className="p-3 bg-surface-2 border border-border/40 rounded-md text-xs text-muted-foreground text-left leading-relaxed mb-3">
                      Re-application is not available for this campaign run.
                    </div>
                  ) : (
                    <div className="p-3 bg-surface-2 border border-border/40 rounded-md text-xs text-muted-foreground text-left leading-relaxed mb-3">
                      Campaign intake has ended.
                    </div>
                  )}

                  <Link 
                    to="/creator/campaigns"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-card hover:bg-surface-2 border border-border/40 text-foreground text-xs font-bold rounded-md transition-colors text-center shadow-xs mt-2"
                  >
                    <span>Browse Other Briefs</span>
                    <ChevronRightIcon className="h-3.5 w-3.5 stroke-[2.2]" />
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
