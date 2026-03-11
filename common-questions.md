# Interview Prep

A collection of commonly asked iOS interview questions with concise answers.

---

## Q: Explain the iOS app lifecycle.

**Answer:**
An iOS app moves through states managed by `UIApplicationDelegate` (UIKit) or `@main` + scene lifecycle (SwiftUI/iOS 13+).

**States:**
1. **Not Running** — app hasn't launched or was terminated
2. **Inactive** — foreground but not receiving events (e.g. incoming call)
3. **Active** — foreground, running normally
4. **Background** — executing code off-screen (limited time)
5. **Suspended** — in memory but not executing

**Key delegate methods (UIKit):**
```swift
func application(_:didFinishLaunchingWithOptions:)  // setup
func applicationDidBecomeActive(_:)                 // resume
func applicationWillResignActive(_:)                // pause
func applicationDidEnterBackground(_:)              // save state
func applicationWillTerminate(_:)                   // cleanup
```

**Tags:** `#interview` `#lifecycle` `#uikit`

---

## Q: What is retain cycle and how do you prevent it?

**Answer:**
A retain cycle occurs when two objects hold strong references to each other, preventing ARC from deallocating either. Memory leaks.

**Common case — closure capturing `self`:**
```swift
// ❌ Retain cycle — viewModel holds closure, closure holds viewModel
viewModel.onUpdate = {
    self.updateUI() // strong capture
}

// ✅ Break cycle with [weak self]
viewModel.onUpdate = { [weak self] in
    self?.updateUI()
}

// ✅ Or [unowned self] if self is guaranteed to outlive the closure
viewModel.onUpdate = { [unowned self] in
    self.updateUI()
}
```

**How to find them:** Xcode's Memory Graph Debugger (`Debug > Memory Graph`) — look for objects that still exist after they should be deallocated.

**Tags:** `#interview` `#memory` `#arc` `#retain-cycle`

---

## Q: What is the difference between synchronous and asynchronous execution?

**Answer:**
- **Synchronous** — blocks the current thread until the work is done
- **Asynchronous** — returns immediately; work continues on another thread or later

```swift
// Synchronous — caller waits
let data = try Data(contentsOf: url) // blocks main thread ❌

// Asynchronous — caller continues immediately
Task {
    let data = try await URLSession.shared.data(from: url).0 // non-blocking ✅
}
```

**Tags:** `#interview` `#concurrency` `#async-await`

---

## Q: What tools do you use to debug performance issues in iOS?

**Answer:**
- **Instruments** — CPU Profiler, Time Profiler, Allocations, Leaks, Core Data
- **Xcode Memory Graph** — find retain cycles and leaked objects
- **View Hierarchy Debugger** — spot off-screen renders, overlapping views
- **MetricKit** — on-device production diagnostics
- **os_signpost** — custom time intervals in Instruments

**Workflow for a slow scroll:**
1. Profile with Instruments Time Profiler
2. Look for `cellForRowAt` taking too long
3. Move image decoding / layout off the main thread
4. Use `os_signpost` to confirm the improvement

**Tags:** `#interview` `#performance` `#instruments` `#debugging`
