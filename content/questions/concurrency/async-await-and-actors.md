# Concurrency

---

## Q: What is the difference between `async/await` and GCD (Grand Central Dispatch)?

**Answer:**
Both manage concurrent work, but `async/await` (introduced in Swift 5.5) is structured and compiler-checked, while GCD is unstructured and callback-based.

| | `async/await` | GCD |
|--|--------------|-----|
| Style | Structured | Unstructured |
| Readability | Linear code | Nested callbacks |
| Error handling | `throws` / `try` | Manual |
| Cancellation | Automatic (Tasks) | Manual |
| Thread safety | Enforced by actors | Manual |

**Code Example:**
```swift
// ❌ GCD — nested, harder to read and reason about
func loadUser(completion: @escaping (User?) -> Void) {
    DispatchQueue.global().async {
        let user = fetchFromNetwork()
        DispatchQueue.main.async {
            completion(user)
        }
    }
}

// ✅ async/await — reads like synchronous code
func loadUser() async throws -> User {
    let user = try await fetchFromNetwork()
    return user
}
```

**Tags:** `#concurrency` `#async-await` `#gcd` `#interview`
**Difficulty:** Intermediate

---

## Q: What is an `Actor` and when should you use one?

**Answer:**
An `actor` is a reference type that protects its mutable state from concurrent access. The Swift compiler enforces that only one task accesses the actor's internals at a time.

**Code Example:**
```swift
actor ImageCache {
    private var cache: [URL: UIImage] = [:]

    func image(for url: URL) -> UIImage? {
        cache[url]
    }

    func store(_ image: UIImage, for url: URL) {
        cache[url] = image
    }
}

// Usage — must be awaited from outside the actor
let cache = ImageCache()
let img = await cache.image(for: url)
await cache.store(image, for: url)
```

**Key Points:**
- Use `actor` for shared mutable state accessed from multiple tasks
- `@MainActor` is a global actor that ensures code runs on the main thread
- Actor methods are automatically `async` when called from outside

**Tags:** `#concurrency` `#actor` `#thread-safety` `#interview`
**Difficulty:** Intermediate

---

## Q: What is `MainActor` and when do you use it?

**Answer:**
`@MainActor` is a global actor that ensures code runs on the main thread. Use it for UI updates, ViewModels, and any code that must not run off the main thread.

**Code Example:**
```swift
@MainActor
class ProfileViewModel: ObservableObject {
    @Published var username: String = ""
    @Published var isLoading: Bool = false

    func loadProfile() async {
        isLoading = true
        defer { isLoading = false }
        username = try await ProfileService.fetchUsername()
        // All assignments happen on main thread automatically
    }
}

// Marking just a function (not the whole type)
func updateUI() async {
    await MainActor.run {
        label.text = "Done"
    }
}
```

**Tags:** `#concurrency` `#mainactor` `#swiftui` `#thread-safety`
**Difficulty:** Intermediate
