import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { campaignsApi } from "@/api/campaigns";
import { activityApi } from "@/api/activity";
import { Campaign, CampaignActivity } from "@/api/types";
import { PageHeader, Empty } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ChatBubbleLeftIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

const Activity = () => {
  const user = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [commentText, setCommentText] = useState("");

  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  const paramCampaignId = searchParams.get("campaignId");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");

  useEffect(() => {
    if (paramCampaignId) {
      setSelectedCampaignId(paramCampaignId);
    } else if (campaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [paramCampaignId, campaigns]);

  const handleCampaignChange = (newId: string) => {
    setSelectedCampaignId(newId);
    setSearchParams({ campaignId: newId });
  };

  const { data: activities = [], isLoading: loadingActivity } = useQuery<CampaignActivity[]>({
    queryKey: ["activity", selectedCampaignId],
    queryFn: () => (selectedCampaignId ? activityApi.getActivity(selectedCampaignId) : Promise.resolve([])),
    enabled: !!selectedCampaignId,
    refetchInterval: 5000,
  });

  const commentMutation = useMutation({
    mutationFn: ({ campaignId, text }: { campaignId: string; text: string }) =>
      activityApi.postComment(campaignId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity", selectedCampaignId] });
      setCommentText("");
      toast.success("Comment added to campaign timeline!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to post comment");
    },
  });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = commentText.trim();
    if (!cleanText) return;
    if (!selectedCampaignId) {
      toast.error("Please select a campaign first.");
      return;
    }
    commentMutation.mutate({ campaignId: selectedCampaignId, text: cleanText });
  };

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId);
  const viewRouteBase = user?.role === "creator" ? "/creator/campaigns" : "/brand/campaigns";

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Campaign Activity Timeline"
          subtitle="Real-time chronological events, comments, and milestones across your workspace."
        />

        {campaigns.length > 0 && (
          <div className="w-full sm:w-72 shrink-0">
            <Select value={selectedCampaignId} onValueChange={handleCampaignChange}>
              <SelectTrigger className="h-10 rounded-md bg-card border-border/60 text-xs font-semibold">
                <SelectValue placeholder="Select a campaign" />
              </SelectTrigger>
              <SelectContent className="rounded-md border-border/60">
                {campaigns.map((camp) => (
                  <SelectItem key={camp.id} value={camp.id} className="text-xs">
                    {camp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {selectedCampaignId && (
        <form onSubmit={handlePostComment} className="bg-card border border-border/60 rounded-md p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <ChatBubbleLeftIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-bold text-foreground">
              Post update or comment to {activeCampaign?.name || "campaign"}
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Leave a message, note, or update for the team..."
              className="h-10 text-xs bg-surface-2/60 border-border/40 focus-visible:ring-teal-500/20"
            />
            <Button
              type="submit"
              disabled={commentMutation.isPending || !commentText.trim()}
              className="h-10 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-md shrink-0 shadow-xs disabled:opacity-50"
            >
              {commentMutation.isPending ? "Posting..." : (
                <span className="flex items-center gap-1.5">
                  <span>Post</span>
                  <PaperAirplaneIcon className="h-3.5 w-3.5" />
                </span>
              )}
            </Button>
          </div>
        </form>
      )}

      <div className="bg-card border border-border/60 rounded-md overflow-hidden shadow-2xs">
        {loadingCampaigns || loadingActivity ? (
          <div className="p-12 text-center text-xs sm:text-sm text-muted-foreground">
            Loading activity stream...
          </div>
        ) : activities.length === 0 ? (
          <Empty
            title="No campaign activities recorded yet"
            hint="Activities record automatically as briefs are created, creators apply, and deliverables are submitted."
          />
        ) : (
          <div>
            {activities.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.4) }}
                className="p-3.5 sm:p-4 flex items-start gap-3 transition-all duration-150 hover:bg-surface-2/60 border-b border-border/30 last:border-0"
              >
                <span className="mt-1.5 h-2 w-2 rounded-full shrink-0 bg-teal-500 ring-4 ring-teal-500/10" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">{a.body}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
                    <span className="font-mono">{new Date(a.createdAt).toLocaleString()}</span>
                    <span className="rounded-sm px-2 py-0.5 text-[10px] font-mono font-semibold uppercase bg-surface-2 border border-border/40 text-muted-foreground">
                      {a.eventType}
                    </span>
                    {a.actor?.email && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        by {a.actor.email}
                      </span>
                    )}
                  </div>
                </div>
                {a.campaignId && (
                  <Link
                    to={`${viewRouteBase}/${a.campaignId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline shrink-0 mt-0.5"
                  >
                    <span>View Campaign</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;
