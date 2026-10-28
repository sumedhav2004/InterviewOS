import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Plus,
  Users,
  Video,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { Interview } from "../types";

type InterviewCardData = Interview & {
  description?: string | null;
  language?: string;

  createdBy?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };

  participants?: {
    id: string;
    role: "INTERVIEWER" | "CANDIDATE" | "OBSERVER";
    status: "ACTIVE" | "INACTIVE";
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  }[];

  questions?: {
    id: string;
    questionOrder: number;
    points: number;
    question: {
      id: string;
      title: string;
      description: string;
      difficulty: "EASY" | "MEDIUM" | "HARD";
    };
  }[];

  invites?: {
    id: string;
    status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "CANCELLED";
    role: "INTERVIEWER" | "CANDIDATE" | "OBSERVER";
    receiver: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  }[];
};

type InterviewCardProps = {
  interview: InterviewCardData;
  currentUserId: string;
  variant?: "upcoming" | "history";
  onOpen?: (interviewId: string) => void;
  onInvite?: (interviewId: string) => void;
};

const statusStyles: Record<string, string> = {
  DRAFT: "border-dashed",
  SCHEDULED: "border-blue-500/30 bg-blue-500/5 text-blue-600",
  INPROGRESS: "border-green-500/30 bg-green-500/5 text-green-600",
  COMPLETED: "border-border",
  CANCELLED: "border-destructive/30 bg-destructive/5 text-destructive",
};

