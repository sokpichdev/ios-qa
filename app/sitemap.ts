import type { MetadataRoute } from 'next';

const SITE = 'https://ios.sokpich.dev';
const routes = ['', '/browse', '/quiz', '/spin', '/bookmarks', '/progress', '/contribute'];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((route) => ({
    url: `${SITE}${route}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
