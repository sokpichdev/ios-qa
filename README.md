# 📱 iOS Developer Q&A Knowledge Base

A personal reference of questions, answers, and code snippets for iOS development.
Click any question to jump straight to the answer.

---

## 🗂 Categories

- [Swift](#-swift)
- [SwiftUI](#-swiftui)
- [Concurrency](#-concurrency)
- [Architecture](#-architecture)
- [Interview Prep](#-interview-prep)

---

## 🔷 Swift
> [`swift/memory-and-types.md`](./swift/memory-and-types.md)

- [What is the difference between `strong`, `weak`, and `unowned` references?](./swift/memory-and-types.md#q-what-is-the-difference-between-strong-weak-and-unowned-references)
- [What is a protocol extension and why is it powerful?](./swift/memory-and-types.md#q-what-is-a-protocol-extension-and-why-is-it-powerful)
- [What is `@escaping` in a closure?](./swift/memory-and-types.md#q-what-is-escaping-in-a-closure)
- [What is the difference between `struct` and `class` in Swift?](./swift/memory-and-types.md#q-what-is-the-difference-between-struct-and-class-in-swift)

---

## 🔶 SwiftUI
> [`swiftui/state-management.md`](./swiftui/state-management.md)

- [What is the difference between `@State`, `@Binding`, `@ObservedObject`, and `@StateObject`?](./swiftui/state-management.md#q-what-is-the-difference-between-state-binding-observedobject-and-stateobject)
- [What is `ViewBuilder` and how does it work?](./swiftui/state-management.md#q-what-is-viewbuilder-and-how-does-it-work)
- [When should you use `task {}` vs `onAppear {}` in SwiftUI?](./swiftui/state-management.md#q-when-should-you-use-task--vs-onappear--in-swiftui)

---

## ⚡ Concurrency
> [`concurrency/async-await-and-actors.md`](./concurrency/async-await-and-actors.md)

- [What is the difference between `async/await` and GCD?](./concurrency/async-await-and-actors.md#q-what-is-the-difference-between-asyncawait-and-gcd-grand-central-dispatch)
- [What is an `Actor` and when should you use one?](./concurrency/async-await-and-actors.md#q-what-is-an-actor-and-when-should-you-use-one)
- [What is `MainActor` and when do you use it?](./concurrency/async-await-and-actors.md#q-what-is-mainactor-and-when-do-you-use-it)

---

## 🏗 Architecture
> [`architecture/mvvm-and-coordinator.md`](./architecture/mvvm-and-coordinator.md)

- [What is MVVM and how does it work in iOS?](./architecture/mvvm-and-coordinator.md#q-what-is-mvvm-and-how-does-it-work-in-ios)
- [What is the Coordinator pattern and why use it?](./architecture/mvvm-and-coordinator.md#q-what-is-the-coordinator-pattern-and-why-use-it)

---

## 🎯 Interview Prep
> [`interview-prep/common-questions.md`](./interview-prep/common-questions.md)

- [Explain the iOS app lifecycle](./interview-prep/common-questions.md#q-explain-the-ios-app-lifecycle)
- [What is a retain cycle and how do you prevent it?](./interview-prep/common-questions.md#q-what-is-retain-cycle-and-how-do-you-prevent-it)
- [What is the difference between synchronous and asynchronous execution?](./interview-prep/common-questions.md#q-what-is-the-difference-between-synchronous-and-asynchronous-execution)
- [What tools do you use to debug performance issues in iOS?](./interview-prep/common-questions.md#q-what-tools-do-you-use-to-debug-performance-issues-in-ios)

---

## 📂 Coming Soon

- 🌐 Networking — URLSession, REST, Codable, error handling
- 🧪 Testing — XCTest, unit tests, UI tests, mocking
- 📐 UIKit — View controllers, Auto Layout, collection views
- 🛠 Xcode & Tools — Debugging, Instruments, SPM, CI/CD

---

## ✍️ How to Add a New Question

1. Open the relevant `.md` file in the right folder
2. Add your Q&A using this format:

\`\`\`markdown
## Q: Your question here?

**Answer:**
Your explanation here.

**Tags:** \`#topic\` \`#subtopic\`
\`\`\`

3. Add a link to this README under the right category:
\`\`\`markdown
- [Your question](./folder/file.md#q-your-question-slug)
\`\`\`

---

*Last updated: 2026*
