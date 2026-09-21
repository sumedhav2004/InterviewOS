"use client";

import {
  Camera,
  CameraOff,
  Code2,
  Mic,
  MicOff,
  MonitorUp,
  Network,
  PhoneOff,
  MessageSquare,
  StickyNote,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type InterviewControlsProps = {
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  onToggleCamera: () => void;
  onToggleMicrophone: () => void;
};

export function InterviewControls({
  cameraEnabled,
  microphoneEnabled,
  onToggleCamera,
  onToggleMicrophone,
}: InterviewControlsProps) {
  return (
    <footer className="flex h-16 shrink-0 items-center justify-between border-t border-border bg-background/90 px-3 backdrop-blur-xl sm:px-5">
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant={microphoneEnabled ? "ghost" : "destructive"}
          title={
            microphoneEnabled
              ? "Turn microphone off"
              : "Turn microphone on"
          }
          onClick={onToggleMicrophone}
        >
          {microphoneEnabled ? <Mic /> : <MicOff />}
        </Button>

        <Button
          size="icon"
          variant={cameraEnabled ? "ghost" : "destructive"}
          title={
            cameraEnabled
              ? "Turn camera off"
              : "Turn camera on"
          }
          onClick={onToggleCamera}
        >
          {cameraEnabled ? <Camera /> : <CameraOff />}
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