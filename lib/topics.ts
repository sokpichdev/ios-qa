import type { Difficulty } from './types';
import type { IconName } from '@/components/Icon';

export interface TopicMeta {
  slug: string;
  name: string;
  color: string;
  icon: IconName;
  blurb: string;
}

export const TOPICS: TopicMeta[] = [
  { slug: 'swift', name: 'Swift', color: '#f05a28', icon: 'flame', blurb: 'Language fundamentals, optionals, memory, value vs reference types.' },
  { slug: 'swiftui', name: 'SwiftUI', color: '#7c3aed', icon: 'layers', blurb: 'Declarative UI, state management, layout, gestures.' },
  { slug: 'concurrency', name: 'Concurrency', color: '#0ea5e9', icon: 'zap', blurb: 'async/await, actors, tasks, structured concurrency.' },
  { slug: 'architecture', name: 'Architecture', color: '#10b981', icon: 'box', blurb: 'MVVM, coordinator, dependency injection, clean architecture.' },
  { slug: 'oop', name: 'OOP', color: '#d946ef', icon: 'grid', blurb: 'Inheritance, polymorphism, protocols, SOLID principles.' },
  { slug: 'networking', name: 'Networking', color: '#f59e0b', icon: 'globe', blurb: 'URLSession, REST, Codable, error handling, caching.' },
  { slug: 'testing', name: 'Testing', color: '#ec4899', icon: 'flask', blurb: 'Unit tests, mocking, XCTest, test doubles, TDD.' },
  { slug: 'uikit', name: 'UIKit', color: '#8b5cf6', icon: 'smartphone', blurb: 'View controllers, Auto Layout, lifecycle, delegation.' },
  { slug: 'xcode-tools', name: 'Xcode Tools', color: '#6366f1', icon: 'wrench', blurb: 'Fastlane, Firebase, build configs, CI/CD tooling.' },
  { slug: 'interview-prep', name: 'Interview Prep', color: '#14b8a6', icon: 'target', blurb: 'Coding frameworks, behavioral, common interview questions.' },
];

const BY_NAME = new Map(TOPICS.map((t) => [t.name, t]));
const BY_SLUG = new Map(TOPICS.map((t) => [t.slug, t]));

export function topicByName(name: string): TopicMeta | undefined {
  return BY_NAME.get(name);
}
export function topicBySlug(slug: string): TopicMeta | undefined {
  return BY_SLUG.get(slug);
}
export function topicColor(name: string): string {
  return BY_NAME.get(name)?.color ?? '#6366f1';
}

export const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: 'junior', label: 'Junior', color: '#34d399' },
  { value: 'mid', label: 'Mid', color: '#fbbf24' },
  { value: 'senior', label: 'Senior', color: '#f87171' },
];

export function difficultyMeta(d: Difficulty) {
  return DIFFICULTIES.find((x) => x.value === d) ?? DIFFICULTIES[1];
}
