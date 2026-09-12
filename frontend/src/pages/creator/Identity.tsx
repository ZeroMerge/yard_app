import { useState } from "react";
import { 
  CameraIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  GlobeAltIcon,
  PhotoIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as SolidCheck } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { creatorsApi } from "@/api/creators";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Identity() {
  const [activeTab, setActiveTab] = useState<"profile" | "rates" | "payout">("profile");

  const { data: creator, isLoading } = useQuery({
    queryKey: ['creator', 'me'],
    queryFn: () => creatorsApi.getMe()
  });

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading creator identity...</p>
      </div>
    );
  }

  if (!creator) return null;

  const hasPayout = creator.payoutAccount && Object.keys(creator.payoutAccount).length > 0;
  const isReady = hasPayout;

  return (
    <div className="space-y-8 lg:space-y-10 pb-20 animate-in fade-in duration-300">
      
      {/* ── Editorial Header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-foreground tracking-tight">
          Identity & Rates
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
          Manage your verified presence, deliverables rate card, and connected audience channels.
        </p>
      </div>

      {/* ── Profile Readiness Health Callout ────────────────────────────────── */}
      {!isReady && (
        <div className="bg-amber-500/5 border border-amber-500/30 rounded-md p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="h-9 w-9 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-foreground">Complete Your Payout Setup</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add your verified Nigerian bank account to unlock direct brand campaign invitations.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab("payout")}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-md transition-colors shadow-xs shrink-0 text-center"
          >
            Add Bank Account
          </button>
        </div>
      )}

      {/* ── Segmented Navigation Tabs ───────────────────────────────────────── */}
      <div className="flex items-center p-1 rounded-md bg-surface-2 border border-border/40 shadow-2xs w-fit overflow-x-auto scrollbar-hide max-w-full">
        {[
          { id: "profile", label: "Public Profile", icon: GlobeAltIcon },
          { id: "rates", label: "Rates & Portfolio", icon: ChartBarIcon },
          { id: "payout", label: "Payout Details", icon: BanknotesIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-all duration-150 whitespace-nowrap",
              activeTab === tab.id
                ? "bg-card text-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Views ───────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        
        {/* TAB 1: PUBLIC PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Identity Card */}
            <div className="bg-card border border-border/60 rounded-md p-6 md:p-8 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between pb-6 border-b border-border/40">
                <div className="flex items-center gap-4">
                  <div className="relative group cursor-pointer">
                    {creator.profileImageUrl ? (
                      <img
                        src={creator.profileImageUrl}
                        alt={creator.displayName}
                        className="h-20 w-20 rounded-md object-cover shadow-2xs"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-md bg-teal-600 text-white text-2xl font-extrabold grid place-items-center shadow-2xs">
                        {creator.displayName?.charAt(0) || "C"}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
                      <CameraIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-xl text-foreground">
                      {creator.displayName}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {creator.locations?.[0]?.city ? `${creator.locations[0].city}, ` : ""}
                      {creator.locations?.[0]?.country || "Nigeria"} 
                      {creator.categories?.length ? ` • ${creator.categories.map((c) => c.category).join(", ")}` : ""}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toast.info("Public profile link copied to clipboard")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-surface-2 hover:bg-surface-2/80 text-foreground text-xs font-semibold transition-colors border border-border/30"
                >
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  Public Preview
                </button>
              </div>

              {/* Bio & Details Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Bio & Creative Angle
                  </label>
                  <textarea 
                    rows={4}
                    defaultValue={creator.bio || ""}
                    placeholder="Tell brands about your audience demographics, visual aesthetics, and what makes your content convert..."
                    className="w-full p-3 bg-surface-2 dark:bg-surface border border-border/40 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Content Categories
                    </label>
                    <input 
                      type="text" 
                      defaultValue={creator.categories?.map((c) => c.category).join(", ") || ""}
                      placeholder="e.g. Beauty, Tech, Lifestyle"
                      className="w-full p-2.5 bg-surface-2 dark:bg-surface border border-border/40 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Primary Location
                    </label>
                    <input 
                      type="text" 
                      defaultValue={creator.locations?.[0]?.country || "Nigeria"}
                      placeholder="e.g. Lagos, Nigeria"
                      className="w-full p-2.5 bg-surface-2 dark:bg-surface border border-border/40 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => toast.success("Profile updated successfully")}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-md transition-colors shadow-xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>

            {/* Connected Platforms */}
            <div className="bg-card border border-border/60 rounded-md p-6 shadow-2xs space-y-4">
              <h3 className="font-display font-bold text-base text-foreground">Connected Social Channels</h3>
              <p className="text-xs text-muted-foreground">
                Verified handles allow brands to review engagement and follower reach directly.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {creator.socialAccounts?.map((social) => (
                  <div key={social.id} className="flex items-center justify-between p-3.5 rounded-md bg-surface-2/40 border border-border/40 hover:bg-surface-2/70 hover:border-transparent transition-all duration-150">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-md grid place-items-center font-bold text-xs capitalize">
                        {social.platform.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs capitalize text-foreground">{social.platform} <span className="text-muted-foreground font-normal">@{social.handle}</span></div>
                        <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">Verified Sync</div>
                      </div>
                    </div>
                    <SolidCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                ))}

                <button
                  onClick={() => toast.info("Opening social channel integration...")}
                  className="flex items-center justify-between p-3.5 rounded-md border border-dashed border-border/60 hover:bg-surface-2/40 hover:border-transparent transition-all duration-150 text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-surface-2 rounded-md grid place-items-center text-muted-foreground group-hover:text-foreground">
                      <PlusIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-foreground">Connect Platform</div>
                      <div className="text-[10px] text-muted-foreground">Instagram, TikTok, YouTube</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400">Connect</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: RATES & PORTFOLIO */}
        {activeTab === "rates" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Baseline Rates */}
            <div className="bg-card border border-border/60 rounded-md p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-foreground">Standard Rate Card</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Baseline pricing for direct brand negotiations.</p>
                </div>
                <button
                  onClick={() => toast.info("Adding new rate card item...")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <PlusIcon className="h-3.5 w-3.5" /> Add Rate
                </button>
              </div>

              <div className="space-y-2.5 pt-2">
                {creator.rates?.length ? (
                  creator.rates.map((rate) => (
                    <div key={rate.id} className="flex items-center justify-between p-4 rounded-md bg-surface-2/40 border border-border/40 hover:bg-surface-2/70 hover:border-transparent transition-all duration-150">
                      <div>
                        <div className="font-bold text-sm text-foreground capitalize">
                          {rate.deliverableType.replace("_", " ")}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Single Deliverable</div>
                      </div>
                      <div className="font-display font-extrabold text-base text-foreground font-numeric">
                        {rate.currency === "NGN" ? "₦" : "$"}{Number(rate.amount).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No custom rates set. Standard platform rates apply.
                  </div>
                )}
              </div>
            </div>

            {/* Featured Portfolio */}
            <div className="bg-card border border-border/60 rounded-md p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-foreground">Featured Portfolio Media</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Showcase your top performing video reels and posts.</p>
                </div>
                <button
                  onClick={() => toast.info("Opening media upload...")}
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  + Upload Media
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div
                  onClick={() => toast.info("Upload reel slot")}
                  className="aspect-[9/16] rounded-md border-2 border-dashed border-border/60 hover:border-transparent hover:bg-surface-2/40 transition-all duration-150 flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <PlusIcon className="h-6 w-6 mb-1" />
                  <span className="text-[11px] font-semibold">Add Reel</span>
                </div>

                <div className="aspect-[9/16] rounded-md bg-surface-2/40 border border-border/40 flex items-center justify-center text-xs text-muted-foreground">
                  Empty Slot
                </div>
                <div className="aspect-[9/16] rounded-md bg-surface-2/40 border border-border/40 flex items-center justify-center text-xs text-muted-foreground">
                  Empty Slot
                </div>
                <div className="aspect-[9/16] rounded-md bg-surface-2/40 border border-border/40 flex items-center justify-center text-xs text-muted-foreground">
                  Empty Slot
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PAYOUT SETTINGS */}
        {activeTab === "payout" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-card border border-border/60 rounded-md p-6 md:p-8 shadow-2xs space-y-5">
              <div>
                <h3 className="font-display font-bold text-base text-foreground">Payout Details</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Yard issues immediate bank payments upon brand approval of deliverables.
                </p>
              </div>

              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Bank Name</label>
                  <select className="w-full p-2.5 bg-surface-2/60 dark:bg-surface border border-border/40 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                    <option>Guaranty Trust Bank (GTBank)</option>
                    <option>United Bank for Africa (UBA)</option>
                    <option>Access Bank</option>
                    <option>Zenith Bank</option>
                    <option>First Bank of Nigeria</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">10-Digit NUBAN Account Number</label>
                  <input 
                    type="text" 
                    placeholder="0123456789"
                    maxLength={10}
                    className="w-full p-2.5 bg-surface-2/60 dark:bg-surface border border-border/40 rounded-md text-xs font-numeric focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Account Beneficiary Name</label>
                  <input 
                    type="text" 
                    disabled
                    value={creator.displayName}
                    className="w-full p-2.5 bg-surface-2/40 dark:bg-surface border border-border/30 rounded-md text-xs font-semibold opacity-70 cursor-not-allowed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => toast.success("Bank details verified with NIP!")}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-md transition-colors shadow-xs"
                  >
                    Verify & Save Payout Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
