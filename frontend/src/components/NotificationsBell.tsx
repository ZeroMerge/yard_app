import { BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { Campaign } from "@/api/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

function timeAgo(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const secs = Math.floor((now - then) / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const Avatar = ({ name, className }: { name: string; className?: string }) => (
  <div
    className={cn(
      "h-8 w-8 shrink-0 rounded-full grid place-items-center text-[10px] font-bold bg-primary/10 text-primary",
      className,
    )}
  >
    {initials(name)}
  </div>
);

const NotifRow = ({
  body,
  name,
  createdAt,
  campaignId,
  onNavigate,
}: {
  body: string;
  name: string;
  eventType: string;
  createdAt: string;
  campaignId: string;
  onNavigate: () => void;
}) => (
  <Link
    to={`/brand/campaigns/${campaignId}`}
    onClick={onNavigate}
    className="flex items-start gap-3 px-4 py-3 hover:bg-surface-2 transition-colors border-b border-border/30 last:border-0"
  >
    <Avatar name={name} />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-foreground leading-snug line-clamp-2">{body}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(createdAt)}</p>
    </div>
  </Link>
);

export const NotificationsBell = () => {
  const user = useAuth();
  const [open, setOpen] = useState(false);

  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
    enabled: !!user,
  });

  if (!user) return null;

  const allActivities = campaigns.flatMap((c) =>
    (c.activities || []).map((a) => ({ ...a, campaignName: c.name })),
  );

  const unread = allActivities.length;
  const preview = allActivities.slice(0, 8);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative h-10 w-10 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <BellIcon className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-teal-600 text-[9px] font-bold text-white grid place-items-center leading-none ring-2 ring-background">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 rounded-md shadow-elevated border-border/40 overflow-hidden bg-card/95 backdrop-blur-xl z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-surface-2/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">Notifications</span>
            {unread > 0 && (
              <span className="h-4 px-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold grid place-items-center">
                {unread}
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">Realtime pulse</span>
        </div>

        {/* Scrollable list */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-border/20">
          {allActivities.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              You're all caught up! No unread notifications.
            </div>
          ) : (
            preview.map((a) => (
              <NotifRow
                key={a.id}
                body={a.body}
                name={a.campaignName ?? "Campaign"}
                eventType={a.eventType}
                createdAt={a.createdAt}
                campaignId={a.campaignId}
                onNavigate={() => setOpen(false)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {allActivities.length > 0 && (
          <div className="border-t border-border/40 p-2.5 bg-surface-2/30 text-center">
            <button
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-primary hover:underline"
            >
              Mark all as read
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
