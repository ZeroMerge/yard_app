import { useAuth, signOut } from "@/lib/auth";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import { AuditLog } from "@/api/types";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ArrowRightOnRectangleIcon as LogOut, ShieldExclamationIcon as ShieldAlert, ShieldCheckIcon as ShieldCheck, UserMinusIcon as UserX, CheckCircleIcon as CheckCircle, MagnifyingGlassIcon as Search } from '@heroicons/react/24/outline';
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Console = () => {
  const user = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);

  const { data: auditLogs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["audit-logs"],
    queryFn: adminApi.getAuditLogs,
  });

  const verifyMutation = useMutation({
    mutationFn: ({ creatorId, reasonText }: { creatorId: string; reasonText: string }) =>
      adminApi.verifyCreator(creatorId, { verified: true, reason: reasonText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      toast.success("Creator successfully verified with immutable audit log!");
      setVerifyOpen(false);
      setTargetId("");
      setReason("");
    },
    onError: (err: any) => toast.error(err.message || "Failed to verify creator"),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ userId, reasonText }: { userId: string; reasonText: string }) =>
      adminApi.suspendUser(userId, { suspended: true, reason: reasonText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      toast.success("User account suspended with audit event recorded!");
      setSuspendOpen(false);
      setTargetId("");
      setReason("");
    },
    onError: (err: any) => toast.error(err.message || "Failed to suspend user"),
  });

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-white dark:bg-background p-6 text-center">
        <div className="bg-card border border-border/60 rounded-md p-8 max-w-md shadow-2xs">
          <ShieldAlert className="h-10 w-10 mx-auto text-teal-600 dark:text-teal-400" />
          <h1 className="mt-4 font-display text-2xl font-bold">Restricted Area</h1>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">Please sign in with administrator credentials.</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link to="/login"><Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-semibold h-9 px-4 shadow-xs">Sign in</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <header className="bg-white dark:bg-card border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <Badge variant="outline" className="uppercase tracking-wider text-[10px] border-teal-500/30 text-teal-600 dark:text-teal-400 font-bold rounded-sm px-2 py-0.5">
              Founders & Admin Console
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground text-xs hidden md:inline font-mono">{user.email}</span>
            <Button size="sm" variant="ghost" onClick={async () => { await signOut(); navigate("/"); }} className="rounded-md h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <div className="md:border-t md:border-x md:border-b-0 md:rounded-t-md md:rounded-b-none md:bg-white md:dark:bg-card border-border/60 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="bg-card border border-border/60 rounded-md p-4 sm:p-5 shadow-2xs">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Audit Events</div>
              <div className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-foreground font-numeric">{auditLogs.length}</div>
            </div>
            <div className="bg-card border border-border/60 rounded-md p-4 sm:p-5 shadow-2xs">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Admin Session</div>
              <div className="mt-2 font-display text-base sm:text-lg font-bold text-teal-600 dark:text-teal-400">Authenticated</div>
            </div>
            <div className="bg-card border border-border/60 rounded-md p-4 sm:p-5 shadow-2xs">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Security Mode</div>
              <div className="mt-2 font-display text-base sm:text-lg font-bold text-foreground">Strict RBAC</div>
            </div>
            <div className="bg-card border border-border/60 rounded-md p-4 sm:p-5 shadow-2xs">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Traceability</div>
              <div className="mt-2 font-display text-base sm:text-lg font-bold text-teal-600 dark:text-teal-400">100% Immutable</div>
            </div>
          </div>

          {/* Admin Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              <h2 className="font-display font-bold text-lg text-foreground tracking-tight">System Audit & Governance</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Platform authority actions with append-only ledger verification.</p>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md px-3.5 h-9 text-xs shadow-xs">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Verify Creator
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-md border border-border/60 bg-card p-6 shadow-xl max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display font-bold text-base">Verify Creator Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <Input
                      placeholder="Creator UUID..."
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 text-xs sm:text-sm h-10"
                    />
                    <Input
                      placeholder="Audit reason / justification..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 text-xs sm:text-sm h-10"
                    />
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      disabled={verifyMutation.isPending || !targetId}
                      onClick={() => verifyMutation.mutate({ creatorId: targetId, reasonText: reason })}
                      className="bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-semibold h-9 px-4"
                    >
                      Confirm & Write Audit Event
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="rounded-md text-xs h-9 px-3 hover:bg-rose-500/10 hover:text-rose-600 font-semibold border border-border/40">
                    <UserX className="h-3.5 w-3.5 mr-1.5" /> Suspend User
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-md border border-border/60 bg-card p-6 shadow-xl max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display font-bold text-base text-rose-600">Suspend User Account</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <Input
                      placeholder="User UUID..."
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 text-xs sm:text-sm h-10"
                    />
                    <Input
                      placeholder="Suspension reason (e.g. Terms violation)..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 text-xs sm:text-sm h-10"
                    />
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      disabled={suspendMutation.isPending || !targetId}
                      onClick={() => suspendMutation.mutate({ userId: targetId, reasonText: reason })}
                      className="bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold h-9 px-4"
                    >
                      Confirm Suspension
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-md p-5 sm:p-6 shadow-2xs space-y-4">
            <div>
              <h3 className="font-display font-bold text-base text-foreground tracking-tight">System Audit Log Trail (/admin/audit-logs)</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Immutable record of governance decisions and security events.</p>
            </div>
            <div className="space-y-2">
              {isLoading ? (
                <div className="p-8 text-center text-xs sm:text-sm text-muted-foreground">Loading immutable audit trail...</div>
              ) : auditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs sm:text-sm text-muted-foreground">No audit logs recorded yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 sm:p-4 rounded-md bg-surface-2/40 border border-border/40 hover:bg-surface-2/70 hover:border-transparent transition-all duration-150 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-sm">
                          {log.action}
                        </span>
                        <span className="text-[11px] uppercase font-semibold text-muted-foreground font-mono">{log.targetType}</span>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-1 truncate">
                        Target: {log.targetId} • Actor: {log.actor?.email || log.actorId || "System"}
                      </div>
                      {log.metadata && (
                        <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                          {JSON.stringify(log.metadata)}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Console;
