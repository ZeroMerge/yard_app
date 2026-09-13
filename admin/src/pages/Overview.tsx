import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import { PageHeader, Stat } from "@/components/ui-bits";
import { money, formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

export const Overview = () => {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminApi.getStats,
  });

  const { data: auditLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: adminApi.getAuditLogs,
  });

  return (
    <div className="space-y-8 lg:space-y-10 pb-16 animate-in fade-in duration-300">
      {/* ── Editorial Header ── */}
      <PageHeader
        title="Platform Overview"
        subtitle="Global platform telemetry, user metrics, and transaction status."
      />

      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Stat
          label="Total Users"
          value={loadingStats ? "..." : stats?.users.total ?? 0}
          subtext={`${stats?.users.creators ?? 0} creators · ${stats?.users.brands ?? 0} brands`}
        />
        <Stat
          label="Verified Creators"
          value={loadingStats ? "..." : stats?.users.verifiedCreators ?? 0}
          tone="teal"
          subtext="Vetted with trust badge"
        />
        <Stat
          label="Campaigns"
          value={loadingStats ? "..." : stats?.campaigns.total ?? 0}
          subtext={`${stats?.campaigns.byStatus?.open ?? 0} open · ${stats?.campaigns.byStatus?.in_progress ?? 0} in progress`}
        />
        <Stat
          label="Settled Payouts"
          value={loadingStats ? "..." : money(stats?.payments.paidVolume ?? 0, "NGN")}
          tone="gold"
          subtext={`${stats?.payments.byStatus?.paid ?? 0} settled disbursements`}
        />
      </div>

      {/* ── Recent Activity Feed ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-display font-bold text-foreground">
              Recent Platform Activity
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live event trail of administrative actions and platform status changes.
            </p>
          </div>
          <Link
            to="/audit"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>View audit trail</span>
            <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </div>

        <div className="bg-card border border-border/60 rounded-md overflow-hidden shadow-2xs">
          {loadingLogs ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No recent activity recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {auditLogs.slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-2/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 shrink-0">
                      {log.action}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">
                        Target: <span className="font-bold">{log.targetType}</span>
                        {log.targetId && (
                          <span className="text-muted-foreground font-mono text-[11px] ml-1.5">
                            ({log.targetId.slice(0, 8)}…)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        Initiated by {log.actor?.email || log.actorId || "System"}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-muted-foreground shrink-0 sm:text-right">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
