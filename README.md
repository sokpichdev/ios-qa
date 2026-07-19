<div align="center">

# 📱 iOS Reference & Practice

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
questions, quiz yourself (MCQ with instant feedback or open-ended with self-rating), and track your
progress — all stored locally in your browser.

> 🔗 **Live:** <https://ios.sokpich.dev> · Built with **Next.js** (App Router, static export) + **Tailwind CSS**.

## ✨ Features

|     | Feature |
| :-: | :------ |
| 🏠 | **Home** — hero, quick stats, topic cards with per-topic completion |
| 🔍 | **Browse** — filter all questions by topic, difficulty, and type; expand to reveal answers |
| 🧠 | **Quiz** — answer one at a time; MCQs give instant feedback, open-ended questions reveal the answer and let you self-rate (Got it / Almost / Missed it) |
| 📈 | **Progress** — overall stats, per-topic completion, and a Weak Areas list to review |
| 🎯 | **Spin Wheel** — spin for a random topic to drill |
| 🔖 | **Bookmarks** — save questions for later |
| 🌗 | **Light & dark mode** — glassmorphism dark theme, soft light theme, follows system preference |

> No backend, no auth, no database — all progress and bookmarks live in `localStorage`.

## 🧩 Topics

`Swift` · `SwiftUI` · `Concurrency` · `Architecture` · `OOP` · `Networking` · `Testing` · `UIKit` · `Xcode Tools` · `Interview Prep`

## 🗂️ Data

Questions are authored as Markdown in [`content/questions/`](./content/questions/), grouped by topic
folder. Each `## Q:` block becomes one question with an answer, optional code example, key points,
tags, and a difficulty.

At build time, [`scripts/build-data.mjs`](./scripts/build-data.mjs) converts the Markdown into
`lib/generated/questions.json`:

- Maps difficulty (`Beginner → junior`, `Intermediate → mid`, `Advanced → senior`).
- Classifies each question as **MCQ** (factual recall) or **open-ended**.
- For MCQs, generates 3 distractor options deterministically from other answers in the same topic.

The generated JSON is git-ignored and rebuilt automatically before `dev` and `build`.

## 🛠️ Development

```bash
npm install
npm run dev        # runs build-data, then starts the dev server at http://localhost:3000
```

Other scripts:

```bash
npm run build      # build-data + static export to ./out
npm run build-data # regenerate questions.json from content/ only
```

To add or edit questions, change the Markdown in `content/questions/` and restart the dev server
(or run `npm run build-data`).

## 🚀 Deployment

Pushing to `main` triggers [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml), which
builds the static export and publishes `out/` to GitHub Pages. The site is served under the
`/ios-qa` base path (configured in [`next.config.mjs`](./next.config.mjs)).

## 📄 License

[MIT](./LICENSE) © Sok Pich
