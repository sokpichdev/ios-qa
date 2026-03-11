# Xcode & Tools — Fundamentals

---

## Q: What is Swift Package Manager (SPM)?

**Answer:**
SPM is Apple's built-in dependency manager for Swift. It fetches, builds, and links third-party packages directly inside Xcode — no extra tools like CocoaPods or Carthage needed.

**How to add a package in Xcode:**
1. `File → Add Package Dependencies`
2. Paste the repo URL (e.g. `https://github.com/Alamofire/Alamofire`)
3. Choose version rule → Add Package

**Creating your own package:**
```swift
// Package.swift
let package = Package(
    name: "NetworkKit",
    platforms: [.iOS(.v16)],
    products: [
        .library(name: "NetworkKit", targets: ["NetworkKit"])
    ],
    dependencies: [
        .package(url: "https://github.com/Alamofire/Alamofire", from: "5.0.0")
    ],
    targets: [
        .target(
            name: "NetworkKit",
            dependencies: ["Alamofire"]
        ),
        .testTarget(
            name: "NetworkKitTests",
            dependencies: ["NetworkKit"]
        )
    ]
)
```

**Version rules:**
- `.exact("5.2.0")` — pin to a specific version
- `from: "5.0.0"` — any version from 5.0.0 up to the next major (< 6.0.0)
- `.upToNextMinor(from: "5.2.0")` — < 5.3.0

**Tags:** `#xcode` `#spm` `#dependencies`

---

## Q: What is the difference between `Debug` and `Release` build configurations?

**Answer:**
Build configurations control compiler optimisations and flags. Debug is for development; Release is what ships to users.

| | Debug | Release |
|--|-------|---------|
| Optimisation | None (`-Onone`) | Full (`-O`) |
| Debug symbols | ✅ Included | ❌ Stripped |
| Assertions | Active | Disabled |
| `#if DEBUG` | `true` | `false` |
| Build speed | Fast | Slow |
| Runtime speed | Slow | Fast |

**Code Example:**
```swift
// Code only runs in Debug builds
#if DEBUG
func printDebugInfo() {
    print("User: \(currentUser)")
    print("API: \(apiBaseURL)")
}
#endif

// Assertion — removed in Release builds, no performance impact in production
assert(!items.isEmpty, "Items should never be empty here")

// Fatal error — always present (use for programmer errors)
guard let url = URL(string: urlString) else {
    fatalError("Invalid hardcoded URL — developer error")
}
```

**Tags:** `#xcode` `#debug` `#release` `#build-config` `#interview`

---

## Q: What is a scheme vs a target vs a project?

**Answer:**
These are three distinct levels of organisation in an Xcode workspace.

- **Project** — the `.xcodeproj` file; top-level container holding everything
- **Target** — a single build product (app, framework, extension, test suite)
- **Scheme** — defines what to build, run, test, profile, and archive

**Practical relationships:**
```
Project (MyApp.xcodeproj)
  ├── Target: MyApp          ← the main app
  ├── Target: MyAppTests     ← unit tests
  ├── Target: MyAppUITests   ← UI tests
  ├── Target: MyWidget       ← widget extension
  └── Target: NetworkKit     ← internal framework

Scheme: MyApp
  ├── Build: MyApp + MyAppTests
  ├── Run: MyApp (Debug config)
  ├── Test: MyAppTests + MyAppUITests
  └── Archive: MyApp (Release config)
```

**When to add targets:**
- App extensions (widgets, share extensions, notification service)
- Internal frameworks you want to share across apps
- White-label apps with different bundle IDs and assets

**Tags:** `#xcode` `#scheme` `#target` `#project` `#interview`

---

## Q: How do you use breakpoints effectively in Xcode?

**Answer:**
Breakpoints pause execution so you can inspect state. Xcode has several types beyond simple line breaks.

**Types of breakpoints:**
```
Line breakpoint       — pause at a specific line (click gutter)
Conditional breakpoint — pause only when condition is true
Symbolic breakpoint    — pause when any method with a name is called
Exception breakpoint   — pause when any exception is thrown
watchpoint             — pause when a variable's value changes
```

**Tips:**
```swift
// 1. Conditional breakpoint — right-click → Edit Breakpoint
// Condition: indexPath.row == 5 && indexPath.section == 0

// 2. Action breakpoint — log without stopping execution
// Add action: "po user.name" — logs to console, continues

// 3. Symbolic breakpoint for a framework method
// Symbol: -[UIViewController viewDidAppear:]
// Catches every viewDidAppear in the app

// 4. LLDB in console
po user           // print description of 'user'
p user.name       // print property
expr user.name = "Alice"  // modify value while paused
bt                // backtrace — see call stack
```

**Tags:** `#xcode` `#debugging` `#breakpoints` `#lldb`

---

## Q: What is `LLDB` and what are useful commands?

**Answer:**
LLDB is the debugger built into Xcode. When paused at a breakpoint, you can type commands in the console to inspect and modify the running app.

**Most useful commands:**
```bash
# Print object description
po viewModel
po viewModel.items.count

# Print raw value
p frame.size.width

# Modify a value while paused
expr isLoading = true
expr (void)[self.tableView reloadData]

# Print backtrace (call stack)
bt

# Move up/down the call stack
up
down

# List all local variables
frame variable

# Continue execution
c

# Step over next line
n

# Step into function call
s

# Step out of current function
finish

# Set a breakpoint from console
breakpoint set --name viewDidLoad
br s -n "URLSession"
```

**Tags:** `#xcode` `#lldb` `#debugging` `#interview`

---

## Q: What is a memory leak and how do you find one with Instruments?

**Answer:**
A memory leak is memory that is allocated but never freed — usually from retain cycles. Over time it causes the app to use more and more memory and eventually crash.

