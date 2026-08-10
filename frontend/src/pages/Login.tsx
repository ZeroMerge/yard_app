import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { dashboardPathFor, signInWithPassword, getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="hidden md:flex relative bg-secondary text-secondary-foreground p-10 flex-col justify-between overflow-hidden">
        <Link to="/"><Logo tone="light" /></Link>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10">
          <h2 className="font-display text-3xl font-bold">Creator marketing, without the chaos.</h2>
          <p className="mt-3 text-secondary-foreground/70 max-w-md">Sign in to your workspace to run campaigns, approve content, and pay creators.</p>
        </motion.div>
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-gold opacity-30 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <Link to="/" className="md:hidden inline-block mb-6"><Logo /></Link>
          <h1 className="font-display text-2xl font-bold">Sign in</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back to CreatorYard.</p>

          <form onSubmit={submit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@brand.co" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Forgot password?</Link>
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">No account? <Link to="/signup" className="text-foreground font-medium underline-offset-4 hover:underline">Create one</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
