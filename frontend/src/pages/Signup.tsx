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
import { BuildingOffice2Icon as Building2, UsersIcon as Users, ArrowLeftIcon as ArrowLeft, EnvelopeOpenIcon as MailCheck } from '@heroicons/react/24/outline';
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthShowcase } from "@/components/AuthShowcase";

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Senegal", "Ethiopia", "Egypt", "Morocco", "Rwanda", "Uganda", "Other"];

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"role" | "form">("role");
  const [role, setRole] = useState<Role>("creator");
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [devVerifyUrl, setDevVerifyUrl] = useState<string | null>(null);

  // Shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");

  // Creator
  const [fullName, setFullName] = useState("");

  // Brand
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      let res: any;
      if (role === "creator") {
        if (!fullName || !country || !phone) {
          toast.error("Please complete all required fields."); setLoading(false); return;
        }
        res = await signUpWithPassword({
          role: "creator",
          full_name: fullName,
          email, password, phone, country,
        } as any);
      } else {
        if (!businessName || !contactPerson || !country || !phone) {
          toast.error("Please complete all required fields."); setLoading(false); return;
        }
        res = await signUpWithPassword({
          role: "brand",
          full_name: contactPerson,
          contact_person: contactPerson,
          business_name: businessName,
          email, password, phone, country,
        } as any);
      }
      if (res?.verificationUrl) {
        setDevVerifyUrl(res.verificationUrl);
      }
      const u = getCurrentUser();
      if (u) {
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
      "text-left rounded-md p-4 transition-colors duration-150",
      role === value ? "bg-primary/5 shadow-sm" : "hover:bg-surface-2 border border-transparent"
    )}>
      <Icon className={cn("h-6 w-6", role === value ? "text-primary" : "text-muted-foreground")} />
      <div className="mt-6 text-sm font-semibold text-foreground">{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
    </button>
  );

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-background p-4 md:p-6 gap-6 overflow-hidden">
      
      {/* Left Panel: Form (Scrollable) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center h-full overflow-y-auto scrollbar-hide">
        <div className="w-[90%] sm:w-[85%] max-w-xl my-auto py-8">
          
          <div className="mb-8">
            <div className="inline-flex items-center justify-center h-12 bg-surface-2 dark:bg-surface rounded-md mb-6 px-3">
              <Logo size="sm" />
            </div>
          </div>

          {pendingEmail ? (
            <div className="text-center py-6">
              <div className="mx-auto h-12 w-12 rounded-md bg-primary/10 grid place-items-center mb-6">
                <MailCheck className="h-6 w-6 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">Verify your email</h1>
              <p className="text-muted-foreground text-sm mt-2">
                We sent a confirmation link to <span className="text-foreground font-semibold">{pendingEmail}</span>. Click it to activate your account, then sign in.
              </p>
              {devVerifyUrl && (
                <div className="mt-4 p-3 bg-muted/60 border rounded-md text-xs text-left break-all">
                  <span className="font-semibold text-foreground block mb-1">Development Verification Link:</span>
                  <a href={devVerifyUrl} className="text-primary hover:underline">{devVerifyUrl}</a>
                </div>
              )}
              <Button asChild className="w-full mt-8"><Link to="/login">Go to sign in</Link></Button>
              <p className="mt-4 text-xs text-muted-foreground">Didn't get it? Check your spam folder.</p>
            </div>
          ) : step === "role" ? (

            <>
              <h1 className="font-display text-2xl font-bold text-foreground">Get Started</h1>
              <p className="text-muted-foreground text-sm mt-1">Welcome to CreatorYard - Let's create your account</p>

              <div className="w-full h-px bg-border/40 my-8" />

              <div className="grid grid-cols-2 gap-3 mt-6">
                <RoleCard value="brand" icon={Building2} title="Brand" desc="Run campaigns & hire creators" />
                <RoleCard value="creator" icon={Users} title="Creator" desc="Apply, submit work, get paid" />
              </div>

              <Button onClick={() => setStep("form")} className="w-full mt-6">
                Continue as {role === "brand" ? "Brand" : "Creator"}
              </Button>

              <p className="mt-8 text-sm text-center text-muted-foreground">
                Already have an account? <Link to="/login" className="text-foreground font-semibold hover:text-primary transition-colors">Log in</Link>
              </p>
            </>
          ) : (
            <>
              <button onClick={() => setStep("role")} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Change role
              </button>
              <h1 className="font-display text-2xl font-bold text-foreground">{role === "brand" ? "Brand details" : "Creator details"}</h1>
              <p className="text-muted-foreground text-sm mt-1">Tell us a bit about {role === "brand" ? "your business" : "you"}.</p>

              <div className="w-full h-px bg-border/40 my-6" />

              <Button variant="outline" className="w-full flex items-center justify-center gap-2 mb-4 bg-surface text-foreground hover:bg-surface-2 border-border/60">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Sign up with Google
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/40" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground font-semibold">Or sign up with email</span></div>
              </div>

              <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
                {role === "brand" ? (
                  <>
                    <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Business name *</Label><Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required autoComplete="organization" /></div>
                    <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Name (Account Operator) *</Label><Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required autoComplete="name" /></div>
                    <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Work email *</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
                    <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password *</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" /></div>
                    <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone *</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} required autoComplete="tel" /></div>
                    <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Country *</Label>
                      <Select value={country} onValueChange={setCountry}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full name *</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" /></div>
                    <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email *</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
                    <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password *</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" /></div>
                    <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Country *</Label>
                      <Select value={country} onValueChange={setCountry}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone *</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} required autoComplete="tel" /></div>
                  </>
                )}
                <div className="sm:col-span-2 mt-2">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center mt-4">By continuing you agree to our <Link to="/terms" className="underline hover:text-foreground">Terms</Link> and <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.</p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right Panel: Graphic Showcase (Sticky/Fixed) */}
      <div className="hidden lg:flex relative w-1/2 rounded-md overflow-hidden bg-surface-2 dark:bg-surface items-center justify-center h-full">
        <AuthShowcase />
      </div>
    </div>
  );
};

export default Signup;
