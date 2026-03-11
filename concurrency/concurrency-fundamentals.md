# Concurrency — Fundamentals

---

## Q: What is a `Task` and how is it different from a `Thread`?

**Answer:**
A `Task` is Swift's unit of async work. Unlike threads, tasks are lightweight, managed by the Swift runtime, and can be suspended without blocking an underlying thread.

| | `Task` | `Thread` |
|--|--------|----------|
| Cost | Lightweight | Heavy (~512KB stack) |
| Managed by | Swift runtime | OS |
| Suspension | Yes (non-blocking) | No (blocks thread) |
| Cancellation | Built-in | Manual |

**Code Example:**
```swift
// Creating a task
let task = Task {
    let data = try await fetchData()
    await MainActor.run { updateUI(with: data) }
}

// Cancelling it
task.cancel()

// Task inherits priority and actor context from where it's created
// Use Task.detached to explicitly break that inheritance
Task.detached(priority: .background) {
    await expensiveBackgroundWork()
}
```

**Tags:** `#concurrency` `#task` `#async-await` `#interview`

---

## Q: What is `TaskGroup` and when would you use it?

**Answer:**
`TaskGroup` lets you run multiple async tasks in parallel and collect all their results. Use it when you have a dynamic number of parallel operations.

**Code Example:**
```swift
func fetchAllUsers(ids: [Int]) async throws -> [User] {
    try await withThrowingTaskGroup(of: User.self) { group in
        for id in ids {
            group.addTask {
                try await fetchUser(id: id)
            }
        }

        var users: [User] = []
        for try await user in group {
            users.append(user)
        }
        return users
    }
}

// All fetches run in parallel — much faster than sequential await
let users = try await fetchAllUsers(ids: [1, 2, 3, 4, 5])
```

**Key Points:**
- `withTaskGroup` for non-throwing tasks
- `withThrowingTaskGroup` when tasks can throw
- Results arrive in completion order, not the order tasks were added

**Tags:** `#concurrency` `#taskgroup` `#parallelism` `#async-await`

---

## Q: What is `async let` and when is it useful?

**Answer:**
`async let` starts a child task immediately and lets you await its result later. It's the cleanest way to run a fixed number of async operations in parallel.

**Code Example:**
```swift
// Sequential — slow (waits for each one)
func loadDashboard() async throws -> Dashboard {
    let user = try await fetchUser()          // waits
    let posts = try await fetchPosts()        // then waits
    let notifications = try await fetchNotifications() // then waits
    return Dashboard(user: user, posts: posts, notifications: notifications)
}

// Parallel with async let — all three start at the same time
func loadDashboard() async throws -> Dashboard {
    async let user = fetchUser()
    async let posts = fetchPosts()
    async let notifications = fetchNotifications()

    return try await Dashboard(
        user: user,
        posts: posts,
        notifications: notifications
    )
}
```

**Rule of thumb:** Use `async let` for a fixed set of concurrent operations. Use `TaskGroup` for a dynamic number.

**Tags:** `#concurrency` `#async-let` `#parallelism` `#interview`

---

## Q: What is `withCheckedContinuation` and why is it needed?

**Answer:**
`withCheckedContinuation` bridges old callback-based APIs into the async/await world. Use it to wrap any completion-handler function so it can be awaited.

**Code Example:**
```swift
// Old callback-based API
func fetchData(completion: @escaping (Data?, Error?) -> Void) { ... }

// Wrap it for async/await use
func fetchData() async throws -> Data {
    try await withCheckedThrowingContinuation { continuation in
        fetchData { data, error in
            if let error = error {
                continuation.resume(throwing: error)
            } else if let data = data {
                continuation.resume(returning: data)
            }
        }
    }
}

// Now you can await it
let data = try await fetchData()
```

**Key Rules:**
- `continuation.resume()` must be called **exactly once** — never zero, never twice
- Use `withCheckedThrowingContinuation` when the operation can fail
- `withUnsafeContinuation` skips the "called once" check — only use if performance is critical

**Tags:** `#concurrency` `#continuation` `#async-await` `#bridging`

---

## Q: How do you cancel a running `Task`?

**Answer:**
Tasks support cooperative cancellation — you cancel from outside, and the task must check for cancellation and stop itself.

**Code Example:**
```swift
// Hold a reference to cancel it
let task = Task {
    for i in 0..<100 {
        try Task.checkCancellation()  // throws CancellationError if cancelled
        await processItem(i)
    }
}

// Cancel from outside
task.cancel()

// Checking cancellation without throwing
Task {
    while !Task.isCancelled {
        await doWork()
    }
}

// async APIs like URLSession respect cancellation automatically
Task {
    do {
        let (data, _) = try await URLSession.shared.data(from: url)
    } catch is CancellationError {
        print("Task was cancelled")
    }
}
```

**Tags:** `#concurrency` `#cancellation` `#task` `#interview`

---

## Q: What is `Sendable` and why does it matter?

**Answer:**
`Sendable` is a protocol that marks a type as safe to share across concurrency domains (actors, tasks). The compiler enforces this to prevent data races at compile time.

