'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

// Links written inline in answer markdown open in a new tab, so a reader
// following a citation doesn't lose the question they were reading. In-page
// anchors and relative links keep default behavior.
const isExternal = (href?: string) => !!href && /^https?:\/\//.test(href);

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose-answer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ href, children, ...props }) =>
            isExternal(href) ? (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            ) : (
              <a href={href} {...props}>
                {children}
              </a>
            ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
