# Swift — ARC & Memory Management

---

## Q: What is Automatic Reference Counting (ARC) and how does Swift manage memory internally?

**Answer:**
ARC is Swift's compile-time memory management system that automatically inserts retain and release calls to allocate and free class instances on the heap.

Unlike garbage collection runtimes (such as Java or Go) which periodically pause execution to scan memory, ARC operates with zero runtime pause overhead by tracking reference counts deterministically:

- **Reference Count Tracking**: Every class instance maintains an internal reference count. When a strong reference is created, ARC calls `swift_retain` (incrementing count); when a reference goes out of scope, ARC calls `swift_release` (decrementing count). When the count hits zero, the instance is immediately deallocated and its `deinit` is executed.
- **Side Tables**: Swift optimizes memory by storing inline reference counts in the object's 64-bit header. When an object receives a `weak` reference or its reference counts overflow, Swift allocates an external **Side Table**. The side table stores strong, unowned, and weak reference counts independently, enabling zeroing weak references without bloating instances that never use weak references.
- **Value Types vs Reference Types**: Value types (`struct`, `enum`, primitives) reside on the call stack or inline within containing types, requiring no reference counting. Only reference types (`class`, closures, actors) are managed by ARC on the heap.

**Code Example:**
```swift
class SessionManager {
    let id: String
    
    init(id: String) {
        self.id = id
        print("Session \(id) initialized")
    }
    
    deinit {
        print("Session \(id) deallocated immediately when reference count reached 0")
    }
}

func startSession() {
    var ref1: SessionManager? = SessionManager(id: "AUTH_01") // retain count = 1
    var ref2 = ref1                                           // retain count = 2
    
    ref1 = nil // retain count = 1
    ref2 = nil // retain count = 0 -> triggers deinit immediately
}
```

**Key Points:**
- ARC operates at compile time by inserting retain/release instructions into the Swift Intermediate Language (SIL)
- Stack allocation for value types is instant and requires no ARC overhead
- Side tables allow zeroing weak references without memory overhead for simple objects

