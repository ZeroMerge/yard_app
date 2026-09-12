import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { Campaign } from "@/api/types";
import { PageHeader, StatusPill, Empty } from "@/components/ui-bits";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusIcon as Plus, UsersIcon as Users, ChevronRightIcon } from '@heroicons/react/24/outline';

export const money = (amount: number, currency: string = "NGN") =>
  `${currency === "NGN" ? "₦" : "$"}${Number(amount || 0).toLocaleString()}`;

const Campaigns = () => {
  const { data: list = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: campaignsApi.list,
  });

  return (
    <div className="space-y-8 lg:space-y-10 pb-20 animate-in fade-in duration-300">
      <PageHeader
        title="Campaigns"
        subtitle="Manage and track your creator marketing briefs and deliverables."
        action={
          <Link to="/brand/campaigns/new">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-md px-4 py-2 text-xs transition-colors shadow-xs">
              <Plus className="h-4 w-4 mr-1.5" /> New Campaign
            </Button>
          </Link>
        }
      />
      {isLoading ? (
        <div className="text-xs text-muted-foreground p-12 text-center">Loading campaigns from server...</div>
      ) : list.length === 0 ? (
        <Empty
          title="No campaigns created yet"
          hint="Create your first campaign brief in under a minute to start matching with African creators."
          action={
            <Link to="/brand/campaigns/new">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-md px-4 py-2 shadow-xs">Create Campaign</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {list.map((c) => {
            const budget = Number(c.budgetPerCreator || 0) * (c.quantity || 1);
            return (
              <Link
                key={c.id}
                to={`/brand/campaigns/${c.id}`}
                className="bg-card hover:bg-surface-2/40 border border-border/60 hover:border-transparent p-5 sm:p-6 rounded-md shadow-2xs transition-all duration-150 flex flex-col justify-between group h-full"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-sm bg-surface-2 text-muted-foreground text-[11px] font-semibold capitalize border border-border/30">
                      {c.category}
                    </span>
                    <StatusPill status={c.status} />
                  </div>
                  <h3 className="mt-3 font-display text-base sm:text-lg font-bold group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors text-foreground">
                    {c.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{c.brief}</p>
                </div>
                
                <div className="mt-5 pt-3.5 border-t border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Users className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{c.quantity} Slots • <span className="capitalize">{c.deliverableType}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-sm text-foreground font-numeric">{money(budget, c.currency)}</span>
                    <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Campaigns;
