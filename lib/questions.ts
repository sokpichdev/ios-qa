import data from './generated/questions.json';
import type { Question, Difficulty, QuestionType } from './types';
import { TOPICS } from './topics';

export const QUESTIONS = data as Question[];

export function getById(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

export interface TopicStat {
  slug: string;
  name: string;
  total: number;
}

export function topicCounts(): TopicStat[] {
  return TOPICS.map((t) => ({
    slug: t.slug,
    name: t.name,
    total: QUESTIONS.filter((q) => q.topic === t.name).length,
  })).filter((t) => t.total > 0);
}

export interface QuestionFilter {
  topics?: string[]; // topic display names
  difficulties?: Difficulty[];
  types?: QuestionType[];
  search?: string;
}

export function filterQuestions(filter: QuestionFilter): Question[] {
  const search = filter.search?.trim().toLowerCase();
  return QUESTIONS.filter((q) => {
    if (filter.topics?.length && !filter.topics.includes(q.topic)) return false;
    if (filter.difficulties?.length && !filter.difficulties.includes(q.difficulty)) return false;
    if (filter.types?.length && !filter.types.includes(q.type)) return false;
    if (search) {
      const hay = (q.question + ' ' + q.answer + ' ' + q.tags.join(' ')).toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

export const STATS = {
  total: QUESTIONS.length,
  topics: topicCounts().length,
  mcq: QUESTIONS.filter((q) => q.type === 'mcq').length,
  open: QUESTIONS.filter((q) => q.type === 'open-ended').length,
};
