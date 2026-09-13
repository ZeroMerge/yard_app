import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deliverablesApi } from "@/api/deliverables";
import { Campaign } from "@/api/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  VideoCameraIcon,
  LinkIcon,
  ArrowUpTrayIcon as UploadIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  SparklesIcon,
  PhotoIcon,
  FilmIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SubmitDeliverableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign;
  applicationId: string;
  isRevision?: boolean;
  revisionNotes?: string;
  currentVersion?: number;
  onSubmitted?: () => void;
}

export function SubmitDeliverableDialog({
  open,
  onOpenChange,
  campaign,
  applicationId,
  isRevision = false,
  revisionNotes,
  currentVersion = 0,
  onSubmitted,
}: SubmitDeliverableDialogProps) {
  const queryClient = useQueryClient();
  const nextVersion = currentVersion + 1;

  // Mode: "link" (Cloud URL / Platform link) vs "upload" (Direct file)
  const [submissionMode, setSubmissionMode] = useState<"link" | "upload">("link");
  const [providerUrl, setProviderUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [timestamps, setTimestamps] = useState("");
  const [caption, setCaption] = useState("");
  const [stickerUrl, setStickerUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const deliverableType = (campaign.deliverableType || "reel").toLowerCase();
  const isVideo =
    deliverableType.includes("reel") ||
    deliverableType.includes("tiktok") ||
    deliverableType.includes("ugc") ||
    deliverableType.includes("video");
  const isYouTube = deliverableType.includes("youtube");
  const isStory = deliverableType.includes("story");
  const isCarousel = deliverableType.includes("carousel") || deliverableType.includes("photo");

  const submitMutation = useMutation({
    mutationFn: async () => {
      let finalUrl = providerUrl.trim();
      let providerName = "cloud_link";
      let fileType = isVideo ? "video/mp4" : "image/jpeg";
      let fileSize = 10485760;

      if (submissionMode === "upload") {
        if (!selectedFile) {
          throw new Error("Please select a media file to upload.");
        }
        // In web client, create local object URL / simulate direct upload metadata
        finalUrl = URL.createObjectURL(selectedFile);
        providerName = "direct_upload";
        fileType = selectedFile.type || (isVideo ? "video/mp4" : "image/jpeg");
        fileSize = selectedFile.size;
      } else {
        if (!finalUrl) {
          throw new Error("Please enter your media URL (e.g. Google Drive, YouTube, TikTok link).");
        }
        if (finalUrl.includes("drive.google.com")) providerName = "google_drive";
        else if (finalUrl.includes("youtube.com") || finalUrl.includes("youtu.be")) providerName = "youtube";
        else if (finalUrl.includes("tiktok.com")) providerName = "tiktok";
        else if (finalUrl.includes("dropbox.com")) providerName = "dropbox";
      }

      // Compile comprehensive creator notes based on format
      const notesParts: string[] = [];
      if (notes.trim()) notesParts.push(notes.trim());
      if (caption.trim()) notesParts.push(`Caption Draft:\n${caption.trim()}`);
      if (timestamps.trim()) notesParts.push(`Integration Timestamps: ${timestamps.trim()}`);
      if (stickerUrl.trim()) notesParts.push(`Link Sticker / Promo Code: ${stickerUrl.trim()}`);

      const fullNotes = notesParts.join("\n\n");

      return deliverablesApi.submit(applicationId, {
        providerUrl: finalUrl,
        provider: providerName,
        fileType,
        fileSize,
        notes: fullNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", campaign.id] });
      toast.success(`Deliverable v${nextVersion} submitted successfully for brand review!`);
      if (onSubmitted) {
        onSubmitted();
      }
      onOpenChange(false);
      // Reset form
      setProviderUrl("");
      setNotes("");
      setCaption("");
      setTimestamps("");
      setStickerUrl("");
      setSelectedFile(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit deliverable");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card border-border/60 p-6 sm:p-7 max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader className="space-y-1.5 pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-teal-500/10 text-teal-600 dark:text-teal-400">
              {isRevision ? `Revision • Version ${nextVersion}` : `Version ${nextVersion}`}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs font-semibold text-muted-foreground capitalize">
              {campaign.deliverableType.replace("_", " ")}
            </span>
          </div>
          <DialogTitle className="font-display font-extrabold text-xl text-foreground">
            {isRevision ? "Submit Revised Deliverable" : "Submit Campaign Deliverable"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Submit your completed content for &quot;{campaign.name}&quot; for brand verification and escrow payout.
          </DialogDescription>
        </DialogHeader>

        {/* Brand Revision Banner (if revision requested) */}
        {isRevision && revisionNotes && (
          <div className="p-3.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs space-y-1 my-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400">
              <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
              Brand Revision Instructions:
            </div>
            <p className="text-foreground leading-relaxed pl-5 whitespace-pre-line">
              {revisionNotes}
            </p>
          </div>
        )}

        {/* Deliverable Format Guidance Card */}
        <div className="p-3 rounded-md bg-surface-2/60 border border-border/40 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {isYouTube ? (
              <FilmIcon className="h-5 w-5 text-primary shrink-0" />
            ) : isCarousel ? (
              <PhotoIcon className="h-5 w-5 text-primary shrink-0" />
            ) : (
              <VideoCameraIcon className="h-5 w-5 text-primary shrink-0" />
            )}
            <div>
              <div className="font-bold text-foreground capitalize">
                Format: {campaign.quantity}x {campaign.deliverableType.replace("_", " ")}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {isYouTube && "16:9 Landscape • YouTube Unlisted/Public Link or Drive video"}
                {isStory && "9:16 Vertical Story • Include link sticker/promo code"}
                {isCarousel && "1:1 / 4:5 Multi-slide carousel • High resolution images"}
                {isVideo && !isYouTube && !isStory && "9:16 Vertical Reel/TikTok • 1080p/4K • Sound enabled"}
              </div>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold text-muted-foreground bg-card border border-border/40 px-2 py-1 rounded-sm shrink-0">
            {campaign.country || "Global"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          
          {/* Submission Mode Selector */}
          <div>
            <Label className="font-bold text-xs text-foreground block mb-1.5">
              Media Delivery Method
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSubmissionMode("link")}
                className={cn(
                  "flex items-center justify-center gap-2 p-2.5 rounded-md text-xs font-semibold border transition-all",
                  submissionMode === "link"
                    ? "bg-card border-primary text-foreground shadow-xs font-bold ring-1 ring-primary/20"
                    : "bg-surface-2/50 border-border/40 text-muted-foreground hover:text-foreground"
                )}
              >
                <LinkIcon className="h-4 w-4 text-primary" />
                <span>Cloud / Media URL</span>
              </button>
              <button
                type="button"
                onClick={() => setSubmissionMode("upload")}
                className={cn(
                  "flex items-center justify-center gap-2 p-2.5 rounded-md text-xs font-semibold border transition-all",
                  submissionMode === "upload"
                    ? "bg-card border-primary text-foreground shadow-xs font-bold ring-1 ring-primary/20"
                    : "bg-surface-2/50 border-border/40 text-muted-foreground hover:text-foreground"
                )}
              >
                <UploadIcon className="h-4 w-4 text-primary" />
                <span>Direct File Upload</span>
              </button>
            </div>
          </div>

          {/* Mode 1: Cloud Link Input */}
          {submissionMode === "link" && (
            <div>
              <Label className="font-bold text-xs text-foreground block mb-1">
                {isYouTube ? "YouTube Video Link or Google Drive URL" : "Google Drive, Dropbox, or Video Link"}
              </Label>
              <Input
                type="url"
                required
                value={providerUrl}
                onChange={(e) => setProviderUrl(e.target.value)}
                placeholder={
                  isYouTube
                    ? "https://www.youtube.com/watch?v=... (Unlisted or Public)"
                    : "https://drive.google.com/file/d/... or https://www.tiktok.com/@creator/video/..."
                }
                className="w-full h-10 bg-surface-2/60 dark:bg-surface border border-border/40 rounded-md text-xs sm:text-sm focus:ring-teal-500/20 focus:border-teal-500"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Tip: Ensure link sharing permissions on Google Drive or Dropbox are set to &quot;Anyone with the link can view&quot;.
              </p>
            </div>
          )}

          {/* Mode 2: Direct File Upload Input */}
          {submissionMode === "upload" && (
            <div>
              <Label className="font-bold text-xs text-foreground block mb-1">
                Select Deliverable File
              </Label>
              <label className="border-2 border-dashed border-border/60 hover:border-teal-500/60 rounded-md p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-surface-2/30 hover:bg-surface-2/50 transition-all">
                <UploadIcon className="h-6 w-6 text-muted-foreground" />
                <div className="text-xs font-bold text-foreground text-center">
                  {selectedFile ? selectedFile.name : "Click to select file or drag & drop"}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to submit`
                    : isVideo
                    ? "MP4, MOV, or WEBM up to 100MB"
                    : "JPG, PNG, or WEBP up to 50MB"}
                </div>
                <input
                  type="file"
                  accept={isVideo ? "video/mp4,video/quicktime,video/webm" : "image/jpeg,image/png,image/webp"}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Deliverable Customization: YouTube Specifics */}
          {isYouTube && (
            <div>
              <Label className="font-bold text-xs text-foreground block mb-1">
                Brand Integration Timestamp Range
              </Label>
              <Input
                type="text"
                value={timestamps}
                onChange={(e) => setTimestamps(e.target.value)}
                placeholder="e.g. 02:15 - 04:30"
                className="w-full h-9 bg-surface-2/60 dark:bg-surface border border-border/40 rounded-md text-xs"
              />
            </div>
          )}

          {/* Deliverable Customization: Story Specifics */}
          {isStory && (
            <div>
              <Label className="font-bold text-xs text-foreground block mb-1">
                Link Sticker URL or Promo Code Used
              </Label>
              <Input
                type="text"
                value={stickerUrl}
                onChange={(e) => setStickerUrl(e.target.value)}
                placeholder="e.g. https://brand.com/discount or Code: YARD20"
                className="w-full h-9 bg-surface-2/60 dark:bg-surface border border-border/40 rounded-md text-xs"
              />
            </div>
          )}

          {/* Deliverable Customization: Caption & Copy Draft (for Reels, TikTok, Carousel) */}
          {(isVideo || isCarousel) && (
            <div>
              <Label className="font-bold text-xs text-foreground block mb-1">
                Post Caption Draft & Hashtags
              </Label>
              <Textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Include your proposed caption copy, hook callout, and brand tags for approval..."
                className="w-full p-2.5 bg-surface-2/60 dark:bg-surface border border-border/40 rounded-md text-xs focus:ring-teal-500/20 focus:border-teal-500 resize-none leading-relaxed"
              />
            </div>
          )}

          {/* Creative Concept & Delivery Notes */}
          <div>
            <Label className="font-bold text-xs text-foreground block mb-1">
              Creative Notes for Brand Review
            </Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any context regarding audio choices, color grading, or key highlights in this cut..."
              className="w-full p-2.5 bg-surface-2/60 dark:bg-surface border border-border/40 rounded-md text-xs focus:ring-teal-500/20 focus:border-teal-500 resize-none leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/40">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitMutation.isPending}
              className="rounded-md text-xs h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitMutation.isPending || (submissionMode === "upload" && !selectedFile) || (submissionMode === "link" && !providerUrl.trim())}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md text-xs h-9 px-5 shadow-xs flex items-center gap-2"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting v{nextVersion}...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>{isRevision ? `Submit Revised v${nextVersion}` : `Submit Deliverable v${nextVersion}`}</span>
                </>
              )}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
