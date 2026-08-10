import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { deliverablesApi } from "@/api/deliverables";
import { Campaign } from "@/api/types";
import { PageHeader, StatusPill, Empty } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Upload, Film } from "lucide-react";
import { motion } from "framer-motion";

export const money = (amount: number, currency: string = "NGN") =>
  `${currency === "NGN" ? "₦" : "$"}${Number(amount || 0).toLocaleString()}`;

const Submissions = () => {
  const queryClient = useQueryClient();
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [providerUrl, setProviderUrl] = useState("");
  const [notes, setNotes] = useState("");

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  const submitDeliverableMutation = useMutation({
    mutationFn: ({ appId, fileUrl }: { appId: string; fileUrl: string }) => {
      const providerFileId = `gdrive_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      return deliverablesApi.submit(appId, {
        provider: "google_drive",
        providerFileId,
        providerUrl: fileUrl,
        fileType: "video/mp4",
        fileSize: 15728640,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Deliverable submitted for brand review!");
      setActiveAppId(null);
      setProviderUrl("");
      setNotes("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit deliverable");
    },
  });

  const activeCampaigns = campaigns.filter(
    (c) => c.applications && c.applications.some((a) => a.status === "accepted" || a.status === "pending")
  );

  return (
    <div>
      <PageHeader
        title="Deliverable Submissions"
        subtitle="Upload content for brand review, address revision notes, and track automated payouts."
      />

      {isLoading ? (
        <div className="p-12 text-center text-sm text-muted-foreground">Loading active campaigns...</div>
      ) : activeCampaigns.length === 0 ? (
        <Empty
          title="No active campaign applications yet"
          hint="Browse open campaigns, apply to briefs, and once accepted your deliverable upload slots will appear here."
        />
      ) : (
        <div className="space-y-6">
          {activeCampaigns.map((camp) => {
            const acceptedApp = camp.applications?.find((a) => a.status === "accepted");
            const pendingApp = camp.applications?.find((a) => a.status === "pending");
            const app = acceptedApp || pendingApp;
            const deliverables = camp.deliverables || [];

            return (
              <motion.div key={camp.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="cy-card p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-border/30">
                  <div>
                    <div className="font-display font-bold text-lg text-foreground">{camp.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Format: <span className="capitalize font-semibold text-foreground">{camp.deliverableType}</span> • Payout: {money(camp.budgetPerCreator, camp.currency)}
                    </div>
                  </div>

                  {acceptedApp && (
                    <Dialog
                      open={activeAppId === acceptedApp.id}
                      onOpenChange={(openState) => setActiveAppId(openState ? acceptedApp.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-5 shadow-sm">
                          <Upload className="h-4 w-4 mr-1.5" /> Submit Deliverable
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-2xl border-0 shadow-elevated">
                        <DialogHeader>
                          <DialogTitle className="font-display font-bold text-xl">Submit Content for {camp.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 py-2">
                          <Input
                            placeholder="Video / Deliverable Media URL (Google Drive / Cloudinary)"
                            value={providerUrl}
                            onChange={(e) => setProviderUrl(e.target.value)}
                            className="rounded-xl h-11 bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500"
                            required
                          />
                          <Textarea
                            rows={3}
                            placeholder="Creator notes or submission details..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="rounded-xl bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500 leading-relaxed"
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            disabled={submitDeliverableMutation.isPending || !providerUrl}
                            onClick={() => submitDeliverableMutation.mutate({ appId: acceptedApp.id, fileUrl: providerUrl })}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-6 shadow-sm"
                          >
                            {submitDeliverableMutation.isPending ? "Submitting..." : "Submit to Brand"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {!acceptedApp && pendingApp && (
                    <span className="text-xs px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full font-semibold">
                      Application Pending Review
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {deliverables.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">No deliverables submitted for this campaign yet.</div>
                  ) : (
                    deliverables.map((d) => (
                      <div key={d.id} className="cy-row flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-foreground">Deliverable v{d.version}</div>
                          {d.revisionNotes && (
                            <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold">
                              Brand Revision Notes: "{d.revisionNotes}"
                            </div>
                          )}
                          {d.file?.providerUrl && (
                            <a
                              href={d.file.providerUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-teal-600 dark:text-teal-400 inline-flex items-center gap-1 hover:underline mt-1 font-medium"
                            >
                              <ExternalLink className="h-3 w-3" /> View Submitted Content
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <StatusPill status={d.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Submissions;
