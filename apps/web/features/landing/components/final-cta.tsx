import {
  ArrowRight,
  CircleDot,
  Monitor,
  MousePointer2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="technical-grid relative overflow-hidden px-4 py-28 sm:px-6 sm:py-40">
      <div className="absolute inset-x-0 bottom-0 h-80 bg-[radial-gradient(ellipse_at_bottom,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_68%)]" />

      <div className="relative mx-auto max-w-4xl text-center">
        <CircleDot className="mx-auto h-7 w-7 text-primary" />

        <h2 className="mt-8 text-balance text-4xl font-semibold sm:text-7xl">
          Run interviews like you mean it.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-balance text-muted-foreground">
          Everything you need to conduct a great technical interview, in one
          focused workspace.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" variant="default">
            Start interviewing
            <ArrowRight />
          </Button>

          <Button size="lg" variant="outline">
            Explore the workspace
          </Button>
        </div>

        <div className="mx-auto mt-16 flex max-w-xl items-center justify-between rounded-lg border border-border bg-card/80 p-3 text-[10px] text-muted-foreground backdrop-blur-xl">
          <span className="flex items-center gap-2">
            <MousePointer2 className="h-3.5 w-3.5 text-cyan" />
            Jordan is coding
          </span>

          <span className="font-mono">42:18</span>

          <span className="flex items-center gap-2">
            <Monitor className="h-3.5 w-3.5 text-primary" />
            Shared
          </span>
        </div>
      </div>
    </section>
  );
}