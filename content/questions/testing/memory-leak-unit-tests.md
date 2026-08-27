# Testing — Memory Leak Unit Tests

---

## Q: How can you write unit tests to automatically detect memory leaks in Swift?

**Answer:**
You can detect memory leaks automatically in unit tests by attaching an `addTeardownBlock` to `XCTestCase` with a `weak` reference to the system under test and asserting that the instance deallocates to `nil`.

Because `XCTestCase.addTeardownBlock` executes after each test method completes and local scopes have exited, any properly managed instance will have a retain count of zero and become `nil`. If a retain cycle exists (e.g. inside a ViewModel, Coordinator, or View Controller), the `weak` pointer remains non-nil, triggering an immediate test failure.

**Reusable Test Helper:**
```swift
import XCTest

extension XCTestCase {
    /// Tracks an object instance and asserts that it deallocates after the test finishes.
    func trackForMemoryLeaks(
        _ instance: AnyObject,
        file: StaticString = #filePath,
        line: UInt = #line
    ) {
        addTeardownBlock { [weak instance] in
            XCTAssertNil(
                instance,
                "Instance should have been deallocated. Potential memory leak detected.",
                file: file,
                line: line
            )
        }
    }
}
```

**Unit Test Example:**
```swift
final class ProfileViewModelTests: XCTestCase {
    
    func test_viewModel_doesNotLeakOnEventCallback() {
        var sut: ProfileViewModel? = ProfileViewModel()
        
        // Track sut for leaks before exercising behaviour
        trackForMemoryLeaks(sut!)
        
        // Trigger bindings and callbacks
        sut?.setupBindings()
        sut?.simulateUserAction()
        
        // Nil out reference to simulate end of screen lifecycle
        sut = nil
        // addTeardownBlock will run and assert weak reference is nil!
    }
}
```

**Integration into CI/CD Pipelines:**
- Prevents memory leak regressions before code merges into `main`
- Runs in milliseconds as standard unit tests without requiring Instruments or UI automation
- Can be applied to ViewControllers, ViewModels, Presenters, Coordinators, and Services

**Tags:** `#testing` `#unit-tests` `#memory-leak` `#xctest` `#ci-cd`
**Difficulty:** Intermediate
**References:**
- [addTeardownBlock — Apple Developer Documentation](https://developer.apple.com/documentation/xctest/xctestcase/addteardownblock(_:))
- [Unit testing memory leaks in Swift — Swift by Sundell](https://swiftbysundell.com/articles/unit-testing-memory-leaks-in-swift/)
- [Testing Memory Leaks in Architecture — Point-Free](https://www.pointfree.co/)
