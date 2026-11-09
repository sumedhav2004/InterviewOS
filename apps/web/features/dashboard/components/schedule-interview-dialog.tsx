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
import { toast } from "@/components/ui/toast";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewId: string;
  onScheduleInterview: (interviewId: string, scheduledAt: Date) => Promise<unknown>;
};

const ScheduleInterviewDateTimePicker = ({
  open,
  onOpenChange,
  interviewId,
  onScheduleInterview,
}: Props) => {
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [minDateTime] = useState(() => {
    const now = new Date();

    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!scheduledAt) {
      setError("Please select a date and time.");
      return;
    }

    const selectedDate = new Date(scheduledAt);

    if (selectedDate <= new Date()) {
      setError("Please select a future date and time.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await onScheduleInterview(interviewId, selectedDate);

      toast.add({
        title: "Interview scheduled successfully!",
        type: "success",
        description: "Your interview has been scheduled.",
      });

      setScheduledAt("");
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to schedule interview.";

      setError(message);

      toast.add({
        title: "Could not schedule interview",
        type: "error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !loading) {
      setScheduledAt("");
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule interview</DialogTitle>
          <DialogDescription>Choose the date and time for your interview.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="scheduled-at" className="text-sm font-medium">
              Interview date and time
            </label>

            <input
              id="scheduled-at"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={minDateTime}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
          )}

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
              {loading ? "Scheduling..." : "Schedule interview"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleInterviewDateTimePicker;
