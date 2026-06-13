'use client';

import Icon from './Icon';
import { TOPICS, DIFFICULTIES } from '@/lib/topics';
import type { Difficulty, QuestionType } from '@/lib/types';
import { topicCounts } from '@/lib/questions';

export interface BrowseFilter {
  topic: string | null;
  difficulty: Difficulty | null;
  type: QuestionType | null;
  search: string;
}

const counts = topicCounts();
const countFor = (name: string) => counts.find((c) => c.name === name)?.total ?? 0;

export default function FilterBar({
  filter,
  onChange,
}: {
  filter: BrowseFilter;
  onChange: (f: BrowseFilter) => void;
}) {
  const set = (patch: Partial<BrowseFilter>) => onChange({ ...filter, ...patch });

  const Row = ({ active, color, onClick, children }: { active: boolean; color?: string; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`w-full rounded-lg px-3 py-1.5 text-left text-[13px] transition-colors ${active ? 'chip-active' : 'text-muted hover:text-[var(--text)]'}`}
      style={!active && color ? { color } : undefined}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="glass flex items-center gap-2 rounded-lg px-3 py-2">
        <Icon name="search" size={15} className="text-faint" />
        <input
          value={filter.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Search questions…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-faint)]"
        />
      </div>

      {/* Topic */}
      <div>
        <p className="label-caps mb-2">Topic</p>
        <div className="space-y-0.5">
          <Row active={filter.topic === null} onClick={() => set({ topic: null })}>All Topics</Row>
          {TOPICS.filter((t) => countFor(t.name) > 0).map((t) => (
            <Row key={t.slug} active={filter.topic === t.name} onClick={() => set({ topic: t.name })}>
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                  {t.name}
                </span>
                <span className="text-faint text-[11px]">{countFor(t.name)}</span>
              </span>
            </Row>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <p className="label-caps mb-2">Difficulty</p>
        <div className="space-y-0.5">
          <Row active={filter.difficulty === null} onClick={() => set({ difficulty: null })}>All Levels</Row>
          {DIFFICULTIES.map((d) => (
            <Row key={d.value} active={filter.difficulty === d.value} color={d.color} onClick={() => set({ difficulty: d.value })}>
              {d.label}
            </Row>
          ))}
        </div>
      </div>

      {/* Type */}
      <div>
        <p className="label-caps mb-2">Type</p>
        <div className="space-y-0.5">
          <Row active={filter.type === null} onClick={() => set({ type: null })}>All Types</Row>
          <Row active={filter.type === 'mcq'} onClick={() => set({ type: 'mcq' })}>MCQ</Row>
          <Row active={filter.type === 'open-ended'} onClick={() => set({ type: 'open-ended' })}>Open-ended</Row>
        </div>
      </div>
    </div>
  );
}
