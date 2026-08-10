import { useAuth } from "@/lib/auth";
import { useDB } from "@/lib/useDB";
import { formatRelative } from "@/lib/activity";
import { loadDB, saveDB, uid } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { motion } from "framer-motion";
import { pushActivity } from "@/lib/activity";

interface Props { campaignId: string; otherPartyIds: string[] }

export const MessageThread = ({ campaignId, otherPartyIds }: Props) => {
  const user = useAuth()!;
  const db = useDB();
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<{ name: string; url: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const msgs = db.messages.filter((m) => m.campaignId === campaignId).sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    // mark as read
    const d = loadDB();
    let changed = false;
    d.messages.forEach((m) => {
      if (m.campaignId === campaignId && !m.readBy.includes(user.id)) {
        m.readBy.push(user.id); changed = true;
      }
    });
    if (changed) saveDB(d);
  }, [msgs.length, campaignId, user.id]);

  const send = () => {
    if (!text.trim() && !attachment) return;
    const d = loadDB();
    d.messages.push({
      id: uid("m"),
      campaignId,
      senderId: user.id,
      body: text.trim(),
      attachments: attachment ? [attachment] : undefined,
      readBy: [user.id],
      createdAt: new Date().toISOString(),
    });
    const camp = d.campaigns.find((c) => c.id === campaignId);
    if (camp) {
      pushActivity(d, {
        kind: "message.sent",
        actorId: user.id,
        recipients: otherPartyIds,
        campaignId,
        message: `New message in "${camp.title}"`,
        link: user.role === "brand" ? `/brand/campaigns/${campaignId}` : `/creator/campaigns/${campaignId}`,
      });
    }
    saveDB(d);
    setText(""); setAttachment(null);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => setAttachment({ name: f.name, url: String(r.result) });
    r.readAsDataURL(f);
  };

  return (
    <div className="cy-card flex flex-col h-[480px]">
      <div className="p-4 border-b border-border">
        <h3 className="font-display font-semibold">Messages</h3>
        <p className="text-xs text-muted-foreground">Conversation between brand & creator on this campaign.</p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.length === 0 && <div className="text-center text-sm text-muted-foreground mt-12">No messages yet. Start the conversation.</div>}
        {msgs.map((m) => {
          const mine = m.senderId === user.id;
          const sender = db.users.find((u) => u.id === m.senderId);
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${mine ? "bg-secondary text-secondary-foreground" : "bg-muted text-foreground"}`}>
                {!mine && <div className="text-[11px] font-semibold opacity-70 mb-0.5">{sender?.name}</div>}
                {m.body && <div className="whitespace-pre-wrap">{m.body}</div>}
                {m.attachments?.map((a, i) => (
                  <a key={i} href={a.url} download={a.name} className="mt-1.5 inline-flex items-center gap-1.5 text-xs underline opacity-90">
                    <Paperclip className="h-3 w-3" /> {a.name}
                  </a>
                ))}
                <div className={`text-[10px] mt-1 ${mine ? "text-secondary-foreground/60" : "text-muted-foreground"}`}>{formatRelative(m.createdAt)}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="p-3 border-t border-border space-y-2">
        {attachment && (
          <div className="text-xs text-muted-foreground flex items-center justify-between bg-muted rounded px-2 py-1">
            <span className="truncate">📎 {attachment.name}</span>
            <button onClick={() => setAttachment(null)} className="ml-2 text-foreground">×</button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input type="file" hidden ref={fileRef} onChange={onFile} />
          <Button type="button" size="icon" variant="ghost" onClick={() => fileRef.current?.click()}>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Write a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <Button onClick={send} size="icon" className="bg-secondary text-secondary-foreground hover:bg-secondary/90"><Send className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
};
