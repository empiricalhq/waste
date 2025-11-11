import type React from "react";
import { QuizView } from "@/components/learn/quiz-view";
import type { QuizQuestion } from "@/types";

interface QuizModeProps {
  questions: QuizQuestion[];
  onQuizComplete: (score: number) => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({
  questions,
  onQuizComplete,
}) => {
  return <QuizView questions={questions} onQuizComplete={onQuizComplete} />;
};
