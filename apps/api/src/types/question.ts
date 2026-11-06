import { QuestionDifficulty } from "@interview-os/database";

export type createQuestionData = {
  title: string;
  description: string;
  difficulty: QuestionDifficulty;
  tags: string[];
  slug: string;
};

export type updateQuestionData = {
  title?: string;
  description?: string;
  difficulty?: QuestionDifficulty;
  tags?: string[];
  slug?: string;
};
