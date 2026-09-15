import { ArrowRight, Braces, Code2, FileText, MessageSquare, Network, StickyNote, Video } from "lucide-react";


const tools=[{name:"Zoom",icon:Video},{name:"CoderPad",icon:Code2},{name:"Google Docs",icon:FileText},{name:"Miro",icon:Network},{name:"Slack",icon:MessageSquare},{name:"Notes",icon:StickyNote}];
export function FragmentedFlow(){
    return <div className="relative mx-auto mt-14 max-w-5xl">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-[repeat(6,minmax(0,1fr))]">
            {tools.map(({name,icon:Icon},i)=><div key={name} className="relative flex h-24 flex-col items-center justify-center gap-2 rounded-md border border-border bg-card text-sm text-muted-foreground">
                <Icon className="h-4 w-4"/><span>{name}</span>{i<tools.length-1&&<ArrowRight className="absolute -right-3 top-10 z-10 hidden h-4 w-4 text-muted-foreground/40 lg:block"/>}</div>)}
        </div>
        <div className="mx-auto h-16 w-px bg-gradient-to-b from-border to-primary"/>
        <div className="mx-auto flex max-w-sm items-center justify-center gap-3 rounded-lg border border-primary/40 bg-primary/10 p-6 shadow-[0_0_50px_color-mix(in_oklab,var(--primary)_15%,transparent)]">
            <Braces className="h-5 w-5 text-cyan"/>
            <span className="text-lg font-semibold">InterviewOS</span>
            <span className="font-mono text-[10px] text-muted-foreground">ONE WORKSPACE</span>
        </div>
    </div>}