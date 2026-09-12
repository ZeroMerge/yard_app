import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export const PageHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
    <div>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const Stat = ({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "gold";
}) => (
  <div className="bg-card hover:bg-surface-2/40 border border-border/60 hover:border-transparent p-4 sm:p-5 lg:p-6 rounded-md shadow-none transition-all duration-150 relative overflow-hidden flex flex-col justify-between h-full group">
    <div>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className={cn("font-geist-mono font-bold text-2xl sm:text-3xl text-foreground tracking-tight mt-1.5", tone === "gold" && "cy-gradient-text")}>
        {value}
      </div>
    </div>
    {hint && <span className="text-[11px] text-muted-foreground/80 mt-2 block font-normal">{hint}</span>}
  </div>
);

export const StatusPill = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    open: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20",
    approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    accepted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    completed: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20",
    draft: "bg-surface-2 text-muted-foreground border border-border/40",
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    requested: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    submitted: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    review: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    revision: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    revision_requested: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    payment_initiated: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    creator_payout_pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    failed: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    cancelled: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20",
  };
  return (
    <span className={cn("inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold capitalize tracking-wide transition-all", map[status] ?? map.draft)}>
      {status.replace(/_/g, " ")}
    </span>
  );
};

export const Empty = ({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) => (
  <div className="bg-card border border-border/60 rounded-md p-10 sm:p-14 text-center shadow-none">
    <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
    {hint && <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 max-w-md mx-auto">{hint}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
