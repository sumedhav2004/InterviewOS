"use client";

import React, { useEffect, useState } from "react";

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
import { toast } from "@/components/ui/toast";

import type { UpdateInterviewPayload } from "../api/dashboard-api";
import type { Interview } from "../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: Interview | null;
  onUpdateInterview: (interviewId: string, data: UpdateInterviewPayload) => Promise<unknown>;
};

const UpdateInterviewDialog = ({ open, onOpenChange, interview, onUpdateInterview }: Props) => {
  const [title, setTitle] = useState(interview?.title ?? "");

  const [description, setDescription] = useState(interview?.description ?? "");

  const [durationMinutes, setDurationMinutes] = useState(String(interview?.durationMinutes ?? ""));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDurationMinutes("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!interview) return;

    const payload: UpdateInterviewPayload = {};

    if (title.trim()) {
      payload.title = title.trim();
    }

    if (description.trim()) {
      payload.description = description.trim();
    }

    if (durationMinutes.trim()) {
      payload.durationMinutes = Number(durationMinutes);
    }

    try {
      setLoading(true);
      setError(null);

      await onUpdateInterview(interview.id, payload);

      toast.add({
        title: "Interview updated successfully!",
        type: "success",
        description: "Your interview details have been saved.",
      });

      resetForm();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update interview.";

      setError(message);

      toast.add({
        title: "Could not update interview",
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
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update interview</DialogTitle>
          <DialogDescription>
            Update any details you want. All fields are optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="update-interview-title" className="text-sm font-medium">
              Interview title
            </label>

            <Input
              id="update-interview-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter interview title"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="update-interview-description" className="text-sm font-medium">
              Description
            </label>

            <Textarea
              id="update-interview-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter interview description"
              rows={3}
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label htmlFor="update-interview-duration" className="text-sm font-medium">
              Duration
            </label>

            <select
              id="update-interview-duration"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">No change</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">120 minutes</option>
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

            <Button type="submit" disabled={loading || !interview}>
              {loading ? "Saving changes..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateInterviewDialog;