**How to find leaks with Instruments:**
1. `Xcode → Product → Profile` (or `Cmd+I`)
2. Choose **Leaks** template
3. Use the app to trigger the suspected leak
4. Instruments marks leaked objects in red
5. Click a leak to see the allocation stack trace

**Finding retain cycles with Memory Graph:**
1. Run the app in Xcode
2. Click the **Memory Graph** button (3 circles icon in debug bar)
3. Look for objects that shouldn't exist — e.g. `MyViewController` that was dismissed
4. Click the object to see what's retaining it

**Code Example — common leak:**
```swift
// ❌ Retain cycle — both objects keep each other alive
class ViewController: UIViewController {
    var timer: Timer?

    override func viewDidLoad() {
        // Timer retains self strongly
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            self.update()  // strong capture
        }
    }
    // timer never invalidated → ViewController never deallocated
}

// ✅ Fix
timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
    self?.update()
}

override func viewDidDisappear(_ animated: Bool) {
    super.viewDidDisappear(animated)
    timer?.invalidate()
}
```

**Tags:** `#xcode` `#instruments` `#memory-leak` `#debugging` `#interview`

---

## Q: What is the Address Sanitizer?

**Answer:**
Address Sanitizer (ASan) is a runtime tool that detects memory corruption bugs — buffer overflows, use-after-free, and invalid memory access — that would otherwise cause mysterious crashes.

**How to enable:**
1. Edit Scheme → Run → Diagnostics
2. Enable **Address Sanitizer**
3. Optionally enable **Undefined Behavior Sanitizer** too

**What it catches:**
- Buffer overflow (reading/writing past array bounds)
- Use-after-free (accessing deallocated memory)
- Use-after-return (returning pointer to stack variable)
- Double-free

**Example output:**
```
==ERROR: AddressSanitizer: heap-buffer-overflow
READ of size 4 at 0x... thread T0
    #0 MyApp in processData() MyClass.swift:47
```

**Note:** ASan adds significant runtime overhead (~2x slower, ~3x more memory) — only enable it when hunting bugs, not for regular development.

**Tags:** `#xcode` `#address-sanitizer` `#debugging` `#memory`

---

## Q: What is `OSLog` and how is it better than `print`?

**Answer:**
`OSLog` is Apple's structured logging framework. It's faster than `print`, integrates with Console.app, supports log levels, and redacts sensitive data in production.

**Code Example:**
```swift
import OSLog

// Create a logger with subsystem and category
private let logger = Logger(subsystem: "com.myapp", category: "networking")

class NetworkManager {
    func fetchUser(id: Int) async throws -> User {
        logger.info("Fetching user \(id)")

        do {
            let user = try await api.getUser(id: id)
            logger.debug("User fetched: \(user.name)")
            return user
        } catch {
            logger.error("Failed to fetch user: \(error.localizedDescription)")
            throw error
        }
    }
}
```

**Log levels:**
- `.debug` — verbose, only in development
- `.info` — general info, retained briefly
- `.notice` — important events
- `.error` — recoverable errors
- `.fault` — serious bugs, always persisted

**Why better than `print`:**
- Compiled out of release builds (`.debug`)
- Auto-redacts private data: `logger.info("Token: \(token, privacy: .private)")`
- Viewable in Console.app on device without Xcode
- Negligible performance impact

**Tags:** `#xcode` `#logging` `#oslog` `#debugging`

---

## Q: What is `xcconfig` and when would you use it?

**Answer:**
An `.xcconfig` file is a plain text file that sets build settings. It's useful for managing different configurations (Dev, Staging, Production) without duplicating targets.

**Example file — `Debug.xcconfig`:**
```bash
// Debug.xcconfig
API_BASE_URL = https://dev.api.com
ANALYTICS_KEY = dev_key_123
BUNDLE_ID_SUFFIX = .debug

// Override bundle identifier
PRODUCT_BUNDLE_IDENTIFIER = com.myapp$(BUNDLE_ID_SUFFIX)
```

**Accessing in Swift:**
```swift
// Add keys to Info.plist first:
// <key>API_BASE_URL</key>
// <string>$(API_BASE_URL)</string>

let apiURL = Bundle.main.infoDictionary?["API_BASE_URL"] as? String ?? ""
```

**Why use xcconfig over hardcoded values:**
- Keep secrets out of source code
- Different API endpoints per environment
- One place to change a value that affects multiple targets
- Works well with CI/CD — inject values at build time

**Tags:** `#xcode` `#xcconfig` `#build-settings` `#environments`

---

## Q: How do you set up CI/CD for an iOS project?

**Answer:**
CI/CD automates building, testing, and distributing your app on every code push. Popular options are Xcode Cloud, GitHub Actions, and Bitrise.

**GitHub Actions example — `.github/workflows/ios.yml`:**
```yaml
name: iOS CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: macos-14

    steps:
    - uses: actions/checkout@v3

    - name: Select Xcode
      run: sudo xcode-select -switch /Applications/Xcode_15.2.app

    - name: Install dependencies
      run: xcodebuild -resolvePackageDependencies

    - name: Run tests
      run: |
        xcodebuild test \
          -scheme MyApp \
          -destination 'platform=iOS Simulator,name=iPhone 15,OS=17.2' \
          -resultBundlePath TestResults \
          | xcpretty

    - name: Upload test results
      uses: actions/upload-artifact@v3
      with:
        name: TestResults
        path: TestResults.xcresult
```

**Typical pipeline stages:**
1. Install dependencies (SPM)
2. Run unit tests
3. Run UI tests
4. Build archive
5. Upload to TestFlight (for `main` branch merges)

**Tags:** `#xcode` `#ci-cd` `#github-actions` `#testing` `#automation`
