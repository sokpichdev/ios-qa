import type { MetadataRoute } from 'next';
import { QUESTIONS, questionSlug } from '@/lib/questions';

const SITE = 'https://ios.sokpich.dev';
const staticRoutes = ['', '/browse', '/quiz', '/spin', '/bookmarks', '/progress', '/contribute'];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const mainPages: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE}${route}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  const questionPages: MetadataRoute.Sitemap = QUESTIONS.map((q) => ({
    url: `${SITE}/questions/${q.id}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const browseSlugPages: MetadataRoute.Sitemap = QUESTIONS.map((q) => ({
    url: `${SITE}/browse/${questionSlug(q.question)}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...mainPages, ...questionPages, ...browseSlugPages];
}
