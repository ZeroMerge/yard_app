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
import { Calendar as CalIcon, Video, Plus } from "lucide-react";
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
    <div className="cy-card">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold">Meetings</h3>
          <p className="text-xs text-muted-foreground">Schedule and track all calls for this campaign.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90"><Plus className="h-3.5 w-3.5 mr-1" /> Schedule</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule a meeting</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
                <div className="space-y-1"><Label>Time</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
              </div>
              <div className="space-y-1"><Label>Duration (minutes)</Label><Input type="number" min={15} step={15} value={duration} onChange={(e) => setDuration(Number(e.target.value))} /></div>
              <div className="text-xs text-muted-foreground">A Google Meet link will be generated automatically.</div>
            </div>
            <DialogFooter><Button onClick={schedule} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Schedule</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="divide-y divide-border">
        {meetings.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No meetings yet.</div>}
        {meetings.map((m, i) => {
          const dt = new Date(m.startsAt);
          const upcoming = dt.getTime() > Date.now();
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="p-4 flex items-start gap-3">
              <div className="h-9 w-9 rounded-md bg-primary/10 text-primary grid place-items-center"><CalIcon className="h-4 w-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{m.title}</div>
                <div className="text-xs text-muted-foreground">{dt.toLocaleString()} · {m.durationMin}min · {upcoming ? "Upcoming" : "Past"}</div>
                <a href={m.meetLink} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <Video className="h-3 w-3" /> {m.meetLink}
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
