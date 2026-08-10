import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { toast } from "sonner";
import { Sparkles, Calendar } from "lucide-react";

const NICHES = ["Beauty", "Fashion", "Tech", "Lifestyle", "Travel", "Food", "Finance", "Fitness"];
const DELIVERABLE_TYPES = ["reel", "tiktok", "youtube_video", "story", "carousel"];

const NewCampaign = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [brief, setBrief] = useState("");
  const [budgetPerCreator, setBudgetPerCreator] = useState(180000);
  const [quantity, setQuantity] = useState(3);
  const [currency, setCurrency] = useState("NGN");
  const [category, setCategory] = useState("Beauty");
  const [deliverableType, setDeliverableType] = useState("reel");
  const [country, setCountry] = useState("Nigeria");
  const [city, setCity] = useState("Lagos");
  const [deliveryDeadline, setDeliveryDeadline] = useState("");

  const createMutation = useMutation({
    mutationFn: campaignsApi.create,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign brief created successfully!");
      navigate(`/brand/campaigns/${created.id}`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create campaign");
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brief || !deliveryDeadline) {
      toast.error("Please fill in all required fields.");
      return;
    }

    createMutation.mutate({
      name,
      goal: "product_awareness",
      category: category.toLowerCase(),
      country,
      city,
      brief,
      deliverableType,
      quantity: Number(quantity),
      budgetPerCreator: Number(budgetPerCreator),
      currency,
      deliveryDeadline: new Date(deliveryDeadline).toISOString(),
    });
  };

  return (
    <div>
      <PageHeader
        title="Create Campaign Brief"
        subtitle="Set up your campaign parameters, creator slots, and deliverables in one linear flow."
      />
      <form onSubmit={submit} className="cy-card p-8 max-w-3xl space-y-6 shadow-sm">
        <div className="space-y-2">
          <Label className="font-semibold text-sm">Campaign Title</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lagos Skincare Summer Drop 2026"
            className="rounded-xl h-11 bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="font-semibold text-sm">Brief & Creative Requirements</Label>
          <Textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={4}
            placeholder="What is the core talking point? What should creators showcase in their video?"
            className="rounded-xl bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500 leading-relaxed"
            required
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="font-semibold text-sm">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="rounded-xl h-11 bg-surface-2 dark:bg-surface border-0 focus:ring-teal-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NGN">NGN (₦)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-sm">Budget Per Creator</Label>
            <Input
              type="number"
              min={1000}
              value={budgetPerCreator}
              onChange={(e) => setBudgetPerCreator(Number(e.target.value))}
              className="rounded-xl h-11 bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-sm">Creator Slots</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="rounded-xl h-11 bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500"
              required
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="font-semibold text-sm">Niche / Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-xl h-11 bg-surface-2 dark:bg-surface border-0 focus:ring-teal-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NICHES.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-sm">Deliverable Format</Label>
            <Select value={deliverableType} onValueChange={setDeliverableType}>
              <SelectTrigger className="rounded-xl h-11 bg-surface-2 dark:bg-surface border-0 focus:ring-teal-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DELIVERABLE_TYPES.map((d) => (
                  <SelectItem key={d} value={d} className="capitalize">{d.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-sm">Target Country</Label>
            <Input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="rounded-xl h-11 bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-semibold text-sm">Delivery Deadline</Label>
          <Input
            type="date"
            value={deliveryDeadline}
            onChange={(e) => setDeliveryDeadline(e.target.value)}
            className="rounded-xl h-11 bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500"
            required
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-border/30">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="rounded-xl">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-6 shadow-sm"
          >
            {createMutation.isPending ? "Creating..." : "Publish Campaign Brief"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewCampaign;
