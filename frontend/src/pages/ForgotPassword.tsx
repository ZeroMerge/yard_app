import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth";
import { toast } from "sonner";
import { Loader2, MailCheck, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err: any) {
      // Always show success to avoid enumeration, but log
      setSent(true);
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
