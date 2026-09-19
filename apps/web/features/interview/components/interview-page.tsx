"use client";

import { useAuth } from "@/lib/auth";

import { useInterview } from "../hooks/use-interview";
import { InterviewHeader } from "./interview-header";
import { InterviewLayout } from "./interview-layout";
import { InterviewControls } from "./interview-controls";
import { useInterviewSocket } from "../hooks/use-interview-socket";
import { useEffect } from "react";

type InterviewPageProps = {
  interviewId: string;
};

export function InterviewPage({
  interviewId,
}: InterviewPageProps) {
  const { isLoaded, isSignedIn } = useAuth();
  useInterviewSocket(interviewId);

  const {
    interview,
    loading,
    error,
  } = useInterview({
    interviewId,
    isLoaded,
    isSignedIn,
  });

  if (!isLoaded) {
    return (
      <InterviewShell>
        <LoadingState label="Authenticating..." />
      </InterviewShell>
    );
  }

  if (!isSignedIn) {
    return (
      <InterviewShell>
        <LoadingState label="Please sign in to enter this room." />
      </InterviewShell>
    );
  }

  if (loading) {
    return (
      <InterviewShell>
        <LoadingState label="Loading interview..." />
      </InterviewShell>
    );
  }

  if (error || !interview) {
    return (
      <InterviewShell>
        <LoadingState
          label={error ?? "Interview not found."}
        />
      </InterviewShell>
    );
  }

  return (
    <InterviewShell>
      <InterviewHeader interview={interview} />
      <InterviewLayout />
      <InterviewControls />
    </InterviewShell>
  );
}

function InterviewShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      {children}
    </main>
  );
}

function LoadingState({
  label,
}: {
  label: string;
}) {
  return (
    <div className="grid h-dvh place-items-center bg-background">
      <div className="text-center">
        <div className="mx-auto h-7 w-7 animate-pulse rounded-full border border-primary/50 bg-primary/10" />

        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}