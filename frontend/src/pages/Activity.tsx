import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { activityApi } from "@/api/activity";
import { Campaign, CampaignActivity } from "@/api/types";
import { PageHeader, StatusPill, Empty } from "@/components/ui-bits";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

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
    <div>
      <PageHeader
        title="Campaign Activity Timeline"
        subtitle="Unified chronological event streams across your workspace campaigns."
      />

      <div className="cy-card overflow-hidden">
        {loadingCampaigns || loadingActivity ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading activity stream...</div>
        ) : activities.length === 0 ? (
          <Empty title="No campaign activities recorded yet" hint="Activities record automatically as briefs are created, creators apply, and deliverables are submitted." />
        ) : (
          <div className="divide-y divide-border">
            {activities.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.4) }}
                className="p-4 flex items-start gap-3 transition-colors hover:bg-muted"
              >
                <span className="mt-1.5 h-2 w-2 rounded-full shrink-0 bg-primary" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{a.body}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                    <span>{new Date(a.createdAt).toLocaleString()}</span>
                    <span className="cy-chip !py-0.5 !px-2 uppercase font-mono">{a.eventType}</span>
                  </div>
                </div>
                {a.campaignId && (
                  <Link to={`/brand/campaigns/${a.campaignId}`}>
                    <span className="text-xs text-primary hover:underline">View Campaign →</span>
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
