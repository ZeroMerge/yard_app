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
    <div>
      <PageHeader
        title="Admin Overview & System Audit"
        subtitle="Platform audit logs, campaign state machines, and system observability."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Total Campaigns" value={campaigns.length} />
        <Stat label="Audit Log Events" value={auditLogs.length} tone="gold" />
        <Stat label="Active State" value={campaigns.filter((c) => c.status === "open" || c.status === "in_progress").length} />
        <Stat label="Traceability Mode" value="Immutable" />
      </div>

      <Tabs defaultValue="audit">
        <TabsList className="mb-4">
          <TabsTrigger value="audit">Audit Logs ({auditLogs.length})</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns ({campaigns.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="audit">
          <div className="cy-card overflow-hidden">
            <div className="divide-y divide-border max-h-[480px] overflow-auto">
              {loadingLogs ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Loading audit log stream...</div>
              ) : auditLogs.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No audit logs recorded.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between gap-3 text-sm">
                    <div>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded">
                        {log.action}
                      </span>
                      <span className="ml-2 text-muted-foreground text-xs">{new Date(log.createdAt).toLocaleString()}</span>
                      <div className="text-xs text-muted-foreground mt-1">Target: {log.targetType} ({log.targetId})</div>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      {log.actor?.email || log.actorId || "System"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <div className="cy-card overflow-hidden">
            <div className="divide-y divide-border max-h-[480px] overflow-auto">
              {loadingCampaigns ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Loading campaigns...</div>
              ) : (
                campaigns.map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{c.category} • {c.country}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{money(c.budgetPerCreator, c.currency)}</span>
                      <StatusPill status={c.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
