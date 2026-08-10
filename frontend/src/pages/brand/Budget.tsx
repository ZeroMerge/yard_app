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
    <div>
      <PageHeader
        title="Budget & Payout Ledger"
        subtitle="Server-validated payment state tracking and creator payout transaction chains."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Total Allocated (NGN)" value={money(totalAllocated)} />
        <Stat label="Total Disbursed" value={money(paidTotal)} tone="gold" />
        <Stat label="Pending Transfers" value={pendingCount} hint="Processing via Paystack/Flutterwave" />
        <Stat label="Total Campaigns" value={myCampaigns.length} />
      </div>

      <div className="cy-card p-6 mb-6 shadow-sm">
        <div className="mb-4">
          <h2 className="font-display font-bold text-lg">Campaign Budget Allocations</h2>
        </div>
        <div className="space-y-2">
          {myCampaigns.length === 0 && !isLoading && (
            <div className="p-8 text-center text-sm text-muted-foreground">No campaigns created yet.</div>
          )}
          {myCampaigns.map((c) => {
            const total = Number(c.budgetPerCreator || 0) * (c.quantity || 1);
            return (
              <div key={c.id} className="cy-row flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-foreground">{c.name}</div>
                  <div className="text-xs text-muted-foreground capitalize mt-0.5">{c.category} • {c.country}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-display font-extrabold text-sm text-foreground">{money(total, c.currency)}</div>
                    <div className="text-[11px] text-muted-foreground">{c.quantity} slots @ {money(c.budgetPerCreator, c.currency)}</div>
                  </div>
                  <StatusPill status={c.status} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="cy-card p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="font-display font-bold text-lg">Append-Only Payment State Machine Records</h2>
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
                className="cy-row flex flex-wrap items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-bold text-sm text-foreground">{p.campaignName}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Provider: <span className="capitalize font-semibold">{p.provider}</span> {p.providerRef ? `• Ref: ${p.providerRef}` : ''} • {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-display font-extrabold text-sm text-foreground text-right">{money(p.amount, p.currency)}</div>
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
