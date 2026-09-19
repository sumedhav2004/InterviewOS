import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { Interview } from "../types";

type InterviewListProps = {
  upcoming: Interview[];
  history: Interview[];
  currentUserId: string;
};

export function InterviewList({
  upcoming,
  history,
  currentUserId,
}: InterviewListProps) {
  return (
    <section className="space-y-10">
      {/* Upcoming interviews */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
              Interviews
            </p>

            <h2 className="text-xl font-semibold tracking-tight">
              Upcoming interviews
            </h2>
          </div>

          <span className="font-mono text-xs text-muted-foreground">
            {upcoming.length}{" "}
            {upcoming.length === 1 ? "interview" : "interviews"}
          </span>
        </div>

        {upcoming.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="mb-5 rounded-md border border-border/60 bg-muted/40 p-3 text-primary">
                <CalendarDays className="size-5" />
              </div>

              <h3 className="text-lg font-medium">
                No upcoming interviews
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Scheduled interviews will appear here when you're invited or
                create one yourself.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcoming.map((interview) => {
              const createdByMe =
                interview.createdById === currentUserId;

              return (
                <Card
                  key={interview.id}
                  className="overflow-hidden border-primary/20 transition-colors hover:border-primary/40"
                >
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col gap-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-primary">
                            <Video className="size-5" />
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold tracking-tight">
                              {interview.title}
                            </h3>

                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">
                                {createdByMe
                                  ? "CREATED BY YOU"
                                  : "PARTICIPATING"}
                              </Badge>

                              <Badge variant="outline">
                                {interview.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 border-y border-border/60 py-5 sm:grid-cols-2">
                        <div>
                          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            Scheduled
                          </p>

                          <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                            <CalendarDays className="size-3.5 text-muted-foreground" />

                            {interview.scheduledAt
                              ? new Date(
                                  interview.scheduledAt,
                                ).toLocaleString()
                              : "Not scheduled"}
                          </p>
                        </div>

                        <div>
                          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            Duration
                          </p>

                          <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                            <Clock3 className="size-3.5 text-muted-foreground" />

                            {interview.durationMinutes} minutes
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button className="gap-2">
                          Open interview
                          <ArrowRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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

            <h2 className="text-xl font-semibold tracking-tight">
              Interview history
            </h2>
          </div>

          <span className="font-mono text-xs text-muted-foreground">
            {history.length}{" "}
            {history.length === 1 ? "interview" : "interviews"}
          </span>
        </div>

        {history.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center gap-4 px-6 py-8">
              <div className="rounded-md border border-border/60 bg-muted/40 p-3 text-muted-foreground">
                <CheckCircle2 className="size-5" />
              </div>

              <div>
                <h3 className="text-sm font-medium">
                  No interview history
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Completed and cancelled interviews will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((interview) => {
              const createdByMe =
                interview.createdById === currentUserId;

              return (
                <Card
                  key={interview.id}
                  className="overflow-hidden border-border/60"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold tracking-tight">
                          {interview.title}
                        </h3>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            {createdByMe
                              ? "CREATED BY YOU"
                              : "PARTICIPATING"}
                          </Badge>

                          <Badge variant="outline">
                            {interview.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Scheduled
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {interview.scheduledAt
                            ? new Date(
                                interview.scheduledAt,
                              ).toLocaleDateString()
                            : "Not scheduled"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}