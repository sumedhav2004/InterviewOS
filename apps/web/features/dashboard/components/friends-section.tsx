"use client";

import { Users, UserPlus, UserRoundCheck, Clock3, ArrowRight, Check, X, Send } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

import type { FriendRequest, User } from "../types";

type FriendsSectionProps = {
  friends: User[];
  friendCount: number;
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  onAcceptRequest?: (requestId: string) => void;
  onDeclineRequest?: (requestId: string) => void;
};

function getInitials(name?: string) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

function SectionHeading({
  eyebrow,
  title,
  count,
}: {
  eyebrow: string;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>

      <span className="shrink-0 font-mono text-xs text-muted-foreground">
        {String(count).padStart(2, "0")} {count === 1 ? "person" : "people"}
      </span>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Users;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-4 rounded-md border border-border/60 bg-muted/40 p-3 text-muted-foreground">
          <Icon className="size-5" />
        </div>

        <h3 className="font-medium">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function PersonCard({ user, action }: { user: User; action?: React.ReactNode }) {
  return (
    <Card className="border-border/60 transition-colors hover:border-primary/40">
      <CardContent className="flex items-center justify-between gap-4 p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-11 border border-border/60">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-1">
            <h3 className="truncate text-sm font-semibold tracking-tight">{user.name}</h3>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {action}
      </CardContent>
    </Card>
  );
}

export default function FriendsSection({
  friends,
  friendCount,
  receivedRequests,
  sentRequests,
  onAcceptRequest,
  onDeclineRequest,
}: FriendsSectionProps) {
  console.log("The friends are: ", friends);
  return (
    <section className="space-y-10">
      {/* Friends list */}
      <div className="space-y-4">
        <SectionHeading eyebrow="Your network" title="Friends" count={friendCount} />

        {friends.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No friends yet"
            description="Your connections will appear here when you become friends with other users."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {friends.map((friend) => (
              <Link key={friend.id} href={`/user/${friend.id}`}>
                <PersonCard user={friend} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Incoming requests */}
      <div className="space-y-4">
        <SectionHeading eyebrow="Pending" title="Friend requests" count={receivedRequests.length} />

        {receivedRequests.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No pending requests"
            description="When someone sends you a friend request, you can review it here."
          />
        ) : (
          <div className="space-y-3">
            {receivedRequests.map((request, index) => (
              <Card
                key={`${request.senderId}-${index}`}
                className="overflow-hidden border-primary/20 transition-colors hover:border-primary/40"
              >
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-primary">
                      <UserPlus className="size-5" />
                    </div>

                    <div className="min-w-0 space-y-2">
                      <h3 className="font-semibold tracking-tight">Incoming friend request</h3>
                      <Badge variant="outline">PENDING</Badge>
                      <p className="break-all text-xs text-muted-foreground">
                        User ID: {request.senderId}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:shrink-0">
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => onAcceptRequest?.(request.id)}
                      disabled={!onAcceptRequest}
                    >
                      <Check className="size-4" />
                      Accept
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => onDeclineRequest?.(request.id)}
                      disabled={!onDeclineRequest}
                    >
                      <X className="size-4" />
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing requests */}
      <div className="space-y-4">
        <SectionHeading
          eyebrow="Awaiting response"
          title="Sent requests"
          count={sentRequests.length}
        />

        {sentRequests.length === 0 ? (
          <EmptyState
            icon={Send}
            title="No outgoing requests"
            description="Friend requests you send will appear here while you're waiting for a response."
          />
        ) : (
          <div className="space-y-3">
            {sentRequests.map((request, index) => (
              <Card
                key={`${request.requesterId}-${index}`}
                className="border-border/60 transition-colors hover:border-primary/40"
              >
                <CardContent className="flex items-center justify-between gap-4 p-4 sm:p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-md border border-border/60 bg-muted/40 p-3 text-muted-foreground">
                      <Clock3 className="size-5" />
                    </div>

                    <div className="min-w-0 space-y-2">
                      <h3 className="font-semibold tracking-tight">Friend request sent</h3>
                      <Badge variant="outline">PENDING</Badge>
                      <p className="break-all text-xs text-muted-foreground">
                        User ID: {request.requesterId}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
