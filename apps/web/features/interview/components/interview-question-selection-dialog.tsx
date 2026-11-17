"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "@/components/ui/toast";
import { InterviewQuestion, QuestionDifficulty } from "../types/interview";
import { Badge } from "@/components/ui/badge";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: InterviewQuestion[];
  activeQuestionId: string | null;
  onSelectQuestion: (interviewQuestionId: string) => Promise<void>;
};

const difficultyStyles: Record<QuestionDifficulty, string> = {
  EASY: "border-green-500/30 bg-green-500/10 text-green-600",
  MEDIUM: "border-yellow-500/30 bg-yellow-500/10 text-yellow-600",
  HARD: "border-red-500/30 bg-red-500/10 text-red-600",
};

export default function InterviewQuestionSelectionDialog({
  open,
  onOpenChange,
  questions,
  activeQuestionId,
  onSelectQuestion,
}: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSelectQuestion = async (interviewQuestionId: string) => {
    try {
      setLoadingId(interviewQuestionId);

      await onSelectQuestion(interviewQuestionId);

      toast.add({
        type: "success",
        title: "Active question updated",
        description: "The selected question is now active.",
      });

      onOpenChange(false);
    } catch (error) {
      toast.add({
        type: "error",
        title: "Failed to change question",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select active question</DialogTitle>
          <DialogDescription>Choose a question to make active in this interview.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">
          {questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No questions assigned to this interview.
            </p>
          ) : (
            questions.map((interviewQuestion, index) => {
              const isActive = activeQuestionId === interviewQuestion.id;

              return (
                <div
                  key={interviewQuestion.id}
                  className="flex items-center justify-between gap-4 rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {index + 1}. {interviewQuestion.question.title}
                    </p>

                    {isActive && <p className="mt-1 text-xs text-primary">Currently active</p>}

                    <Badge
                      variant="outline"
                      className={difficultyStyles[interviewQuestion.question.difficulty]}
                    >
                      {interviewQuestion.question.difficulty}
                    </Badge>
                  </div>

                  <button
                    type="button"
                    disabled={loadingId !== null || isActive}
                    onClick={() => handleSelectQuestion(interviewQuestion.id)}
                    className="shrink-0 rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingId === interviewQuestion.id
                      ? "Selecting..."
                      : isActive
                        ? "Active"
                        : "Select"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
