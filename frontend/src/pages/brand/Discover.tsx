import { useQuery } from "@tanstack/react-query";
import { creatorsApi } from "@/api/creators";
import { Creator } from "@/api/types";
import { PageHeader } from "@/components/ui-bits";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { MapPin, Search, Users, Sparkles } from "lucide-react";
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
    <div>
      <PageHeader title="Creator Discovery" subtitle="Discover verified creators with structured rate cards across Africa." />

      <div className="cy-card p-4 grid md:grid-cols-3 gap-3 mb-6 shadow-sm">
        <div className="md:col-span-2 relative">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10 rounded-xl bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500"
            placeholder="Search by creator name, bio, or niche..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="rounded-xl bg-surface-2 dark:bg-surface border-0 focus:ring-teal-500">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {NICHES.map((n) => (
              <SelectItem key={n} value={n} className="capitalize">{n === "all" ? "All Categories" : n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-sm text-muted-foreground">Searching creators from backend...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                whileHover={{ y: -3 }}
                className="cy-card p-6 flex flex-col justify-between hover:shadow-elevated transition-all"
              >
                <div>
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-xl bg-gradient-teal text-white grid place-items-center font-bold text-lg shadow-sm">
                      {c.displayName?.charAt(0) || "C"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-base text-foreground truncate">{c.displayName}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-teal-600 dark:text-teal-400" /> {loc}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mt-4 line-clamp-2 leading-relaxed">
                    {c.bio || "Creator profile verified on Yard network."}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="cy-chip capitalize">{primaryCategory}</span>
                    <span className="cy-chip">{money(rate, "NGN")} / reel</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/30">
                  {c.stats && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-medium mb-3">
                      <span>{c.stats.campaignsCompleted} campaigns completed</span>
                      <span>{c.stats.revisionsRequested} revisions</span>
                    </div>
                  )}
                  <Button
                    onClick={() => toast.success(`Invited ${c.displayName} to campaign!`)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl py-2.5 shadow-sm"
                  >
                    Invite to Campaign
                  </Button>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="cy-card p-12 text-center text-muted-foreground col-span-full">
              No creators found matching those filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Discover;
