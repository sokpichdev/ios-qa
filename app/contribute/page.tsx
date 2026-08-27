'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
import { TOPICS } from '@/lib/topics';

const TEMPLATE_EXAMPLE = `## Q: What is [Question Title]?

**Answer:**
A concise, standalone first sentence summarizing the answer accurately. Follow with any further technical explanation, architectural details, or context.

**Code Example:**
\`\`\`swift
// Provide a realistic, idiomatic Swift or UIKit/SwiftUI snippet
let example = "Idiomatic Swift"
\`\`\`

**Key Points:**
- Concise summary bullet point 1
- Important nuance or trade-off bullet point 2

**Tags:** #topic #concept #interview
**Difficulty:** Intermediate
**References:**
- [Topic Documentation — Apple Developer](https://developer.apple.com/documentation/...)
- [Deep Dive Article — Swift by Sundell](https://swiftbysundell.com/articles/...)
`;

const ALLOWED_HOSTS = [
  { name: 'Apple Developer', domain: 'developer.apple.com', color: '#0071e3' },
  { name: 'Swift.org', domain: 'swift.org', color: '#f05138' },
  { name: 'Swift by Sundell', domain: 'swiftbysundell.com', color: '#2563eb' },
  { name: 'Point-Free', domain: 'pointfree.co', color: '#7c3aed' },
  { name: 'Kodeco', domain: 'kodeco.com', color: '#059669' },
  { name: 'objc.io', domain: 'objc.io', color: '#ea580c' },
  { name: 'Hacking with Swift', domain: 'hackingwithswift.com', color: '#dc2626' },
  { name: 'GitHub', domain: 'github.com', color: '#4b5563' },
  { name: 'Firebase Docs', domain: 'firebase.google.com', color: '#f59e0b' },
  { name: 'Fastlane Tools', domain: 'docs.fastlane.tools', color: '#0284c7' },
];

