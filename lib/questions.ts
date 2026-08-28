import data from './generated/questions.json';
import type { Question, Difficulty, QuestionType } from './types';
import { TOPICS } from './topics';

export const QUESTIONS = data as Question[];

export function getById(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

export function getAdjacentQuestions(id: string): { prev?: Question; next?: Question } {
  const current = getById(id);
  if (!current) return {};
  const inTopic = QUESTIONS.filter((q) => q.topic === current.topic);
  const idx = inTopic.findIndex((q) => q.id === id);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? inTopic[idx - 1] : undefined,
    next: idx < inTopic.length - 1 ? inTopic[idx + 1] : undefined,
  };
}

export function getRelatedQuestions(question: Question, limit = 3): Question[] {
  return QUESTIONS.filter(
    (q) => q.id !== question.id && (q.topic === question.topic || q.tags.some((t) => question.tags.includes(t)))
  ).slice(0, limit);
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

export interface TagStat {
  tag: string;
  total: number;
}

export function tagCounts(selectedTopic?: string | null): TagStat[] {
  const map = new Map<string, number>();
  const questions = selectedTopic
    ? QUESTIONS.filter((q) => q.topic === selectedTopic)
    : QUESTIONS;

  for (const q of questions) {
    for (const t of q.tags) {
      map.set(t, (map.get(t) ?? 0) + 1);
    }
  }

  return Array.from(map.entries())
    .map(([tag, total]) => ({ tag, total }))
    .sort((a, b) => b.total - a.total || a.tag.localeCompare(b.tag));
}

export interface QuestionFilter {
  topics?: string[]; // topic display names
  difficulties?: Difficulty[];
  types?: QuestionType[];
  tags?: string[];
  tag?: string;
  search?: string;
}

export function filterQuestions(filter: QuestionFilter): Question[] {
  const search = filter.search?.trim().toLowerCase();
  const filterTag = filter.tag?.trim().toLowerCase().replace(/^#/, '');
  const filterTags = filter.tags?.map((t) => t.trim().toLowerCase().replace(/^#/, ''));

  return QUESTIONS.filter((q) => {
    if (filter.topics?.length && !filter.topics.includes(q.topic)) return false;
    if (filter.difficulties?.length && !filter.difficulties.includes(q.difficulty)) return false;
    if (filter.types?.length && !filter.types.includes(q.type)) return false;
    if (filterTag && !q.tags.some((t) => t.toLowerCase() === filterTag)) return false;
    if (filterTags?.length && !filterTags.every((ft) => q.tags.some((t) => t.toLowerCase() === ft))) return false;
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
  tags: tagCounts().length,
  mcq: QUESTIONS.filter((q) => q.type === 'mcq').length,
  open: QUESTIONS.filter((q) => q.type === 'open-ended').length,
};