**Code Example:**
```swift
// Structs with Sendable properties are automatically Sendable
struct UserProfile: Sendable {
    let id: Int
    let name: String
}

// Classes need to be carefully marked — only if truly thread-safe
final class ImmutableConfig: Sendable {
    let apiKey: String
    init(apiKey: String) { self.apiKey = apiKey }
}

// Actor — implicitly Sendable
actor DataCache {
    var items: [String: Data] = [:]
}

// ⚠️ This causes a compiler error — non-Sendable type crossing actor boundary
class NonSendableData { var value = 0 }

actor MyActor {
    func process(_ data: NonSendableData) { } // ❌ compiler warning
}
```

**Tags:** `#concurrency` `#sendable` `#thread-safety` `#advanced`

---

## Q: What is the difference between a `serial` and `concurrent` queue in GCD?

**Answer:**
- **Serial queue** — executes tasks one at a time, in order. Second task waits for first to finish.
- **Concurrent queue** — executes multiple tasks simultaneously on different threads.

**Code Example:**
```swift
// Serial queue — tasks run one after another
let serialQueue = DispatchQueue(label: "com.app.serial")
serialQueue.async { print("Task 1") }
serialQueue.async { print("Task 2") }  // always after Task 1

// Concurrent queue — tasks run in parallel
let concurrentQueue = DispatchQueue(label: "com.app.concurrent",
                                    attributes: .concurrent)
concurrentQueue.async { print("Task A") }
concurrentQueue.async { print("Task B") }  // may run before Task A

// Global queues are concurrent with different priorities
DispatchQueue.global(qos: .userInitiated).async { ... }
DispatchQueue.global(qos: .background).async { ... }

// Main queue is serial — always use for UI updates
DispatchQueue.main.async {
    self.tableView.reloadData()
}
```

**Tags:** `#concurrency` `#gcd` `#queues` `#interview`

---

## Q: What is a race condition and how do you prevent it?

**Answer:**
A race condition occurs when two or more threads access shared mutable state simultaneously, producing unpredictable results depending on timing.

**Code Example:**
```swift
// ❌ Race condition — counter could be corrupted
class UnsafeCounter {
    var count = 0
    func increment() { count += 1 }  // not thread-safe
}

// ✅ Option 1 — Use an actor (preferred in modern Swift)
actor SafeCounter {
    var count = 0
    func increment() { count += 1 }  // actor serializes access
}

// ✅ Option 2 — Serial dispatch queue
class QueueCounter {
    private var count = 0
    private let queue = DispatchQueue(label: "com.app.counter")

    func increment() {
        queue.async { self.count += 1 }
    }

    func value(completion: @escaping (Int) -> Void) {
        queue.async { completion(self.count) }
    }
}
```

**Tags:** `#concurrency` `#race-condition` `#thread-safety` `#interview`

---

## Q: What is `OperationQueue` and how is it different from GCD?

**Answer:**
`OperationQueue` is a higher-level abstraction over GCD. It adds features like dependencies between operations, cancellation, and maximum concurrency limits.

| | `OperationQueue` | GCD |
|--|-----------------|-----|
| Dependencies | ✅ Yes | ❌ No |
| Cancellation | ✅ Yes | Limited |
| Max concurrency | ✅ Yes | Limited |
| KVO observable | ✅ Yes | ❌ No |
| Overhead | Higher | Lower |

**Code Example:**
```swift
let queue = OperationQueue()
queue.maxConcurrentOperationCount = 3

let op1 = BlockOperation { print("Download image") }
let op2 = BlockOperation { print("Process image") }
let op3 = BlockOperation { print("Save image") }

// op2 and op3 won't start until op1 finishes
op2.addDependency(op1)
op3.addDependency(op2)

queue.addOperations([op1, op2, op3], waitUntilFinished: false)

// Cancel all
queue.cancelAllOperations()
```

**Tags:** `#concurrency` `#operationqueue` `#gcd`

---

## Q: What is `AsyncStream` and what problem does it solve?

**Answer:**
`AsyncStream` converts callback or delegate-based event sources into an `AsyncSequence` you can iterate over with `for await`. It bridges event-driven code into structured concurrency.

**Code Example:**
```swift
// Wrapping a delegate/callback pattern into AsyncStream
func locationUpdates() -> AsyncStream<CLLocation> {
    AsyncStream { continuation in
        let manager = CLLocationManager()
        let delegate = LocationDelegate { location in
            continuation.yield(location)     // emit each update
        }
        manager.delegate = delegate
        manager.startUpdatingLocation()

        continuation.onTermination = { _ in
            manager.stopUpdatingLocation()   // cleanup on cancel
        }
    }
}

// Consuming it cleanly with for await
Task {
    for await location in locationUpdates() {
        print("New location: \(location.coordinate)")
    }
}
```

**Use for:** Location updates, WebSocket messages, notifications, sensor data, any ongoing event stream.

**Tags:** `#concurrency` `#asyncstream` `#async-await` `#combine`
