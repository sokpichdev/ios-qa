# Xcode Tools — Memory Debugging & Instruments

---

## Q: How do you diagnose memory leaks using Xcode Memory Graph Debugger and Malloc Stack Logging?

**Answer:**
Xcode's Memory Graph Debugger visualizes live heap allocations and object reference relationships, while Malloc Stack Logging reveals the exact source code line where leaked memory was allocated.

To diagnose memory leaks with Memory Graph Debugger:
1. **Enable Malloc Stack Logging**: Open your scheme (`Product > Scheme > Edit Scheme...`), navigate to **Run > Diagnostics**, and check **Malloc Stack Logging** (select **Live Allocations Only** or **All Allocations and Free History**).
2. **Reproduce the Flow**: Run your app, perform the workflow (e.g. push a screen and pop it back).
3. **Capture Memory Graph**: Click the **Debug Memory Graph** icon (three connected circles) in the Xcode debug bar.
4. **Identify Leaked Objects**: Look in the Debug Navigator for purple exclamation point icons (`!`), which indicate confirmed memory leaks detected by Xcode.
5. **Inspect Retain Cycles & Backtraces**: Click any leaked object in the navigator to view the node relationship graph. Look for cycles where arrows point between two or more objects. In the inspector pane on the right, view the **Backtrace** to see the exact file and line where the object was created.

**Code Example:**
```swift
// Example of a retain cycle visible in Memory Graph
class DetailViewController: UIViewController {
    var onDismiss: (() -> Void)?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // ❌ Leaks DetailViewController upon dismiss:
        // onDismiss retains self, self retains onDismiss closure
        onDismiss = {
            self.analyticsLogDismiss()
        }
    }
    
    func analyticsLogDismiss() { print("Dismissed") }
}

// LLDB command during Memory Graph inspection to inspect address:
// (lldb) po [0x600003b54200 description]
// (lldb) malloc_history 0x600003b54200
```

**Key Points:**
- Memory Graph Debugger works on both iOS Simulator and physical devices
- Filtering by workspace symbols (bottom search bar: check the small person icon) hides UIKit system internal objects and highlights your app's classes
- Malloc Stack Logging enables `malloc_history <address>` in LLDB to inspect allocation call trees

**Tags:** `#xcode` `#memory-graph` `#debugging` `#memory-leak` `#malloc-stack-logging`
**Difficulty:** Intermediate
**References:**
- [Gathering information about memory use — Apple Developer](https://developer.apple.com/documentation/xcode/gathering-information-about-memory-use)
- [Diagnosing memory, thread, and crash issues early — Apple Developer](https://developer.apple.com/documentation/xcode/diagnosing-memory-thread-and-crash-issues-early)
- [Debugging Memory Issues — objc.io](https://www.objc.io/issues/19-debugging/debugging-memory-issues/)

---

## Q: How do you diagnose memory leaks and abandoned memory using Instruments?

**Answer:**
Instruments diagnoses memory issues through the Leaks instrument for automated heap scans and the Allocations instrument with Mark Generation for tracking persistent abandoned memory.

There is an important distinction between **Memory Leaks** (unreachable memory with active retain cycles) and **Abandoned Memory** (reachable memory that continues growing because references are never cleaned up, such as unbounded caches):

- **Leaks Instrument**:
  1. Profile app via `Product > Profile` (`Cmd + I`) and choose the **Leaks** template.
  2. The Leaks instrument runs periodic scans of the heap, placing red flags at timestamps where unreachable allocations are detected.
  3. Select a leak event, view the **Cycles & Roots** graph, and inspect the **Call Tree** with "Hide System Libraries" and "Invert Call Tree" enabled to pinpoint offending code.

- **Allocations Instrument & Mark Generation (Heapshot Analysis)**:
  1. Open the **Allocations** instrument.
  2. Navigate to a starting state in your app (e.g. Home screen).
  3. Click **Mark Generation** in the inspector to take a baseline heap snapshot (Generation A).
  4. Perform the user action (e.g., open a Feed, load images, scroll, and pop back).
  5. Click **Mark Generation** again (Generation B).
  6. Repeat the action and mark Generation C and D.
  7. If objects from a popped screen persist in subsequent generations (growth > 0), expand that generation to inspect the exact leaked objects and their allocation backtraces.

**Code Example:**
```swift
// Example: Abandoned memory (Cache without eviction)
class ImageCacheManager {
    static let shared = ImageCacheManager()
    private var cache = [String: UIImage]() // ❌ Grows indefinitely without NSCache eviction
    
    func store(image: UIImage, for key: String) {
        cache[key] = image // Allocations instrument will show steady heap growth
    }
}

// ✅ Fix using NSCache which evicts under memory pressure:
class OptimizedCacheManager {
    static let shared = OptimizedCacheManager()
    private let cache = NSCache<NSString, UIImage>()
    
    func store(image: UIImage, for key: String) {
        cache.setObject(image, forKey: key as NSString)
    }
}
```

**Key Points:**
- Always profile memory on a **physical device** with a **Release** build configuration for realistic memory metrics and compiler optimizations
- Invert Call Tree places your app's functions at the top of the call stack rather than deep inside `libsystem_malloc.dylib`

**Tags:** `#xcode` `#instruments` `#allocations` `#leaks` `#performance`
**Difficulty:** Advanced
**References:**
- [Gathering information about memory use — Apple Developer](https://developer.apple.com/documentation/xcode/gathering-information-about-memory-use)
- [Instruments Tutorial for iOS — Kodeco](https://www.kodeco.com/10562-instruments-tutorial-for-ios-getting-started)
- [Debugging Memory Issues — objc.io](https://www.objc.io/issues/19-debugging/debugging-memory-issues/)
