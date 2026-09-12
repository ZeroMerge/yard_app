import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { activityApi } from "@/api/activity";
import { Campaign, CampaignActivity } from "@/api/types";
import { PageHeader, StatusPill, Empty } from "@/components/ui-bits";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Activity = () => {
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  const activeCampaignId = campaigns[0]?.id;

  const { data: activities = [], isLoading: loadingActivity } = useQuery<CampaignActivity[]>({
    queryKey: ["activity", activeCampaignId],
    queryFn: () => (activeCampaignId ? activityApi.getActivity(activeCampaignId) : Promise.resolve([])),
    enabled: !!activeCampaignId,
  });

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Campaign Activity Timeline"
        subtitle="Unified chronological event streams across your workspace campaigns."
      />

      <div className="bg-card border border-border/60 rounded-md overflow-hidden shadow-2xs">
        {loadingCampaigns || loadingActivity ? (
          <div className="p-12 text-center text-xs sm:text-sm text-muted-foreground">Loading activity stream...</div>
        ) : activities.length === 0 ? (
          <Empty title="No campaign activities recorded yet" hint="Activities record automatically as briefs are created, creators apply, and deliverables are submitted." />
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
                    <span className="rounded-sm px-2 py-0.5 text-[10px] font-mono font-semibold uppercase bg-surface-2 border border-border/40 text-muted-foreground">{a.eventType}</span>
                  </div>
                </div>
                {a.campaignId && (
                  <Link
                    to={`/brand/campaigns/${a.campaignId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline shrink-0 mt-0.5"
                  >
                    <span>View</span>
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
