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
import { LogOut, ShieldAlert, ShieldCheck, UserX, CheckCircle, Search } from "lucide-react";
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
      <div className="min-h-screen grid place-items-center bg-surface p-6 text-center">
        <div className="cy-card p-8 max-w-md shadow-sm">
          <ShieldAlert className="h-10 w-10 mx-auto text-teal-600 dark:text-teal-400" />
          <h1 className="mt-4 font-display text-2xl font-bold">Restricted Area</h1>
          <p className="mt-2 text-sm text-muted-foreground">Please sign in with administrator credentials.</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link to="/login"><Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl">Sign in</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-background">
      <header className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <Badge variant="outline" className="uppercase tracking-wider text-[10px] border-teal-500/30 text-teal-600 dark:text-teal-400 font-bold">
              Founders & Admin Console
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground text-xs hidden md:inline font-medium">{user.email}</span>
            <Button size="sm" variant="ghost" onClick={async () => { await signOut(); navigate("/"); }} className="rounded-xl">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="cy-card p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Immutable Audit Events</div>
            <div className="mt-2 font-display text-3xl font-extrabold text-foreground">{auditLogs.length}</div>
          </div>
          <div className="cy-card p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Admin Session</div>
            <div className="mt-2 font-display text-lg font-bold text-teal-600 dark:text-teal-400">Authenticated</div>
          </div>
          <div className="cy-card p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Security Mode</div>
            <div className="mt-2 font-display text-lg font-bold text-foreground">JWT / Strict RBAC</div>
          </div>
          <div className="cy-card p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Traceability</div>
            <div className="mt-2 font-display text-lg font-bold text-teal-600 dark:text-teal-400">100% Immutable</div>
          </div>
        </div>

        {/* Admin Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 className="font-display font-bold text-xl">System Audit & Governance</h2>
          <div className="flex gap-2">
            <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-4 shadow-sm text-xs">
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Verify Creator
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl border-0 shadow-elevated">
                <DialogHeader>
                  <DialogTitle className="font-display font-bold">Verify Creator Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <Input
                    placeholder="Creator UUID..."
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="rounded-xl bg-surface-2 dark:bg-surface border-0"
                  />
                  <Input
                    placeholder="Audit reason / justification..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="rounded-xl bg-surface-2 dark:bg-surface border-0"
                  />
                </div>
                <DialogFooter>
                  <Button
                    disabled={verifyMutation.isPending || !targetId}
                    onClick={() => verifyMutation.mutate({ creatorId: targetId, reasonText: reason })}
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
                  >
                    Confirm & Write Audit Event
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="rounded-xl text-xs hover:bg-rose-500/10 hover:text-rose-600 font-semibold">
                  <UserX className="h-3.5 w-3.5 mr-1.5" /> Suspend User
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl border-0 shadow-elevated">
                <DialogHeader>
                  <DialogTitle className="font-display font-bold text-rose-600">Suspend User Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <Input
                    placeholder="User UUID..."
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="rounded-xl bg-surface-2 dark:bg-surface border-0"
                  />
                  <Input
                    placeholder="Suspension reason (e.g. Terms violation)..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="rounded-xl bg-surface-2 dark:bg-surface border-0"
                  />
                </div>
                <DialogFooter>
                  <Button
                    disabled={suspendMutation.isPending || !targetId}
                    onClick={() => suspendMutation.mutate({ userId: targetId, reasonText: reason })}
                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
                  >
                    Confirm Suspension
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="cy-card p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-display font-bold text-lg">System Audit Log Trail (/admin/audit-logs)</h3>
          </div>
          <div className="space-y-2">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading immutable audit trail...</div>
            ) : auditLogs.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No audit logs recorded yet.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="cy-row flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-lg">
                        {log.action}
                      </span>
                      <span className="text-xs uppercase font-semibold text-muted-foreground">{log.targetType}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-1 truncate">
                      Target: {log.targetId} • Actor: {log.actor?.email || log.actorId || "System"}
                    </div>
                    {log.metadata && (
                      <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                        {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Console;