const difficultyStyles: Record<string, string> = {
  EASY: "text-green-600",
  MEDIUM: "text-yellow-600",
  HARD: "text-red-600",
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(date: string | Date | null | undefined) {
  if (!date) return "Not scheduled";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not scheduled";

  return parsed.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function InterviewCard({
  interview,
  currentUserId,
  variant = "upcoming",
  onOpen,
  onInvite,
}: InterviewCardProps) {
  const isHistory = variant === "history";
  const createdByMe = interview.createdById === currentUserId;

  const activeParticipants = (interview.participants ?? []).filter(
    (participant) => participant.status === "ACTIVE",
  );

  const questions = [...(interview.questions ?? [])].sort(
    (a, b) => a.questionOrder - b.questionOrder,
  );

  const pendingInvites = (interview.invites ?? []).filter((invite) => invite.status === "PENDING");

  const scheduledAt = interview.scheduledAt;

  return (
    <Card
      className={`overflow-hidden transition-colors ${
        isHistory ? "border-border/60" : "border-primary/20 hover:border-primary/40"
      }`}
    >
      <CardContent className="space-y-6 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-md border border-primary/30 bg-primary/10 p-3 text-primary">
            <Video className="size-5" />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="text-xl font-semibold tracking-tight">{interview.title}</h3>

            {interview.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">{interview.description}</p>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{createdByMe ? "CREATED BY YOU" : "PARTICIPATING"}</Badge>

              <Badge variant="outline" className={statusStyles[interview.status] ?? ""}>
                {interview.status.replace("_", " ")}
              </Badge>

              {interview.language && <Badge variant="secondary">{interview.language}</Badge>}
            </div>
          </div>
        </div>

        {/* Interview metadata */}
        <div className="grid gap-4 border-y border-border/60 py-5 sm:grid-cols-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Scheduled
            </p>

            <p className="mt-2 flex items-start gap-2 text-sm font-medium">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>{formatDate(scheduledAt)}</span>
            </p>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Duration
            </p>

            <p className="mt-2 flex items-center gap-2 text-sm font-medium">
              <Clock3 className="size-4 text-muted-foreground" />
              {interview.durationMinutes} minutes
            </p>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Questions
            </p>

            <p className="mt-2 flex items-center gap-2 text-sm font-medium">
              <FileQuestion className="size-4 text-muted-foreground" />
              {questions.length} {questions.length === 1 ? "question" : "questions"}
            </p>
          </div>
        </div>

        {/* Participants */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />

              <h4 className="text-sm font-medium">Participants</h4>

              <Badge variant="secondary">{activeParticipants.length}</Badge>
            </div>

            {createdByMe && !isHistory && onInvite && (
              <Button variant="outline" size="sm" onClick={() => onInvite(interview.id)}>
                + Invite people
              </Button>
            )}
          </div>

          {activeParticipants.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {activeParticipants.slice(0, 4).map((participant) => (
                <div
                  key={participant.id}
                  className="flex min-w-0 items-center gap-2 rounded-md border border-border/60 px-3 py-2"
                >
                  <Avatar className="size-8">
                    <AvatarImage
                      src={participant.user.avatarUrl ?? undefined}
                      alt={participant.user.name}
                    />

                    <AvatarFallback>{getInitials(participant.user.name)}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="max-w-32 truncate text-sm font-medium">{participant.user.name}</p>

                    <p className="text-xs text-muted-foreground">
                      {participant.role.toLowerCase()}
                    </p>
                  </div>
                </div>
              ))}

              {activeParticipants.length > 4 && (
                <div className="flex items-center text-sm text-muted-foreground">
                  +{activeParticipants.length - 4} more
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active participants yet.</p>
          )}

          {/* Pending invitations */}
          {createdByMe && pendingInvites.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {pendingInvites.length} pending{" "}
              {pendingInvites.length === 1 ? "invitation" : "invitations"}
            </p>
          )}
        </div>

        {/* Question preview */}
        {!isHistory && questions.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between">
              <h4 className="text-sm font-medium">Question preview</h4>
              <Button variant="outline" className="" onClick={() => {}}>
                <Plus />
                Add Question
              </Button>
            </div>

            <div className="space-y-2">
              {questions.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-md border border-border/60 bg-muted/20 p-3"
                >
                  <span className="pt-0.5 font-mono text-xs text-muted-foreground">
                    {String(item.questionOrder).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.question.title}</p>

                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      <span className={difficultyStyles[item.question.difficulty] ?? ""}>
                        {item.question.difficulty}
                      </span>

                      <span className="text-muted-foreground">
                        {item.points} {item.points === 1 ? "point" : "points"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {questions.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{questions.length - 3} more questions
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {!isHistory && (
          <div className="flex justify-end border-t border-border/60 pt-4">
            <Button className="gap-2" onClick={() => onOpen?.(interview.id)}>
              Open interview
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type InterviewListProps = {
  upcoming: InterviewCardData[];
  history: InterviewCardData[];
  currentUserId: string;
  onOpenInterview?: (interviewId: string) => void;
  onInvitePeople?: (interviewId: string) => void;
};

export function InterviewList({
  upcoming,
  history,
  currentUserId,
  onOpenInterview,
  onInvitePeople,
}: InterviewListProps) {
  return (
    <section className="space-y-10">
      {/* Upcoming interviews */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Interviews</p>

            <h2 className="text-xl font-semibold tracking-tight">Upcoming interviews</h2>
          </div>

          <span className="font-mono text-xs text-muted-foreground">
            {upcoming.length} {upcoming.length === 1 ? "interview" : "interviews"}
          </span>
        </div>

        {upcoming.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="mb-5 rounded-md border border-border/60 bg-muted/40 p-3 text-primary">
                <CalendarDays className="size-5" />
              </div>

              <h3 className="text-lg font-medium">No upcoming interviews</h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Scheduled interviews will appear here when you&apos;re invited or create one
                yourself.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcoming.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                currentUserId={currentUserId}
                onOpen={onOpenInterview}
                onInvite={onInvitePeople}
              />
            ))}
          </div>
        )}
      </div>

      {/* Interview history */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              History
            </p>

            <h2 className="text-xl font-semibold tracking-tight">Interview history</h2>
          </div>

          <span className="font-mono text-xs text-muted-foreground">
            {history.length} {history.length === 1 ? "interview" : "interviews"}
          </span>
        </div>

        {history.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center gap-4 px-6 py-8">
              <div className="rounded-md border border-border/60 bg-muted/40 p-3 text-muted-foreground">
                <CheckCircle2 className="size-5" />
              </div>

              <div>
                <h3 className="text-sm font-medium">No interview history</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Completed and cancelled interviews will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                currentUserId={currentUserId}
                variant="history"
                onOpen={onOpenInterview}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
