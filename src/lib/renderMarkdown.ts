import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
import swift from 'highlight.js/lib/languages/swift';
import objectivec from 'highlight.js/lib/languages/objectivec';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import ruby from 'highlight.js/lib/languages/ruby';

hljs.registerLanguage('swift', swift);
hljs.registerLanguage('objectivec', objectivec);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('ruby', ruby);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Emit data-lang on <pre> (drives the CSS language badge), syntax-highlight
// the contents with highlight.js, and append a copy button handled by the
// delegated click listener in BaseLayout.
marked.use({
  renderer: {
    code({ text, lang }) {
      const language = (lang ?? '').trim().split(/\s+/)[0].toLowerCase();
      const langAttr = language ? ` data-lang="${escapeHtml(language)}"` : '';
      let body: string;
      let codeClass = '';
      if (language && hljs.getLanguage(language)) {
        body = hljs.highlight(text, { language }).value;
        codeClass = ` class="hljs language-${escapeHtml(language)}"`;
      } else {
        body = escapeHtml(text);
      }
      return `<pre${langAttr}><code${codeClass}>${body}</code>`
        + `<button class="copy-btn" type="button" aria-label="Copy code">Copy</button></pre>\n`;
    },
  },
});

export function renderMarkdown(text: string): string {
  const html = marked.parse(text) as string;
  // DOMPurify only runs in browser; on server (Astro SSG) it's a no-op fallback
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(html);
  }
  return html;
}
