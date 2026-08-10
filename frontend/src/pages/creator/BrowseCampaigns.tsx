import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { applicationsApi } from "@/api/applications";
import { Campaign } from "@/api/types";
import { PageHeader, StatusPill } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export const money = (amount: number, currency: string = "NGN") =>
  `${currency === "NGN" ? "₦" : "$"}${Number(amount || 0).toLocaleString()}`;

const BrowseCampaigns = () => {
  const queryClient = useQueryClient();
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [pitch, setPitch] = useState("");

  const { data: openCampaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  const applyMutation = useMutation({
    mutationFn: ({ campaignId, pitchText }: { campaignId: string; pitchText: string }) =>
      applicationsApi.apply(campaignId, { pitch: pitchText, source: "applied" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Application submitted directly to the brand!");
      setActiveCampaignId(null);
      setPitch("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit application");
    },
  });

  return (
    <div>
      <PageHeader title="Browse Open Briefs" subtitle="Discover active brand campaigns across Africa and apply with your custom angle." />
      {isLoading ? (
        <div className="p-12 text-center text-sm text-muted-foreground">Loading open campaigns from server...</div>
      ) : openCampaigns.length === 0 ? (
        <div className="cy-card p-12 text-center text-muted-foreground">No open campaigns at the moment. Check back soon!</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {openCampaigns.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              className="cy-card p-6 flex flex-col justify-between hover:shadow-elevated transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="cy-chip capitalize">{c.category}</span>
                  <StatusPill status={c.status} />
                </div>
                <Link to={`/creator/campaigns/${c.id}`} className="block mt-4 group">
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {c.name}
                  </h3>
                </Link>
                <div className="text-xs text-muted-foreground mt-1 font-medium">
                  Format: <span className="capitalize font-semibold text-foreground">{c.deliverableType}</span> • Location: {c.country}
                </div>
                <p className="text-sm text-muted-foreground mt-2.5 line-clamp-3 leading-relaxed">{c.brief}</p>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
                <div>
                  <div className="font-display font-extrabold text-base text-foreground">
                    {money(c.budgetPerCreator, c.currency)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">per approved deliverable</div>
                </div>

                <Dialog
                  open={activeCampaignId === c.id}
                  onOpenChange={(openState) => setActiveCampaignId(openState ? c.id : null)}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-5 shadow-sm">
                      Apply to Brief
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl border-0 shadow-elevated">
                    <DialogHeader>
                      <DialogTitle className="font-display text-xl font-bold">Apply to {c.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                      <p className="text-xs text-muted-foreground">
                        Tell the brand about your proposed creative hook, camera format, and audience alignment.
                      </p>
                      <Textarea
                        rows={5}
                        placeholder="Pitch your angle. How will you bring this brief to life for your audience?"
                        value={pitch}
                        onChange={(e) => setPitch(e.target.value)}
                        className="rounded-xl bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500 leading-relaxed"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        disabled={applyMutation.isPending || !pitch}
                        onClick={() => applyMutation.mutate({ campaignId: c.id, pitchText: pitch })}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-6 shadow-sm"
                      >
                        {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseCampaigns;
