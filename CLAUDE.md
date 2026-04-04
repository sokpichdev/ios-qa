# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

**ios-qa** is a personal iOS development knowledge base — a curated collection of Q&A markdown files covering Swift, SwiftUI, concurrency, architecture, networking, testing, UIKit, Xcode tools, and interview prep. A Python script generates a searchable GitHub Pages site from these markdown files.

## Site Generation

The only build step is running the Python site generator:

```bash
python3 scripts/generate_site.py
```

This parses all `.md` files and regenerates `index.html`. No dependencies, no pip install needed — pure stdlib.

**CI/CD:** GitHub Actions (`.github/workflows/build-site.yml`) runs the generator automatically on any push to `main` that touches `.md` files or generator scripts, then auto-commits the updated `index.html`.

## Content Structure

Q&A files live in category folders:

| Folder | Topic |
|--------|-------|
| `swift/` | Language fundamentals, memory management |
| `swiftui/` | State, property wrappers, layout, navigation |
| `concurrency/` | async/await, Actors, Tasks, GCD |
| `architecture/` | MVVM, Coordinator, Design patterns |
| `networking/` | URLSession, Codable, caching, auth |
| `testing/` | XCTest, UI testing, mocking |
| `uikit/` | ViewControllers, Auto Layout, lifecycle |
| `xcode-tools/` | SPM, build config, CI/CD, Fastlane, Firebase |
| `interview/` | Interview prep questions and debugging |

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

1. Edit or create a `.md` file in the appropriate category folder
2. Follow the Q&A format above (the `Q:` prefix on headings is required by the parser)
3. Run `python3 scripts/generate_site.py` locally to verify the HTML renders correctly
4. Push to `main` — GitHub Actions regenerates and commits `index.html` automatically

Do **not** manually edit `index.html`; it gets overwritten on every push.
