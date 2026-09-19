import { User } from "@/features/auth/types";
import type { Interview, Invite } from "../types";
import { InvitationCard } from "./invitation-card";

type InvitationWithDetails = Invite & {
  sender: User;
  interview: Interview;
};

type InvitationListProps = {
  invitations: InvitationWithDetails[];
  onAccept: (inviteId: string) => Promise<void>;
  onDecline: (inviteId: string) => Promise<void>;
};

export function InvitationList({
  invitations,
  onAccept,
  onDecline,
}: InvitationListProps) {
  const pendingInvitations = invitations.filter(
    (invite) => invite.status === "PENDING",
  );

  const invitationHistory = invitations.filter(
    (invite) => invite.status !== "PENDING",
  );

  if (invitations.length === 0) {
    return null;
  }

  return (
    <section className="space-y-10">
      {/* Pending invitations */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                Invitations
              </p>

              <h2 className="text-xl font-semibold tracking-tight">
                Waiting for your response
              </h2>
            </div>

            <span className="font-mono text-xs text-muted-foreground">
              {pendingInvitations.length} pending
            </span>
          </div>

          <div className="space-y-4">
            {pendingInvitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                onAccept={onAccept}
                onDecline={onDecline}
              />
            ))}
          </div>
        </div>
      )}

      {/* Invitation history */}
      {invitationHistory.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                History
              </p>

              <h2 className="text-xl font-semibold tracking-tight">
                Invitation history
              </h2>
            </div>

            <span className="font-mono text-xs text-muted-foreground">
              {invitationHistory.length}{" "}
              {invitationHistory.length === 1 ? "invitation" : "invitations"}
            </span>
          </div>

          <div className="space-y-4">
            {invitationHistory.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                onAccept={onAccept}
                onDecline={onDecline}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}