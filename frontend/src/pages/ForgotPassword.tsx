import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { authApi } from "@/api/auth";
import { toast } from "sonner";
import { ArrowPathIcon as Loader2, EnvelopeOpenIcon as MailCheck, ArrowLeftIcon as ArrowLeft } from '@heroicons/react/24/outline';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setSent(true);
      if (res.resetUrl) {
        setDevResetUrl(res.resetUrl);
      }
      toast.success("Password reset link sent!");
    } catch (err: any) {
      setSent(true);
      toast.success("Password reset link sent!");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-block mb-6"><Logo /></Link>
        {sent ? (
          <div className="text-center py-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 grid place-items-center">
              <MailCheck className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold mt-5">Check your email</h1>
            <p className="text-muted-foreground text-sm mt-2">
              If an account exists for <span className="text-foreground font-medium">{email}</span>, we've sent a link to reset your password.
            </p>
            {devResetUrl && (
              <div className="mt-4 p-3 bg-muted/60 border rounded-md text-xs text-left break-all">
                <span className="font-semibold text-foreground block mb-1">Development Reset Link:</span>
                <a href={devResetUrl} className="text-primary hover:underline">{devResetUrl}</a>
              </div>
            )}
            <Button asChild variant="outline" className="mt-6"><Link to="/login"><ArrowLeft className="h-4 w-4 mr-2" /> Back to sign in</Link></Button>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold">Forgot your password?</h1>
            <p className="text-muted-foreground text-sm mt-1">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={submit} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
              </Button>
            </form>
            <p className="mt-6 text-sm text-muted-foreground">Remembered it? <Link to="/login" className="text-foreground font-medium underline-offset-4 hover:underline">Sign in</Link></p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
