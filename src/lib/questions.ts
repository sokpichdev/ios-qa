// src/lib/questions.ts

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Question {
  id: string;           // slugified: "swift--what-is-optional--0"
  category: string;     // "swift", "swiftui", etc.
  title: string;        // text after "## Q:"
  body: string;         // full answer markdown text
  difficulty: Difficulty;
  tags: string[];
}

export const CATEGORIES = [
  'swift',
  'swiftui',
  'concurrency',
  'architecture',
  'oop',
  'networking',
  'testing',
  'uikit',
  'xcode-tools',
  'interview-prep',
] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_META: Record<Category, { emoji: string; color: string; label: string }> = {
  swift:            { emoji: '🦅', color: '#f05a28', label: 'Swift' },
  swiftui:          { emoji: '🎨', color: '#7c3aed', label: 'SwiftUI' },
  concurrency:      { emoji: '⚡', color: '#0ea5e9', label: 'Concurrency' },
  architecture:     { emoji: '🏗️', color: '#10b981', label: 'Architecture' },
  oop:              { emoji: '🧩', color: '#d946ef', label: 'OOP' },
  networking:       { emoji: '🌐', color: '#f59e0b', label: 'Networking' },
  testing:          { emoji: '🧪', color: '#ec4899', label: 'Testing' },
  uikit:            { emoji: '📱', color: '#8b5cf6', label: 'UIKit' },
  'xcode-tools':    { emoji: '🔧', color: '#6366f1', label: 'Xcode Tools' },
  'interview-prep': { emoji: '🎯', color: '#14b8a6', label: 'Interview Prep' },
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function parseDifficulty(body: string): Difficulty {
  const match = body.match(/\*\*Difficulty:\*\*\s*(Beginner|Intermediate|Advanced)/i);
  if (!match) return 'Intermediate';
  return match[1] as Difficulty;
}

function parseTags(body: string): string[] {
  const match = body.match(/\*\*Tags:\*\*\s*(.+)/);
  if (!match) return [];
  return match[1]
    .split(/[,\s`]+/)
    .map((t: string) => t.replace(/^#/, '').trim())
    .filter(Boolean);
}

export function parseQuestionsFromRaw(raw: string, category: string): Question[] {
  // Split on "## Q:" or "### Q:" headings
  const sections = raw.split(/^#{1,3}\s+Q:\s*/m).filter(Boolean);

  return sections
    .map((section, i) => {
      const lines = section.split('\n');
      const title = lines[0].trim();
      // Skip sections that don't look like questions (e.g. file headers)
      if (!title || title.startsWith('#')) return null;
      const body = lines.slice(1).join('\n').trim();
      const id = `${category}--${slugify(title)}--${i}`;

      return {
        id,
        category,
        title,
        body,
        difficulty: parseDifficulty(body),
        tags: parseTags(body),
      };
    })
    .filter((q): q is Question => q !== null);
}
