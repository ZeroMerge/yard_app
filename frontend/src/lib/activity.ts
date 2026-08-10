import { type ActivityKind, type DB, uid } from "./mockData";

export const pushActivity = (
  db: DB,
  args: {
    kind: ActivityKind;
    actorId: string;
    recipients: string[];
    campaignId?: string;
    message: string;
    link?: string;
  }
) => {
  db.activities.unshift({
    id: uid("act"),
    readBy: [],
    createdAt: new Date().toISOString(),
    ...args,
  });
};

export const formatRelative = (iso: string) => {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};
