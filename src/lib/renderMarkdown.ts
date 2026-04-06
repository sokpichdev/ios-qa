import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function renderMarkdown(text: string): string {
  const html = marked.parse(text) as string;
  // DOMPurify only runs in browser; on server (Astro SSG) it's a no-op fallback
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(html);
  }
  return html;
}
