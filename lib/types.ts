export type QuestionType = 'mcq' | 'open-ended';
export type Difficulty = 'junior' | 'mid' | 'senior';
export type SelfRating = 'got-it' | 'almost' | 'missed';

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  topic: string;
  difficulty: Difficulty;
  options?: string[];
  correct?: string;
  answer: string;
  tags: string[];
}

export interface ProgressEntry {
  answered: boolean;
  correct?: boolean;
  selfRating?: SelfRating;
  answeredAt: number;
}

export type ProgressMap = Record<string, ProgressEntry>;
