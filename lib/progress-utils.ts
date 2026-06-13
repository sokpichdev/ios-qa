import type { ProgressMap, Question } from './types';
import { QUESTIONS } from './questions';
import { TOPICS } from './topics';

export interface TopicProgress {
  slug: string;
  name: string;
  color: string;
  total: number;
  answered: number;
  percent: number;
}

export function topicProgress(progress: ProgressMap): TopicProgress[] {
  return TOPICS.map((t) => {
    const inTopic = QUESTIONS.filter((q) => q.topic === t.name);
    const answered = inTopic.filter((q) => progress[q.id]?.answered).length;
    return {
      slug: t.slug,
      name: t.name,
      color: t.color,
      total: inTopic.length,
      answered,
      percent: inTopic.length ? Math.round((answered / inTopic.length) * 100) : 0,
    };
  }).filter((t) => t.total > 0);
}

export interface OverallStats {
  answered: number;
  correct: number;
  missed: number;
  percent: number;
}

export function overallStats(progress: ProgressMap): OverallStats {
  const entries = Object.values(progress).filter((e) => e.answered);
  const correct = entries.filter((e) => e.correct === true || e.selfRating === 'got-it').length;
  const missed = entries.filter((e) => e.correct === false || e.selfRating === 'missed').length;
  return {
    answered: entries.length,
    correct,
    missed,
    percent: QUESTIONS.length ? Math.round((entries.length / QUESTIONS.length) * 100) : 0,
  };
}

// Questions the user got wrong or rated below "got it".
export function weakQuestions(progress: ProgressMap): Question[] {
  return QUESTIONS.filter((q) => {
    const e = progress[q.id];
    if (!e?.answered) return false;
    return e.correct === false || e.selfRating === 'missed' || e.selfRating === 'almost';
  });
}
