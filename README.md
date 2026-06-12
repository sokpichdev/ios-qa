# iOS Developer Q&A Knowledge Base

A personal reference of questions, answers, and code snippets for iOS development. Built with [Astro](https://astro.build) and deployed to GitHub Pages.

---

## Categories

- [Swift](#swift)
- [SwiftUI](#swiftui)
- [Concurrency](#concurrency)
- [Architecture](#architecture)
- [OOP](#oop)
- [Networking](#networking)
- [Testing](#testing)
- [UIKit](#uikit)
- [Xcode & Tools](#xcode--tools)
- [Interview Prep](#interview-prep)

---

## Swift

- [What is the difference between `strong`, `weak`, and `unowned` references?](./src/content/questions/swift/memory-and-types.md#q-what-is-the-difference-between-strong-weak-and-unowned-references)
- [What is a protocol extension and why is it powerful?](./src/content/questions/swift/memory-and-types.md#q-what-is-a-protocol-extension-and-why-is-it-powerful)
- [What is `@escaping` in a closure?](./src/content/questions/swift/memory-and-types.md#q-what-is-escaping-in-a-closure)
- [What is the difference between `struct` and `class` in Swift?](./src/content/questions/swift/memory-and-types.md#q-what-is-the-difference-between-struct-and-class-in-swift)
- [What is the difference between `[Obj]`, `[Obj?]`, `[Obj]?`, and `[Obj?]?` in Swift?](./src/content/questions/swift/swift-array-optionals.md#q-what-is-the-difference-between-obj-obj-obj-and-obj-in-swift)
- [What is `Optional` and how does it work?](./src/content/questions/swift/swift-fundamentals.md#q-what-is-optional-and-how-does-it-work)
- [What is `guard let` vs `if let`?](./src/content/questions/swift/swift-fundamentals.md#q-what-is-guard-let-vs-if-let)
- [What is `Codable` and how does it work?](./src/content/questions/swift/swift-fundamentals.md#q-what-is-codable-and-how-does-it-work)
- [What is the difference between `map`, `flatMap`, and `compactMap`?](./src/content/questions/swift/swift-fundamentals.md#q-what-is-the-difference-between-map-flatmap-and-compactmap)
- [What is `lazy` property and when is it useful?](./src/content/questions/swift/swift-fundamentals.md#q-what-is-lazy-property-and-when-is-it-useful)
- [What is `Result` type and when should you use it?](./src/content/questions/swift/swift-fundamentals.md#q-what-is-result-type-and-when-should-you-use-it)
- [What is `Hashable`, `Equatable`, and `Comparable`?](./src/content/questions/swift/swift-fundamentals.md#q-what-is-hashable-equatable-and-comparable)
- [What is `@propertyWrapper` and how do you create one?](./src/content/questions/swift/swift-fundamentals.md#q-what-is-propertywrapper-and-how-do-you-create-one)
- [What is the `some` keyword (opaque types)?](./src/content/questions/swift/swift-fundamentals.md#q-what-is-some-keyword-opaque-types)
- [What is copy-on-write (COW) and which types use it?](./src/content/questions/swift/swift-fundamentals.md#q-what-is-copy-on-write-cow-and-which-types-use-it)

---

## SwiftUI

- [What is the difference between `@State`, `@Binding`, `@ObservedObject`, and `@StateObject`?](./src/content/questions/swiftui/state-management.md#q-what-is-the-difference-between-state-binding-observedobject-and-stateobject)
- [What is `ViewBuilder` and how does it work?](./src/content/questions/swiftui/state-management.md#q-what-is-viewbuilder-and-how-does-it-work)
- [When should you use `task {}` vs `onAppear {}` in SwiftUI?](./src/content/questions/swiftui/state-management.md#q-when-should-you-use-task--vs-onappear--in-swiftui)
- [What is the difference between `@Environment` and `@EnvironmentObject`?](./src/content/questions/swiftui/swiftui-fundamentals.md#q-what-is-the-difference-between-environment-and-environmentobject)
- [How does SwiftUI's diffing algorithm work?](./src/content/questions/swiftui/swiftui-fundamentals.md#q-how-does-swiftuis-diffing-algorithm-work)
- [What is `GeometryReader` and what are its pitfalls?](./src/content/questions/swiftui/swiftui-fundamentals.md#q-what-is-geometryreader-and-what-are-its-pitfalls)
- [How do you animate transitions between views in SwiftUI?](./src/content/questions/swiftui/swiftui-fundamentals.md#q-how-do-you-animate-transitions-between-views-in-swiftui)
- [What is `LazyVStack` vs `VStack` — when does it matter?](./src/content/questions/swiftui/swiftui-fundamentals.md#q-what-is-lazyvstack-vs-vstack--when-does-it-matter)
- [How do you handle navigation in SwiftUI using `NavigationStack`?](./src/content/questions/swiftui/swiftui-fundamentals.md#q-how-do-you-handle-navigation-in-swiftui-using-navigationstack)
- [What is `@AppStorage` and when would you use it?](./src/content/questions/swiftui/swiftui-fundamentals.md#q-what-is-appstorage-and-when-would-you-use-it)
- [How do you create a custom `ViewModifier`?](./src/content/questions/swiftui/swiftui-fundamentals.md#q-how-do-you-create-a-custom-viewmodifier)
- [How do you pass data between a sheet and the parent view?](./src/content/questions/swiftui/swiftui-fundamentals.md#q-how-do-you-pass-data-between-a-sheet-and-the-parent-view)
- [What is the `Identifiable` protocol and why does SwiftUI need it?](./src/content/questions/swiftui/swiftui-fundamentals.md#q-what-is-the-identifiable-protocol-and-why-does-swiftui-need-it)
- [When should you use `.onTapGesture` vs `.simultaneousGesture` in SwiftUI?](./src/content/questions/swiftui/ontapgesture-vs-simultaneousgesture.md#q-when-should-you-use-ontapgesture-vs-onsimultaneousgesture-in-swiftui)
- [What is the difference between `FlowLayout` and `WrapHStack` for wrapping tag-style views?](./src/content/questions/swiftui/FlowLayout-vs-WrapHStack.md#q-what-is-the-difference-between-flowlayout-and-wraphstack-for-wrapping-tag-style-views-in-swiftui)
- [Why does `FlowLayout` break inside a `ScrollView`?](./src/content/questions/swiftui/FlowLayout-vs-WrapHStack.md#q-why-does-flowlayout-using-the-layout-protocol-break-inside-a-scrollview)
- [How do you implement a wrapping flow layout using the SwiftUI `Layout` protocol?](./src/content/questions/swiftui/FlowLayout-vs-WrapHStack.md#q-how-do-you-implement-a-wrapping-flow-layout-using-the-swiftui-layout-protocol)
- [How do you implement `WrapHStack` — a flow layout that reliably wraps inside a `ScrollView`?](./src/content/questions/swiftui/FlowLayout-vs-WrapHStack.md#q-how-do-you-implement-wraphstack--a-flow-layout-that-reliably-wraps-inside-a-scrollview)
- [When should you use a Loader, Toast, or Alert for user feedback in a SwiftUI app?](./src/content/questions/swiftui/how-to-use-ui-feedback.md#q-when-should-you-use-a-loader-toast-or-alert-for-user-feedback-in-a-swiftui-app)

---

## Concurrency

- [What is the difference between `async/await` and GCD?](./src/content/questions/concurrency/async-await-and-actors.md#q-what-is-the-difference-between-asyncawait-and-gcd-grand-central-dispatch)
- [What is an `Actor` and when should you use one?](./src/content/questions/concurrency/async-await-and-actors.md#q-what-is-an-actor-and-when-should-you-use-one)
- [What is `MainActor` and when do you use it?](./src/content/questions/concurrency/async-await-and-actors.md#q-what-is-mainactor-and-when-do-you-use-it)
- [What is a `Task` and how is it different from a `Thread`?](./src/content/questions/concurrency/concurrency-fundamentals.md#q-what-is-a-task-and-how-is-it-different-from-a-thread)
- [What is `TaskGroup` and when would you use it?](./src/content/questions/concurrency/concurrency-fundamentals.md#q-what-is-taskgroup-and-when-would-you-use-it)
- [What is `async let` and when is it useful?](./src/content/questions/concurrency/concurrency-fundamentals.md#q-what-is-async-let-and-when-is-it-useful)
- [What is `withCheckedContinuation` and why is it needed?](./src/content/questions/concurrency/concurrency-fundamentals.md#q-what-is-withcheckedcontinuation-and-why-is-it-needed)
- [How do you cancel a running `Task`?](./src/content/questions/concurrency/concurrency-fundamentals.md#q-how-do-you-cancel-a-running-task)
- [What is `Sendable` and why does it matter?](./src/content/questions/concurrency/concurrency-fundamentals.md#q-what-is-sendable-and-why-does-it-matter)
- [What is the difference between a `serial` and `concurrent` queue in GCD?](./src/content/questions/concurrency/concurrency-fundamentals.md#q-what-is-the-difference-between-a-serial-and-concurrent-queue-in-gcd)
- [What is a race condition and how do you prevent it?](./src/content/questions/concurrency/concurrency-fundamentals.md#q-what-is-a-race-condition-and-how-do-you-prevent-it)
- [What is `OperationQueue` and how is it different from GCD?](./src/content/questions/concurrency/concurrency-fundamentals.md#q-what-is-operationqueue-and-how-is-it-different-from-gcd)
- [What is `AsyncStream` and what problem does it solve?](./src/content/questions/concurrency/concurrency-fundamentals.md#q-what-is-asyncstream-and-what-problem-does-it-solve)

---

## Architecture

- [What is MVVM and how does it work in iOS?](./src/content/questions/architecture/mvvm-and-coordinator.md#q-what-is-mvvm-and-how-does-it-work-in-ios)
- [What is the Coordinator pattern and why use it?](./src/content/questions/architecture/mvvm-and-coordinator.md#q-what-is-the-coordinator-pattern-and-why-use-it)
- [What is the difference between MVC, MVVM, and MVP?](./src/content/questions/architecture/architecture-fundamentals.md#q-what-is-the-difference-between-mvc-mvvm-and-mvp)
- [What is Dependency Injection and why is it important?](./src/content/questions/architecture/architecture-fundamentals.md#q-what-is-dependency-injection-and-why-is-it-important)
- [What is the Repository pattern?](./src/content/questions/architecture/architecture-fundamentals.md#q-what-is-the-repository-pattern)
- [What is the Singleton pattern and what are its downsides?](./src/content/questions/architecture/architecture-fundamentals.md#q-what-is-the-singleton-pattern-and-what-are-its-downsides)
- [What is the difference between composition and inheritance?](./src/content/questions/architecture/architecture-fundamentals.md#q-what-is-the-difference-between-composition-and-inheritance)
- [What is SOLID and how does it apply to Swift?](./src/content/questions/architecture/architecture-fundamentals.md#q-what-is-solid-and-how-does-it-apply-to-swift)
- [What is the Observer pattern and how is it used in iOS?](./src/content/questions/architecture/architecture-fundamentals.md#q-what-is-the-observer-pattern-and-how-is-it-used-in-ios)
- [What is the Factory pattern?](./src/content/questions/architecture/architecture-fundamentals.md#q-what-is-the-factory-pattern)
- [What is Clean Architecture in iOS?](./src/content/questions/architecture/architecture-fundamentals.md#q-what-is-clean-architecture-in-ios)
- [What is TCA (The Composable Architecture)?](./src/content/questions/architecture/architecture-fundamentals.md#q-what-is-tca-the-composable-architecture)

---

## OOP

- [What are the four pillars of Object-Oriented Programming?](./src/content/questions/oop/oop-fundamentals.md#q-what-are-the-four-pillars-of-object-oriented-programming)
- [What is encapsulation, and how does Swift's access control support it?](./src/content/questions/oop/oop-fundamentals.md#q-what-is-encapsulation-and-how-does-swifts-access-control-support-it)
- [What's the difference between abstraction and encapsulation?](./src/content/questions/oop/oop-fundamentals.md#q-whats-the-difference-between-abstraction-and-encapsulation)
- [What is polymorphism, and what forms does it take in Swift?](./src/content/questions/oop/oop-fundamentals.md#q-what-is-polymorphism-and-what-forms-does-it-take-in-swift)
- [How does Protocol-Oriented Programming (POP) differ from classic class-based OOP?](./src/content/questions/oop/oop-fundamentals.md#q-how-does-protocol-oriented-programming-pop-differ-from-classic-class-based-oop)
- [How do value types and reference types change the way you think about OOP in Swift?](./src/content/questions/oop/oop-fundamentals.md#q-how-do-value-types-and-reference-types-change-the-way-you-think-about-oop-in-swift)
- [What are the SOLID principles, and how do they apply in Swift?](./src/content/questions/oop/oop-fundamentals.md#q-what-are-the-solid-principles-and-how-do-they-apply-in-swift)
- [When should you choose composition over inheritance in Swift?](./src/content/questions/oop/oop-fundamentals.md#q-when-should-you-choose-composition-over-inheritance-in-swift)

---

## Networking

- [How does `URLSession` work?](./src/content/questions/networking/networking-fundamentals.md#q-how-does-urlsession-work)
- [What is the difference between `dataTask`, `downloadTask`, and `uploadTask`?](./src/content/questions/networking/networking-fundamentals.md#q-what-is-the-difference-between-datatask-downloadtask-and-uploadtask)
- [How do you handle API errors gracefully?](./src/content/questions/networking/networking-fundamentals.md#q-how-do-you-handle-api-errors-gracefully)
- [How do you implement retry logic for failed network calls?](./src/content/questions/networking/networking-fundamentals.md#q-how-do-you-implement-retry-logic-for-failed-network-calls)
- [How do you handle authentication tokens and refresh them?](./src/content/questions/networking/networking-fundamentals.md#q-how-do-you-handle-authentication-tokens-and-refresh-them)
- [How do you mock network requests for testing?](./src/content/questions/networking/networking-fundamentals.md#q-how-do-you-mock-network-requests-for-testing)
- [What is `URLCache` and how does caching work in iOS?](./src/content/questions/networking/networking-fundamentals.md#q-what-is-urlcache-and-how-does-caching-work-in-ios)
- [What is `multipart/form-data` and how do you send it in iOS?](./src/content/questions/networking/networking-fundamentals.md#q-what-is-multipartform-data-and-how-do-you-send-it-in-ios)
- [How do you handle SSL pinning in iOS?](./src/content/questions/networking/networking-fundamentals.md#q-how-do-you-handle-ssl-pinning-in-ios)
- [What is Combine and how does it relate to networking?](./src/content/questions/networking/networking-fundamentals.md#q-what-is-combine-and-how-does-it-relate-to-networking)

---

## Testing

- [What is the difference between unit tests and UI tests?](./src/content/questions/testing/testing-fundamentals.md#q-what-is-the-difference-between-unit-tests-and-ui-tests)
- [What is a mock vs a stub vs a spy?](./src/content/questions/testing/testing-fundamentals.md#q-what-is-a-mock-vs-a-stub-vs-a-spy)
- [How do you test async code in XCTest?](./src/content/questions/testing/testing-fundamentals.md#q-how-do-you-test-async-code-in-xctest)
- [What is `XCTestExpectation` and when do you need it?](./src/content/questions/testing/testing-fundamentals.md#q-what-is-xctestexpectation-and-when-do-you-need-it)
- [What is test coverage and how do you measure it?](./src/content/questions/testing/testing-fundamentals.md#q-what-is-test-coverage-and-how-do-you-measure-it)
- [How do you test a ViewModel?](./src/content/questions/testing/testing-fundamentals.md#q-how-do-you-test-a-viewmodel)
- [What is snapshot testing?](./src/content/questions/testing/testing-fundamentals.md#q-what-is-snapshot-testing)
- [How do you use dependency injection to make code testable?](./src/content/questions/testing/testing-fundamentals.md#q-how-do-you-use-dependency-injection-to-make-code-testable)
- [What is `XCTAssert` and what are the main assertion types?](./src/content/questions/testing/testing-fundamentals.md#q-what-is-xctassert-and-what-are-the-main-assertion-types)
- [How do you test network code without hitting a real server?](./src/content/questions/testing/testing-fundamentals.md#q-how-do-you-test-network-code-without-hitting-a-real-server)

---

## UIKit

- [What is the `UIViewController` lifecycle?](./src/content/questions/uikit/uikit-fundamentals.md#q-what-is-the-uiviewcontroller-lifecycle)
- [What is the difference between `frame` and `bounds`?](./src/content/questions/uikit/uikit-fundamentals.md#q-what-is-the-difference-between-frame-and-bounds)
- [How does Auto Layout work and what is constraint priority?](./src/content/questions/uikit/uikit-fundamentals.md#q-how-does-auto-layout-work-and-what-is-constraint-priority)
- [What is `UITableView` reuse and why does it matter?](./src/content/questions/uikit/uikit-fundamentals.md#q-what-is-uitableview-reuse-and-why-does-it-matter)
- [What is the `UIResponder` and the responder chain?](./src/content/questions/uikit/uikit-fundamentals.md#q-what-is-the-uiresponder-and-the-responder-chain)
- [How does `layoutSubviews` work and when is it called?](./src/content/questions/uikit/uikit-fundamentals.md#q-how-does-layoutsubviews-work-and-when-is-it-called)
- [What is `intrinsicContentSize`?](./src/content/questions/uikit/uikit-fundamentals.md#q-what-is-intrinsiccontentsize)
- [What is `CALayer` and how does it relate to `UIView`?](./src/content/questions/uikit/uikit-fundamentals.md#q-what-is-calayer-and-how-does-it-relate-to-uiview)
- [How do you handle keyboard appearance and dismissal?](./src/content/questions/uikit/uikit-fundamentals.md#q-how-do-you-handle-keyboard-appearance-and-dismissal)
- [What is `UIStackView` and when should you use it?](./src/content/questions/uikit/uikit-fundamentals.md#q-what-is-uistackview-and-when-should-you-use-it)

---

## Xcode & Tools

- [What is Swift Package Manager (SPM)?](./src/content/questions/xcode-tools/xcode-fundamentals.md#q-what-is-swift-package-manager-spm)
- [What is the difference between `Debug` and `Release` build configurations?](./src/content/questions/xcode-tools/xcode-fundamentals.md#q-what-is-the-difference-between-debug-and-release-build-configurations)
- [What is a scheme vs a target vs a project?](./src/content/questions/xcode-tools/xcode-fundamentals.md#q-what-is-a-scheme-vs-a-target-vs-a-project)
- [How do you use breakpoints effectively in Xcode?](./src/content/questions/xcode-tools/xcode-fundamentals.md#q-how-do-you-use-breakpoints-effectively-in-xcode)
- [What is `LLDB` and what are useful commands?](./src/content/questions/xcode-tools/xcode-fundamentals.md#q-what-is-lldb-and-what-are-useful-commands)
- [What is a memory leak and how do you find one with Instruments?](./src/content/questions/xcode-tools/xcode-fundamentals.md#q-what-is-a-memory-leak-and-how-do-you-find-one-with-instruments)
- [What is the Address Sanitizer?](./src/content/questions/xcode-tools/xcode-fundamentals.md#q-what-is-the-address-sanitizer)
- [What is `OSLog` and how is it better than `print`?](./src/content/questions/xcode-tools/xcode-fundamentals.md#q-what-is-oslog-and-how-is-it-better-than-print)
- [What is `xcconfig` and when would you use it?](./src/content/questions/xcode-tools/xcode-fundamentals.md#q-what-is-xcconfig-and-when-would-you-use-it)
- [How do you set up CI/CD for an iOS project?](./src/content/questions/xcode-tools/xcode-fundamentals.md#q-how-do-you-set-up-cicd-for-an-ios-project)
- **Guide:** [How do you set up Fastlane with Firebase App Distribution?](./src/content/questions/xcode-tools/fastlane-firebase-distribution-guide.md#q-how-do-you-set-up-fastlane-with-firebase-app-distribution-to-automate-ios-build-delivery-to-testers)
- **Guide:** [How do you implement push notifications end-to-end using Firebase FCM?](./src/content/questions/xcode-tools/firebase-push-notifications-guide.md#q-how-do-you-implement-push-notifications-end-to-end-using-firebase-cloud-messaging-fcm-with-swift-package-manager)
- **Guide:** [iOS Fastlane + Firebase Full Setup](./src/content/questions/xcode-tools/iOS_Fastlane_Firebase_Setup_Guide.md)
- **Guide:** [Multi-Environment SwiftUI + Firebase Setup](./src/content/questions/xcode-tools/iOS_MultiEnv_SwiftUI_Firebase_Setup.md)
- **Guide:** [How do you add Protobuf to an iOS project?](./src/content/questions/xcode-tools/add-protobuf.md)

---

## Interview Prep

- [Explain the iOS app lifecycle](./src/content/questions/interview-prep/common-questions.md#q-explain-the-ios-app-lifecycle)
- [What is a retain cycle and how do you prevent it?](./src/content/questions/interview-prep/common-questions.md#q-what-is-retain-cycle-and-how-do-you-prevent-it)
- [What is the difference between synchronous and asynchronous execution?](./src/content/questions/interview-prep/common-questions.md#q-what-is-the-difference-between-synchronous-and-asynchronous-execution)
- [What tools do you use to debug performance issues in iOS?](./src/content/questions/interview-prep/common-questions.md#q-what-tools-do-you-use-to-debug-performance-issues-in-ios)
- [What is the 7-step framework for cracking any coding interview?](./src/content/questions/interview-prep/coding-interview-framework.md#q-what-is-the-7-step-framework-for-cracking-any-coding-interview)

---

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
