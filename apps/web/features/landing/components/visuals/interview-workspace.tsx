import {
  Camera,
  ChevronDown,
  Code2,
  Maximize2,
  MessageSquare,
  Mic,
  Play,
  StickyNote,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PersonTile } from "./person-title";



const code = [
  <><span className="text-code-keyword">function</span> <span className="text-code-function">findFirstUnique</span>(s: <span className="text-cyan">string</span>): <span className="text-cyan">number</span> {'{'}</>,
  <>  <span className="text-code-keyword">const</span> counts = <span className="text-code-keyword">new</span> Map&lt;<span className="text-cyan">string</span>, <span className="text-cyan">number</span>&gt;();</>,
  <></>,
  <>  <span className="text-code-keyword">for</span> (<span className="text-code-keyword">const</span> char <span className="text-code-keyword">of</span> s) {'{'}</>,
  <>    counts.set(char, (counts.get(char) ?? <span className="text-code-string">0</span>) + <span className="text-code-string">1</span>);</>,
  <>  {'}'}</>,
  <></>,
  <>  <span className="text-code-keyword">for</span> (<span className="text-code-keyword">let</span> i = <span className="text-code-string">0</span>; i &lt; s.length; i++) {'{'}</>,
  <>    <span className="text-code-keyword">if</span> (counts.get(s[i]) === <span className="text-code-string">1</span>) <span className="text-code-keyword">return</span> i;</>,
  <>  {'}'}</>,
  <>  <span className="text-code-keyword">return</span> -<span className="text-code-string">1</span>;</>,
  <>{'}'}</>,
];


export function InterviewWorkspace({ compact = false }: { compact?: boolean }) {
  return <div className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_28px_100px_color-mix(in_oklab,var(--primary)_13%,transparent)]">
    <div className="grid h-11 grid-cols-[minmax(0,1fr)_auto] items-center border-b border-border bg-secondary/50 px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2"><span className="h-2 w-2 shrink-0 rounded-full bg-success shadow-[0_0_9px_var(--success)]"/><span className="truncate font-mono text-[10px] text-muted-foreground">INTERVIEW / FRONTEND ENGINEER</span></div>
      <div className="flex items-center gap-2 font-mono text-[10px]"><span className="hidden text-muted-foreground sm:inline">Shared session</span><span className="rounded bg-background px-2 py-1 text-foreground">42:18</span></div>
    </div>
    <div className="grid min-h-[360px] grid-cols-1 md:grid-cols-[minmax(0,1fr)_190px]">
      <div className="min-w-0 border-b border-border md:border-b-0 md:border-r">
        <div className="flex h-10 items-center justify-between border-b border-border px-3">
          <div className="flex items-center gap-2 font-mono text-[10px]"><Code2 className="h-3.5 w-3.5 text-primary"/>solution.ts <span className="text-muted-foreground">•</span> <span className="text-muted-foreground">TypeScript</span><ChevronDown className="h-3 w-3 text-muted-foreground"/></div>
          <Button size="sm" className="h-7 px-2.5 text-[10px]"><Play className="h-3 w-3"/> Run</Button>
        </div>
        <div className={`relative overflow-hidden bg-background/50 py-4 font-mono text-[10px] leading-6 sm:text-xs ${compact ? "h-64" : "h-[318px]"}`}>
          {code.map((line, i) => <div key={i} className={`${i === 8 ? "bg-primary/[.07]" : ""} grid grid-cols-[34px_1fr] px-2`}><span className="select-none text-right text-muted-foreground/40">{i + 1}</span><code className="pl-4 text-foreground/80">{line}{i === 8 && <span className="animate-cursor ml-0.5 inline-block h-4 w-px translate-y-1 bg-cyan"/>}</code></div>)}
          <div className="absolute bottom-3 left-[46%] rounded border border-cyan/30 bg-card px-2 py-1 font-sans text-[9px] text-cyan shadow-lg">Jordan</div>
        </div>
      </div>
      <aside className="grid grid-cols-2 gap-2 p-2 md:grid-cols-1">
        <PersonTile name="Alex Morgan" role="Interviewer" initials="AM" />
        <PersonTile name="Jordan Lee" role="Candidate" initials="JL" active />
        <div className="col-span-2 hidden rounded-md border border-border bg-background/40 p-2 md:block">
          <p className="font-mono text-[9px] text-muted-foreground">LIVE ACTIVITY</p>
          <p className="mt-2 flex items-center gap-2 text-[10px]"><span className="animate-pulse-soft h-1.5 w-1.5 rounded-full bg-cyan"/>Jordan is typing</p>
        </div>
      </aside>
    </div>
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t border-border bg-secondary/40 p-2">
      <div className="flex min-w-0 gap-1 overflow-x-auto">
        {[Code2, Maximize2, MessageSquare, StickyNote].map((Icon,i)=><button key={i} aria-label={["Code","Whiteboard","Chat","Notes"][i]} className={`grid h-8 w-9 shrink-0 place-items-center rounded-md transition-colors ${i===0?"bg-primary/15 text-primary":"text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon className="h-3.5 w-3.5"/></button>)}
      </div>
      <div className="flex items-center gap-1"><button aria-label="Microphone" className="grid h-8 w-8 place-items-center rounded-full bg-muted text-foreground"><Mic className="h-3.5 w-3.5"/></button><button aria-label="Camera" className="grid h-8 w-8 place-items-center rounded-full bg-muted text-foreground"><Camera className="h-3.5 w-3.5"/></button><Button size="sm" variant="destructive" className="h-8 px-3 text-[10px]">End</Button></div>
    </div>
  </div>
}