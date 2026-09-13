import React from "react";
import { cn } from "@/lib/utils";

export const PageHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/40 dark:border-border/30">
    <div>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-foreground tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
          {subtitle}
        </p>
      )}
    </div>
    {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
  </div>
);

export const Stat = ({
  label,
  value,
  tone = "default",
  subtext,
}: {
  label: string;
  value: string | number;
  tone?: "default" | "teal" | "gold" | "rose";
  subtext?: string;
}) => {
  return (
    <div className="bg-card hover:bg-surface-2/40 border border-border/60 hover:border-border p-5 sm:p-6 rounded-md shadow-2xs transition-all duration-150 flex flex-col justify-between">
      <div className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div
        className={cn(
          "text-2xl sm:text-3xl font-display font-extrabold tracking-tight mt-2 mb-1",
          tone === "teal" && "text-teal-600 dark:text-teal-400",
          tone === "gold" && "text-amber-600 dark:text-amber-400",
          tone === "rose" && "text-rose-600 dark:text-rose-400",
          tone === "default" && "text-foreground"
        )}
      >
        {value}
      </div>
      {subtext && <div className="text-xs text-muted-foreground">{subtext}</div>}
    </div>
  );
};

export const StatusPill = ({ status }: { status: string }) => {
  const getStyle = () => {
    switch (status) {
      case "open":
      case "active":
      case "approved":
      case "completed":
      case "paid":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "in_progress":
      case "submitted":
      case "creator_payout_pending":
        return "bg-teal-500/10 text-teal-600 dark:text-teal-400";
      case "review":
      case "revision_requested":
      case "payment_initiated":
      case "invited":
      case "pending":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "applied":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "cancelled":
      case "rejected":
      case "suspended":
      case "failed":
      case "declined":
      case "not_accepted":
      case "revision":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
      case "draft":
      case "closed":
      case "archived":
      default:
        return "bg-surface-2 text-muted-foreground";
    }
  };

  const getLabel = () => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "creator_payout_pending":
        return "Payout Pending";
      case "payment_initiated":
        return "Payment Initiated";
      case "revision_requested":
        return "Revision Requested";
      default:
        return status.replace(/_/g, " ");
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider shrink-0",
        getStyle()
      )}
    >
      {getLabel()}
    </span>
  );
};

export const Empty = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <div className="bg-card border border-border/60 rounded-md p-10 sm:p-14 text-center shadow-2xs space-y-3">
    <h3 className="font-display font-bold text-base text-foreground">{title}</h3>
    {description && (
      <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
    )}
    {action && <div className="pt-2">{action}</div>}
  </div>
);
