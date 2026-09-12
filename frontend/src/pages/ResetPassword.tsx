import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { updatePassword, dashboardPathFor, getCurrentUser } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowPathIcon as Loader2 } from '@heroicons/react/24/outline';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase handles the recovery token in the URL hash and establishes a session.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else {
        // Give it a beat for hash processing
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: d2 }) => {
            if (d2.session) setReady(true);
            else setError("This reset link is invalid or has expired. Request a new one.");
          });
        }, 800);
      }
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (password !== confirm) { toast.error("Passwords don't match."); return; }
    setLoading(true);
    try {
      await updatePassword(password);
      toast.success("Password updated. You're signed in.");
      const u = getCurrentUser();
      navigate(u ? dashboardPathFor(u.role) : "/login");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-block mb-6"><Logo /></Link>
        <h1 className="font-display text-2xl font-bold">Set a new password</h1>
        <p className="text-muted-foreground text-sm mt-1">Choose a strong password you don't use elsewhere.</p>

        {error ? (
          <div className="mt-6 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
            <div className="mt-3">
              <Link to="/forgot-password" className="text-foreground font-medium underline-offset-4 hover:underline">Request a new link</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} autoComplete="new-password" />
            </div>
            <Button type="submit" disabled={loading || !ready} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : ready ? "Update password" : "Verifying link…"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
