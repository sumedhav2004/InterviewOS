"use client"

import { useState } from "react";
import { InterviewWorkspace } from "./interview-workspace";
import { Whiteboard } from "./whiteboard";
import { VideoView } from "./VideoView";
import { ChatView } from "./ChatView";
import { NotesView } from "./NotesView";

const tabNames = ["Code", "Whiteboard", "Video", "Chat", "Notes"] as const;
export function ProductShowcase() {
  const [tab, setTab] = useState<(typeof tabNames)[number]>("Code");
  return <div><div role="tablist" aria-label="Workspace views" className="mx-auto mb-8 flex max-w-xl gap-1 overflow-x-auto rounded-lg border border-border bg-card/80 p-1">{tabNames.map(name=><button role="tab" aria-selected={tab===name} onClick={()=>setTab(name)} key={name} className={`h-10 min-w-24 flex-1 rounded-md px-4 text-sm transition-all ${tab===name?"bg-secondary text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>{name}</button>)}</div>
    <div className="min-h-[460px] overflow-hidden rounded-lg border border-border bg-card p-3 shadow-[0_25px_90px_color-mix(in_oklab,var(--primary)_10%,transparent)] sm:p-5">
      {tab === "Code" && <div className="animate-in fade-in duration-300"><InterviewWorkspace compact/></div>}
      {tab === "Whiteboard" && <Whiteboard/>}{tab === "Video" && <VideoView/>}{tab === "Chat" && <ChatView/>}{tab === "Notes" && <NotesView/>}
    </div></div>
}