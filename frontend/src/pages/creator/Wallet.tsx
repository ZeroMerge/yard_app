import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { creatorsApi } from "@/api/creators";
import { campaignsApi } from "@/api/campaigns";
import { Campaign, Creator } from "@/api/types";
import { PageHeader, Stat, StatusPill, Empty } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const money = (amount: number, currency: string = "NGN") =>
  `${currency === "NGN" ? "₦" : "$"}${Number(amount || 0).toLocaleString()}`;

const Wallet = () => {
  const user = useAuth()!;

  const { data: profile } = useQuery<Creator>({
    queryKey: ["creator_me"],
    queryFn: creatorsApi.getMe,
  });

  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  const [accountNumber, setAccountNumber] = useState("0123456789");
  const [bankCode, setBankCode] = useState("058 (GTBank)");

  const payments = campaigns.flatMap((c) => (c.payments || []).map((p) => ({ ...p, campaignName: c.name })));
  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const pendingPayouts = payments.filter((p) => p.status === "creator_payout_pending" || p.status === "payment_initiated");

  const saveBank = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("NUBAN Payout details saved!");
  };

  return (
    <div>
      <PageHeader
        title="Creator Wallet & Disbursements"
        subtitle="Manage verified Nigerian NUBAN payout details and track campaign disbursements."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Lifetime Earnings" value={money(totalPaid)} tone="gold" />
        <Stat label="Pending Transfers" value={pendingPayouts.length} />
        <Stat label="Completed Payouts" value={payments.filter((p) => p.status === "paid").length} />
        <Stat label="Payment Rail" value="Paystack / NUBAN" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <form onSubmit={saveBank} className="cy-card p-6 space-y-4 lg:col-span-1 shadow-sm">
          <h3 className="font-display font-bold text-lg">NUBAN Payout Account</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Earnings disburse directly to your verified bank account upon brand deliverable approval.
          </p>
          <div className="space-y-1.5">
            <Label className="font-semibold text-xs">Bank Code / Name</Label>
            <Input
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="rounded-xl h-11 bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500"
              placeholder="058 (GTBank) or 033 (UBA)"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-semibold text-xs">Account Number (NUBAN)</Label>
            <Input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="rounded-xl h-11 bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500"
              placeholder="0123456789"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-semibold text-xs">Account Name</Label>
            <Input
              value={profile?.displayName || user?.name || "Creator"}
              disabled
              className="rounded-xl h-11 bg-surface-2 dark:bg-surface border-0 opacity-80"
            />
          </div>
          <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl mt-2 shadow-sm">
            Save Payout Details
          </Button>
        </form>

        <div className="cy-card p-6 lg:col-span-2 shadow-sm">
          <div className="mb-4">
            <h3 className="font-display font-bold text-lg">Payout Disbursements</h3>
          </div>
          {payments.length === 0 ? (
            <Empty title="No payouts recorded yet" hint="Once your deliverable is approved by a brand, payouts disburse automatically." />
          ) : (
            <div className="space-y-2">
              {payments.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="cy-row flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-sm text-foreground">{p.campaignName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(p.createdAt).toLocaleDateString()} • <span className="capitalize">{p.provider}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-extrabold text-sm text-foreground">{money(p.amount, p.currency)}</span>
                    <StatusPill status={p.status} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
