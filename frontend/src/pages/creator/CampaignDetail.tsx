import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { Campaign } from "@/api/types";
import { PageHeader, Stat, StatusPill, Empty } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const money = (amount: number, currency: string = "NGN") =>
  `${currency === "NGN" ? "₦" : "$"}${Number(amount || 0).toLocaleString()}`;

const CreatorCampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: campaign, isLoading } = useQuery<Campaign>({
    queryKey: ["campaign", id],
    queryFn: () => campaignsApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading campaign details from server...</div>;
  }

  if (!campaign) {
    return <Empty title="Campaign not found" action={<Button onClick={() => navigate("/creator/campaigns")}>Back</Button>} />;
  }

  const app = campaign.applications?.[0];

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <PageHeader
        title={campaign.name}
        subtitle={`${campaign.category.toUpperCase()} • ${campaign.country} • Format: ${campaign.deliverableType}`}
        action={<StatusPill status={app?.status || campaign.status} />}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Payout Per Creator" value={money(campaign.budgetPerCreator, campaign.currency)} tone="gold" />
        <Stat label="Total Slots" value={campaign.quantity} />
        <Stat label="Category" value={<span className="capitalize">{campaign.category}</span>} />
        <Stat label="Campaign Status" value={<span className="capitalize">{campaign.status}</span>} />
      </div>

      <Tabs defaultValue="brief">
        <TabsList className="mb-4">
          <TabsTrigger value="brief">Campaign Brief</TabsTrigger>
          <TabsTrigger value="timeline">Activity Stream ({campaign.activities?.length || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="brief">
          <div className="cy-card p-6 max-w-3xl space-y-4">
            <h2 className="font-display font-semibold text-lg">Brief & Requirements</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{campaign.brief}</p>
            <div className="pt-4 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>Goal: <strong>{campaign.goal}</strong></span>
              <span>Country: <strong>{campaign.country}</strong></span>
              {campaign.deliveryDeadline && (
                <span>Delivery Deadline: <strong>{new Date(campaign.deliveryDeadline).toLocaleDateString()}</strong></span>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="timeline">
          <div className="cy-card p-5 space-y-3">
            <h2 className="font-display font-semibold">Activity Timeline</h2>
            <div className="divide-y divide-border">
              {(campaign.activities || []).map((act) => (
                <div key={act.id} className="py-2.5">
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span className="font-semibold uppercase">{act.eventType}</span>
                    <span>{new Date(act.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm mt-1">{act.body}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreatorCampaignDetail;
