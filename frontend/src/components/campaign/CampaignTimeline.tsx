import { useQuery } from "@tanstack/react-query";
import { activityApi } from "@/api/activity";
import { CampaignActivity } from "@/api/types";
import { motion } from "framer-motion";
import { Check, Circle, FileText, UserCheck, Upload, RefreshCw, Wallet, Sparkles } from "lucide-react";

interface Props {
  campaignId: string;
}

const ICON: Record<string, any> = {
  campaign_created: FileText,
  campaign_published: Sparkles,
  application_submitted: UserCheck,
  creator_accepted: Check,
  deliverable_submitted: Upload,
  deliverable_approved: Check,
  revision_requested: RefreshCw,
  payment_completed: Wallet,
};

export const CampaignTimeline = ({ campaignId }: Props) => {
  const { data: activities = [], isLoading } = useQuery<CampaignActivity[]>({
    queryKey: ["activity", campaignId],
    queryFn: () => activityApi.getActivity(campaignId),
    enabled: !!campaignId,
  });

  return (
    <div className="cy-card">
      <div className="p-4 border-b border-border">
        <h3 className="font-display font-semibold">Campaign Timeline</h3>
        <p className="text-xs text-muted-foreground">Every milestone, approval, revision, and payout recorded in order.</p>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground py-6">Loading timeline...</div>
        ) : activities.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-6">No events recorded yet.</div>
        ) : (
          <ol className="relative border-l border-border ml-3 space-y-5">
            {activities.map((e, i) => {
              const Icon = ICON[e.eventType] ?? Circle;
              return (
                <motion.li
                  key={e.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="ml-6"
                >
                  <span className="absolute -left-3 h-6 w-6 rounded-full grid place-items-center ring-4 ring-background bg-secondary text-primary">
                    <Icon className="h-3 w-3" />
                  </span>
                  <div className="text-sm font-medium">{e.body}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {new Date(e.createdAt).toLocaleString()} · <span className="uppercase font-mono">{e.eventType}</span>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
};
