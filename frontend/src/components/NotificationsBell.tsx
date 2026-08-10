import { Bell } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { Campaign } from "@/api/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "react-router-dom";

export const NotificationsBell = () => {
  const user = useAuth();
  if (!user) return null;

  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  const allActivities = campaigns.flatMap((c) => (c.activities || []).map((a) => ({ ...a, campaignName: c.name })));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative h-9 w-9 grid place-items-center rounded-md border border-border bg-card hover:bg-muted transition-colors"
        >
          <Bell className="h-4 w-4" />
          {allActivities.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground grid place-items-center">
              {allActivities.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="font-display font-semibold text-sm">Campaign Notifications</div>
        </div>
        <div className="max-h-[360px] overflow-y-auto">
          {allActivities.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">You're all caught up.</div>
          ) : (
            allActivities.slice(0, 15).map((a) => (
              <Link
                key={a.id}
                to={`/brand/campaigns/${a.campaignId}`}
                className="p-3 border-b border-border text-sm block hover:bg-muted transition-colors"
              >
                <div className="text-foreground text-xs font-medium">{a.body}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(a.createdAt).toLocaleTimeString()} • <span className="uppercase font-mono">{a.eventType}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
