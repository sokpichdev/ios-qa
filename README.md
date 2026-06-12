# iOS Developer Q&A Knowledge Base

A personal reference of questions, answers, and code snippets for iOS development. Built with [Astro](https://astro.build) and deployed to GitHub Pages.

---

## Categories

| Category | Files |
|---|---|
| [Swift](#swift) | `memory-and-types` · `swift-fundamentals` · `swift-array-optionals` |
| [SwiftUI](#swiftui) | `state-management` · `swiftui-fundamentals` · `ontapgesture-vs-simultaneousgesture` · `FlowLayout-vs-WrapHStack` · `how-to-use-ui-feedback` |
| [Concurrency](#concurrency) | `async-await-and-actors` · `concurrency-fundamentals` |
| [Architecture](#architecture) | `mvvm-and-coordinator` · `architecture-fundamentals` |
| [OOP](#oop) | `oop-fundamentals` |
| [Networking](#networking) | `networking-fundamentals` |
| [Testing](#testing) | `testing-fundamentals` |
| [UIKit](#uikit) | `uikit-fundamentals` |
| [Xcode & Tools](#xcode--tools) | `xcode-fundamentals` · `fastlane-firebase-distribution-guide` · `firebase-push-notifications-guide` · `iOS_Fastlane_Firebase_Setup_Guide` · `iOS_MultiEnv_SwiftUI_Firebase_Setup` · `add-protobuf` |
| [Interview Prep](#interview-prep) | `common-questions` · `coding-interview-framework` |

---

## Swift

- What is the difference between `strong`, `weak`, and `unowned` references?
- What is a protocol extension and why is it powerful?
- What is `@escaping` in a closure?
- What is the difference between `struct` and `class` in Swift?
- What is `Optional` and how does it work?
- What is `guard let` vs `if let`?
- What is `Codable` and how does it work?
- What is the difference between `map`, `flatMap`, and `compactMap`?
- What is `lazy` property and when is it useful?
- What is `Result` type and when should you use it?
- What is `Hashable`, `Equatable`, and `Comparable`?
- What is `@propertyWrapper` and how do you create one?
- What is the `some` keyword (opaque types)?
- What is copy-on-write (COW) and which types use it?
- Swift arrays, optionals, and collection operations

---

## SwiftUI

- What is the difference between `@State`, `@Binding`, `@ObservedObject`, and `@StateObject`?
- What is `ViewBuilder` and how does it work?
- When should you use `task {}` vs `onAppear {}`?
- What is the difference between `@Environment` and `@EnvironmentObject`?
- How does SwiftUI's diffing algorithm work?
- What is `GeometryReader` and what are its pitfalls?
- How do you animate transitions between views?
- What is `LazyVStack` vs `VStack` — when does it matter?
- How do you handle navigation with `NavigationStack`?
- What is `@AppStorage` and when would you use it?
- How do you create a custom `ViewModifier`?
- How do you pass data between a sheet and the parent view?
- What is the `Identifiable` protocol and why does SwiftUI need it?
- `onTapGesture` vs `simultaneousGesture` — differences and use cases
- FlowLayout vs WrapHStack — wrapping views in SwiftUI
- How to use UI feedback (haptics, alerts, toasts)

---

## Concurrency

- What is the difference between `async/await` and GCD?
- What is an `Actor` and when should you use one?
- What is `MainActor` and when do you use it?
- What is a `Task` and how is it different from a `Thread`?
- What is `TaskGroup` and when would you use it?
- What is `async let` and when is it useful?
- What is `withCheckedContinuation` and why is it needed?
- How do you cancel a running `Task`?
- What is `Sendable` and why does it matter?
- What is the difference between a serial and concurrent queue in GCD?
- What is a race condition and how do you prevent it?
- What is `OperationQueue` and how is it different from GCD?
- What is `AsyncStream` and what problem does it solve?

---

## Architecture

- What is MVVM and how does it work in iOS?
- What is the Coordinator pattern and why use it?
- What is the difference between MVC, MVVM, and MVP?
- What is Dependency Injection and why is it important?
- What is the Repository pattern?
- What is the Singleton pattern and what are its downsides?
- What is the difference between composition and inheritance?
- What is SOLID and how does it apply to Swift?
- What is the Observer pattern and how is it used in iOS?
- What is the Factory pattern?
- What is Clean Architecture in iOS?
- What is TCA (The Composable Architecture)?

---

## OOP

- What are the four pillars of OOP?
- What is encapsulation and how is it applied in Swift?
- What is inheritance and when should you avoid it?
- What is polymorphism in Swift?
- What is abstraction and how do protocols support it?
- Class vs Struct — when to use each in an OOP context

---

## Networking

- How does `URLSession` work?
- What is the difference between `dataTask`, `downloadTask`, and `uploadTask`?
- How do you handle API errors gracefully?
- How do you implement retry logic for failed network calls?
- How do you handle authentication tokens and refresh them?
- How do you mock network requests for testing?
- What is `URLCache` and how does caching work in iOS?
- What is `multipart/form-data` and how do you send it?
- How do you handle SSL pinning in iOS?
- What is Combine and how does it relate to networking?

---

## Testing

- What is the difference between unit tests and UI tests?
- What is a mock vs a stub vs a spy?
- How do you test async code in XCTest?
- What is `XCTestExpectation` and when do you need it?
- What is test coverage and how do you measure it?
- How do you test a ViewModel?
- What is snapshot testing?
- How do you use dependency injection to make code testable?
- What are the main `XCTAssert` assertion types?
- How do you test network code without hitting a real server?

---

## UIKit

- What is the `UIViewController` lifecycle?
- What is the difference between `frame` and `bounds`?
- How does Auto Layout work and what is constraint priority?
- What is `UITableView` reuse and why does it matter?
- What is the `UIResponder` and the responder chain?
- How does `layoutSubviews` work and when is it called?
- What is `intrinsicContentSize`?
- What is `CALayer` and how does it relate to `UIView`?
- How do you handle keyboard appearance and dismissal?
- What is `UIStackView` and when should you use it?

---

## Xcode & Tools

- What is Swift Package Manager (SPM)?
- What is the difference between `Debug` and `Release` build configurations?
- What is a scheme vs a target vs a project?
- How do you use breakpoints effectively in Xcode?
- What is LLDB and what are useful commands?
- What is a memory leak and how do you find one with Instruments?
- What is the Address Sanitizer?
- What is `OSLog` and how is it better than `print`?
- What is `xcconfig` and when would you use it?
- How do you set up CI/CD for an iOS project?
- **Guide:** [Fastlane + Firebase App Distribution](./src/content/questions/xcode-tools/fastlane-firebase-distribution-guide.md) — automated build delivery to testers
- **Guide:** [Firebase FCM Push Notifications](./src/content/questions/xcode-tools/firebase-push-notifications-guide.md) — end-to-end push notification setup with SPM
- **Guide:** [Fastlane + Firebase Full Setup](./src/content/questions/xcode-tools/iOS_Fastlane_Firebase_Setup_Guide.md) — complete Fastlane/Firebase iOS setup
- **Guide:** [Multi-Environment SwiftUI + Firebase](./src/content/questions/xcode-tools/iOS_MultiEnv_SwiftUI_Firebase_Setup.md) — dev/staging/prod environment configuration
- **Guide:** [Add Protobuf to iOS Project](./src/content/questions/xcode-tools/add-protobuf.md)

---

## Interview Prep

- Explain the iOS app lifecycle
- What is a retain cycle and how do you prevent it?
- What is the difference between synchronous and asynchronous execution?
- What tools do you use to debug performance issues?
- Coding interview frameworks and problem-solving patterns

---

## Content Structure

```
src/content/questions/
├── swift/
├── swiftui/
├── concurrency/
├── architecture/
├── oop/
├── networking/
├── testing/
├── uikit/
├── xcode-tools/
└── interview-prep/
```

## Adding a New Question

1. Edit or create a `.md` file in the appropriate `src/content/questions/` subfolder
2. Use this format (the `Q:` prefix on headings is required):

```markdown
## Q: Your question here?

Your answer here.

​```swift
// Code example
​```

**Tags:** tag1, tag2, tag3
```

3. Push to `main` — GitHub Actions builds and deploys automatically
