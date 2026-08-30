<div align="center">

# iOS Reference & Practice

### Browse, quiz yourself, and track progress across the iOS stack — all in the browser.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-2EA44F?style=for-the-badge&logo=githubpages&logoColor=white)](https://ios.sokpich.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-58A6FF?style=for-the-badge)](./LICENSE)

<br/>

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=flat-square&logo=githubpages&logoColor=white)

</div>

---

A **static, no-backend** website for learning and revising iOS development. Browse and filter
questions, quiz yourself (MCQ with instant feedback, or open-ended with self-rating), and track your
progress. There is no auth and no database — progress and bookmarks live in `localStorage`.

<!-- > **Live:** <https://ios.sokpich.dev> · Built with **Next.js** (App Router, static export) + **TypeScript** + **Tailwind CSS**. -->

## Features

| Page | What it does |
| :--- | :----------- |
| Home | Hero, quick stats, topic cards with per-topic completion |
| Browse | Filter all questions by topic, difficulty, and type; expand to reveal answers |
| Quiz | One question at a time — MCQs give instant feedback; open-ended questions reveal the answer and let you self-rate (Got it / Almost / Missed it) |
| Progress | Overall stats, per-topic completion, and a Weak Areas list to review |
| Spin Wheel | Spin for a random topic to drill |
| Bookmarks | Save questions for later |

Light and dark themes are both supported and follow the system preference by default.

## Content

154 questions across 11 topics — 102 multiple-choice and 52 open-ended.

| Topic | Questions |
| :---- | --------: |
| Swift | 24 |
| Xcode Tools | 23 |
| SwiftUI | 19 |
| UIKit | 15 |
| Security | 14 |
| Concurrency | 13 |
| Architecture | 12 |
| Testing | 11 |
| Networking | 10 |
| OOP | 8 |
| Interview Prep | 5 |

## How the data works

Questions are authored as Markdown in [`content/questions/`](./content/questions/), grouped into one
folder per topic. The folder name is the topic slug, registered in
[`lib/topics.ts`](./lib/topics.ts). Each `## Q:` heading starts one question:

````markdown
## Q: What is `intrinsicContentSize`?

**Answer:**
A complete standalone sentence, then any further prose.

**Code Example:**
```swift
label.intrinsicContentSize
```

**Key Points:**
- Optional bullet list

**Tags:** `#uikit` `#autolayout`
**Difficulty:** Intermediate
**References:**
- [intrinsicContentSize — Apple Developer](https://developer.apple.com/documentation/uikit/uiview/intrinsiccontentsize)
````

At build time, [`scripts/build-data.mjs`](./scripts/build-data.mjs) converts the Markdown into
`lib/generated/questions.json`:

- Derives a stable `id` from the topic slug, the question text, and the question's index within its
  file. Progress and bookmarks are keyed by this `id`, so **inserting a question in the middle of an
  existing file renumbers the ones after it and resets saved progress for them.** Append to the end
  of a file, or add a new file.
- Maps difficulty: `Beginner` to `junior`, `Intermediate` to `mid`, `Advanced` to `senior`. Any other
  value silently falls back to `mid`.
- Classifies each question as **MCQ** or **open-ended**. A question becomes an MCQ only if it opens
  with a recall phrase (`What is`, `Which`, `When should`, and similar) *and* the first sentence of
  its answer is clean standalone prose. That first sentence becomes the correct option, capped at
  200 characters — write it to stand on its own.
- For MCQs, generates three distractor options from other answers, preferring the same topic. The
  shuffle is seeded from the question `id`, so builds are reproducible.
- Lifts the `**References:**` block out of the answer into a `references` array, rendered as a
  "Further reading" panel below the answer. See below.

There is no schema validation: a block missing its question or answer is skipped silently, and a
folder that is not registered in `lib/topics.ts` produces questions that never appear in the filters.
Check your additions with `npm run build-data` and confirm the reported count went up as expected.

## References

`**References:**` is optional, goes last in a question block, and holds one Markdown link per line:

```markdown
**References:**
- [State — Apple Developer](https://developer.apple.com/documentation/swiftui/state)
```

Rules enforced by `npm run build-data`:

| Rule | Result if broken |
| :--- | :--- |
| Every line matches `- [label](url)` | **Build fails** |
| URLs are `https://` | **Build fails** |
| Host is in `REFERENCE_HOSTS` in [`scripts/build-data.mjs`](./scripts/build-data.mjs) | Warning only |

The host allowlist is a nudge, not a gate — add a host to that array when you start citing a new
source. Links render with the host shown next to the label so readers can judge the source, and open
in a new tab.

**Validation checks shape, not reachability.** Nothing in the build fetches these URLs, so a
well-formed link to a page that no longer exists passes silently. Open a URL before committing it —
Apple reorganizes documentation and retires WWDC session links regularly, and plausible-looking
`developer.apple.com` paths are easy to get wrong.

The generated JSON is git-ignored and rebuilt automatically before `dev` and `build`.

## Development

Requires Node 18.17.1 or newer.

```bash
npm install
npm run dev          # runs build-data, then serves at http://localhost:3000
```

Other scripts:

```bash
npm run build        # build-data + static export to ./out
npm run build-data   # regenerate questions.json from content/ only
npm run lint         # next lint
```

To add or edit questions, change the Markdown in `content/questions/` and restart the dev server, or
run `npm run build-data` on its own.

## Project layout

```text
app/           Next.js App Router pages (browse, quiz, progress, spin, bookmarks, contribute)
components/    QuestionCard, MarkdownRenderer, FilterBar, badges, quiz flow, spin wheel
content/       Question Markdown, one folder per topic
hooks/         useProgress and useBookmarks (localStorage)
lib/           Types, topic registry, question queries, generated JSON
scripts/       build-data.mjs — Markdown to JSON
```

## Deployment

Pushing to `main` triggers [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml), which
runs the static export and publishes `out/` to GitHub Pages. The site is served from the custom
domain in [`public/CNAME`](./public/CNAME) at the root path, so
[`next.config.mjs`](./next.config.mjs) sets no `basePath`.

## License

[MIT](./LICENSE) — Sok Pich
