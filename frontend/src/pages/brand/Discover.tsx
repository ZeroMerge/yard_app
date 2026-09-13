import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { creatorsApi } from "@/api/creators";
import { campaignsApi } from "@/api/campaigns";
import { applicationsApi } from "@/api/applications";
import { Creator, Campaign } from "@/api/types";
import { PageHeader } from "@/components/ui-bits";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect, useMemo } from "react";
import {
  MapPinIcon as MapPin,
  MagnifyingGlassIcon as Search,
  UserPlusIcon,
  XMarkIcon as X,
  LockClosedIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const money = (amount: number, currency: string = "NGN") =>
  `${currency === "NGN" ? "₦" : "$"}${Number(amount || 0).toLocaleString()}`;

const NICHES = ["all", "beauty", "fashion", "tech", "lifestyle", "food", "finance", "fitness"];

const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramCampaignId = searchParams.get("campaignId");

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [minFollowers, setMinFollowers] = useState("");

  const [selectedCreatorForInvite, setSelectedCreatorForInvite] = useState<Creator | null>(null);
  const [inviteCampaignId, setInviteCampaignId] = useState(paramCampaignId || "");
  const [invitePitch, setInvitePitch] = useState("");

  useEffect(() => {
    if (paramCampaignId) {
      setInviteCampaignId(paramCampaignId);
    }
  }, [paramCampaignId]);

  const { data: creators = [], isLoading } = useQuery<Creator[]>({
    queryKey: ["creators", category, minFollowers],
    queryFn: () => {
      const filters: any = {};
      if (category !== "all") filters.category = category;
      const numFollowers = parseInt(minFollowers, 10);
      if (!isNaN(numFollowers) && numFollowers > 0) {
        filters.minFollowers = numFollowers;
      }
      return creatorsApi.list(Object.keys(filters).length ? filters : undefined);
    },
  });

  const { data: brandCampaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["brand-campaigns-for-invite"],
    queryFn: campaignsApi.list,
  });

  const openCampaigns = useMemo(() => {
    return brandCampaigns.filter((c) => c.status === "open" && !c.isArchived);
  }, [brandCampaigns]);

  const activeTargetCampaign = useMemo(() => {
    if (!inviteCampaignId) return null;
    return brandCampaigns.find((c) => c.id === inviteCampaignId) || null;
  }, [brandCampaigns, inviteCampaignId]);

  const inviteMutation = useMutation({
    mutationFn: ({ campaignId, creatorId, pitch }: { campaignId: string; creatorId: string; pitch?: string }) =>
      applicationsApi.invite(campaignId, creatorId, pitch),
    onSuccess: () => {
      toast.success("Invitation sent! Creator will see it on their dashboard.");
      setSelectedCreatorForInvite(null);
      setInvitePitch("");
      setInviteCampaignId("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to send invitation");
    },
  });

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCampaignId) {
      toast.error("Please select a campaign to invite this creator to.");
      return;
    }
    if (!selectedCreatorForInvite) return;
    inviteMutation.mutate({
      campaignId: inviteCampaignId,
      creatorId: selectedCreatorForInvite.id,
      pitch: invitePitch.trim() || undefined,
    });
  };

  const filtered = creators.filter((c) => {
    if (q) {
      const match = `${c.displayName} ${c.bio || ""}`.toLowerCase().includes(q.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      <PageHeader title="Creator Discovery" subtitle="Discover verified creators with structured rate cards across Africa." />

      {activeTargetCampaign && (
        <div className="p-3.5 sm:p-4 rounded-md bg-teal-500/10 dark:bg-teal-950/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400 grid place-items-center shrink-0">
              <UserPlusIcon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground font-medium">Inviting creators directly to:</span>
                <span className="text-xs font-bold text-foreground">{activeTargetCampaign.name}</span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1",
                    activeTargetCampaign.isPrivate
                      ? "bg-purple-500/20 text-purple-700 dark:text-purple-300"
                      : "bg-teal-500/20 text-teal-700 dark:text-teal-300"
                  )}
                >
                  {activeTargetCampaign.isPrivate ? (
                    <>
                      <LockClosedIcon className="h-2.5 w-2.5 shrink-0" />
                      <span>Private</span>
                    </>
                  ) : (
                    <>
                      <GlobeAltIcon className="h-2.5 w-2.5 shrink-0" />
                      <span>Public</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Budget: {money(activeTargetCampaign.budgetPerCreator, activeTargetCampaign.currency)} per creator • {activeTargetCampaign.quantity} slots • Category: <span className="capitalize">{activeTargetCampaign.category}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to={`/brand/campaigns/${activeTargetCampaign.id}`}>
              <Button variant="outline" className="h-8 text-xs font-semibold rounded-md border-none bg-card hover:bg-surface-2 shadow-2xs">
                View Brief
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => {
                setInviteCampaignId("");
                setSearchParams({});
              }}
              className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-md px-2.5"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      <div className="p-3 sm:p-3.5 rounded-md bg-card border border-border/60 shadow-2xs grid sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-10 rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 focus-visible:ring-teal-500/20 text-xs sm:text-sm h-10"
            placeholder="Search by creator name, bio, or niche..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 focus:ring-teal-500/20 text-xs sm:text-sm h-10">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="rounded-md border-border/60">
            {NICHES.map((n) => (
              <SelectItem key={n} value={n} className="capitalize text-xs sm:text-sm">{n === "all" ? "All Categories" : n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div>
          <Input
            type="number"
            min="0"
            step="1000"
            className="rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 focus-visible:ring-teal-500/20 text-xs sm:text-sm h-10"
            placeholder="Min. Followers..."
            value={minFollowers}
            onChange={(e) => setMinFollowers(e.target.value)}
          />
        </div>
      </div>


      {isLoading ? (
        <div className="p-12 text-center text-xs sm:text-sm text-muted-foreground">Searching creators from backend...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((c, i) => {
            const loc = c.locations?.[0] ? `${c.locations[0].city || ""}, ${c.locations[0].country}` : "Lagos, Nigeria";
            const rate = c.rates?.[0] ? c.rates[0].amount : 180000;
            const primaryCategory = c.categories?.[0]?.category || "beauty";

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card hover:bg-surface-2/40 border border-border/60 hover:border-transparent rounded-md p-5 sm:p-6 transition-all duration-150 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-md bg-teal-600/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 grid place-items-center font-bold text-base shrink-0 shadow-2xs">
                      {c.displayName?.charAt(0) || "C"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm sm:text-base text-foreground truncate">{c.displayName}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-teal-600 dark:text-teal-400 shrink-0" /> {loc}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground mt-3.5 line-clamp-2 leading-relaxed">
                    {c.bio || "Creator profile verified on Yard network."}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    <span className="rounded-sm px-2 py-0.5 text-[11px] font-semibold bg-surface-2 border border-border/40 text-muted-foreground capitalize">{primaryCategory}</span>
                    <span className="rounded-sm px-2 py-0.5 text-[11px] font-semibold bg-surface-2 border border-border/40 text-muted-foreground font-numeric">{money(rate, "NGN")} / reel</span>
                    {(c as any).socialMetricSnapshots?.[0]?.followers && (
                      <span className="rounded-sm px-2 py-0.5 text-[11px] font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-numeric">
                        {Number((c as any).socialMetricSnapshots[0].followers).toLocaleString()} followers
                      </span>
                    )}
                  </div>
                </div>


                <div className="mt-5 pt-4 border-t border-border/40">
                  {c.stats && (
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium mb-3">
                      <span>{c.stats.campaignsCompleted} campaigns completed</span>
                      <span>{c.stats.revisionsRequested} revisions</span>
                    </div>
                  )}
                  <Button
                    onClick={() => {
                      setSelectedCreatorForInvite(c);
                      setInvitePitch("");
                      if (openCampaigns.length > 0 && !inviteCampaignId) {
                        setInviteCampaignId(openCampaigns[0].id);
                      }
                    }}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md h-9 text-xs shadow-xs"
                  >
                    Invite to Campaign
                  </Button>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="rounded-md border border-border/60 bg-card p-12 text-center text-xs sm:text-sm text-muted-foreground col-span-full">
              No creators found matching those filters.
            </div>
          )}
        </div>
      )}

      {/* Invite to Campaign Dialog */}
      <Dialog open={!!selectedCreatorForInvite} onOpenChange={(open) => !open && setSelectedCreatorForInvite(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border/60">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Invite {selectedCreatorForInvite?.displayName} to Campaign
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Send a direct campaign collaboration offer. The creator will be notified and can accept immediately.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendInvite} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Target Campaign Brief
              </label>
              {openCampaigns.length > 0 ? (
                <Select value={inviteCampaignId} onValueChange={setInviteCampaignId}>
                  <SelectTrigger className="w-full h-10 rounded-md bg-surface-2/60 border-border/40 text-xs font-semibold">
                    <SelectValue placeholder="Select an open campaign" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-border/60">
                    {openCampaigns.map((camp) => (
                      <SelectItem key={camp.id} value={camp.id} className="text-xs">
                        {camp.name} ({camp.currency === 'NGN' ? '₦' : '$'}{Number(camp.budgetPerCreator).toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-amber-500/10 rounded-md text-xs text-amber-700 dark:text-amber-300">
                  You do not have any open campaigns. Please create and publish a campaign first.
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Personalized Note / Pitch (Optional)
              </label>
              <textarea
                rows={3}
                value={invitePitch}
                onChange={(e) => setInvitePitch(e.target.value)}
                placeholder="Hi! We loved your recent videos and would love to collaborate on this brief..."
                className="w-full p-2.5 bg-surface-2/60 border border-border/40 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none text-foreground"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedCreatorForInvite(null)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={inviteMutation.isPending || !inviteCampaignId || openCampaigns.length === 0}
                className="h-9 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                {inviteMutation.isPending ? "Sending Invitation..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Discover;
