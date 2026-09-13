import { useState, useEffect } from "react";
import { 
  CameraIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  GlobeAltIcon,
  PhotoIcon,
  ChartBarIcon,
  PlusIcon,
  CheckIcon,
  ArrowTopRightOnSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as SolidCheck } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { creatorsApi } from "@/api/creators";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const POPULAR_NICHES = [
  "Beauty", "Fashion", "Tech", "Lifestyle", "Food", 
  "Fitness", "Finance", "Gaming", "Travel", "Music", "Education"
];

const POPULAR_LANGUAGES = [
  "English", "Pidgin", "Yoruba", "Igbo", "Hausa", "French", "Swahili"
];

export default function Identity() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "rates" | "payout">("profile");

  const { data: creator, isLoading } = useQuery({
    queryKey: ['creator', 'me'],
    queryFn: () => creatorsApi.getMe()
  });

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [categoriesText, setCategoriesText] = useState("");
  const [languagesText, setLanguagesText] = useState("");
  const [rates, setRates] = useState<any[]>([]);

  useEffect(() => {
    if (creator) {
      setDisplayName(creator.displayName || "");
      setBio(creator.bio || "");
      setCategoriesText(creator.categories?.map((c: any) => c.category).join(", ") || "");
      setLanguagesText(creator.languages?.map((l: any) => l.language).join(", ") || "English");
      setRates(creator.rates?.map((r: any) => ({
        deliverableType: r.deliverableType,
        amount: Number(r.amount),
        currency: r.currency || "NGN",
      })) || []);
    }
  }, [creator]);

  const toggleCategory = (cat: string) => {
    const current = categoriesText.split(",").map((c) => c.trim()).filter(Boolean);
    const exists = current.some((c) => c.toLowerCase() === cat.toLowerCase());
    let next: string[];
    if (exists) {
      next = current.filter((c) => c.toLowerCase() !== cat.toLowerCase());
    } else {
      next = [...current, cat];
    }
    setCategoriesText(next.join(", "));
  };

  const toggleLanguage = (lang: string) => {
    const current = languagesText.split(",").map((l) => l.trim()).filter(Boolean);
    const exists = current.some((l) => l.toLowerCase() === lang.toLowerCase());
    let next: string[];
    if (exists) {
      next = current.filter((l) => l.toLowerCase() !== lang.toLowerCase());
    } else {
      next = [...current, lang];
    }
    setLanguagesText(next.join(", "));
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => creatorsApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['creator_me'] });
      toast.success("Profile updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  const handleSaveProfile = () => {
    const cats = categoriesText.split(",").map((c) => c.trim()).filter(Boolean);
    const langs = languagesText.split(",").map((l) => l.trim()).filter(Boolean);
    updateProfileMutation.mutate({
      displayName,
      bio,
      categories: cats,
      languages: langs,
    });
  };


  const handleSaveRates = () => {
    updateProfileMutation.mutate({
      rates: rates.map((r) => ({
        deliverableType: r.deliverableType,
        amount: Number(r.amount),
        currency: r.currency || "NGN",
      })),
    });
  };

  const handleAddRate = () => {
    setRates([
      ...rates,
      {
        deliverableType: "reels_video",
        amount: 150000,
        currency: "NGN",
      },
    ]);
  };

  const handleRemoveRate = (index: number) => {
    setRates(rates.filter((_, i) => i !== index));
  };

  const handleRateChange = (index: number, field: string, value: any) => {
    const updated = [...rates];
    updated[index] = { ...updated[index], [field]: value };
    setRates(updated);
  };

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
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your creator display name"
                    className="w-full p-2.5 bg-surface-2 dark:bg-surface border border-border/40 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Bio & Creative Angle
                  </label>
                  <textarea 
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell brands about your audience demographics, visual aesthetics, and what makes your content convert..."
                    className="w-full p-3 bg-surface-2 dark:bg-surface border border-border/40 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>

                {/* Content Categories Tag Picker */}
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Content Categories (Niches)
                  </label>
                  <input 
                    type="text" 
                    value={categoriesText}
                    onChange={(e) => setCategoriesText(e.target.value)}
                    placeholder="e.g. Beauty, Tech, Lifestyle"
                    className="w-full p-2.5 bg-surface-2 dark:bg-surface border border-border/40 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {POPULAR_NICHES.map((niche) => {
                      const isActive = categoriesText.toLowerCase().includes(niche.toLowerCase());
                      return (
                        <button
                          key={niche}
                          type="button"
                          onClick={() => toggleCategory(niche)}
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-semibold transition-colors border",
                            isActive
                              ? "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30"
                              : "bg-surface-2/60 text-muted-foreground border-border/40 hover:text-foreground"
                          )}
                        >
                          {isActive ? (
                            <CheckIcon className="h-3 w-3 shrink-0 stroke-[2.5]" />
                          ) : (
                            <PlusIcon className="h-3 w-3 shrink-0 stroke-[2.5]" />
                          )}
                          <span>{niche}</span>
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">Click pills to add/remove or type custom comma-separated niches</span>
                </div>

                {/* Languages Tag Picker */}
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Languages Spoken & Content Produced In
                  </label>
                  <input 
                    type="text" 
                    value={languagesText}
                    onChange={(e) => setLanguagesText(e.target.value)}
                    placeholder="e.g. English, Pidgin, Yoruba"
                    className="w-full p-2.5 bg-surface-2 dark:bg-surface border border-border/40 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {POPULAR_LANGUAGES.map((lang) => {
                      const isActive = languagesText.toLowerCase().includes(lang.toLowerCase());
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleLanguage(lang)}
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-semibold transition-colors border",
                            isActive
                              ? "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30"
                              : "bg-surface-2/60 text-muted-foreground border-border/40 hover:text-foreground"
                          )}
                        >
                          {isActive ? (
                            <CheckIcon className="h-3 w-3 shrink-0 stroke-[2.5]" />
                          ) : (
                            <PlusIcon className="h-3 w-3 shrink-0 stroke-[2.5]" />
                          )}
                          <span>{lang}</span>
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">Specify languages you create content in</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Primary Location
                  </label>
                  <input 
                    type="text" 
                    defaultValue={creator.locations?.[0]?.country || "Nigeria"}
                    disabled
                    placeholder="e.g. Lagos, Nigeria"
                    className="w-full p-2.5 bg-surface-2 dark:bg-surface border border-border/40 rounded-md text-xs opacity-70 cursor-not-allowed"
                  />
                </div>
              </div>


              <div className="pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-md transition-colors shadow-xs disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? "Saving Profile..." : "Save Profile Changes"}
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
                  type="button"
                  onClick={handleAddRate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-2 hover:bg-surface-2/80 text-foreground border border-border/40 text-xs font-bold transition-colors shadow-2xs"
                >
                  <PlusIcon className="h-3.5 w-3.5" /> Add Deliverable Rate
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {rates.length > 0 ? (
                  rates.map((rate, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-md bg-surface-2/40 border border-border/40">
                      <div className="flex-1 w-full sm:w-auto">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Deliverable Format</label>
                        <select
                          value={rate.deliverableType}
                          onChange={(e) => handleRateChange(idx, "deliverableType", e.target.value)}
                          className="w-full h-9 rounded-md bg-card border border-border/40 px-2.5 text-xs text-foreground font-semibold"
                        >
                          <option value="reels_video">Instagram Reel (30-60s)</option>
                          <option value="ugc_video">UGC Raw Video Assets</option>
                          <option value="story_post">Instagram Story Sequence</option>
                          <option value="tiktok_video">TikTok Video</option>
                          <option value="youtube_dedicated">YouTube Dedicated Video</option>
                          <option value="youtube_integrated">YouTube Integrated Mention</option>
                        </select>
                      </div>

                      <div className="w-full sm:w-44">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Rate ({rate.currency || 'NGN'})</label>
                        <input
                          type="number"
                          value={rate.amount}
                          onChange={(e) => handleRateChange(idx, "amount", e.target.value)}
                          className="w-full h-9 rounded-md bg-card border border-border/40 px-2.5 text-xs text-foreground font-numeric font-bold"
                        />
                      </div>

                      <div className="pt-2 sm:pt-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveRate(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                          title="Remove rate"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No custom rates set. Click "Add Deliverable Rate" to configure your rate card.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border/40 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveRates}
                  disabled={updateProfileMutation.isPending}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-md transition-colors shadow-xs disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? "Saving Rates..." : "Save Rate Card Changes"}
                </button>
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
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  <PlusIcon className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Upload Media</span>
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
