import { Heading } from "./heading";
import { Label } from "./label";
import { MiniBoard } from "./visuals/MiniBoard";
import { MiniChat } from "./visuals/MiniChat";
import { MiniCode } from "./visuals/MiniCode";
import { MiniEvaluation } from "./visuals/MiniEvaluation";
import { MiniNotes } from "./visuals/MiniNotes";
import { MiniVideo } from "./visuals/MiniVideo";


const features=[
  ["Collaborative coding","A powerful editor designed for live technical interviews.",MiniCode,"md:col-span-2"],
  ["Built-in video","Talk face-to-face without leaving the interview.",MiniVideo,""],
  ["Shared whiteboard","Solve systems, algorithms, architecture, and diagrams together.",MiniBoard,""],
  ["Contextual chat","Keep communication attached to the interview.",MiniChat,""],
  ["Interview notes","Capture observations without breaking the flow.",MiniNotes,""],
  ["Structured evaluation","Turn the interview into a clear hiring signal.",MiniEvaluation,"md:col-span-2"],
] as const;
export function Features(){return <section className="px-4 py-28 sm:px-6 sm:py-40"><div className="mx-auto max-w-7xl"><div className="max-w-3xl"><Label>Context, preserved</Label><Heading>Everything stays in context.</Heading></div><div className="mt-14 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{features.map(([title,copy,Visual,span])=><article key={title} className={`group overflow-hidden rounded-lg border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 ${span}`}><Visual/><div className="mt-7"><h3 className="text-lg font-medium">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{copy}</p></div></article>)}</div></div></section>}