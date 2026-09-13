import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { dashboardPathFor, signInWithPassword, getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AuthShowcase } from "@/components/AuthShowcase";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast.success("Email verified successfully! You can now sign in.");
    }
    const err = searchParams.get("verification_error");
    if (err) {
      toast.error(decodeURIComponent(err));
    }
  }, [searchParams]);


  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await signInWithPassword(email, password);
      const u = getCurrentUser();
      toast.success(`Welcome back${u ? `, ${u.name.split(" ")[0]}` : ""}`);
      navigate(u ? dashboardPathFor(u.role) : "/");
    } catch (err: any) {
      const msg = err?.message ?? "Sign-in failed";
      if (msg.toLowerCase().includes("not confirmed") || msg.toLowerCase().includes("email not")) {
        toast.error("Please verify your email address first. Check your inbox for the confirmation link.");
      } else {
        toast.error(msg.includes("Invalid") ? "Incorrect email or password." : msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-background p-4 md:p-6 gap-6 overflow-hidden">
      
      {/* Left Panel: Form (Scrollable) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center h-full overflow-y-auto scrollbar-hide">
        <div className="w-[90%] sm:w-[85%] max-w-md my-auto py-8">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center h-12 bg-surface-2 dark:bg-surface rounded-md mb-6 px-3">
              <Logo size="sm" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome to CreatorYard - Let's get you logged in</p>
          </div>

          <div className="w-full h-px bg-border/40 mb-8" />

          <Button variant="outline" className="w-full flex items-center justify-center gap-2 mb-4 bg-surface text-foreground hover:bg-surface-2 border-border/60">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/40" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground font-semibold">Or continue with email</span></div>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@brand.co" 
                required 
                autoComplete="email" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                <Link to="/forgot-password" className="text-xs font-semibold text-foreground hover:text-primary transition-colors">Forgot?</Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                required 
                autoComplete="current-password" 
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
            </Button>
          </form>

          <p className="mt-8 text-sm text-center text-muted-foreground">
            Don't have an account? <Link to="/signup" className="text-foreground font-semibold hover:text-primary transition-colors">Sign up</Link>
          </p>
        </div>
      </div>

      {/* Right Panel: Graphic Showcase (Sticky/Fixed) */}
      <div className="hidden lg:flex relative w-1/2 rounded-md overflow-hidden bg-surface-2 dark:bg-surface items-center justify-center h-full">
        <AuthShowcase />
      </div>
    </div>
  );
};

export default Login;
