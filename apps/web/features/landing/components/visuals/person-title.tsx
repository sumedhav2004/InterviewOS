import { Mic } from "lucide-react";

export function PersonTile({ name, role, initials, active }: { name: string; role: string; initials: string; active?: boolean }) {
  return <div className={`relative flex min-h-28 flex-col justify-between overflow-hidden rounded-md border bg-muted/60 p-3 ${active ? "border-primary/50" : "border-border"}`}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_58%)]" />
    <div className="relative flex justify-between"><span className="h-2 w-2 rounded-full bg-success"/><Mic className="h-3.5 w-3.5 text-muted-foreground"/></div>
    <div className="relative mx-auto grid h-11 w-11 place-items-center rounded-full border border-border bg-secondary font-mono text-xs text-foreground">{initials}</div>
    <div className="relative"><p className="text-[11px] font-medium">{name}</p><p className="text-[9px] text-muted-foreground">{role}</p></div>
  </div>
}