import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

export const PageHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
  >
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
    </div>
    {action}
  </motion.div>
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
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -2 }}
    className="cy-card p-6 flex flex-col gap-1.5 transition-all hover:shadow-elevated"
  >
    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    <span className={cn("font-display text-2xl md:text-3xl font-extrabold", tone === "gold" && "cy-gradient-text")}>
      {value}
    </span>
    {hint && <span className="text-xs text-muted-foreground/80 mt-0.5">{hint}</span>}
  </motion.div>
);

export const StatusPill = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    open: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    accepted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    completed: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    draft: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    requested: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    submitted: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    review: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    revision: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    revision_requested: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    payment_initiated: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    creator_payout_pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    failed: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    cancelled: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize tracking-wide", map[status] ?? map.draft)}>
      {status.replace(/_/g, " ")}
    </span>
  );
};

export const Empty = ({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) => (
  <div className="cy-card p-12 text-center">
    <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
    {hint && <p className="text-muted-foreground text-sm mt-1.5 max-w-md mx-auto">{hint}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
