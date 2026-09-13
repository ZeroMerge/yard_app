import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, AdminUserRecord } from "@/api/admin";
import { PageHeader, StatusPill } from "@/components/ui-bits";
import { formatDate } from "@/lib/utils";
import {
  MagnifyingGlassIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  NoSymbolIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type RoleFilter = "all" | "creator" | "brand" | "admin";
type StatusFilter = "all" | "active" | "suspended";

export const Users = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users", search, roleFilter, statusFilter],
    queryFn: () =>
      adminApi.getUsers({
        search: search || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ creatorId, verified }: { creatorId: string; verified: boolean }) =>
      adminApi.verifyCreator(creatorId, { verified, reason: "Admin directory toggle" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Creator verification state updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update verification"),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ userId, suspended }: { userId: string; suspended: boolean }) =>
      adminApi.suspendUser(userId, { suspended, reason: "Admin status toggle" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Account status updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update status"),
  });

  const roleTabs: { id: RoleFilter; label: string }[] = [
    { id: "all", label: "All Users" },
    { id: "creator", label: "Creators" },
    { id: "brand", label: "Brands" },
    { id: "admin", label: "Admins" },
  ];

  const statusTabs: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "suspended", label: "Suspended" },
  ];

  return (
    <div className="space-y-8 lg:space-y-10 pb-16 animate-in fade-in duration-300">
      {/* ── Editorial Header ── */}
      <PageHeader
        title="User Directory"
        subtitle="Manage creators, brand partners, and platform access privileges."
      />

      {/* ── Filter Controls ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-card border border-border/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-teal-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Role Filter Segmented Control */}
          <div className="flex items-center p-1 rounded-md bg-surface-2 border border-border/40 shadow-2xs overflow-x-auto">
            {roleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-sm transition-all duration-150 whitespace-nowrap",
                  roleFilter === tab.id
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Filter Segmented Control */}
          <div className="flex items-center p-1 rounded-md bg-surface-2 border border-border/40 shadow-2xs overflow-x-auto">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-semibold rounded-sm transition-all duration-150 whitespace-nowrap",
                  statusFilter === tab.id
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── User Cards List ── */}
      <div className="bg-card border border-border/60 rounded-md overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            No users match your current filters.
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {users.map((u) => {
              const isCreator = u.role === "creator";
              const isVerified = u.creator?.verified;
              const isSuspended = u.status === "suspended";
              const displayName =
                u.creator?.displayName || u.organization?.name || u.email.split("@")[0];

              return (
                <div
                  key={u.id}
                  className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-surface-2/40 transition-colors"
                >
                  {/* Left: User Identity */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-extrabold text-sm grid place-items-center shadow-xs ring-2 ring-border/40 shrink-0">
                      {displayName.charAt(0).toUpperCase()}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-base text-foreground leading-snug truncate">
                          {displayName}
                        </span>
                        {isCreator && isVerified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold uppercase tracking-wider">
                            <CheckBadgeIcon className="h-3 w-3 shrink-0" />
                            Verified
                          </span>
                        )}
                        <StatusPill status={u.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-mono text-[11px]">{u.email}</span>
                        <span>•</span>
                        <span className="capitalize font-semibold text-foreground/80">{u.role}</span>
                        {u.organization && (
                          <>
                            <span>•</span>
                            <span>Org: <strong className="text-foreground">{u.organization.name}</strong></span>
                          </>
                        )}
                        <span>•</span>
                        <span>Joined {formatDate(u.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 ml-14 lg:ml-0">
                    {isCreator && u.creator && (
                      <button
                        onClick={() =>
                          verifyMutation.mutate({
                            creatorId: u.creator!.id,
                            verified: !isVerified,
                          })
                        }
                        disabled={verifyMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border border-border/60 hover:bg-surface-2 transition-colors disabled:opacity-50"
                      >
                        <ShieldCheckIcon className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                        <span>{isVerified ? "Revoke Badge" : "Grant Verified"}</span>
                      </button>
                    )}

                    <button
                      onClick={() =>
                        suspendMutation.mutate({
                          userId: u.id,
                          suspended: !isSuspended,
                        })
                      }
                      disabled={suspendMutation.isPending}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors disabled:opacity-50",
                        isSuspended
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                      )}
                    >
                      {isSuspended ? (
                        <>
                          <ArrowPathIcon className="h-3.5 w-3.5" />
                          <span>Reinstate</span>
                        </>
                      ) : (
                        <>
                          <NoSymbolIcon className="h-3.5 w-3.5" />
                          <span>Suspend</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
