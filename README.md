# 📱 iOS Developer Q&A Knowledge Base

A personal reference of questions, answers, and code snippets for iOS development.
Click any question to jump straight to the answer.

---

## 🗂 Categories

- [Swift](#-swift)
- [SwiftUI](#-swiftui)
- [Concurrency](#-concurrency)
- [Architecture](#-architecture)
- [Networking](#-networking)
- [Testing](#-testing)
- [UIKit](#-uikit)
- [Xcode & Tools](#-xcode--tools)

---

## 🔷 Swift
> [`swift/memory-and-types.md`](./swift/memory-and-types.md) · [`swift/swift-fundamentals.md`](./swift/swift-fundamentals.md)

- [What is the difference between `strong`, `weak`, and `unowned` references?](./swift/memory-and-types.md#q-what-is-the-difference-between-strong-weak-and-unowned-references)
- [What is a protocol extension and why is it powerful?](./swift/memory-and-types.md#q-what-is-a-protocol-extension-and-why-is-it-powerful)
- [What is `@escaping` in a closure?](./swift/memory-and-types.md#q-what-is-escaping-in-a-closure)
- [What is the difference between `struct` and `class` in Swift?](./swift/memory-and-types.md#q-what-is-the-difference-between-struct-and-class-in-swift)
- [What is `Optional` and how does it work?](./swift/swift-fundamentals.md#q-what-is-optional-and-how-does-it-work)
- [What is `guard let` vs `if let`?](./swift/swift-fundamentals.md#q-what-is-guard-let-vs-if-let)
- [What is `Codable` and how does it work?](./swift/swift-fundamentals.md#q-what-is-codable-and-how-does-it-work)
- [What is the difference between `map`, `flatMap`, and `compactMap`?](./swift/swift-fundamentals.md#q-what-is-the-difference-between-map-flatmap-and-compactmap)
- [What is `lazy` property and when is it useful?](./swift/swift-fundamentals.md#q-what-is-lazy-property-and-when-is-it-useful)
- [What is `Result` type and when should you use it?](./swift/swift-fundamentals.md#q-what-is-result-type-and-when-should-you-use-it)
- [What is `Hashable`, `Equatable`, and `Comparable`?](./swift/swift-fundamentals.md#q-what-is-hashable-equatable-and-comparable)
- [What is `@propertyWrapper` and how do you create one?](./swift/swift-fundamentals.md#q-what-is-propertywrapper-and-how-do-you-create-one)
- [What is `some` keyword (opaque types)?](./swift/swift-fundamentals.md#q-what-is-some-keyword-opaque-types)
- [What is copy-on-write (COW) and which types use it?](./swift/swift-fundamentals.md#q-what-is-copy-on-write-cow-and-which-types-use-it)

---

## 🔶 SwiftUI
> [`swiftui/state-management.md`](./swiftui/state-management.md) · [`swiftui/swiftui-fundamentals.md`](./swiftui/swiftui-fundamentals.md)

- [What is the difference between `@State`, `@Binding`, `@ObservedObject`, and `@StateObject`?](./swiftui/state-management.md#q-what-is-the-difference-between-state-binding-observedobject-and-stateobject)
- [What is `ViewBuilder` and how does it work?](./swiftui/state-management.md#q-what-is-viewbuilder-and-how-does-it-work)
- [When should you use `task {}` vs `onAppear {}` in SwiftUI?](./swiftui/state-management.md#q-when-should-you-use-task--vs-onappear--in-swiftui)
- [What is the difference between `@Environment` and `@EnvironmentObject`?](./swiftui/swiftui-fundamentals.md#q-what-is-the-difference-between-environment-and-environmentobject)
- [How does SwiftUI's diffing algorithm work?](./swiftui/swiftui-fundamentals.md#q-how-does-swiftuis-diffing-algorithm-work)
- [What is `GeometryReader` and what are its pitfalls?](./swiftui/swiftui-fundamentals.md#q-what-is-geometryreader-and-what-are-its-pitfalls)
- [How do you animate transitions between views in SwiftUI?](./swiftui/swiftui-fundamentals.md#q-how-do-you-animate-transitions-between-views-in-swiftui)
- [What is `LazyVStack` vs `VStack` — when does it matter?](./swiftui/swiftui-fundamentals.md#q-what-is-lazyvstack-vs-vstack--when-does-it-matter)
- [How do you handle navigation in SwiftUI using `NavigationStack`?](./swiftui/swiftui-fundamentals.md#q-how-do-you-handle-navigation-in-swiftui-using-navigationstack)
- [What is `@AppStorage` and when would you use it?](./swiftui/swiftui-fundamentals.md#q-what-is-appstorage-and-when-would-you-use-it)
- [How do you create a custom `ViewModifier`?](./swiftui/swiftui-fundamentals.md#q-how-do-you-create-a-custom-viewmodifier)
- [How do you pass data between a sheet and the parent view?](./swiftui/swiftui-fundamentals.md#q-how-do-you-pass-data-between-a-sheet-and-the-parent-view)
- [What is the `Identifiable` protocol and why does SwiftUI need it?](./swiftui/swiftui-fundamentals.md#q-what-is-the-identifiable-protocol-and-why-does-swiftui-need-it)

---

## ⚡ Concurrency
> [`concurrency/async-await-and-actors.md`](./concurrency/async-await-and-actors.md) · [`concurrency/concurrency-fundamentals.md`](./concurrency/concurrency-fundamentals.md)

- [What is the difference between `async/await` and GCD?](./concurrency/async-await-and-actors.md#q-what-is-the-difference-between-asyncawait-and-gcd-grand-central-dispatch)
- [What is an `Actor` and when should you use one?](./concurrency/async-await-and-actors.md#q-what-is-an-actor-and-when-should-you-use-one)
- [What is `MainActor` and when do you use it?](./concurrency/async-await-and-actors.md#q-what-is-mainactor-and-when-do-you-use-it)
- [What is a `Task` and how is it different from a `Thread`?](./concurrency/concurrency-fundamentals.md#q-what-is-a-task-and-how-is-it-different-from-a-thread)
- [What is `TaskGroup` and when would you use it?](./concurrency/concurrency-fundamentals.md#q-what-is-taskgroup-and-when-would-you-use-it)
- [What is `async let` and when is it useful?](./concurrency/concurrency-fundamentals.md#q-what-is-async-let-and-when-is-it-useful)
- [What is `withCheckedContinuation` and why is it needed?](./concurrency/concurrency-fundamentals.md#q-what-is-withcheckedcontinuation-and-why-is-it-needed)
- [How do you cancel a running `Task`?](./concurrency/concurrency-fundamentals.md#q-how-do-you-cancel-a-running-task)
- [What is `Sendable` and why does it matter?](./concurrency/concurrency-fundamentals.md#q-what-is-sendable-and-why-does-it-matter)
- [What is the difference between a `serial` and `concurrent` queue in GCD?](./concurrency/concurrency-fundamentals.md#q-what-is-the-difference-between-a-serial-and-concurrent-queue-in-gcd)
- [What is a race condition and how do you prevent it?](./concurrency/concurrency-fundamentals.md#q-what-is-a-race-condition-and-how-do-you-prevent-it)
- [What is `OperationQueue` and how is it different from GCD?](./concurrency/concurrency-fundamentals.md#q-what-is-operationqueue-and-how-is-it-different-from-gcd)
- [What is `AsyncStream` and what problem does it solve?](./concurrency/concurrency-fundamentals.md#q-what-is-asyncstream-and-what-problem-does-it-solve)

---

## 🏗 Architecture
> [`architecture/mvvm-and-coordinator.md`](./architecture/mvvm-and-coordinator.md) · [`architecture/architecture-fundamentals.md`](./architecture/architecture-fundamentals.md)

- [What is MVVM and how does it work in iOS?](./architecture/mvvm-and-coordinator.md#q-what-is-mvvm-and-how-does-it-work-in-ios)
- [What is the Coordinator pattern and why use it?](./architecture/mvvm-and-coordinator.md#q-what-is-the-coordinator-pattern-and-why-use-it)
- [What is the difference between MVC, MVVM, and MVP?](./architecture/architecture-fundamentals.md#q-what-is-the-difference-between-mvc-mvvm-and-mvp)
- [What is Dependency Injection and why is it important?](./architecture/architecture-fundamentals.md#q-what-is-dependency-injection-and-why-is-it-important)
- [What is the Repository pattern?](./architecture/architecture-fundamentals.md#q-what-is-the-repository-pattern)
- [What is the Singleton pattern and what are its downsides?](./architecture/architecture-fundamentals.md#q-what-is-the-singleton-pattern-and-what-are-its-downsides)
- [What is the difference between composition and inheritance?](./architecture/architecture-fundamentals.md#q-what-is-the-difference-between-composition-and-inheritance)
- [What is SOLID and how does it apply to Swift?](./architecture/architecture-fundamentals.md#q-what-is-solid-and-how-does-it-apply-to-swift)
- [What is the Observer pattern and how is it used in iOS?](./architecture/architecture-fundamentals.md#q-what-is-the-observer-pattern-and-how-is-it-used-in-ios)
- [What is the Factory pattern?](./architecture/architecture-fundamentals.md#q-what-is-the-factory-pattern)
- [What is Clean Architecture in iOS?](./architecture/architecture-fundamentals.md#q-what-is-clean-architecture-in-ios)
- [What is TCA (The Composable Architecture)?](./architecture/architecture-fundamentals.md#q-what-is-tca-the-composable-architecture)

---

## 🌐 Networking
> [`networking/networking-fundamentals.md`](./networking/networking-fundamentals.md)

- [How does `URLSession` work?](./networking/networking-fundamentals.md#q-how-does-urlsession-work)
- [What is the difference between `dataTask`, `downloadTask`, and `uploadTask`?](./networking/networking-fundamentals.md#q-what-is-the-difference-between-datatask-downloadtask-and-uploadtask)
- [How do you handle API errors gracefully?](./networking/networking-fundamentals.md#q-how-do-you-handle-api-errors-gracefully)
- [How do you implement retry logic for failed network calls?](./networking/networking-fundamentals.md#q-how-do-you-implement-retry-logic-for-failed-network-calls)
- [How do you handle authentication tokens and refresh them?](./networking/networking-fundamentals.md#q-how-do-you-handle-authentication-tokens-and-refresh-them)
- [How do you mock network requests for testing?](./networking/networking-fundamentals.md#q-how-do-you-mock-network-requests-for-testing)
- [What is `URLCache` and how does caching work in iOS?](./networking/networking-fundamentals.md#q-what-is-urlcache-and-how-does-caching-work-in-ios)
- [What is `multipart/form-data` and how do you send it in iOS?](./networking/networking-fundamentals.md#q-what-is-multipartform-data-and-how-do-you-send-it-in-ios)
- [How do you handle SSL pinning in iOS?](./networking/networking-fundamentals.md#q-how-do-you-handle-ssl-pinning-in-ios)
- [What is Combine and how does it relate to networking?](./networking/networking-fundamentals.md#q-what-is-combine-and-how-does-it-relate-to-networking)

---

## 🧪 Testing
> [`testing/testing-fundamentals.md`](./testing/testing-fundamentals.md)

- [What is the difference between unit tests and UI tests?](./testing/testing-fundamentals.md#q-what-is-the-difference-between-unit-tests-and-ui-tests)
- [What is a mock vs a stub vs a spy?](./testing/testing-fundamentals.md#q-what-is-a-mock-vs-a-stub-vs-a-spy)
- [How do you test async code in XCTest?](./testing/testing-fundamentals.md#q-how-do-you-test-async-code-in-xctest)
- [What is `XCTestExpectation` and when do you need it?](./testing/testing-fundamentals.md#q-what-is-xctestexpectation-and-when-do-you-need-it)
- [What is test coverage and how do you measure it?](./testing/testing-fundamentals.md#q-what-is-test-coverage-and-how-do-you-measure-it)
- [How do you test a ViewModel?](./testing/testing-fundamentals.md#q-how-do-you-test-a-viewmodel)
- [What is snapshot testing?](./testing/testing-fundamentals.md#q-what-is-snapshot-testing)
- [How do you use dependency injection to make code testable?](./testing/testing-fundamentals.md#q-how-do-you-use-dependency-injection-to-make-code-testable)
- [What is `XCTAssert` and what are the main assertion types?](./testing/testing-fundamentals.md#q-what-is-xctassert-and-what-are-the-main-assertion-types)
- [How do you test network code without hitting a real server?](./testing/testing-fundamentals.md#q-how-do-you-test-network-code-without-hitting-a-real-server)

---

## 📐 UIKit
> [`uikit/uikit-fundamentals.md`](./uikit/uikit-fundamentals.md)

- [What is the `UIViewController` lifecycle?](./uikit/uikit-fundamentals.md#q-what-is-the-uiviewcontroller-lifecycle)
- [What is the difference between `frame` and `bounds`?](./uikit/uikit-fundamentals.md#q-what-is-the-difference-between-frame-and-bounds)
- [How does Auto Layout work and what is constraint priority?](./uikit/uikit-fundamentals.md#q-how-does-auto-layout-work-and-what-is-constraint-priority)
- [What is `UITableView` reuse and why does it matter?](./uikit/uikit-fundamentals.md#q-what-is-uitableview-reuse-and-why-does-it-matter)
- [What is the `UIResponder` and the responder chain?](./uikit/uikit-fundamentals.md#q-what-is-the-uiresponder-and-the-responder-chain)
- [How does `layoutSubviews` work and when is it called?](./uikit/uikit-fundamentals.md#q-how-does-layoutsubviews-work-and-when-is-it-called)
- [What is `intrinsicContentSize`?](./uikit/uikit-fundamentals.md#q-what-is-intrinsiccontentsize)
- [What is `CALayer` and how does it relate to `UIView`?](./uikit/uikit-fundamentals.md#q-what-is-calayer-and-how-does-it-relate-to-uiview)
- [How do you handle keyboard appearance and dismissal?](./uikit/uikit-fundamentals.md#q-how-do-you-handle-keyboard-appearance-and-dismissal)
- [What is `UIStackView` and when should you use it?](./uikit/uikit-fundamentals.md#q-what-is-uistackview-and-when-should-you-use-it)

---

## 🛠 Xcode & Tools
> [`xcode-tools/xcode-fundamentals.md`](./xcode-tools/xcode-fundamentals.md) · [`xcode-tools/fastlane-firebase-distribution.md`](./xcode-tools/fastlane-firebase-distribution.md)

- [What is Swift Package Manager (SPM)?](./xcode-tools/xcode-fundamentals.md#q-what-is-swift-package-manager-spm)
- [What is the difference between `Debug` and `Release` build configurations?](./xcode-tools/xcode-fundamentals.md#q-what-is-the-difference-between-debug-and-release-build-configurations)
- [What is a scheme vs a target vs a project?](./xcode-tools/xcode-fundamentals.md#q-what-is-a-scheme-vs-a-target-vs-a-project)
- [How do you use breakpoints effectively in Xcode?](./xcode-tools/xcode-fundamentals.md#q-how-do-you-use-breakpoints-effectively-in-xcode)
- [What is `LLDB` and what are useful commands?](./xcode-tools/xcode-fundamentals.md#q-what-is-lldb-and-what-are-useful-commands)
- [What is a memory leak and how do you find one with Instruments?](./xcode-tools/xcode-fundamentals.md#q-what-is-a-memory-leak-and-how-do-you-find-one-with-instruments)
- [What is the Address Sanitizer?](./xcode-tools/xcode-fundamentals.md#q-what-is-the-address-sanitizer)
- [What is `OSLog` and how is it better than `print`?](./xcode-tools/xcode-fundamentals.md#q-what-is-oslog-and-how-is-it-better-than-print)
- [What is `xcconfig` and when would you use it?](./xcode-tools/xcode-fundamentals.md#q-what-is-xcconfig-and-when-would-you-use-it)
- [How do you set up CI/CD for an iOS project?](./xcode-tools/xcode-fundamentals.md#q-how-do-you-set-up-cicd-for-an-ios-project)
- [How do you set up CI/CD for an iOS project?](./xcode-tools/xcode-fundamentals.md#q-how-do-you-set-up-cicd-for-an-ios-project) → [Full setup guide](./xcode-tools/iOS_Fastlane_Firebase_Setup_Guide.md)

---

## 🎯 Interview Prep
> [`interview-prep/common-questions.md`](./iOS_Fastlane_Firebase_Setup_Guide.md)

- [Explain the iOS app lifecycle](./interview-prep/common-questions.md#q-explain-the-ios-app-lifecycle)
- [What is a retain cycle and how do you prevent it?](./interview-prep/common-questions.md#q-what-is-retain-cycle-and-how-do-you-prevent-it)
- [What is the difference between synchronous and asynchronous execution?](./interview-prep/common-questions.md#q-what-is-the-difference-between-synchronous-and-asynchronous-execution)
- [What tools do you use to debug performance issues in iOS?](./interview-prep/common-questions.md#q-what-tools-do-you-use-to-debug-performance-issues-in-ios)

---

## ✍️ How to Add a New Question

1. Open the relevant `.md` file (or create a new one in the right folder)
2. Add your Q&A:

```markdown
## Q: Your question here?

**Answer:**
Your explanation here.

**Code Example:**
​```swift
// Code here
​```

**Tags:** `#topic` `#subtopic`
```

3. Add a link to this README under the right category:
```markdown
- [Your question](./folder/file.md#q-your-question-slug)
```

---

*Last updated: 2026*
