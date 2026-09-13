import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import { PageHeader } from "@/components/ui-bits";
import { formatDate } from "@/lib/utils";
import {
  MagnifyingGlassIcon,
  DocumentMagnifyingGlassIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

export const Audit = () => {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: adminApi.getAuditLogs,
  });

  const actions = Array.from(new Set(auditLogs.map((l) => l.action)));

  const filtered = auditLogs.filter((l) => {
    if (actionFilter !== "all" && l.action !== actionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchActor = (l.actor?.email || l.actorId || "").toLowerCase().includes(q);
      const matchTarget =
        (l.targetId || "").toLowerCase().includes(q) ||
        (l.targetType || "").toLowerCase().includes(q);
      const matchAction = l.action.toLowerCase().includes(q);
      if (!matchActor && !matchTarget && !matchAction) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 lg:space-y-10 pb-16 animate-in fade-in duration-300">
      {/* ── Editorial Header ── */}
      <PageHeader
        title="Audit Log"
        subtitle="Append-only chronological record of administrative actions, payouts, and platform mutations."
      />

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by action, actor, or target…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-card border border-border/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-teal-500 shadow-2xs"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-md bg-card border border-border/60 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-teal-500 shadow-2xs"
        >
          <option value="all">All Action Types ({actions.length})</option>
          {actions.map((act) => (
            <option key={act} value={act}>
              {act}
            </option>
          ))}
        </select>
      </div>

      {/* ── Audit Events List ── */}
      <div className="bg-card border border-border/60 rounded-md overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="py-24 flex items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card p-10 sm:p-14 text-center">
            <div className="h-11 w-11 rounded-md bg-surface-2 text-muted-foreground mx-auto grid place-items-center mb-3">
              <DocumentMagnifyingGlassIcon className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-base text-foreground">
              No audit records found
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              No audit events matched your search filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filtered.map((log) => (
              <div
                key={log.id}
                className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-surface-2/40 transition-colors"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                      {log.action}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Target: <strong className="text-foreground">{log.targetType}</strong>
                      {log.targetId && (
                        <span className="font-mono text-[11px] ml-1 opacity-70">
                          ({log.targetId.slice(0, 8)}…)
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Actor: <span className="font-medium text-foreground">{log.actor?.email || log.actorId || "System"}</span>
                  </div>

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="pt-1">
                      <div className="text-[11px] font-mono text-muted-foreground bg-surface-2/70 px-3 py-1.5 rounded-md inline-block max-w-xl truncate">
                        {JSON.stringify(log.metadata)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-xs font-mono text-muted-foreground shrink-0 flex items-center gap-1.5 sm:text-right">
                  <ClockIcon className="h-3.5 w-3.5" />
                  <span>{formatDate(log.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
