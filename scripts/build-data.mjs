// Build script: converts content/questions/**/*.md → lib/generated/questions.json
// Runs via `npm run build-data` (hooked into predev / prebuild).
//
// Each `## Q:` block becomes one Question. MCQ options are generated
// deterministically: the correct option is the first sentence of the answer,
// distractors are first-sentences pulled from other questions in the same topic.

import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content', 'questions');
const OUT_DIR = join(ROOT, 'lib', 'generated');
const OUT_FILE = join(OUT_DIR, 'questions.json');

const TOPIC_NAMES = {
  swift: 'Swift',
  swiftui: 'SwiftUI',
  concurrency: 'Concurrency',
  architecture: 'Architecture',
  oop: 'OOP',
  networking: 'Networking',
  testing: 'Testing',
  uikit: 'UIKit',
  'xcode-tools': 'Xcode Tools',
  security: 'Security',
  'interview-prep': 'Interview Prep',
};

const DIFFICULTY_MAP = {
  beginner: 'junior',
  intermediate: 'mid',
  advanced: 'senior',
};

// Approved "Further reading" sources. A host outside this list is a warning,
// not an error — adding a source should never break a deploy. Matches the host
// itself or any subdomain of it.
const REFERENCE_HOSTS = [
  // Apple official
  'developer.apple.com',
  'support.apple.com',
  'swift.org',
  // Tooling & repos
  'github.com',
  'docs.fastlane.tools',
  'firebase.google.com',
  'docs.cossacklabs.com',
  // Curated community
  'swiftbysundell.com',
  'pointfree.co',
  'objc.io',
  'kodeco.com',
  'hackingwithswift.com',
  'medium.com',
  'itcraftapps.com',
  // Q&A
  'stackoverflow.com',
];

// Questions opening with these become candidate MCQs (factual recall).
const MCQ_OPENERS = /^(what is|what are|what does|what's|which|when should|name the|true or false)/i;

// --- deterministic PRNG so build output is stable across runs ---
function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function slug(s) {
  return s
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

// Strip inline markdown for plain-text option/summary display.
function stripMd(s) {
  return s
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// First sentence of the "**Answer:**" prose, cleaned and length-capped.
function firstSentence(answerSection) {
  const clean = stripMd(answerSection);
  if (!clean) return '';
  const m = clean.match(/^(.+?[.!?])(\s|$)/);
  let sentence = m ? m[1] : clean;
  if (sentence.length > 200) {
    sentence = sentence.slice(0, 197).replace(/\s+\S*$/, '') + '…';
  }
  return sentence;
}

// Pull the prose under "**Answer:**" up to the next "**Heading:**".
function extractAnswerProse(body) {
  const m = body.match(/\*\*Answer:\*\*\s*([\s\S]*?)(?=\n\s*\*\*[A-Z][^*]*:\*\*|\n\s*```|$)/);
  if (m) return m[1].trim();
  // Fallback: first non-empty paragraph
  const para = body.split(/\n\s*\n/).find((p) => p.trim() && !p.trim().startsWith('**'));
  return para ? para.trim() : body.trim();
}

// The whole "**References:**" meta block: header plus the list under it, up to
// the next "**Meta:**" line or end of body. Matched once per question block and
// reused to strip the block out of `answer`, so the links don't render twice.
const REFERENCE_BLOCK =
  /\n?[ \t]*\*\*References:\*\*[ \t]*\r?\n([\s\S]*?)(?=\n[ \t]*\*\*[A-Z][^*\n]*:\*\*|$)/;
const REFERENCE_LINE = /^[-*]\s+\[([^\]]+)\]\((\S+)\)$/;

function lineOf(text, offset) {
  let n = 1;
  for (let i = 0; i < offset && i < text.length; i++) if (text[i] === '\n') n++;
  return n;
}

function hostAllowed(host) {
  return REFERENCE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}

// Parse a matched reference block into [{ label, url }], pushing any problems
// onto `errors` / `warnings` with file:line context.
function parseReferences(match, startLine, where, errors, warnings) {
  const refs = [];
  match[0].split('\n').forEach((raw, idx) => {
    const line = raw.trim();
    if (!line || line.startsWith('**References:**')) return;

    const at = `${where}:${startLine + idx}`;
    const m = line.match(REFERENCE_LINE);
    if (!m) {
      errors.push(`${at} — malformed reference, expected "- [label](https://…)": ${line}`);
      return;
    }

    const [, label, url] = m;
    if (!url.startsWith('https://')) {
      errors.push(`${at} — reference URL must be https://: ${url}`);
      return;
    }

    let host;
    try {
      host = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      errors.push(`${at} — unparseable reference URL: ${url}`);
      return;
    }
    if (!hostAllowed(host)) {
      warnings.push(`${at} — host '${host}' not in allowlist`);
    }

    refs.push({ label: label.trim(), url });
  });
  return refs;
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(full)));
    else if (e.name.endsWith('.md')) files.push(full);
  }
  return files;
}