**Tags:** `#swift` `#arc` `#memory` `#internals` `#performance`
**Difficulty:** Advanced
**References:**
- [Automatic Reference Counting — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/automaticreferencecounting/)
- [Memory Management in Swift — Swift by Sundell](https://swiftbysundell.com/articles/memory-management-in-swift/)
- [Swift Runtime Memory Management — Swift.org](https://www.swift.org/documentation/)

---

## Q: What are the most common causes of memory leaks in iOS applications?

**Answer:**
The most common causes of memory leaks in iOS are strong reference cycles between classes, closure capture retention, un-invalidated Timers, retained Combine subscriptions, and unmanaged Core Foundation allocations.

A memory leak occurs when heap-allocated memory is no longer needed by the application but cannot be freed by ARC because its reference count remains greater than zero.

1. **Retain Cycles in Class Hierarchies**: Two objects holding strong references to each other (e.g. parent coordinator holding child view model while child holds strong parent reference).
2. **Closure Self-Capture**: Stored closures or async callbacks capturing `self` strongly without `[weak self]`.
3. **Non-Weak Delegates**: Delegate protocols declared without `: AnyObject` and delegate properties declared without `weak`.
4. **Target-Action Timers & CADisplayLink**: `Timer.scheduledTimer` holding a strong reference to its target object in the `RunLoop`.
5. **Combine Subscriptions**: Storing an `AnyCancellable` set on `self` while the `.sink` closure captures `self` strongly.
6. **NotificationCenter Observers**: Block-based observers added with `addObserver(forName:...)` whose token is retained by `self` while the block strongly retains `self`.
7. **Singletons and Global Managers**: Registering closures or listeners to singleton instances without weak capture.
8. **Core Foundation / C-APIs**: Failing to balance `CFRetain` / `passRetained` with `CFRelease` / `takeRetainedValue`.

**Code Example:**
```swift
// Common Leak Scenario 1: Retained Delegate
protocol NetworkServiceDelegate: AnyObject { // Must be AnyObject!
    func dataDidUpdate()
}

class NetworkService {
    weak var delegate: NetworkServiceDelegate? // weak avoids retain cycle
}

// Common Leak Scenario 2: Stored Closure Retain Cycle
class ProfileViewModel {
    var onAvatarLoaded: (() -> Void)?
    var avatarImage: String = "default.png"
    
    func setupBindings() {
        // ❌ Leaks if self holds onAvatarLoaded and onAvatarLoaded holds self
        // onAvatarLoaded = { self.avatarImage = "new.png" }
        
        // ✅ Safe with [weak self]
        onAvatarLoaded = { [weak self] in
            self?.avatarImage = "new.png"
        }
    }
}
```

**Key Points:**
- A single leaked ViewController retains its entire subview hierarchy, image buffers, and child view models
- Memory leaks lead to memory pressure warnings, background termination, and Jetsam OOM (Out Of Memory) crashes
- Always check object ownership: parents own children strongly; children reference parents weakly

**Tags:** `#swift` `#memory-leak` `#arc` `#debugging` `#interview`
**Difficulty:** Intermediate
**References:**
- [Gathering information about memory use — Apple Developer](https://developer.apple.com/documentation/xcode/gathering-information-about-memory-use)
- [Capturing objects in Swift closures — Swift by Sundell](https://swiftbysundell.com/articles/capturing-objects-in-swift-closures/)
- [Debugging Memory Issues — objc.io](https://www.objc.io/issues/19-debugging/debugging-memory-issues/)

---

## Q: How do closure capture lists prevent retain cycles and memory leaks?

**Answer:**
Closure capture lists define explicit ownership rules for references captured inside a closure's body, breaking retain cycles by capturing instances as `weak` or `unowned`.

By default, closures in Swift capture any referenced object with a `strong` reference. If the object also holds a reference to the closure (directly or indirectly through a chain of objects), a strong reference cycle is formed.

- **`[weak self]`**: Creates a zeroing weak reference. The captured reference becomes an `Optional` (`Self?`). When the referenced object deallocates, the pointer is automatically set to `nil`.
- **`[unowned self]`**: Creates a non-optional reference that assumes the referenced object will never be `nil` while the closure executes. If called after the object is deallocated, it triggers a runtime crash (trap).
- **Swift 5.3+ `guard let self`**: Allows safely unwrapping `[weak self]` with `guard let self else { return }`, creating a temporary local strong reference for the duration of closure execution.

**Code Example:**
```swift
class OrderService {
    var orderStatus: String = "Pending"
    var onComplete: (() -> Void)?
    
    func placeOrder() {
        // [weak self] breaks the retain cycle between self and onComplete
        onComplete = { [weak self] in
            guard let self else { return }
            self.orderStatus = "Confirmed"
            self.notifyAnalytics()
        }
    }
    
    private func notifyAnalytics() {
        print("Order confirmed: \(orderStatus)")
    }
}
```

**When to choose `weak` vs `unowned`:**
- Use **`[weak self]`** whenever the closure can outlive the referenced object (async network requests, event listeners, dispatch queues).
- Use **`[unowned self]`** ONLY when the closure's lifecycle is strictly bounded by the owner's lifecycle and will never execute after the owner deallocates (e.g., synchronous animation blocks or strictly managed parent-child pairs).

**Tags:** `#swift` `#closures` `#arc` `#memory` `#interview`
**Difficulty:** Intermediate
**References:**
- [Closures: Defining a Capture List — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/closures/)
- [Capturing objects in Swift closures — Swift by Sundell](https://swiftbysundell.com/articles/capturing-objects-in-swift-closures/)
- [Swift Closures and Memory Management — Point-Free](https://www.pointfree.co/)

---

## Q: Why must delegate protocols inherit from `AnyObject` to prevent memory leaks?

**Answer:**
Delegate protocols must inherit from `AnyObject` to restrict protocol conformance to classes, allowing delegate properties to be marked with the `weak` keyword.

In Swift, protocols can be adopted by value types (`struct`, `enum`) or reference types (`class`). Because `weak` can only be applied to reference types managed on the heap, the Swift compiler emits a compilation error if you attempt to declare `weak var delegate: SomeProtocol?` on a protocol that does not conform to `AnyObject`.

If developers omit `AnyObject` and work around compiler errors by declaring `var delegate: SomeProtocol?` strongly, a bidirectional retain cycle occurs when a child view/controller references its parent controller.

**Code Example:**
```swift
// ❌ Error or strong retain cycle: protocol not constrained to classes
// protocol FeedCellDelegate { func didTapLike() }

// ✅ Constrain protocol to class instances with AnyObject
protocol FeedCellDelegate: AnyObject {
    func didTapLike(on cell: FeedCell)
}

class FeedCell: UITableViewCell {
    // weak requires AnyObject protocol conformance
    weak var delegate: FeedCellDelegate?
    
    func handleLikeButtonTap() {
        delegate?.didTapLike(on: self)
    }
}

class FeedViewController: UIViewController, FeedCellDelegate {
    func didTapLike(on cell: FeedCell) {
        print("Liked post in cell")
    }
}
```

**Key Points:**
- Protocol inheritance: `protocol MyDelegate: AnyObject` replaces the legacy Objective-C `protocol MyDelegate: class` syntax
- Always mark delegate properties as `weak var delegate: MyDelegate?` to ensure child views do not retain parent controllers

**Tags:** `#swift` `#delegation` `#protocols` `#arc` `#memory`
**Difficulty:** Beginner
**References:**
- [Protocols: Class-Only Protocols — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols/)
- [Delegation in Swift — Swift by Sundell](https://swiftbysundell.com/articles/delegation-in-swift/)

---

## Q: How do Timers and CADisplayLink cause memory leaks and how do you resolve them?

**Answer:**
`Timer` and `CADisplayLink` cause memory leaks because the target-action API causes the active `RunLoop` to retain the timer, and the timer retains its target object until explicitly invalidated.

Even if you dismiss a `UIViewController` or release a `ViewModel`, if an active `Timer` is targeting `self`, its `deinit` will never be called because the retain count never reaches zero.

**Resolution Approaches:**
1. **Weak Target Proxy**: Use an intermediate forwarding object that holds a `weak` reference to the real target.
2. **Block-based Timer with `[weak self]`**: Use `Timer.scheduledTimer(withTimeInterval:repeats:block:)` and explicitly call `timer.invalidate()` when done.
3. **Swift Concurrency `Task`**: Replace Timer with a managed `Task` utilizing `Task.sleep` and cancel it on cleanup.

**Code Example:**
```swift
// Approach 1: Weak Proxy Pattern
final class WeakTimerProxy: NSObject {
    private weak var target: AnyObject?
    private let action: (AnyObject) -> Void
    
    init(target: AnyObject, action: @escaping (AnyObject) -> Void) {
        self.target = target
        self.action = action
        super.init()
    }
    
    @objc func timerFired() {
        if let target = target {
            action(target)
        }
    }
}

// Approach 2: Modern Swift Concurrency Task
final class PollingService {
    private var pollingTask: Task<Void, Never>?
    
    func startPolling() {
        pollingTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 5_000_000_000) // 5s
                guard !Task.isCancelled, let self else { break }
                await self.fetchLatestData()
            }
        }
    }
    
    func stopPolling() {
        pollingTask?.cancel()
        pollingTask = nil
    }
    
    deinit {
        pollingTask?.cancel()
    }
    
    private func fetchLatestData() async { /* ... */ }
}
```

**Key Points:**
- Never rely on `deinit` to call `timer.invalidate()` if the timer strongly references `self`, because `deinit` will never trigger
- Invalidate timers in `viewWillDisappear`, `viewDidDisappear`, or lifecycle cleanup hooks

**Tags:** `#swift` `#timer` `#cadisplaylink` `#runloop` `#memory-leak`
**Difficulty:** Intermediate
**References:**
- [Timer — Apple Developer Documentation](https://developer.apple.com/documentation/foundation/timer)
- [CADisplayLink — Apple Developer Documentation](https://developer.apple.com/documentation/quartzcore/cadisplaylink)
- [Memory Management in Swift — Swift by Sundell](https://swiftbysundell.com/articles/memory-management-in-swift/)

---

## Q: How do Combine subscriptions and NotificationCenter observers cause memory leaks?

**Answer:**
Combine subscriptions and NotificationCenter block observers cause leaks when the observation token is stored on `self` while the callback closure captures `self` strongly.

In Combine, storing a subscription in `var cancellables = Set<AnyCancellable>()` on `self` while the pipeline's `.sink` closure references `self` creates a circular reference: `self → cancellables → AnyCancellable → sink closure → self`.

In `NotificationCenter`, `addObserver(forName:object:queue:using:)` returns an opaque observer token. If `self` retains the token and the observer closure strongly captures `self`, neither is ever deallocated unless `removeObserver` is called.

**Code Example:**
```swift
import Combine
import Foundation

class SearchViewModel {
    @Published var query: String = ""
    private var cancellables = Set<AnyCancellable>()
    private var observerToken: NSObjectProtocol?
    
    init() {
        // ✅ Combine: Break cycle using [weak self] in sink
        $query
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .sink { [weak self] searchQuery in
                guard let self else { return }
                self.performSearch(query: searchQuery)
            }
            .store(in: &cancellables)
        
        // ✅ NotificationCenter: Break cycle using [weak self] & cleanup token
        observerToken = NotificationCenter.default.addObserver(
            forName: UIApplication.didEnterBackgroundNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.saveState()
        }
    }
    
    deinit {
        if let token = observerToken {
            NotificationCenter.default.removeObserver(token)
        }
    }
    
    private func performSearch(query: String) {}
    private func saveState() {}
}
```

**Key Points:**
- Modern Swift apps should use Combine or `NotificationCenter.default.notifications(named:)` async sequences with `[weak self]`
- `AnyCancellable` automatically cancels its upstream publisher when deallocated, provided there is no retain cycle preventing its deallocation

**Tags:** `#swift` `#combine` `#notificationcenter` `#memory-leak` `#arc`
**Difficulty:** Intermediate
**References:**
- [AnyCancellable — Apple Developer](https://developer.apple.com/documentation/combine/anycancellable)
- [NotificationCenter — Apple Developer](https://developer.apple.com/documentation/foundation/nsnotificationcenter)
- [Combine and Architecture — Point-Free](https://www.pointfree.co/)

---

## Q: How do Swift Concurrency Tasks interact with ARC and what causes async memory leaks?

**Answer:**
Unstructured `Task { ... }` blocks retain captured objects for the entire duration of the asynchronous operation, which can lead to delayed deallocation or memory leaks if long-running tasks are not cancelled.

When you create an unstructured `Task` or `Task.detached`, the task closure captures referenced instances strongly by default. If the task performs a long network request, an infinite loop, or listens to an `AsyncStream`, the captured object (`self`) remains retained in memory until the task completes.

**Best Practices for Swift Concurrency:**
1. **Cancel Tasks on Lifecycle Teardown**: Store the `Task` reference and call `task.cancel()` in `deinit`, `viewWillDisappear`, or SwiftUI `.onDisappear`.
2. **Use `[weak self]` in Long-Running Tasks**: Prevent holding `self` in memory during extended background operations.
3. **Structured Concurrency**: Prefer structured concurrency (`async let`, `withTaskGroup`, `withThrowingTaskGroup`) because child tasks automatically cancel when the parent scope exits.

**Code Example:**
```swift
class LiveStreamViewModel {
    private var streamTask: Task<Void, Never>?
    
    func startListening(to stream: AsyncStream<String>) {
        // ❌ Leaks self indefinitely if stream never terminates
        // streamTask = Task { for await item in stream { self.handle(item) } }
        
        // ✅ Safe: Use [weak self] and check for cancellation
        streamTask = Task { [weak self] in
            for await item in stream {
                guard !Task.isCancelled, let self else { break }
                self.handle(item)
            }
        }
    }
    
    func stop() {
        streamTask?.cancel()
        streamTask = nil
    }
    
    deinit {
        streamTask?.cancel()
    }
    
    private func handle(_ item: String) {}
}
```

**Key Points:**
- Structured tasks tie child lifetimes to the enclosing lexical scope; unstructured `Task` outlives the scope unless explicitly cancelled
- Always check `Task.isCancelled` inside long loops or after `await` suspension points

**Tags:** `#swift` `#concurrency` `#async-await` `#arc` `#memory`
**Difficulty:** Advanced
**References:**
- [Concurrency: Tasks and Task Groups — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/)
- [Task Lifecycle in Swift Concurrency — Swift by Sundell](https://swiftbysundell.com/articles/task-lifecycle-in-swift-concurrency/)

---

## Q: How do you prevent memory leaks when working with Core Foundation and `Unmanaged` pointers?

**Answer:**
Prevent Core Foundation memory leaks in Swift by correctly balancing `Unmanaged<T>.passRetained()` with `takeRetainedValue()` and pairing every retained C-level allocation with `CFRelease`.

Core Foundation (CF) types use C-style manual memory management. ARC does not automatically track CF reference counts unless bridging is handled explicitly.

- **`passRetained`**: Increments the retain count. Use when passing a Swift class instance to a C API that expects to own a reference.
- **`passUnretained`**: Does NOT increment retain count. Use when the C API borrows the object temporarily without taking ownership.
- **`takeRetainedValue`**: Consumes an existing retain count and transfers ownership to ARC (ARC will balance it with a release later).
- **`takeUnretainedValue`**: Borrows the value without decrementing its CF retain count.

**Code Example:**
```swift
class CustomDataHandler {
    let name: String = "Handler"
}

// 1. Passing Swift object into C callback context (retained)
let handler = CustomDataHandler()
let unmanagedPointer = Unmanaged.passRetained(handler).toOpaque()

// ... C API executes callback with void* context ...

// 2. Consuming object in C callback and transferring ownership back to ARC
let restoredHandler = Unmanaged<CustomDataHandler>.fromOpaque(unmanagedPointer).takeRetainedValue()
print("Restored: \(restoredHandler.name)") // ARC handles cleanup when restoredHandler leaves scope

// 3. Direct Core Foundation types
let cfArray: CFArray = CFArrayCreate(nil, nil, 0, nil)
// When bridging with __bridge_transfer in Swift:
let swiftArray = cfArray as [AnyObject] // ARC assumes ownership and releases CFArray
```

**Key Points:**
- Calling `takeRetainedValue()` on an un-retained pointer causes a crash (over-release)
- Calling `takeUnretainedValue()` on a retained pointer causes a permanent memory leak (under-release)

**Tags:** `#swift` `#corefoundation` `#unmanaged` `#memory` `#c-interop`
**Difficulty:** Senior
**References:**
- [Unmanaged — Apple Developer Documentation](https://developer.apple.com/documentation/swift/unmanaged)
- [Core Foundation Design Concepts — Apple Developer](https://developer.apple.com/documentation/corefoundation)
