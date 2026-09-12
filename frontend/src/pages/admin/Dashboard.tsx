import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import { campaignsApi } from "@/api/campaigns";
import { AuditLog, Campaign } from "@/api/types";
import { PageHeader, Stat, StatusPill } from "@/components/ui-bits";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const money = (amount: number, currency: string = "NGN") =>
  `${currency === "NGN" ? "₦" : "$"}${Number(amount || 0).toLocaleString()}`;

const AdminDashboard = () => {
  const { data: auditLogs = [], isLoading: loadingLogs } = useQuery<AuditLog[]>({
    queryKey: ["audit-logs"],
    queryFn: adminApi.getAuditLogs,
  });

  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Admin Overview & System Audit"
        subtitle="Platform audit logs, campaign state machines, and system observability."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        <Stat label="Total Campaigns" value={campaigns.length} />
        <Stat label="Audit Log Events" value={auditLogs.length} tone="gold" />
        <Stat label="Active State" value={campaigns.filter((c) => c.status === "open" || c.status === "in_progress").length} />
        <Stat label="Traceability Mode" value="Immutable" />
      </div>

      <Tabs defaultValue="audit" className="w-full">
        <TabsList className="mb-6 bg-surface-2 dark:bg-surface p-1 rounded-md border border-border/40 shadow-2xs h-auto flex flex-wrap gap-1">
          <TabsTrigger value="audit" className="rounded-sm px-3.5 py-1.5 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">
            Audit Logs ({auditLogs.length})
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="rounded-sm px-3.5 py-1.5 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">
            Campaigns ({campaigns.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-sm px-3.5 py-1.5 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">
            Manual Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit">
          <div className="bg-card border border-border/60 rounded-md overflow-hidden shadow-2xs">
            <div className="max-h-[480px] overflow-auto">
              {loadingLogs ? (
                <div className="p-12 text-center text-xs sm:text-sm text-muted-foreground">Loading audit log stream...</div>
              ) : auditLogs.length === 0 ? (
                <div className="p-12 text-center text-xs sm:text-sm text-muted-foreground">No audit logs recorded.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs sm:text-sm hover:bg-surface-2/60 transition-all border-b border-border/30 last:border-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-semibold px-2 py-0.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 rounded-sm">
                          {log.action}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">Target: <span className="text-foreground font-medium">{log.targetType}</span> ({log.targetId})</div>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground shrink-0">
                      {log.actor?.email || log.actorId || "System"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <div className="bg-card border border-border/60 rounded-md overflow-hidden shadow-2xs">
            <div className="max-h-[480px] overflow-auto">
              {loadingCampaigns ? (
                <div className="p-12 text-center text-xs sm:text-sm text-muted-foreground">Loading campaigns...</div>
              ) : (
                campaigns.map((c) => (
                  <div key={c.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-surface-2/60 transition-all border-b border-border/30 last:border-0">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-foreground truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground capitalize mt-0.5">{c.category} • {c.country}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold font-numeric text-foreground">{money(c.budgetPerCreator, c.currency)}</span>
                      <StatusPill status={c.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="bg-card border border-border/60 rounded-md p-8 sm:p-10 text-center text-xs sm:text-sm text-muted-foreground shadow-2xs space-y-3">
            <h3 className="font-display font-bold text-base text-foreground">Manual Payments Queue</h3>
            <p className="max-w-md mx-auto text-xs sm:text-sm leading-relaxed">
              View payouts that need to be manually fulfilled via direct bank transfer and upload transaction receipts.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="rounded-sm px-3 py-1 bg-surface-2 border border-border/40 font-mono text-xs text-foreground">Pending: 0</span>
              <span className="rounded-sm px-3 py-1 bg-surface-2 border border-border/40 font-mono text-xs text-foreground">Paid: 0</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
