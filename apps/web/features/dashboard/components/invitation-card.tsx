import { ArrowRight, Clock3, Contact2Icon, Mail, VideoIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { Invite, Interview } from "../types";
import type { User } from "@/features/auth/types";

type InvitationWithDetails = Invite & {
  sender: User;
  interview: Interview;
};

type InvitationCardProps = {
  invitation: InvitationWithDetails;
  onAccept: (inviteId: string) => Promise<void>;
  onDecline: (inviteId: string) => Promise<void>;
};

export function InvitationCard({
  invitation,
  onAccept,
  onDecline
}: InvitationCardProps) {
  return (
    <Card className="overflow-hidden border-primary/30 shadow-[0_0_32px_oklch(0.62_0.22_278_/_10%)]">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-primary">
                <Mail className="size-5" />
              </div>

              <div className="space-y-1">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                  Interview invitation
                </p>

                <h3 className="text-xl font-semibold tracking-tight">
                  You've been invited
                </h3>
              </div>
            </div>

            <Badge variant="outline">
              {invitation.status}
            </Badge>
          </div>

          <div className="grid gap-4 border-y border-border/60 py-5 sm:grid-cols-2">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Invited As
              </p>

              <p className="mt-1 text-sm font-medium">
                {invitation.role}
              </p>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Received
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                <Clock3 className="size-3.5 text-muted-foreground" />
                {new Date(invitation.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Sender
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                <Contact2Icon className="size-3.5 text-muted-foreground" />
                {invitation.sender.name}
              </p>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Interview
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                <VideoIcon className="size-3.5 text-muted-foreground" />
                {invitation.interview.title}
              </p>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Interview Scheduled
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                <Clock3 className="size-3.5 text-muted-foreground" />
                {invitation.interview.scheduledAt
                ? new Date(invitation.interview.scheduledAt).toLocaleDateString()
                : "Not scheduled"}
              </p>
            </div>
          </div>

          {invitation.status === "PENDING" && (
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                variant="ghost"
                onClick={() => onDecline(invitation.id)}
                >
                Decline
                </Button>

                <Button
                className="gap-2"
                onClick={() => onAccept(invitation.id)}
                >
                Accept invitation
                <ArrowRight className="size-4" />
                </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}