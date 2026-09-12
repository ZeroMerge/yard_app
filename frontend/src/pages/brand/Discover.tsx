import { useQuery } from "@tanstack/react-query";
import { creatorsApi } from "@/api/creators";
import { Creator } from "@/api/types";
import { PageHeader } from "@/components/ui-bits";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { MapPinIcon as MapPin, MagnifyingGlassIcon as Search } from '@heroicons/react/24/outline';
import { toast } from "sonner";
import { motion } from "framer-motion";

export const money = (amount: number, currency: string = "NGN") =>
  `${currency === "NGN" ? "₦" : "$"}${Number(amount || 0).toLocaleString()}`;

const NICHES = ["all", "beauty", "fashion", "tech", "lifestyle", "food", "finance", "fitness"];

const Discover = () => {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");

  const { data: creators = [], isLoading } = useQuery<Creator[]>({
    queryKey: ["creators", category],
    queryFn: () => creatorsApi.list(category !== "all" ? { category } : undefined),
  });

  const filtered = creators.filter((c) => {
    if (q) {
      const match = `${c.displayName} ${c.bio || ""}`.toLowerCase().includes(q.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      <PageHeader title="Creator Discovery" subtitle="Discover verified creators with structured rate cards across Africa." />

      <div className="p-3 sm:p-3.5 rounded-md bg-card border border-border/60 shadow-2xs grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9 rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 focus-visible:ring-teal-500/20 text-xs sm:text-sm h-10"
            placeholder="Search by creator name, bio, or niche..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 focus:ring-teal-500/20 text-xs sm:text-sm h-10">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="rounded-md border-border/60">
            {NICHES.map((n) => (
              <SelectItem key={n} value={n} className="capitalize text-xs sm:text-sm">{n === "all" ? "All Categories" : n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs sm:text-sm text-muted-foreground">Searching creators from backend...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((c, i) => {
            const loc = c.locations?.[0] ? `${c.locations[0].city || ""}, ${c.locations[0].country}` : "Lagos, Nigeria";
            const rate = c.rates?.[0] ? c.rates[0].amount : 180000;
            const primaryCategory = c.categories?.[0]?.category || "beauty";

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card hover:bg-surface-2/40 border border-border/60 hover:border-transparent rounded-md p-5 sm:p-6 transition-all duration-150 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-md bg-teal-600/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 grid place-items-center font-bold text-base shrink-0 shadow-2xs">
                      {c.displayName?.charAt(0) || "C"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm sm:text-base text-foreground truncate">{c.displayName}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-teal-600 dark:text-teal-400 shrink-0" /> {loc}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground mt-3.5 line-clamp-2 leading-relaxed">
                    {c.bio || "Creator profile verified on Yard network."}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    <span className="rounded-sm px-2 py-0.5 text-[11px] font-semibold bg-surface-2 border border-border/40 text-muted-foreground capitalize">{primaryCategory}</span>
                    <span className="rounded-sm px-2 py-0.5 text-[11px] font-semibold bg-surface-2 border border-border/40 text-muted-foreground font-numeric">{money(rate, "NGN")} / reel</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border/40">
                  {c.stats && (
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium mb-3">
                      <span>{c.stats.campaignsCompleted} campaigns completed</span>
                      <span>{c.stats.revisionsRequested} revisions</span>
                    </div>
                  )}
                  <Button
                    onClick={() => toast.success(`Invited ${c.displayName} to campaign!`)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md h-9 text-xs shadow-xs"
                  >
                    Invite to Campaign
                  </Button>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="rounded-md border border-border/60 bg-card p-12 text-center text-xs sm:text-sm text-muted-foreground col-span-full">
              No creators found matching those filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Discover;
