import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Plus,
  Trash,
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
  onAddQuestion?: (interviewId: string) => void;
  onRemoveInterviewQuestion: (
    interviewId: string,
    questionId: string,
    interviewQuestionId: string,
  ) => Promise<unknown>;
  onEdit?: (interview: InterviewCardData) => void;
  onSchedule?: (interviewId: string) => void;
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
  onAddQuestion,
  onRemoveInterviewQuestion,
  onEdit,
  onSchedule,
}: InterviewCardProps) {
  const isDraft = interview.status === "DRAFT";
  const isHistory = variant === "history";
  const createdByMe = interview.createdById === currentUserId;

  const activeParticipants = (interview.participants ?? []).filter(
    (participant) => participant.status === "ACTIVE",
  );

  const myParticipant = interview.participants?.find(
    (participant) => participant.user.id === currentUserId,
  );

  const isInterviewer = myParticipant?.role === "INTERVIEWER";
  const canManageQuestions = !isHistory && isInterviewer;

  const questions = [...(interview.questions ?? [])].sort(
    (a, b) => a.questionOrder - b.questionOrder,
  );

  const pendingInvites = (interview.invites ?? []).filter((invite) => invite.status === "PENDING");

  const scheduledAt = interview.scheduledAt;

  const handleRemoveInterviewQuestion = (
    interviewId: string,
    questionId: string,
    interviewQuestionId: string,
  ) => {
    onRemoveInterviewQuestion(interviewId, questionId, interviewQuestionId);
  };

  return (
    <Card
      className={`overflow-hidden transition-colors ${
        isDraft || isHistory
          ? "border-dashed border-border bg-muted/100"
          : "border-primary/20 hover:border-primary/40"
      }`}
    >
      <CardContent className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div
            className={`shrink-0 rounded-md border p-3 ${
              isDraft || isHistory
                ? "border-border bg-muted text-muted-foreground"
                : "border-primary/30 bg-primary/10 text-primary"
            }`}
          >
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
        <div className="grid gap-2 border-y border-border/60 py-5 sm:grid-cols-3">
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
        {canManageQuestions && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-medium">Question preview</h4>

              <Button variant="outline" onClick={() => onAddQuestion?.(interview.id)}>
                <Plus className="size-4" />
                Add Question
              </Button>
            </div>

            {questions.length > 0 ? (
              <div className="max-h-64 space-y-2 overflow-y-auto pr-2">
                {questions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-md border border-border/60 bg-muted/20 p-3"
                  >
                    <span className="pt-0.5 font-mono text-xs text-muted-foreground">
                      {String(item.questionOrder).padStart(2, "0")}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.question.title}</p>

                      <div className="mt-1 flex flex-wrap items-center justify-between text-xs">
                        <span className={difficultyStyles[item.question.difficulty] ?? ""}>
                          {item.question.difficulty}
                        </span>

                        <span className="text-muted-foreground">
                          {item.points} {item.points === 1 ? "point" : "points"}
                        </span>

                        <Button
                          variant="destructive"
                          className="cursor-pointer hover:bg-red-900"
                          onClick={() =>
                            handleRemoveInterviewQuestion(interview.id, item.question.id, item.id)
                          }
                        >
                          <Trash className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No questions added yet.</p>
            )}
          </div>
        )}

        {/* Actions */}
        {!isHistory && (
          <div className="flex justify-end border-t border-border/60 pt-4">
            <Button
              variant="outline"
              className="gap-2 border-primary"
              onClick={() => onOpen?.(interview.id)}
            >
              Open interview
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}

        {createdByMe && !isHistory && (
          <Button variant="outline" onClick={() => onEdit?.(interview)}>
            Edit interview
          </Button>
        )}

        {isDraft && createdByMe && (
          <Button variant="outline" onClick={() => onSchedule?.(interview.id)}>
            Schedule interview
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

type InterviewListProps = {
  drafts: InterviewCardData[];
  upcoming: InterviewCardData[];
  history: InterviewCardData[];
  currentUserId: string;
  onOpenInterview?: (interviewId: string) => void;
  onInvitePeople?: (interviewId: string) => void;
  onAddQuestion?: (interviewId: string) => void;
  onRemoveInterviewQuestion: (
    interviewId: string,
    questionId: string,
    interviewQuestionId: string,
  ) => Promise<unknown>;
  onEditInterview?: (interview: InterviewCardData) => void;
  onScheduleInterview?: (interviewId: string) => void;
};

export function InterviewList({
  drafts,
  upcoming,
  history,
  currentUserId,
  onOpenInterview,
  onInvitePeople,
  onAddQuestion,
  onRemoveInterviewQuestion,
  onEditInterview,
  onScheduleInterview,
}: InterviewListProps) {
  return (
    <section className="space-y-10">
      {/* Draft interviews */}
      {drafts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-end justify-between border-b border-border/60 pb-3">
            <div className="space-y-1">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Work in progress
              </p>

              <h2 className="text-xl font-semibold tracking-tight">Draft interviews</h2>
            </div>

            <span className="font-mono text-xs text-muted-foreground">
              {drafts.length} {drafts.length === 1 ? "draft" : "drafts"}
            </span>
          </div>

          <div className="max-h-[600px] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {drafts.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  currentUserId={currentUserId}
                  onOpen={onOpenInterview}
                  onInvite={onInvitePeople}
                  onAddQuestion={onAddQuestion}
                  onRemoveInterviewQuestion={onRemoveInterviewQuestion}
                  onEdit={onEditInterview}
                  onSchedule={onScheduleInterview}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming interviews */}
      <div className="space-y-4">
        <div className="flex items-end justify-between border-b border-border/60 pb-3">
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
          <div className="max-h-[1000px] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {upcoming.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  currentUserId={currentUserId}
                  onOpen={onOpenInterview}
                  onInvite={onInvitePeople}
                  onAddQuestion={onAddQuestion}
                  onRemoveInterviewQuestion={onRemoveInterviewQuestion}
                  onEdit={onEditInterview}
                  onSchedule={onScheduleInterview}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interview history */}
      <div className="space-y-4">
        <div className="flex items-end justify-between border-b border-border/60 pb-3">
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
          <div className="max-h-[600px] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2">
              {history.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  currentUserId={currentUserId}
                  variant="history"
                  onOpen={onOpenInterview}
                  onInvite={onInvitePeople}
                  onAddQuestion={onAddQuestion}
                  onRemoveInterviewQuestion={onRemoveInterviewQuestion}
                  onEdit={onEditInterview}
                  onSchedule={onScheduleInterview}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
