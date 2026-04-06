// src/components/ContributeForm.tsx
import { useState } from 'react';
import { CATEGORIES, CATEGORY_META } from '../lib/questions';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;
const REPO = 'cobra-PICH/ios-qa';
const BRANCH = 'main';

interface FormFields {
  question: string;
  answer: string;
  code: string;
  category: string;
  difficulty: string;
  tags: string;
  filename: string;
}

function buildMarkdown(f: FormFields): string {
  let md = `## Q: ${f.question}\n\n${f.answer}\n`;
  if (f.code.trim()) {
    md += `\n\`\`\`swift\n${f.code.trim()}\n\`\`\`\n`;
  }
  md += `\n**Difficulty:** ${f.difficulty}\n`;
  if (f.tags.trim()) {
    md += `**Tags:** ${f.tags}\n`;
  }
  md += '\n---\n';
  return md;
}

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  background: 'var(--surface2)', border: '1px solid var(--border)',
  color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: 14,
  outline: 'none',
};
const labelStyle = {
  display: 'block', marginBottom: 6, fontSize: 13,
  color: 'var(--text-muted)', fontWeight: 500,
};

export default function ContributeForm() {
  const [fields, setFields] = useState<FormFields>({
    question: '', answer: '', code: '',
    category: 'swift', difficulty: 'Intermediate',
    tags: '', filename: '',
  });

  function update(key: keyof FormFields, val: string) {
    setFields(prev => ({ ...prev, [key]: val }));
  }

  const markdown = buildMarkdown(fields);
  const isValid = fields.question.trim() && fields.answer.trim() && fields.filename.trim().replace(/\.md$/, '').trim();

  function handleSubmit() {
    const filename = fields.filename.trim().replace(/\.md$/, '') + '.md';
    const url = `https://github.com/${REPO}/new/${BRANCH}/${encodeURIComponent(fields.category)}?filename=${encodeURIComponent(filename)}&value=${encodeURIComponent(markdown)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
      {/* Form column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Question *</label>
          <input
            style={inputStyle}
            placeholder="What is Optional and how does it work?"
            value={fields.question}
            onChange={e => update('question', e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>Answer *</label>
          <textarea
            style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
            placeholder="An Optional represents a value that may or may not exist..."
            value={fields.answer}
            onChange={e => update('answer', e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>Code Example (Swift — optional)</label>
          <textarea
            style={{ ...inputStyle, minHeight: 100, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 13 }}
            placeholder="let name: String? = nil&#10;print(name ?? &quot;unknown&quot;)"
            value={fields.code}
            onChange={e => update('code', e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Category *</label>
            <select style={inputStyle} value={fields.category} onChange={e => update('category', e.target.value)}>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Difficulty</label>
            <select style={inputStyle} value={fields.difficulty} onChange={e => update('difficulty', e.target.value)}>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Tags (comma-separated)</label>
          <input
            style={inputStyle}
            placeholder="optionals, nil, unwrapping"
            value={fields.tags}
            onChange={e => update('tags', e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>
            File name * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(e.g. optionals-basics, no .md needed)</span>
          </label>
          <input
            style={inputStyle}
            placeholder="optionals-basics"
            value={fields.filename}
            onChange={e => update('filename', e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!isValid}
          style={{ justifyContent: 'center', padding: '12px' }}
        >
          Open on GitHub →
        </button>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Opens GitHub's file editor with your content pre-filled. Sign in to GitHub, review the file, then click "Commit changes" to open a Pull Request. A GitHub account is required.
        </p>
      </div>

      {/* Preview column */}
      <div>
        <label style={{ ...labelStyle, marginBottom: 8 }}>Live Markdown Preview</label>
        <pre style={{
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 8, padding: 16, fontSize: 12, lineHeight: 1.6,
          whiteSpace: 'pre-wrap', minHeight: 300,
          color: markdown.trim() ? 'var(--text-muted)' : 'var(--border)',
          overflowY: 'auto', maxHeight: 520,
        }}>
          {markdown.trim() || '← Fill in the form to see preview'}
        </pre>
      </div>
    </div>
  );
}
