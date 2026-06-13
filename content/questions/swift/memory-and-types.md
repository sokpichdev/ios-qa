# Swift

---

## Q: What is the difference between `strong`, `weak`, and `unowned` references?

**Answer:**
These determine how ARC (Automatic Reference Counting) manages object lifetimes.

- `strong` — increments the retain count. Default for most references.
- `weak` — does NOT increment retain count. Automatically set to `nil` when the object deallocates. Must be `Optional`.
- `unowned` — does NOT increment retain count. Assumed to always have a value — crashes if accessed after deallocation.

**Code Example:**
```swift
class Owner {
    var pet: Pet?
}

class Pet {
    weak var owner: Owner?  // avoid retain cycle
}

// unowned — use when you're certain the referenced object outlives the current one
class ViewModel {
    unowned let coordinator: AppCoordinator
    init(coordinator: AppCoordinator) {
        self.coordinator = coordinator
    }
}
```

**When to use `weak` vs `unowned`:**
- `weak` — the reference can become `nil` (delegate patterns, optional parent refs)
- `unowned` — the reference should never become `nil` (e.g. child → parent with guaranteed lifetime)

**Tags:** `#swift` `#arc` `#memory` `#interview`
**Difficulty:** Intermediate

---

## Q: What is a protocol extension and why is it powerful?

**Answer:**
Protocol extensions let you add default implementations to protocol methods, so conforming types get behavior for free without inheriting from a base class.

**Code Example:**
```swift
protocol Greetable {
    var name: String { get }
    func greet() -> String
}

extension Greetable {
    func greet() -> String {
        return "Hello, \(name)!"
    }
}

struct User: Greetable {
    var name: String
    // greet() is provided for free by the extension
}

let user = User(name: "Mia")
print(user.greet()) // "Hello, Mia!"
```

**Key Points:**
- Enables composition over inheritance
- Multiple protocols can be adopted (vs single class inheritance)
- Constrained extensions let you add methods only for specific types

**Tags:** `#swift` `#protocols` `#extensions` `#interview`
**Difficulty:** Intermediate

---

## Q: What is `@escaping` in a closure?

**Answer:**
A closure marked `@escaping` can outlive the function it was passed into — it "escapes" the function's scope. Non-escaping closures are executed synchronously before the function returns.

**Code Example:**
```swift
// @escaping — stored and called later (e.g. async completion)
func fetchData(completion: @escaping (Result<Data, Error>) -> Void) {
    URLSession.shared.dataTask(with: url) { data, _, error in
        if let data = data {
            completion(.success(data))
        }
    }.resume()
}

// Non-escaping (default) — called inline, can be optimized by the compiler
func performOperation(action: () -> Void) {
    action() // called immediately, before function returns
}
```

**Key Points:**
- Use `@escaping` for async callbacks, stored closures, delegate-style patterns
- Non-escaping closures don't need `self.` to capture properties

**Tags:** `#swift` `#closures` `#async` `#interview`
**Difficulty:** Intermediate

---

## Q: What is the difference between `struct` and `class` in Swift?

**Answer:**
The core difference is value type vs reference type.

| | `struct` | `class` |
|--|----------|---------|
| Type | Value type | Reference type |
| Memory | Stack (usually) | Heap |
| Inheritance | No | Yes |
| Mutability | Explicit (`mutating`) | Implicit |
| ARC | No | Yes |
| `deinit` | No | Yes |

**Rule of thumb:**
- Use `struct` by default — safer, faster, no retain cycles
- Use `class` when you need identity, inheritance, or Objective-C interop

**Tags:** `#swift` `#struct` `#class` `#memory` `#interview`
**Difficulty:** Intermediate
