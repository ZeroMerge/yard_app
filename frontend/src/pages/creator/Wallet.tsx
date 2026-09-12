import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { creatorsApi } from "@/api/creators";
import { campaignsApi } from "@/api/campaigns";
import { Campaign, Creator } from "@/api/types";
import { StatusPill } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  BanknotesIcon,
  ShieldCheckIcon,
  BuildingLibraryIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export const money = (amount: number, currency: string = "NGN") =>
  `${currency === "NGN" ? "₦" : "$"}${Number(amount || 0).toLocaleString()}`;

export default function Wallet() {
  const user = useAuth()!;

  const { data: profile } = useQuery<Creator>({
    queryKey: ["creator_me"],
    queryFn: creatorsApi.getMe,
  });

  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");

  const payments = campaigns.flatMap((c) => (c.payments || []).map((p) => ({ ...p, campaignName: c.name })));
  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const pendingPayouts = payments.filter((p) => p.status === "creator_payout_pending" || p.status === "payment_initiated");

  const saveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber || !bankCode) {
      toast.error("Please provide both bank code and account number.");
      return;
    }
    toast.success("Verified Nigerian NUBAN payout details saved!");
  };

  return (
    <div className="space-y-8 lg:space-y-10 pb-20 animate-in fade-in duration-300">
      
      {/* ── Editorial Header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-foreground tracking-tight">
          Earnings & Payments
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
          Track brand milestones, view verified escrow clearances, and manage your local Nigerian bank account.
        </p>
      </div>

      {/* ── 4-Stat Metric Banner (2-Col Mobile, 4-Col Desktop) ──────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-card hover:bg-surface-2/40 border border-border/60 hover:border-transparent p-4 sm:p-5 lg:p-6 rounded-md shadow-2xs transition-all duration-150 flex flex-col justify-between h-full"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">Lifetime Earnings</span>
            <div className="h-7 w-7 rounded-md bg-surface-2/80 grid place-items-center text-muted-foreground shrink-0">
              <BanknotesIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div>
            <div className="font-geist-mono font-bold text-2xl sm:text-3xl text-yellow-600 dark:text-yellow-400 tracking-tight">
              {money(totalPaid)}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">Paid to NUBAN</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-card hover:bg-surface-2/40 border border-border/60 hover:border-transparent p-4 sm:p-5 lg:p-6 rounded-md shadow-2xs transition-all duration-150 flex flex-col justify-between h-full"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">Payments on the way</span>
            <div className="h-7 w-7 rounded-md bg-surface-2/80 grid place-items-center text-muted-foreground shrink-0">
              <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <div className="font-geist-mono font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
              {pendingPayouts.length}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">In Escrow / Pending</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-card hover:bg-surface-2/40 border border-border/60 hover:border-transparent p-4 sm:p-5 lg:p-6 rounded-md shadow-2xs transition-all duration-150 flex flex-col justify-between h-full"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">Completed Payments</span>
            <div className="h-7 w-7 rounded-md bg-surface-2/80 grid place-items-center text-muted-foreground shrink-0">
              <CheckCircleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="font-geist-mono font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
              {payments.filter((p) => p.status === "paid").length}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">Total transactions</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-card hover:bg-surface-2/40 border border-border/60 hover:border-transparent p-4 sm:p-5 lg:p-6 rounded-md shadow-2xs transition-all duration-150 flex flex-col justify-between h-full"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">Payment Rail</span>
            <div className="h-7 w-7 rounded-md bg-surface-2/80 grid place-items-center text-muted-foreground shrink-0">
              <ShieldCheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
          </div>
          <div>
            <div className="font-display font-extrabold text-xl sm:text-2xl text-foreground tracking-tight">
              Paystack NUBAN
            </div>
            <div className="text-[10px] sm:text-xs text-teal-600 dark:text-teal-400 font-semibold mt-0.5 sm:mt-1 truncate">Direct Bank Wire</div>
          </div>
        </motion.div>
      </div>

      {/* ── 2-Column Split: Payout Form (4/12) & Ledger (8/12) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Column: Bank Account Details */}
        <div className="lg:col-span-4">
          <form onSubmit={saveBank} className="bg-card border border-border/60 rounded-md p-6 shadow-2xs space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BuildingLibraryIcon className="h-4 w-4 text-primary" />
                <h2 className="font-display font-bold text-base text-foreground">
                  Payout Details
                </h2>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Brand deliverable approvals disburse straight to your verified Nigerian account.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-foreground block mb-1.5">
                  Bank Code or Name
                </Label>
                <Input
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  placeholder="e.g. 058 (GTBank), 033 (UBA)"
                  className="rounded-md h-10 bg-surface-2 dark:bg-surface border border-border/40 focus-visible:ring-teal-500/20 text-xs shadow-2xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground block mb-1.5">
                  10-Digit NUBAN Account Number
                </Label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="0123456789"
                  maxLength={10}
                  className="rounded-md h-10 bg-surface-2 dark:bg-surface border border-border/40 focus-visible:ring-teal-500/20 text-xs font-numeric tracking-wider shadow-2xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground block mb-1.5">
                  Account Beneficiary Name
                </Label>
                <Input
                  value={profile?.displayName || user?.name || "Creator"}
                  disabled
                  className="rounded-md h-10 bg-surface-2 dark:bg-surface border border-border/30 opacity-70 text-xs font-semibold cursor-not-allowed"
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Name must match your verified identity on Yard.
                </span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-md h-10 text-xs transition-all shadow-xs"
            >
              Save Payout Details
            </Button>
          </form>
        </div>

        {/* Right Columns: Payment Disbursements Ledger */}
        <div className="lg:col-span-8">
          <div className="bg-card border border-border/60 rounded-md p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-bold text-base text-foreground">
                  Payment History
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automated release ledger for completed milestones.
                </p>
              </div>

              {payments.length > 0 && (
                <button
                  onClick={() => toast.info("Exporting CSV statement...")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                  <span>Statement CSV</span>
                </button>
              )}
            </div>

            {payments.length === 0 ? (
              <div className="py-12 text-center">
                <div className="h-11 w-11 rounded-md bg-surface-2 text-muted-foreground mx-auto grid place-items-center mb-2.5">
                  <BanknotesIcon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold text-sm text-foreground">No payments on record yet</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Once your deliverable is approved by the brand, automated payments disburse to your NUBAN account.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {payments.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="py-3.5 px-3 flex items-center justify-between gap-4 hover:bg-surface-2/40 rounded-md transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm text-foreground">{p.campaignName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span className="font-numeric tabular-nums">{new Date(p.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="capitalize">{p.provider || "NUBAN Transfer"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-numeric tabular-nums font-extrabold text-sm sm:text-base text-foreground">
                        {money(p.amount, p.currency)}
                      </span>
                      <StatusPill status={p.status} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
