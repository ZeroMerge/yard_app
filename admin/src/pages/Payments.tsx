import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, AdminPaymentRecord } from "@/api/admin";
import { PageHeader, StatusPill } from "@/components/ui-bits";
import { money, formatDate } from "@/lib/utils";
import {
  BanknotesIcon,
  XMarkIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterTab = "pending" | "paid" | "all";

export const Payments = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterTab>("pending");
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentRecord | null>(null);
  const [receiptNote, setReceiptNote] = useState("");

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: adminApi.getManualPaymentsQueue,
  });

  const fulfillMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      adminApi.markPaymentAsPaid(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Bank disbursement recorded successfully!");
      setSelectedPayment(null);
      setReceiptNote("");
    },
    onError: (err: any) => toast.error(err.message || "Failed to record payment"),
  });

  const filtered = payments.filter((p) => {
    if (filter === "pending") return p.status !== "paid";
    if (filter === "paid") return p.status === "paid";
    return true;
  });

  const tabCounts = {
    pending: payments.filter((p) => p.status !== "paid").length,
    paid: payments.filter((p) => p.status === "paid").length,
    all: payments.length,
  };

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "pending", label: "Pending Payouts", count: tabCounts.pending },
    { id: "paid", label: "Settled Payouts", count: tabCounts.paid },
    { id: "all", label: "All Records", count: tabCounts.all },
  ];

  return (
    <div className="space-y-8 lg:space-y-10 pb-16 animate-in fade-in duration-300">
      {/* ── Editorial Header ── */}
      <PageHeader
        title="Payout Desk"
        subtitle="Manual bank wire settlement fulfillment for approved creator deliverables."
      />

      {/* ── Segmented Control Filter Tabs ── */}
      <div className="flex items-center p-1 rounded-md bg-surface-2 border border-border/40 shadow-2xs overflow-x-auto scrollbar-hide max-w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-sm transition-all duration-150 whitespace-nowrap flex items-center gap-1.5",
              filter === tab.id
                ? "bg-card text-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-sm text-[10px] font-bold font-numeric transition-colors",
                filter === tab.id
                  ? "bg-primary/10 text-primary"
                  : "bg-surface-2 text-muted-foreground"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Payout Cards List ── */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-24 text-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading disbursement queue...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border/60 rounded-md p-10 sm:p-14 text-center shadow-2xs">
            <div className="h-11 w-11 rounded-md bg-surface-2 text-muted-foreground mx-auto grid place-items-center mb-3">
              <BanknotesIcon className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-base text-foreground">
              No payments in this view
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {filter === "pending"
                ? "All approved creator payouts have been settled."
                : "No transaction records match the current filter."}
            </p>
          </div>
        ) : (
          filtered.map((p) => {
            const account = p.application?.creator?.payoutAccount;
            const creatorName = p.application?.creator?.displayName || "Creator Partner";
            const campaignName = p.campaign?.name || p.campaignId;
            const isPaid = p.status === "paid";

            return (
              <div
                key={p.id}
                className={cn(
                  "bg-card hover:bg-surface-2/40 border border-border/60 hover:border-border p-5 sm:p-6 rounded-md shadow-2xs transition-all duration-150 space-y-4",
                  !isPaid && "border-amber-500/20 dark:border-amber-500/30"
                )}
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Disbursement ID: {p.id.slice(0, 8)}…
                      </span>
                      <StatusPill status={p.status} />
                    </div>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-foreground">
                      {creatorName}
                    </h3>
                    <div className="text-xs text-muted-foreground">
                      Campaign: <strong className="text-foreground">{campaignName}</strong>
                    </div>
                  </div>

                  {/* Monetary Amount */}
                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-2xl sm:text-3xl font-display font-extrabold text-foreground font-numeric tracking-tight">
                      {money(p.amount, p.currency)}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      Currency: {p.currency || "NGN"}
                    </div>
                  </div>
                </div>

                {/* Bank Account Wire Details Box */}
                {account ? (
                  <div className="bg-surface-2/60 border border-border/40 p-3.5 rounded-md text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-foreground mb-1">
                      <BuildingLibraryIcon className="h-4 w-4 text-primary shrink-0" />
                      <span>Beneficiary Bank Account</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-muted-foreground">
                      <div>
                        Bank: <strong className="text-foreground">{account.bankName || "N/A"}</strong> ({account.bankCode || "N/A"})
                      </div>
                      <div>
                        Account Number: <strong className="font-mono text-foreground">{account.accountNumber || "N/A"}</strong>
                      </div>
                      <div>
                        Account Name: <strong className="text-foreground">{account.accountName || "N/A"}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-rose-500/5 border border-rose-500/20 p-3 rounded-md text-xs text-rose-600 dark:text-rose-400">
                    ⚠️ Creator has not yet provided beneficiary banking details. Payout paused.
                  </div>
                )}

                {/* Footer Action & Meta */}
                <div className="pt-3 border-t border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <ClockIcon className="h-3.5 w-3.5" />
                    <span>Created {formatDate(p.createdAt)}</span>
                    {p.providerRef && (
                      <>
                        <span>•</span>
                        <span className="font-mono">Ref: {p.providerRef}</span>
                      </>
                    )}
                  </div>

                  {!isPaid && (
                    <button
                      onClick={() => setSelectedPayment(p)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Fulfill & Mark Paid</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Confirmation Modal ── */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-card border border-border/60 rounded-md p-6 sm:p-7 max-w-md w-full shadow-elevated space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">
                  Confirm Bank Wire Settlement
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Confirm payout of{" "}
                  <strong className="text-foreground font-numeric">
                    {money(selectedPayment.amount, selectedPayment.currency)}
                  </strong>{" "}
                  to {selectedPayment.application?.creator?.displayName || "the creator"}.
                </p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-surface-2"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Transaction Reference / Wire Receipt *
              </label>
              <input
                type="text"
                value={receiptNote}
                onChange={(e) => setReceiptNote(e.target.value)}
                placeholder="e.g. Wire Ref #9812938492 or Bank Transfer receipt"
                className="w-full px-3 py-2 rounded-md bg-surface-2 border border-border/50 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
              <p className="text-[10px] text-muted-foreground">
                This reference will be permanently stored in the immutable audit log.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-3.5 py-2 rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!receiptNote.trim() || fulfillMutation.isPending}
                onClick={() =>
                  fulfillMutation.mutate({
                    id: selectedPayment.id,
                    note: receiptNote.trim(),
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all"
              >
                {fulfillMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Recording…</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Confirm Settlement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
