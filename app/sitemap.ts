import type { MetadataRoute } from 'next';
import { QUESTIONS, questionSlug } from '@/lib/questions';

const SITE = 'https://ios.sokpich.dev';
const routes = ['', '/browse', '/quiz', '/spin', '/bookmarks', '/progress', '/contribute'];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const pages: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${SITE}${route}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  const questions = QUESTIONS.map((question) => ({
    url: `${SITE}/browse/${questionSlug(question.question)}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...pages, ...questions];
}
