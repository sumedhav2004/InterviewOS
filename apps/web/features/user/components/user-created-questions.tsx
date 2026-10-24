"use client";

import type { User } from "../types";
import { Brain, ChevronRight, FileQuestion } from "lucide-react";

type Props = {
  user: User;
};

const UserCreatedQuestions = ({ user }: Props) => {
  const questions = user.questions ?? [];

  return (
    <section className="rounded-xl border bg-card p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Questions created</h2>
          <p className="mt-1 text-sm text-muted-foreground">Questions contributed by {user.name}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Brain className="h-5 w-5" />
          <span>{questions.length}</span>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-10 text-center">
          <FileQuestion className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No questions yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Questions created by this user will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {questions.map((question) => (
            <div key={question.id} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <FileQuestion className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{question.title}</p>
                {question.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {question.description}
                  </p>
                )}
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default UserCreatedQuestions;
