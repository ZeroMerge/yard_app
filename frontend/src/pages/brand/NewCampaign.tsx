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
import { SparklesIcon as Sparkles, CalendarIcon as Calendar } from '@heroicons/react/24/outline';

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
    <div className="space-y-8 lg:space-y-10 pb-20 animate-in fade-in duration-300">
      <PageHeader
        title="Create Campaign Brief"
        subtitle="Set up your campaign parameters, creator slots, and deliverables in one linear flow."
      />
      <form onSubmit={submit} className="bg-card border border-border/60 rounded-md p-6 sm:p-8 max-w-3xl space-y-6 shadow-2xs">
        <div>
          <Label className="font-bold text-xs text-foreground block mb-1.5">Campaign Title</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lagos Skincare Summer Drop 2026"
            className="w-full h-10 p-2.5 bg-surface-2/60 dark:bg-surface border border-border/40 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            required
          />
        </div>

        <div>
          <Label className="font-bold text-xs text-foreground block mb-1.5">Brief & Creative Requirements</Label>
          <Textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={4}
            placeholder="What is the core talking point? What should creators showcase in their video?"
            className="w-full p-3 bg-surface-2/60 dark:bg-surface border border-border/40 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none leading-relaxed"
            required
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label className="font-bold text-xs text-foreground block mb-1.5">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-full h-10 rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 text-xs sm:text-sm focus:ring-teal-500/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-md border-border/40 bg-card shadow-elevated">
                <SelectItem value="NGN" className="text-xs">NGN (₦)</SelectItem>
                <SelectItem value="USD" className="text-xs">USD ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-bold text-xs text-foreground block mb-1.5">Budget Per Creator</Label>
            <Input
              type="number"
              min={1000}
              value={budgetPerCreator}
              onChange={(e) => setBudgetPerCreator(Number(e.target.value))}
              className="w-full h-10 p-2.5 bg-surface-2/60 dark:bg-surface border border-border/40 rounded-md text-xs sm:text-sm font-numeric focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              required
            />
          </div>
          <div>
            <Label className="font-bold text-xs text-foreground block mb-1.5">Creator Slots</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full h-10 p-2.5 bg-surface-2/60 dark:bg-surface border border-border/40 rounded-md text-xs sm:text-sm font-numeric focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              required
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label className="font-bold text-xs text-foreground block mb-1.5">Niche / Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full h-10 rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 text-xs sm:text-sm focus:ring-teal-500/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-md border-border/40 bg-card shadow-elevated">
                {NICHES.map((n) => (
                  <SelectItem key={n} value={n} className="text-xs capitalize">{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-bold text-xs text-foreground block mb-1.5">Deliverable Format</Label>
            <Select value={deliverableType} onValueChange={setDeliverableType}>
              <SelectTrigger className="w-full h-10 rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 text-xs sm:text-sm focus:ring-teal-500/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-md border-border/40 bg-card shadow-elevated">
                {DELIVERABLE_TYPES.map((d) => (
                  <SelectItem key={d} value={d} className="text-xs capitalize">{d.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-bold text-xs text-foreground block mb-1.5">Target Country</Label>
            <Input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full h-10 p-2.5 bg-surface-2/60 dark:bg-surface border border-border/40 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              required
            />
          </div>
        </div>

        <div>
          <Label className="font-bold text-xs text-foreground block mb-1.5">Delivery Deadline</Label>
          <Input
            type="date"
            value={deliveryDeadline}
            onChange={(e) => setDeliveryDeadline(e.target.value)}
            className="w-full h-10 p-2.5 bg-surface-2/60 dark:bg-surface border border-border/40 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            required
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-border/30">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="rounded-md text-xs font-semibold px-4 py-2 hover:bg-surface-2/60 transition-colors">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-md px-5 py-2.5 shadow-xs transition-colors"
          >
            {createMutation.isPending ? "Creating..." : "Publish Campaign Brief"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewCampaign;
