import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useState } from "react";
import { setAdminAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AuthShowcase } from "@/components/AuthShowcase";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const json = await res.json();
      const payload = json.data || json;

      if (!res.ok) {
        throw new Error(payload.message || "Invalid administrative credentials");
      }

      if (payload.user?.role !== "admin") {
        throw new Error("Access Denied: Administrative account required.");
      }

      setAdminAuth(payload.token, payload.user);
      toast.success("Welcome back, Administrator");
      navigate("/");
    } catch (err: any) {
      toast.error(err?.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-background p-4 md:p-6 gap-6 overflow-hidden">
      {/* Left Panel: Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center h-full overflow-y-auto scrollbar-hide">
        <div className="w-[90%] sm:w-[85%] max-w-md my-auto py-8">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center h-12 bg-surface-2 dark:bg-surface rounded-md mb-6 px-3">
              <Logo size="sm" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to Yard Platform Admin</p>
          </div>

          <div className="w-full h-px bg-border/40 mb-8" />

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yard.dev"
                required
                autoComplete="email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background transition-colors duration-150 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background transition-colors duration-150 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </button>
          </form>
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
