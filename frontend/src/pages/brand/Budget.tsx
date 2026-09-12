import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { Campaign } from "@/api/types";
import { PageHeader, Stat, StatusPill, Empty } from "@/components/ui-bits";
import { motion } from "framer-motion";

export const money = (amount: number, currency: string = "NGN") =>
  `${currency === "NGN" ? "₦" : "$"}${Number(amount || 0).toLocaleString()}`;

const Budget = () => {
  const { data: myCampaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  const totalAllocated = myCampaigns.reduce(
    (sum, c) => sum + Number(c.budgetPerCreator || 0) * (c.quantity || 1),
    0
  );

  const payments = myCampaigns.flatMap((c) => (c.payments || []).map((p) => ({ ...p, campaignName: c.name })));
  const paidTotal = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingCount = payments.filter((p) => p.status === "creator_payout_pending" || p.status === "payment_initiated").length;

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Budget & Payout Ledger"
        subtitle="Server-validated payment state tracking and creator payout transaction chains."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        <Stat label="Total Allocated" value={money(totalAllocated)} />
        <Stat label="Total Disbursed" value={money(paidTotal)} tone="gold" />
        <Stat label="Pending Transfers" value={pendingCount} hint="Processing via Paystack" />
        <Stat label="Total Campaigns" value={myCampaigns.length} />
      </div>

      <div className="bg-card border border-border/60 rounded-md p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="font-display font-bold text-base text-foreground tracking-tight">Campaign Budget Allocations</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Budget allocations across active and upcoming campaigns.</p>
        </div>
        <div className="space-y-2">
          {myCampaigns.length === 0 && !isLoading && (
            <div className="p-8 text-center text-xs sm:text-sm text-muted-foreground">No campaigns created yet.</div>
          )}
          {myCampaigns.map((c) => {
            const total = Number(c.budgetPerCreator || 0) * (c.quantity || 1);
            return (
              <div key={c.id} className="p-3.5 sm:p-4 rounded-md bg-surface-2/40 border border-border/40 hover:bg-surface-2/70 hover:border-transparent transition-all duration-150 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-foreground truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground capitalize mt-0.5">{c.category} • {c.country}</div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <div className="text-right">
                    <div className="font-bold font-numeric text-xs sm:text-sm text-foreground">{money(total, c.currency)}</div>
                    <div className="text-[11px] text-muted-foreground font-numeric">{c.quantity} slots @ {money(c.budgetPerCreator, c.currency)}</div>
                  </div>
                  <StatusPill status={c.status} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border/60 rounded-md p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="font-display font-bold text-base text-foreground tracking-tight">Append-Only Payment State Machine Records</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Immutable audit trail of creator disbursements and gateway confirmations.</p>
        </div>
        <div className="space-y-2">
          {payments.length === 0 ? (
            <Empty title="No payment records yet" hint="Payouts initiate automatically when you approve creator deliverables." />
          ) : (
            payments.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-3.5 sm:p-4 rounded-md bg-surface-2/40 border border-border/40 hover:bg-surface-2/70 hover:border-transparent transition-all duration-150 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-bold text-sm text-foreground">{p.campaignName}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Provider: <span className="capitalize font-semibold">{p.provider}</span> {p.providerRef ? `• Ref: ${p.providerRef}` : ''} • <span className="font-mono">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-bold font-numeric text-xs sm:text-sm text-foreground text-right">{money(p.amount, p.currency)}</div>
                  <StatusPill status={p.status} />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Budget;
