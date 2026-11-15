import { Participant, ParticipantMediaState } from "@/features/interview/types/participant";
import React from "react";
import { VideoPanel } from "./_components/VideoPanel";
import { FileText } from "lucide-react";

type Props = {
  localStream: MediaStream | null;
  participantIds: string[];
  participants: Participant[];
  remoteStreams: Map<string, MediaStream>;
  localMediaState: ParticipantMediaState;
  remoteMediaStates: Map<string, ParticipantMediaState>;
};

const InterviewSidebar = ({
  localStream,
  participantIds,
  participants,
  remoteStreams,
  localMediaState,
  remoteMediaStates,
}: Props) => {
  return (
    <aside className="flex min-h-0 flex-col bg-card/20">
      <VideoPanel
        localStream={localStream}
        participantIds={participantIds}
        participants={participants}
        remoteStreams={remoteStreams}
        localMediaState={localMediaState}
        remoteMediaStates={remoteMediaStates}
      />

      <section className="hidden min-h-[180px] flex-1 flex-col border-t border-border md:flex">
        <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3">
          <FileText className="h-3.5 w-3.5 text-primary" />

          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            Activity
          </span>
        </div>
      </section>
    </aside>
  );
};

export default InterviewSidebar;
