"use client";

import { UserPlus, UserCheck, Clock, Check, X, LoaderCircle } from "lucide-react";

export type FriendStatus = "NONE" | "OUTGOING_PENDING" | "INCOMING_PENDING" | "FRIENDS";

type FriendRequestButtonProps = {
  status: FriendStatus;
  loading?: boolean;
  onSendRequest: () => void;
  onAcceptRequest: () => void;
  onDeclineRequest: () => void;
};

export default function FriendRequestButton({
  status,
  loading = false,
  onSendRequest,
  onAcceptRequest,
  onDeclineRequest,
}: FriendRequestButtonProps) {
  console.log("Button received status:", status);
  if (status === "FRIENDS") {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium"
      >
        <UserCheck className="h-4 w-4" />
        Friends
      </button>
    );
  }

  if (status === "OUTGOING_PENDING") {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground"
      >
        <Clock className="h-4 w-4" />
        Request sent
      </button>
    );
  }

  if (status === "INCOMING_PENDING") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={onAcceptRequest}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Accept
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={onDeclineRequest}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Decline
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={onSendRequest}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {loading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      Add friend
    </button>
  );
}