export default function ContributePage() {
  const [copied, setCopied] = useState(false);

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(TEMPLATE_EXAMPLE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="py-8 sm:py-12 space-y-12 max-w-4xl mx-auto">
      {/* Header / Hero */}
      <section className="text-center space-y-4">
        <span
          className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"
          style={{ background: 'rgba(20,184,166,0.15)', color: '#14b8a6' }}
        >
          <Icon name="sparkles" size={26} />
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          <span className="heading-gradient">Contribution Guidelines</span>
        </h1>
        <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Help build the most authoritative, open-source iOS interview and practice curriculum.
          Questions live as Markdown files and compile into deterministic quizzes with verified references.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://github.com/sokpichdev/ios-qa"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <Icon name="logo" size={16} />
            View Repository on GitHub
          </a>
          <button onClick={handleCopyTemplate} className="btn-ghost">
            <Icon name={copied ? 'check' : 'list'} size={16} />
            {copied ? 'Template Copied!' : 'Copy Markdown Template'}
          </button>
        </div>
      </section>

      {/* Step-by-Step Contribution Workflow */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
          How to Contribute in 4 Steps
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 grid place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-xs">
                1
              </span>
              <h3 className="font-semibold text-sm">Fork &amp; Clone Repository</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Fork <a href="https://github.com/sokpichdev/ios-qa" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline">sokpichdev/ios-qa</a> and clone your fork locally:
            </p>
            <pre className="surface-2 rounded-lg p-2.5 text-[11px] font-mono text-muted overflow-x-auto">
              git clone https://github.com/&lt;your-username&gt;/ios-qa.git
            </pre>
          </div>

          <div className="glass rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 grid place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-xs">
                2
              </span>
              <h3 className="font-semibold text-sm">Choose Topic &amp; Author Markdown</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Navigate to <code className="surface-2 rounded px-1 text-[11px]">content/questions/&lt;topic-slug&gt;/</code>. Append your question block to an existing file or add a new <code className="surface-2 rounded px-1 text-[11px]">.md</code> file.
            </p>
            <p className="text-[11px] text-faint">
              Available topics: {TOPICS.map((t) => t.slug).join(', ')}.
            </p>
          </div>

          <div className="glass rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 grid place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-xs">
                3
              </span>
              <h3 className="font-semibold text-sm">Validate with Build Scripts</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Run the build validation script to check question syntax, MCQ option generation, and reference URLs:
            </p>
            <pre className="surface-2 rounded-lg p-2.5 text-[11px] font-mono text-muted overflow-x-auto">
              npm run build-data &amp;&amp; npm run build
            </pre>
          </div>

          <div className="glass rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 grid place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-xs">
                4
              </span>
              <h3 className="font-semibold text-sm">Open a Pull Request</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Push your branch and open a PR against <code className="surface-2 rounded px-1 text-[11px]">main</code>. Provide a brief summary of the questions and concepts added.
            </p>
            <a
              href="https://github.com/sokpichdev/ios-qa/pulls"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-[var(--accent)] inline-flex items-center gap-1 hover:underline"
            >
              View open PRs <Icon name="arrow-right" size={12} />
            </a>
          </div>
        </div>
      </section>

      {/* Markdown Format Specification */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            Markdown Format Specification
          </h2>
          <button
            onClick={handleCopyTemplate}
            className="chip text-xs hover:text-[var(--accent)] cursor-pointer"
          >
            <Icon name={copied ? 'check' : 'list'} size={13} />
            {copied ? 'Copied!' : 'Copy Template'}
          </button>
        </div>

        <div className="glass rounded-2xl p-5 space-y-4">
          <pre className="surface-2 rounded-xl p-4 text-xs font-mono text-[var(--text)] overflow-x-auto leading-relaxed border border-[var(--border)]">
            {TEMPLATE_EXAMPLE}
          </pre>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="space-y-1.5">
              <p className="font-semibold text-[var(--text)]">Field Requirements:</p>
              <ul className="space-y-1 text-muted list-disc list-inside">
                <li><code className="text-[var(--accent)]">## Q: [Title]</code>: Starts a single question block.</li>
                <li><code className="text-[var(--accent)]">**Answer:**</code>: Must open with a standalone, complete sentence.</li>
                <li><code className="text-[var(--accent)]">**Tags:**</code>: Space-separated hash tags (e.g. <code className="text-[var(--text)]">#swift #arc</code>).</li>
                <li><code className="text-[var(--accent)]">**Difficulty:**</code>: <code className="text-[var(--text)]">Beginner</code>, <code className="text-[var(--text)]">Intermediate</code>, or <code className="text-[var(--text)]">Advanced</code>.</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <p className="font-semibold text-[var(--text)]">MCQ Auto-Generation Rules:</p>
              <ul className="space-y-1 text-muted list-disc list-inside">
                <li>Questions opening with <em>What is, Which, When should, How does</em> become candidate MCQs.</li>
                <li>The first sentence of the answer becomes the correct option (&le; 200 characters).</li>
                <li>Distractor options are deterministically sourced from the same topic.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Allowed Reference Sources */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
          Authoritative Reference Sources
        </h2>
        <p className="text-sm text-muted">
          All questions should include credible references. The build validation script verifies that links use <code className="surface-2 rounded px-1.5 py-0.5 text-xs">https://</code> and originate from approved primary domains:
        </p>

        <div className="flex flex-wrap gap-2">
          {ALLOWED_HOSTS.map((host) => (
            <div
              key={host.domain}
              className="glass rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: host.color }} />
              <span className="font-medium text-[var(--text)]">{host.name}</span>
              <span className="text-faint font-mono text-[10px]">({host.domain})</span>
            </div>
          ))}
        </div>
      </section>

      {/* Best Practices & Rules Checklist */}
      <section className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold">Best Practices for Contributions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Icon name="check" size={14} /> DO:
            </p>
            <ul className="space-y-1.5 text-muted list-disc list-inside">
              <li>Write concise, direct answers that stand on their own.</li>
              <li>Include modern Swift 5.9+ and concurrency syntax.</li>
              <li>Provide realistic, syntax-highlighted code snippets.</li>
              <li>Append questions at the end of files to maintain stable IDs.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-rose-400 flex items-center gap-1.5">
              <Icon name="x" size={14} /> AVOID:
            </p>
            <ul className="space-y-1.5 text-muted list-disc list-inside">
              <li>Do not insert questions into the middle of existing files (resets user progress IDs).</li>
              <li>Do not use insecure <code className="text-rose-400">http://</code> links.</li>
              <li>Avoid opinion-based or framework-war discussions without technical basis.</li>
              <li>Avoid deprecated Objective-C APIs unless explicitly contrasting.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <section className="text-center pt-4 space-y-3">
        <p className="text-sm text-muted">
          Have an idea for a topic or question that isn&apos;t covered yet?
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://github.com/sokpichdev/ios-qa/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-xs"
          >
            Open an Issue on GitHub <Icon name="arrow-right" size={14} />
          </a>
          <Link href="/browse" className="btn-ghost text-xs">
            Browse Current Questions
          </Link>
        </div>
      </section>
    </div>
  );
}
