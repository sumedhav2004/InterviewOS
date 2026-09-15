
const capabilities=["VIDEO","CODE","WHITEBOARD","CHAT","NOTES","EVALUATION"];
export function CapabilityStrip(){
    return <section className="border-y border-border bg-card/40 px-4 py-12">
        <p className="text-center text-sm text-muted-foreground">Everything your technical interview needs. Nothing you don’t.</p>
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-3 gap-y-5 sm:grid-cols-6">
            {capabilities.map(x=><span key={x} className="text-center font-mono text-[9px] text-foreground/60">{x}</span>)}
        </div>
    </section>}
