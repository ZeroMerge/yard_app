import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { creatorsApi } from "@/api/creators";
import { Creator } from "@/api/types";
import { PageHeader } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Camera, Sparkles } from "lucide-react";

const Profile = () => {
  const user = useAuth()!;

  const { data: profile } = useQuery<Creator>({
    queryKey: ["creator_me"],
    queryFn: creatorsApi.getMe,
  });

  const [bio, setBio] = useState("");
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");
  const [reelRate, setReelRate] = useState(180000);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
      setDisplayName(profile.displayName || user?.name || "");
      const ig = profile.socialAccounts?.find((s) => s.platform === "instagram")?.handle || "";
      const tt = profile.socialAccounts?.find((s) => s.platform === "tiktok")?.handle || "";
      const yt = profile.socialAccounts?.find((s) => s.platform === "youtube")?.handle || "";
      setInstagram(ig);
      setTiktok(tt);
      setYoutube(yt);
      const rate = profile.rates?.find((r) => r.deliverableType === "reel")?.amount;
      if (rate) setReelRate(Number(rate));
    }
  }, [profile, user?.name]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };

  return (
    <div>
      <PageHeader
        title="Your Creator Profile"
        subtitle="Brands discover you through your structured rate cards, niche, and portfolio."
      />
      <form onSubmit={save} className="cy-card p-8 max-w-3xl space-y-6 shadow-sm">
        <div className="flex items-center gap-4 pb-4 border-b border-border/30">
          <div className="h-20 w-20 rounded-2xl bg-gradient-teal text-white grid place-items-center text-2xl font-extrabold shadow-sm">
            {displayName.charAt(0)}
          </div>
          <div>
            <label className="cursor-pointer text-sm font-semibold inline-flex items-center gap-2 px-4 py-2 bg-surface-2 dark:bg-surface rounded-xl hover:bg-muted transition-colors">
              <Camera className="h-4 w-4 text-teal-600 dark:text-teal-400" /> Change Profile Photo
              <input type="file" accept="image/*" hidden />
            </label>
            <p className="text-xs text-muted-foreground mt-1">Recommended: Square PNG or JPG, at least 400x400px</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-semibold text-sm">Display Name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="rounded-xl h-11 bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-sm">Deliverable Rate (₦ NGN per Reel)</Label>
            <Input
              type="number"
              value={reelRate}
              onChange={(e) => setReelRate(Number(e.target.value))}
              className="rounded-xl h-11 bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-semibold text-sm">Creator Bio & Positioning</Label>
          <Textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell brands about your audience demographics, past reviews, and daily content focus..."
            className="rounded-xl bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500 leading-relaxed"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="font-semibold text-sm">Instagram Handle</Label>
            <Input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@handle"
              className="rounded-xl h-11 bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-sm">TikTok Handle</Label>
            <Input
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              placeholder="@handle"
              className="rounded-xl h-11 bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-sm">YouTube Channel</Label>
            <Input
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="@channel"
              className="rounded-xl h-11 bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border/30">
          <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-6 shadow-sm">
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
