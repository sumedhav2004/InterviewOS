import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { InterviewWorkspace } from "./visuals/interview-workspace";
import { Label } from "./label";



export function Hero(){
    return <section id="top" className="technical-grid relative overflow-hidden px-4 pb-24 pt-36 sm:px-6 sm:pt-44">
        <div className="pointer-events-none absolute left-1/2 top-20 h-[500px] w-[780px] -translate-x-1/2 rounded-full bg-primary/[.09] blur-[120px]"/>
            <div className="relative mx-auto max-w-7xl">
                <div className="mx-auto max-w-4xl text-center">
                        <Label>The interview workspace</Label>
                        <h1 className="text-balance text-5xl font-semibold leading-[.96] sm:text-7xl">Every interview.
                            <br/>
                            <span className="text-muted-foreground">One workspace.</span>
                        </h1>
                        <p className="mx-auto mt-7 max-w-2xl text-balance text-base leading-7 text-muted-foreground sm:text-lg">Code, talk, sketch, collaborate, and evaluate — without switching tabs.</p>
                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Button size="lg" variant="default">Start interviewing <ArrowRight/></Button>
                            <Button size="lg" variant="outline">See how it works</Button>
                        </div>
                        <p className="mt-5 font-mono text-[10px] uppercase text-muted-foreground">Built for modern technical interviews</p>
                </div>
                <div className="relative mx-auto mt-16 max-w-6xl animate-float-slow">
                <div className="absolute -inset-8 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--primary)_15%,transparent),transparent_65%)]"/>
                <div className="relative [transform:perspective(1600px)_rotateX(2deg)]">
                    <InterviewWorkspace/>
                </div>
            </div>
        </div>
</section>}