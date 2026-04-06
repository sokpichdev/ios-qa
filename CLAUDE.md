# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

**ios-qa** is a personal iOS development knowledge base — a curated collection of Q&A markdown files covering Swift, SwiftUI, concurrency, architecture, networking, testing, UIKit, Xcode tools, and interview prep. The site is built with Astro and deployed to GitHub Pages.

## Site Generation

The site is built with Astro:

```bash
npm run build
```

This generates `dist/` which is deployed to GitHub Pages via GitHub Actions.

**CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys the site automatically on push to `main`.

**Note:** The Python generator (`scripts/generate_site.py`) has been superseded by Astro. Do not edit `index.html` — it is no longer committed to the repo.

## Content Structure

Q&A files live under `src/content/questions/` in category subfolders:

| Folder | Topic |
|--------|-------|
| `src/content/questions/swift/` | Language fundamentals, memory management |
| `src/content/questions/swiftui/` | State, property wrappers, layout, navigation |
| `src/content/questions/concurrency/` | async/await, Actors, Tasks, GCD |
| `src/content/questions/architecture/` | MVVM, Coordinator, Design patterns |
| `src/content/questions/networking/` | URLSession, Codable, caching, auth |
| `src/content/questions/testing/` | XCTest, UI testing, mocking |
| `src/content/questions/uikit/` | ViewControllers, Auto Layout, lifecycle |
| `src/content/questions/xcode-tools/` | SPM, build config, CI/CD, Fastlane, Firebase |
| `src/content/questions/interview/` | Interview prep questions and debugging |

## Q&A Format

Each `.md` file uses a consistent structure the parser depends on:

```markdown
## Q: Your question here?

Your answer here.

\```swift
// Code example
\```

**Tags:** tag1, tag2, tag3
```

Questions are detected by the regex `^#{1,3}\s+Q:` — headings must start with `Q:` to be parsed.

## Adding or Editing Content

1. Edit or create a `.md` file in the appropriate `src/content/questions/` category subfolder
2. Follow the Q&A format above (the `Q:` prefix on headings is required by the content schema)
3. Run `npm run build` locally to verify the site builds correctly
4. Push to `main` — GitHub Actions builds and deploys to GitHub Pages automatically

Do **not** manually edit `index.html` or files in `dist/`; these are generated artifacts.