async function main() {
  const files = (await walk(CONTENT_DIR)).sort();
  const raw = [];
  const errors = [];
  const warnings = [];

  for (const file of files) {
    const rel = file.slice(CONTENT_DIR.length + 1);
    const topicSlug = rel.split(/[/\\]/)[0];
    const topic = TOPIC_NAMES[topicSlug] || topicSlug;
    const text = await readFile(file, 'utf8');

    // Split on "## Q:" headings, keeping offsets so reference diagnostics can
    // report a real file:line instead of just a filename.
    const heads = [...text.matchAll(/^##\s+Q:\s*/gm)];
    heads.forEach((head, i) => {
      const start = head.index + head[0].length;
      const end = i + 1 < heads.length ? heads[i + 1].index : text.length;
      const block = text.slice(start, end);

      const nl = block.indexOf('\n');
      const question = (nl === -1 ? block : block.slice(0, nl)).trim();
      const rawBody = nl === -1 ? '' : block.slice(nl + 1);
      // Offset of the trimmed body within `text`, for line numbering.
      const bodyOffset =
        start + (nl === -1 ? block.length : nl + 1) + (rawBody.length - rawBody.trimStart().length);
      let body = rawBody.trim();

      // Drop trailing horizontal rule and any following block leakage.
      body = body.replace(/\n\s*---\s*$/g, '').trim();

      const tagMatch = body.match(/\*\*Tags:\*\*\s*(.+)/);
      const tags = tagMatch
        ? [...tagMatch[1].matchAll(/#([\w-]+)/g)].map((m) => m[1])
        : [];

      const diffMatch = body.match(/\*\*Difficulty:\*\*\s*(\w+)/);
      const difficulty = diffMatch
        ? DIFFICULTY_MAP[diffMatch[1].toLowerCase()] || 'mid'
        : 'mid';

      const refMatch = body.match(REFERENCE_BLOCK);
      const references = refMatch
        ? parseReferences(
            refMatch,
            lineOf(text, bodyOffset + refMatch.index),
            rel,
            errors,
            warnings
          )
        : [];

      // Answer field = full body minus the References block and the
      // Tags/Difficulty meta lines. References is a multi-line block, so it
      // needs a block-level strip — otherwise its links render twice.
      const answer = body
        .replace(REFERENCE_BLOCK, '')
        .replace(/\n?\*\*Tags:\*\*.*$/m, '')
        .replace(/\n?\*\*Difficulty:\*\*.*$/m, '')
        .trim();

      const summary = firstSentence(extractAnswerProse(body));
      if (!question || !answer) return;

      raw.push({
        id: `${topicSlug}-${slug(question)}-${i}`,
        question,
        topic,
        topicSlug,
        difficulty,
        answer,
        tags,
        references,
        summary,
      });
    });
  }

  // A "clean" summary reads as a complete statement (good for options).
  const isClean = (s) => !!s && /[.!?…]$/.test(s) && s.length >= 12;

  // Group clean summaries by topic for distractor sourcing.
  const byTopic = {};
  for (const q of raw) {
    if (!isClean(q.summary)) continue;
    (byTopic[q.topicSlug] ||= []).push(q.summary);
  }
  const allSummaries = raw.map((q) => q.summary).filter(isClean);

  // Omit the key entirely when a question has no references.
  const refField = (q) => (q.references.length ? { references: q.references } : {});

  const questions = raw.map((q) => {
    const rng = mulberry32(hashSeed(q.id));
    const isMcqCandidate = MCQ_OPENERS.test(q.question) && isClean(q.summary);

    if (isMcqCandidate) {
      const pool = (byTopic[q.topicSlug] || [])
        .concat(allSummaries)
        .filter((s) => s && s !== q.summary);
      const seen = new Set([q.summary]);
      const distractors = [];
      for (const s of shuffle(pool, rng)) {
        if (distractors.length >= 3) break;
        if (seen.has(s)) continue;
        seen.add(s);
        distractors.push(s);
      }
      if (distractors.length === 3) {
        const options = shuffle([q.summary, ...distractors], rng);
        return {
          id: q.id,
          question: q.question,
          type: 'mcq',
          topic: q.topic,
          difficulty: q.difficulty,
          options,
          correct: q.summary,
          answer: q.answer,
          tags: q.tags,
          ...refField(q),
        };
      }
    }

    return {
      id: q.id,
      question: q.question,
      type: 'open-ended',
      topic: q.topic,
      difficulty: q.difficulty,
      answer: q.answer,
      tags: q.tags,
      ...refField(q),
    };
  });

  // Malformed references are a content bug, not a rendering quirk — fail the
  // build rather than shipping a broken "Further reading" panel.
  if (errors.length) {
    for (const e of errors) console.error(`✗ ${e}`);
    console.error(`✗ build-data failed: ${errors.length} invalid reference(s)`);
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(questions, null, 2));

  const mcq = questions.filter((q) => q.type === 'mcq').length;
  const open = questions.length - mcq;
  const withRefs = questions.filter((q) => q.references);
  const refCount = withRefs.reduce((n, q) => n + q.references.length, 0);
  console.log(
    `✓ build-data: ${questions.length} questions (${mcq} MCQ, ${open} open-ended) → lib/generated/questions.json`
  );
  console.log(`✓ references: ${refCount} links across ${withRefs.length} questions`);
  for (const w of warnings) console.warn(`⚠ ${w}`);
}

main().catch((err) => {
  console.error('✗ build-data failed:', err);
  process.exit(1);
});
