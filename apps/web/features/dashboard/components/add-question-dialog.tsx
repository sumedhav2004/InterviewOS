"use client";

import { useEffect, useRef, useState } from "react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Search, Plus, ChevronLeft, ChevronRight, X, Check } from "lucide-react";

import { useQuestions } from "../hooks/usegetAllQuestions";
import { Interview, Question, QuestionDifficulty } from "../types";
import { CreateInterviewQuestionPayload } from "../api/dashboard-api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewId: string;
  existingInterviews: (Interview & {
    description?: string | null;
    language?: string;
    createdBy?: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
    participants?: {
      id: string;
      role: "INTERVIEWER" | "CANDIDATE" | "OBSERVER";
      status: "ACTIVE" | "INACTIVE";
      user: {
        id: string;
        name: string;
        avatarUrl: string | null;
      };
    }[];
    questions?: {
      id: string;
      questionOrder: number;
      points: number;
      question: {
        id: string;
        title: string;
        description: string;
        difficulty: "EASY" | "MEDIUM" | "HARD";
      };
    }[];
  })[];

  onCreateInterviewQuestion: (
    interviewId: string,
    questionId: string,
    data: CreateInterviewQuestionPayload,
  ) => Promise<unknown>;
};

const PAGE_SIZE = 6;

const difficultyStyles: Record<QuestionDifficulty, string> = {
  EASY: "border-green-500/30 bg-green-500/10 text-green-600",
  MEDIUM: "border-yellow-500/30 bg-yellow-500/10 text-yellow-600",
  HARD: "border-red-500/30 bg-red-500/10 text-red-600",
};

export default function AddQuestionDialog({
  open,
  onOpenChange,
  interviewId,
  existingInterviews,
  onCreateInterviewQuestion,
}: Props) {
  // -----------------------------------------------
  // Question bank state
  // -----------------------------------------------

  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<QuestionDifficulty | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [assigningQuestions, setAssigningQuestions] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  // -----------------------------------------------
  // Hooks
  // -----------------------------------------------

  const { getQuestions, loading: questionsLoading, error: questionsError } = useQuestions();

  // Keep the latest function without making the fetching effect
  // repeatedly run when the hook creates a new function identity.
  const getQuestionsRef = useRef(getQuestions);

  useEffect(() => {
    getQuestionsRef.current = getQuestions;
  }, [getQuestions]);

  // -----------------------------------------------
  // Fetch real questions from the backend
  // -----------------------------------------------

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadQuestions() {
      const result = await getQuestionsRef.current({
        search: search.trim() || undefined,

        difficulty: filterDifficulty === "ALL" ? undefined : filterDifficulty,

        page,
        limit: PAGE_SIZE,
      });

      if (cancelled) return;

      if (!result) {
        setQuestions([]);
        setTotalQuestions(0);
        return;
      }

      setQuestions(result.data);
      setTotalQuestions(result.pagination.total);
    }

    void loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [open, search, filterDifficulty, page, retryCount]);

  // -----------------------------------------------
  // Pagination
  // -----------------------------------------------

  const totalPages = Math.max(1, Math.ceil(totalQuestions / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  // -----------------------------------------------
  // Select / deselect questions
  // -----------------------------------------------

  function toggleQuestion(questionId: string) {
    setSelectedQuestionIds((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId],
    );
  }

  // -----------------------------------------------
  // Assign selected questions to the interview
  // -----------------------------------------------

  async function handleAddSelected() {
    if (!interviewId || selectedQuestionIds.length === 0) return;

    const currentInterview = existingInterviews.find((interview) => interview.id === interviewId);

    const existingQuestions = currentInterview?.questions ?? [];

    try {
      setAssigningQuestions(true);
      setAssignmentError(null);

      let nextOrder = existingQuestions.length + 1;

      for (const questionId of selectedQuestionIds) {
        await onCreateInterviewQuestion(interviewId, questionId, {
          questionOrder: nextOrder,
          points: 10,
        });

        nextOrder++;
      }

      setSelectedQuestionIds([]);
      onOpenChange(false);
    } catch (err) {
      setAssignmentError(err instanceof Error ? err.message : "Failed to add questions");
    } finally {
      setAssigningQuestions(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="text-xl">Add Questions</DialogTitle>

          <DialogDescription>
            Select questions from your question bank to add to this interview.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            {/* Search and difficulty filter */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search questions..."
                  className="pl-9"
                  aria-label="Search questions"
                />
              </div>

              <select
                value={filterDifficulty}
                onChange={(event) => {
                  setFilterDifficulty(event.target.value as QuestionDifficulty | "ALL");
                  setPage(1);
                }}
                aria-label="Filter by difficulty"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="ALL">All difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            {/* Question list */}
            <div className="space-y-2">
              {questionsLoading ? (
                <div className="flex min-h-48 items-center justify-center">
                  <p className="text-sm text-muted-foreground">Loading questions...</p>
                </div>
              ) : questionsError ? (
                <div className="flex min-h-48 flex-col items-center justify-center text-center">
                  <p className="font-medium text-destructive">Failed to load questions</p>

                  <p className="mt-1 text-sm text-muted-foreground">{questionsError}</p>

                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3"
                    onClick={() => setRetryCount((count) => count + 1)}
                  >
                    Retry
                  </Button>
                </div>
              ) : questions.length > 0 ? (
                questions.map((question) => {
                  const selected = selectedQuestionIds.includes(question.id);

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => toggleQuestion(question.id)}
                      aria-pressed={selected}
                      className={`w-full rounded-lg border p-4 text-left transition-colors ${
                        selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium">{question.title}</p>

                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {question.description}
                          </p>
                        </div>

                        <Badge variant="outline" className={difficultyStyles[question.difficulty]}>
                          {question.difficulty}
                        </Badge>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {question.tags.map((item) => (
                          <Badge
                            key={`${question.id}-${item.tagId}`}
                            variant="secondary"
                            className="font-normal"
                          >
                            {item.tag.name}
                          </Badge>
                        ))}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex min-h-48 flex-col items-center justify-center text-center">
                  <Search className="mb-2 size-8 text-muted-foreground/50" />

                  <p className="font-medium">No questions found</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Try changing your search or difficulty filter.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                {totalQuestions} questions · Page {currentPage} of {totalPages}
              </p>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Previous page"
                  disabled={questionsLoading || currentPage <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Next page"
                  disabled={questionsLoading || currentPage >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>

            {/* Assignment actions */}
            <div className="flex flex-col gap-3 border-t pt-4">
              <p className="text-sm text-muted-foreground">{selectedQuestionIds.length} selected</p>

              {assignmentError && (
                <p role="alert" className="text-sm text-destructive">
                  {assignmentError}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>

                <Button
                  type="button"
                  disabled={selectedQuestionIds.length === 0 || assigningQuestions}
                  onClick={handleAddSelected}
                >
                  <Plus className="mr-2 size-4" />
                  {assigningQuestions ? "Adding..." : "Add Selected"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
