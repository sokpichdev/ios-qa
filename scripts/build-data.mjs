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
  'interview-prep': 'Interview Prep',
};

const DIFFICULTY_MAP = {
  beginner: 'junior',
  intermediate: 'mid',
  advanced: 'senior',
};

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

  for (const file of files) {
    const rel = file.slice(CONTENT_DIR.length + 1);
    const topicSlug = rel.split(/[/\\]/)[0];
    const topic = TOPIC_NAMES[topicSlug] || topicSlug;
    const text = await readFile(file, 'utf8');

    // Split on "## Q:" headings.
    const blocks = text.split(/^##\s+Q:\s*/m).slice(1);
    blocks.forEach((block, i) => {
      const nl = block.indexOf('\n');
      const question = (nl === -1 ? block : block.slice(0, nl)).trim();
      let body = (nl === -1 ? '' : block.slice(nl + 1)).trim();

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

      // Answer field = full body minus the Tags/Difficulty meta lines.
      const answer = body
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
    };
  });

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(questions, null, 2));

  const mcq = questions.filter((q) => q.type === 'mcq').length;
  const open = questions.length - mcq;
  console.log(
    `✓ build-data: ${questions.length} questions (${mcq} MCQ, ${open} open-ended) → lib/generated/questions.json`
  );
}

main().catch((err) => {
  console.error('✗ build-data failed:', err);
  process.exit(1);
});
