import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { dashboardPathFor, signUpWithPassword, getCurrentUser } from "@/lib/auth";
import type { Role } from "@/api/types";
import { toast } from "sonner";
import { Building2, Users, Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const CREATOR_CATEGORIES = ["Beauty", "Fashion", "Tech", "Lifestyle", "Food", "Travel", "Fitness", "Finance", "Gaming", "Music", "Education", "Parenting"];
const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Senegal", "Ethiopia", "Egypt", "Morocco", "Rwanda", "Uganda", "Other"];
const PRIMARY_PLATFORMS = ["Instagram", "TikTok", "YouTube", "X (Twitter)", "Facebook", "LinkedIn", "Twitch", "Threads"];
const INDUSTRIES = ["Beauty & Skincare", "Fashion", "Food & Beverage", "Tech / SaaS", "Fintech", "Health & Wellness", "Education", "Entertainment", "E-commerce", "Other"];
const COMPANY_SIZES = ["Just me", "2–10", "11–50", "51–200", "200+"];

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"role" | "form">("role");
  const [role, setRole] = useState<Role>("creator");
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  // Shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");

  // Creator
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [primaryPlatform, setPrimaryPlatform] = useState("");
  const [niche, setNiche] = useState("");

  // Brand
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (role === "creator") {
        if (!fullName || !city || !primaryPlatform || !niche || !country || !phone) {
          toast.error("Please complete all required fields."); setLoading(false); return;
        }
        await signUpWithPassword({
          role: "creator",
          full_name: fullName,
          email, password, phone, country,
          city, primary_platform: primaryPlatform, niche,
        } as any);
      } else {
        if (!businessName || !contactPerson || !industry || !companySize || !country || !phone) {
          toast.error("Please complete all required fields."); setLoading(false); return;
        }
        await signUpWithPassword({
          role: "brand",
          full_name: contactPerson,
          contact_person: contactPerson,
          business_name: businessName,
          email, password, phone, country,
          business_category: industry, company_size: companySize,
        } as any);
      }
      const u = getCurrentUser();
      if (u) {
        // Auto-confirmed (shouldn't happen in production but handled)
        toast.success("Workspace ready. Welcome to CreatorYard.");
        navigate(dashboardPathFor(u.role));
      } else {
        setPendingEmail(email);
      }
    } catch (err: any) {
      const msg = err?.message ?? "Could not create account.";
      toast.error(msg.includes("registered") || msg.includes("already") ? "An account with this email already exists." : msg);
    } finally {
      setLoading(false);
    }
  };

  const RoleCard = ({ value, icon: Icon, title, desc }: any) => (
    <button type="button" onClick={() => setRole(value)} className={cn(
      "text-left rounded-xl border p-5 transition-all",
      role === value ? "border-primary bg-primary/5 shadow-soft" : "border-border hover:border-primary/40"
    )}>
      <Icon className={cn("h-6 w-6", role === value ? "text-primary" : "text-muted-foreground")} />
      <div className="mt-3 font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{desc}</div>
    </button>
  );

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="hidden md:flex relative bg-secondary text-secondary-foreground p-10 flex-col justify-between overflow-hidden">
        <Link to="/"><Logo tone="light" /></Link>
        <div>
          <h2 className="font-display text-3xl font-bold">Set up your workspace in under a minute.</h2>
          <p className="mt-3 text-secondary-foreground/70 max-w-md">Choose Brand to run campaigns. Choose Creator to apply, submit work, and get paid.</p>
        </div>
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-gold opacity-30 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-md py-4">
          <Link to="/" className="md:hidden inline-block mb-6"><Logo /></Link>

          {pendingEmail ? (
            <div className="text-center py-10">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 grid place-items-center">
                <MailCheck className="h-6 w-6 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold mt-5">Verify your email</h1>
              <p className="text-muted-foreground text-sm mt-2">
                We sent a confirmation link to <span className="text-foreground font-medium">{pendingEmail}</span>. Click it to activate your account, then sign in.
              </p>
              <Button asChild className="w-full mt-6"><Link to="/login">Go to sign in</Link></Button>
              <p className="mt-4 text-xs text-muted-foreground">Didn't get it? Check your spam folder.</p>
            </div>
          ) : step === "role" ? (
            <>
              <h1 className="font-display text-2xl font-bold">Create your account</h1>
              <p className="text-muted-foreground text-sm mt-1">Pick how you want to use CreatorYard.</p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <RoleCard value="brand" icon={Building2} title="Brand" desc="Run campaigns & hire creators" />
                <RoleCard value="creator" icon={Users} title="Creator" desc="Apply, submit work, get paid" />
              </div>

              <Button onClick={() => setStep("form")} className="w-full mt-6 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                Continue as {role === "brand" ? "Brand" : "Creator"}
              </Button>

              <p className="mt-6 text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-foreground font-medium underline-offset-4 hover:underline">Sign in</Link></p>
            </>
          ) : (
            <>
              <button onClick={() => setStep("role")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3"><ArrowLeft className="h-4 w-4" /> Change role</button>
              <h1 className="font-display text-2xl font-bold">{role === "brand" ? "Brand account" : "Creator account"}</h1>
              <p className="text-muted-foreground text-sm mt-1">Tell us a bit about {role === "brand" ? "your business" : "you"}.</p>

              <form onSubmit={submit} className="space-y-3 mt-5">
                {role === "brand" ? (
                  <>
                    <div className="grid gap-1"><Label>Business name *</Label><Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required autoComplete="organization" /></div>
                    <div className="grid gap-1"><Label>Contact name *</Label><Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required autoComplete="name" /></div>
                    <div className="grid gap-1"><Label>Work email *</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
                    <div className="grid gap-1"><Label>Password *</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1"><Label>Phone *</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} required autoComplete="tel" /></div>
                      <div className="grid gap-1"><Label>Country *</Label>
                        <Select value={country} onValueChange={setCountry}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                      </div>
                    </div>
                    <div className="grid gap-1"><Label>Industry *</Label>
                      <Select value={industry} onValueChange={setIndustry}><SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger><SelectContent>{INDUSTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                    </div>
                    <div className="grid gap-1"><Label>Company size *</Label>
                      <Select value={companySize} onValueChange={setCompanySize}><SelectTrigger><SelectValue placeholder="Team size" /></SelectTrigger><SelectContent>{COMPANY_SIZES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid gap-1"><Label>Full name *</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" /></div>
                    <div className="grid gap-1"><Label>Email *</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
                    <div className="grid gap-1"><Label>Password *</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1"><Label>Phone *</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} required autoComplete="tel" /></div>
                      <div className="grid gap-1"><Label>Country *</Label>
                        <Select value={country} onValueChange={setCountry}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                      </div>
                    </div>
                    <div className="grid gap-1"><Label>City *</Label><Input value={city} onChange={(e) => setCity(e.target.value)} required autoComplete="address-level2" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1"><Label>Primary platform *</Label>
                        <Select value={primaryPlatform} onValueChange={setPrimaryPlatform}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{PRIMARY_PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
                      </div>
                      <div className="grid gap-1"><Label>Creator category *</Label>
                        <Select value={niche} onValueChange={setNiche}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{CREATOR_CATEGORIES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select>
                      </div>
                    </div>
                  </>
                )}
                <Button type="submit" disabled={loading} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
                <p className="text-[11px] text-muted-foreground text-center">By continuing you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
