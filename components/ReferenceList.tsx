import type { Reference } from '@/lib/types';
import Icon from './Icon';

// The host is shown next to each label so a reader can judge the source before
// clicking — references mix Apple docs with community posts and Q&A threads.
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export default function ReferenceList({ references }: { references?: Reference[] }) {
  if (!references?.length) return null;

  return (
    <div className="surface-2 mt-4 rounded-xl p-3">
      <p className="label-caps mb-2">Further reading</p>
      <ul className="space-y-1.5">
        {references.map((ref) => {
          const host = hostOf(ref.url);
          return (
            <li key={ref.url}>
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-2 text-xs leading-snug transition-colors hover:text-accent"
              >
                <Icon
                  name="external-link"
                  size={13}
                  className="mt-0.5 shrink-0"
                  style={{ color: 'var(--accent)' }}
                />
                <span className="min-w-0">
                  <span className="underline decoration-[var(--border)] underline-offset-2 group-hover:decoration-current">
                    {ref.label}
                  </span>
                  {host && <span className="text-faint ml-1.5 break-all">{host}</span>}
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
