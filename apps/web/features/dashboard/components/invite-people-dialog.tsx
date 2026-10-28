"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import type { User } from "../types";
import { useSendInvite } from "../hooks/useSendInvite";
import { toast } from "@/components/ui/toast";

type ParticipantRole = "INTERVIEWER" | "CANDIDATE" | "OBSERVER";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewId: string;
  friends: User[];
  user: User;
};

const roles: ParticipantRole[] = ["INTERVIEWER", "CANDIDATE", "OBSERVER"];

const InvitePeopleDialog = ({ open, onOpenChange, interviewId, friends }: Props) => {
  const [query, setQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<Record<string, ParticipantRole>>({});

  const { sendInvite, loading } = useSendInvite();

  const filteredFriends = friends.filter((friend) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return false;

    return (
      friend.name?.toLowerCase().includes(normalizedQuery) ||
      friend.email?.toLowerCase().includes(normalizedQuery)
    );
  });

  const handleSendInvite = async (friend: User) => {
    const role = selectedRoles[friend.id];

    if (!role) {
      toast.add({
        type: "error",
        title: "Select a role",
        description: "Choose a role before sending the invitation.",
      });
      return;
    }

    try {
      const result = await sendInvite(interviewId, friend.id, role);

      toast.add({
        title: "Invitation sent",
        description: `Invitation sent to ${friend.name} as ${role}.`,
        type: "success",
      });
    } catch (err) {
      toast.add({
        title: "Invite failed",
        description: err instanceof Error ? err.message : "Failed to send invitation.",
        type: "error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite people to interview</DialogTitle>
          <DialogDescription>
            Search your friends, choose a role for each person, and send an invitation.
          </DialogDescription>
        </DialogHeader>

        <input
          type="text"
          placeholder="Search friends by name or email..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-md border px-3 py-2"
        />

        <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">
          {query.trim() === "" ? (
            <p className="text-sm text-muted-foreground">Start typing to search your friends.</p>
          ) : filteredFriends.length === 0 ? (
            <p className="text-sm text-muted-foreground">No friends found.</p>
          ) : (
            filteredFriends.map((friend) => {
              const selectedRole = selectedRoles[friend.id];

              return (
                <div key={friend.id} className="space-y-3 rounded-md border p-3">
                  <div>
                    <p className="font-medium">{friend.name}</p>
                    <p className="text-sm text-muted-foreground">{friend.email}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <button
                        key={role}
                        type="button"
                        disabled={loading}
                        aria-pressed={selectedRole === role}
                        onClick={() =>
                          setSelectedRoles((previous) => ({
                            ...previous,
                            [friend.id]: role,
                          }))
                        }
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                          selectedRole === role
                            ? "border-primary bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={loading || !selectedRole}
                    onClick={() => handleSendInvite(friend)}
                    className="rounded-md border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvitePeopleDialog;
