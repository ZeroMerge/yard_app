import { useAuth } from "@/lib/auth";
import { useDB } from "@/lib/useDB";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { loadDB, saveDB, uid } from "@/lib/mockData";
import { newMeetLink } from "@/lib/meetings";
import { pushActivity } from "@/lib/activity";
import { CalendarIcon as CalIcon, VideoCameraIcon as Video, PlusIcon as Plus } from '@heroicons/react/24/outline';
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Props { campaignId: string; counterpartyIds: string[] }

export const MeetingScheduler = ({ campaignId, counterpartyIds }: Props) => {
  const user = useAuth()!;
  const db = useDB();
  const meetings = db.meetings.filter((m) => m.campaignId === campaignId).sort((a, b) => (a.startsAt < b.startsAt ? 1 : -1));
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Kickoff call");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("14:00");
  const [duration, setDuration] = useState(30);

  const schedule = () => {
    if (!date) { toast.error("Pick a date"); return; }
    const startsAt = new Date(`${date}T${time}:00`).toISOString();
    const d = loadDB();
    const camp = d.campaigns.find((c) => c.id === campaignId);
    d.meetings.push({
      id: uid("mt"),
      campaignId,
      title,
      startsAt,
      durationMin: duration,
      meetLink: newMeetLink(),
      attendees: [user.id, ...counterpartyIds],
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    });
    if (camp) {
      pushActivity(d, {
        kind: "meeting.scheduled",
        actorId: user.id,
        recipients: counterpartyIds,
        campaignId,
        message: `${title} scheduled for "${camp.title}"`,
        link: user.role === "brand" ? `/brand/campaigns/${campaignId}` : `/creator/campaigns/${campaignId}`,
      });
    }
    saveDB(d);
    toast.success("Meeting scheduled");
    setOpen(false); setTitle("Kickoff call"); setDate(""); setTime("14:00"); setDuration(30);
  };

  return (
    <div className="bg-card border border-border/60 rounded-md shadow-2xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-border/40 flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-base text-foreground tracking-tight">Meetings</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Schedule and track all calls for this campaign.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-semibold h-8 px-3 shadow-xs">
              <Plus className="h-3.5 w-3.5 mr-1" /> Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-md border border-border/60 bg-card p-6 shadow-xl max-w-md">
            <DialogHeader><DialogTitle className="font-display font-bold text-base">Schedule a meeting</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 text-xs sm:text-sm h-10" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs font-semibold">Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 text-xs sm:text-sm h-10" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold">Time</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 text-xs sm:text-sm h-10" /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Duration (minutes)</Label><Input type="number" min={15} step={15} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 text-xs sm:text-sm h-10" /></div>
              <div className="text-[11px] text-muted-foreground">A Google Meet link will be generated automatically.</div>
            </div>
            <DialogFooter><Button onClick={schedule} className="bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-semibold h-9 px-4">Schedule Call</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="divide-y divide-border/30">
        {meetings.length === 0 && <div className="p-8 text-center text-xs sm:text-sm text-muted-foreground">No meetings scheduled yet.</div>}
        {meetings.map((m, i) => {
          const dt = new Date(m.startsAt);
          const upcoming = dt.getTime() > Date.now();
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="p-3.5 sm:p-4 flex items-start gap-3 hover:bg-surface-2/50 transition-colors">
              <div className="h-9 w-9 rounded-md bg-teal-600/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 grid place-items-center shrink-0"><CalIcon className="h-4 w-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-foreground">{m.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5"><span className="font-mono">{dt.toLocaleString()}</span> · {m.durationMin}min · <span className="font-semibold text-foreground">{upcoming ? "Upcoming" : "Past"}</span></div>
                <a href={m.meetLink} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold">
                  <Video className="h-3.5 w-3.5" /> {m.meetLink}
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
