import { useAuth } from "@/lib/auth";
import { useDB } from "@/lib/useDB";
import { formatRelative } from "@/lib/activity";
import { loadDB, saveDB, uid } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { PaperClipIcon as Paperclip, PaperAirplaneIcon as Send, XMarkIcon as X } from '@heroicons/react/24/outline';
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
    <div className="bg-card border border-border/60 rounded-md shadow-2xs overflow-hidden flex flex-col h-[480px]">
      <div className="p-4 border-b border-border/40">
        <h3 className="font-display font-bold text-base text-foreground tracking-tight">Messages</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Conversation between brand & creator on this campaign.</p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.length === 0 && <div className="text-center text-xs sm:text-sm text-muted-foreground mt-12">No messages yet. Start the conversation.</div>}
        {msgs.map((m) => {
          const mine = m.senderId === user.id;
          const sender = db.users.find((u) => u.id === m.senderId);
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-md px-3.5 py-2.5 text-xs sm:text-sm ${mine ? "bg-teal-600 text-white shadow-2xs" : "bg-surface-2 text-foreground border border-border/40"}`}>
                {!mine && <div className="text-[11px] font-semibold opacity-80 mb-0.5">{sender?.name}</div>}
                {m.body && <div className="whitespace-pre-wrap leading-relaxed">{m.body}</div>}
                {m.attachments?.map((a, i) => (
                  <a key={i} href={a.url} download={a.name} className="mt-1.5 inline-flex items-center gap-1.5 text-xs underline opacity-90">
                    <Paperclip className="h-3 w-3" /> {a.name}
                  </a>
                ))}
                <div className={`text-[10px] mt-1 font-mono ${mine ? "text-white/70" : "text-muted-foreground"}`}>{formatRelative(m.createdAt)}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="p-3 border-t border-border/40 space-y-2">
        {attachment && (
          <div className="text-xs text-muted-foreground flex items-center justify-between bg-surface-2 border border-border/40 rounded-md px-2.5 py-1">
            <span className="truncate inline-flex items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span>{attachment.name}</span>
            </span>
            <button onClick={() => setAttachment(null)} className="ml-2 p-0.5 text-muted-foreground hover:text-foreground rounded transition-colors" aria-label="Remove attachment">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input type="file" hidden ref={fileRef} onChange={onFile} />
          <Button type="button" size="icon" variant="ghost" onClick={() => fileRef.current?.click()} className="rounded-md h-9 w-9 text-muted-foreground hover:text-foreground">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Write a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            className="rounded-md bg-surface-2/60 dark:bg-surface border border-border/40 text-xs sm:text-sm h-9"
          />
          <Button onClick={send} size="icon" className="bg-teal-600 hover:bg-teal-700 text-white rounded-md h-9 w-9 shadow-xs shrink-0"><Send className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
};
