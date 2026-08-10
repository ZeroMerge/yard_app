import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { Campaign } from "@/api/types";
import { PageHeader, StatusPill, Empty } from "@/components/ui-bits";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const money = (amount: number, currency: string = "NGN") =>
  `${currency === "NGN" ? "₦" : "$"}${Number(amount || 0).toLocaleString()}`;

const Campaigns = () => {
  const { data: list = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  return (
    <div>
      <PageHeader
        title="Campaigns"
        subtitle="Manage and track your creator marketing briefs and deliverables."
        action={
          <Link to="/brand/campaigns/new">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-sm rounded-xl px-5">
              <Plus className="h-4 w-4 mr-1.5" /> New Campaign
            </Button>
          </Link>
        }
      />
      {isLoading ? (
        <div className="text-sm text-muted-foreground p-12 text-center">Loading campaigns from server...</div>
      ) : list.length === 0 ? (
        <Empty
          title="No campaigns created yet"
          hint="Create your first campaign brief in under a minute to start matching with African creators."
          action={
            <Link to="/brand/campaigns/new">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl">Create Campaign</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {list.map((c, i) => {
            const budget = Number(c.budgetPerCreator || 0) * (c.quantity || 1);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3 }}
              >
                <Link to={`/brand/campaigns/${c.id}`} className="cy-card p-6 block hover:shadow-elevated transition-all group">
                  <div className="flex items-center justify-between">
                    <span className="cy-chip capitalize">{c.category}</span>
                    <StatusPill status={c.status} />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{c.brief}</p>
                  
                  <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Users className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      <span>{c.quantity} Slots • <span className="capitalize">{c.deliverableType}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-extrabold text-sm text-foreground">{money(budget, c.currency)}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Campaigns;
