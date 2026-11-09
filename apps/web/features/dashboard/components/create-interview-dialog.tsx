"use client";

import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import type { CreateInterviewPayload } from "../api/dashboard-api";
import type { ParticipantRole } from "../types";
import { toast } from "@/components/ui/toast";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateInterview: (data: CreateInterviewPayload) => Promise<unknown>;
};

const CreateInterviewDialog = ({ open, onOpenChange, onCreateInterview }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [createdAs, setCreatedAs] = useState<ParticipantRole>("INTERVIEWER");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDurationMinutes(60);
    setCreatedAs("INTERVIEWER");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      await onCreateInterview({
        title: title.trim(),
        description: description.trim(),
        durationMinutes,
        createdAs,
      });

      toast.add({
        title: "Interview created successfully!",
        type: "success",
        description: "Your interview has been saved as a draft.",
      });

      resetForm();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create interview.";

      setError(message);

      toast.add({
        title: "Could not create interview",
        type: "error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !loading) {
      resetForm();
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a draft interview</DialogTitle>
          <DialogDescription>
            Set up your interview now and add the remaining details later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Draft disclaimer */}
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-500/40 text-amber-600">
                DRAFT
              </Badge>

              <p className="text-sm font-medium">This interview will be saved as a draft.</p>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              You will need to add a date and time later to schedule this interview. Creating this
              interview will not schedule it.
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="interview-title" className="text-sm font-medium">
              Interview title
            </label>

            <Input
              id="interview-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Frontend Developer Interview"
              required
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="interview-description" className="text-sm font-medium">
              Description (optional)
            </label>

            <Textarea
              id="interview-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this interview about?"
              rows={3}
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label htmlFor="duration" className="text-sm font-medium">
              Duration
            </label>

            <select
              id="duration"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label htmlFor="created-as" className="text-sm font-medium">
              Your role
            </label>

            <select
              id="created-as"
              value={createdAs}
              onChange={(e) => setCreatedAs(e.target.value as ParticipantRole)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="INTERVIEWER">Interviewer</option>
              <option value="CANDIDATE">Candidate</option>
              <option value="OBSERVER">Observer</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? "Creating draft..." : "Create draft interview"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInterviewDialog;
