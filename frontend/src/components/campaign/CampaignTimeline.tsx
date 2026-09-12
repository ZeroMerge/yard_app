import { useQuery } from "@tanstack/react-query";
import { activityApi } from "@/api/activity";
import { CampaignActivity } from "@/api/types";
import { motion } from "framer-motion";
import { CheckIcon as Check, ArrowPathIcon as Circle, DocumentTextIcon as FileText, UserPlusIcon as UserCheck, ArrowUpTrayIcon as Upload, ArrowPathIcon as RefreshCw, WalletIcon as Wallet, SparklesIcon as Sparkles } from '@heroicons/react/24/outline';

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
    <div className="bg-card border border-border/60 rounded-md shadow-2xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-border/40">
        <h3 className="font-display font-bold text-base text-foreground tracking-tight">Campaign Timeline</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Every milestone, approval, revision, and payout recorded in order.</p>
      </div>
      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="text-center text-xs sm:text-sm text-muted-foreground py-6">Loading timeline...</div>
        ) : activities.length === 0 ? (
          <div className="text-center text-xs sm:text-sm text-muted-foreground py-6">No events recorded yet.</div>
        ) : (
          <ol className="relative border-l border-border/40 ml-3 space-y-5">
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
                  <span className="absolute -left-3 h-6 w-6 rounded-full grid place-items-center ring-4 ring-background bg-teal-600/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    <Icon className="h-3 w-3" />
                  </span>
                  <div className="text-xs sm:text-sm font-medium text-foreground">{e.body}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
                    <span className="font-mono">{new Date(e.createdAt).toLocaleString()}</span>
                    <span>·</span>
                    <span className="rounded-sm px-1.5 py-0.5 uppercase font-mono text-[10px] bg-surface-2 border border-border/40">{e.eventType}</span>
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
