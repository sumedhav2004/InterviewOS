"use client";

import {
  Camera,
  Code2,
  Mic,
  MonitorUp,
  Network,
  PhoneOff,
  MessageSquare,
  StickyNote,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export function InterviewControls() {
  return (
    <footer className="flex h-16 shrink-0 items-center justify-between border-t border-border bg-background/90 px-3 backdrop-blur-xl sm:px-5">
      <div className="hidden items-center gap-1 sm:flex">
        <Button
          size="icon"
          variant="ghost"
          title="Microphone"
        >
          <Mic />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          title="Camera"
        >
          <Camera />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          title="Share screen"
        >
          <MonitorUp />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" title="Code">
          <Code2 />
        </Button>

        <Button size="icon" variant="ghost" title="Whiteboard">
          <Network />
        </Button>

        <Button size="icon" variant="ghost" title="Chat">
          <MessageSquare />
        </Button>

        <Button size="icon" variant="ghost" title="Notes">
          <StickyNote />
        </Button>
      </div>

      <Button
        size="icon"
        variant="destructive"
        title="Leave interview"
      >
        <PhoneOff />
      </Button>
    </footer>
  );
}