# OOP — Fundamentals

---

## Q: What are the four pillars of Object-Oriented Programming?

**Answer:**
Encapsulation, abstraction, inheritance, and polymorphism. Swift supports all four, though it leans on protocols and value types more than classic class-based OOP languages.

| Pillar | What it means | Swift example |
|--|--|--|
| Encapsulation | Hide internal state, expose controlled access | `private(set) var balance` |
| Abstraction | Expose what something does, not how | `protocol PaymentProcessor` |
| Inheritance | Reuse/extend behavior from a base type | `class SavingsAccount: Account` |
| Polymorphism | Same interface, different underlying behavior | `[PaymentProcessor]` holding multiple conforming types |

```swift
protocol PaymentProcessor {
    func charge(_ amount: Decimal) -> Bool
}

class CreditCardProcessor: PaymentProcessor {
    func charge(_ amount: Decimal) -> Bool { /* ... */ true }
}

class PayPalProcessor: PaymentProcessor {
    func charge(_ amount: Decimal) -> Bool { /* ... */ true }
}

let processors: [PaymentProcessor] = [CreditCardProcessor(), PayPalProcessor()]
processors.forEach { _ = $0.charge(9.99) } // polymorphic dispatch
```

**Tags:** `#oop` `#fundamentals` `#interview`
**Difficulty:** Beginner

---

## Q: What is encapsulation, and how does Swift's access control support it?

**Answer:**
Encapsulation means bundling data with the operations that act on it, and restricting direct access to that data so internal invariants can't be broken from outside. Swift enforces this through access control levels rather than getter/setter conventions.

| Level | Visibility |
|--|--|
| `private` | Within the enclosing declaration (and extensions in the same file) |
| `fileprivate` | Anywhere in the same file |
| `internal` (default) | Anywhere in the same module |
| `public` | Any module, but not overridable/subclassable outside |
| `open` | Any module, including override/subclass |

```swift
class BankAccount {
    private(set) var balance: Decimal = 0   // readable outside, writable only inside

    func deposit(_ amount: Decimal) {
        guard amount > 0 else { return }    // invariant protected here
        balance += amount
    }
}

let account = BankAccount()
account.deposit(100)
// account.balance = 1_000_000  // ❌ compile error — can't bypass deposit()
```

**Tags:** `#oop` `#encapsulation` `#access-control`
**Difficulty:** Beginner
**References:**
- [Access Control — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/accesscontrol/)

---

## Q: What's the difference between abstraction and encapsulation?

**Answer:**
They're often confused because both involve "hiding" something, but they hide different things for different reasons:

- **Encapsulation** hides *internal state* to protect it from invalid mutation (an implementation detail / data-integrity concern).
- **Abstraction** hides *implementation complexity* behind a simpler interface, so callers depend on *what* something does, not *how* (a design / interface concern).

```swift
protocol ImageLoader {
    func load(url: URL) async throws -> UIImage
}

// Caller only knows the abstraction...
func showAvatar(loader: ImageLoader, url: URL) async {
    let image = try? await loader.load(url: url)
}

// ...not that this implementation encapsulates a cache and a URLSession
final class CachingImageLoader: ImageLoader {
    private var cache: [URL: UIImage] = [:]   // encapsulated state
    private let session = URLSession.shared

    func load(url: URL) async throws -> UIImage {
        if let cached = cache[url] { return cached }
        let (data, _) = try await session.data(from: url)
        let image = UIImage(data: data)!
        cache[url] = image
        return image
    }
}
```

**Tags:** `#oop` `#abstraction` `#encapsulation` `#interview`
**Difficulty:** Intermediate

---

## Q: What is polymorphism, and what forms does it take in Swift?

**Answer:**
Polymorphism lets code work with values of different underlying types through a single shared interface. Swift supports several flavors:

- **Subtype (runtime) polymorphism** — a subclass overrides a base class's method, and the override is dispatched at runtime via `dynamic`/vtable dispatch.
- **Protocol (ad-hoc) polymorphism** — unrelated types conform to the same protocol and are used interchangeably, often via existentials (`any Protocol`) or generics.
- **Parametric (generic) polymorphism** — a single function/type works across many types via generics, resolved at compile time.
- **Ad-hoc polymorphism (overloading)** — the same function name behaves differently based on argument types.

```swift
// Subtype polymorphism
class Shape { func area() -> Double { 0 } }
class Circle: Shape {
    let radius: Double
    init(radius: Double) { self.radius = radius }
    override func area() -> Double { .pi * radius * radius }
}

// Protocol polymorphism
protocol Drawable { func draw() }
struct Square: Drawable { func draw() { /* ... */ } }
struct Triangle: Drawable { func draw() { /* ... */ } }
let shapes: [any Drawable] = [Square(), Triangle()]

// Parametric (generic) polymorphism
func firstElement<T>(of array: [T]) -> T? { array.first }
```

**Tags:** `#oop` `#polymorphism` `#generics` `#interview`
**Difficulty:** Intermediate

---

## Q: How does Protocol-Oriented Programming (POP) differ from classic class-based OOP?

**Answer:**
Classic OOP centers on classes and inheritance hierarchies — behavior is shared by subclassing a base class. Swift instead favors **Protocol-Oriented Programming**: define behavior as protocols, share default implementations via protocol extensions, and let both `struct`s and `class`es adopt them. This sidesteps single-inheritance limits and the fragile-base-class problem, and works naturally with value types.

```swift
protocol Flyable {
    func fly()
}

extension Flyable {
    func fly() { print("Flapping wings") }   // default implementation, no base class needed
}

struct Sparrow: Flyable {}                    // gets fly() for free
struct Airplane: Flyable {
    func fly() { print("Engines roaring") }   // overrides the default
}
```

A struct can adopt ten protocols and get default behavior from each — something a single-inheritance class hierarchy can't express cleanly. This is also why Apple frameworks (e.g., `Equatable`, `Collection`, `Identifiable`) lean heavily on protocols rather than base classes.

**Tags:** `#oop` `#protocol-oriented` `#protocols` `#interview`
**Difficulty:** Intermediate
**References:**
- [Protocols — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols/)

---

## Q: How do value types and reference types change the way you think about OOP in Swift?

**Answer:**
Classic OOP assumes objects are reference types with identity and shared mutable state. Swift's `struct`/`enum` value types break that assumption: copies are independent, there's no shared mutable state to corrupt, and "object identity" doesn't apply. This pushes Swift OOP toward **composition and protocols over inheritance**, since value types can't be subclassed.

```swift
struct Point {            // value type — copied on assignment
    var x, y: Double
}
var a = Point(x: 0, y: 0)
var b = a
b.x = 10
// a.x is still 0 — independent copies, no aliasing bugs

class Counter {           // reference type — shared identity
    var count = 0
}
let c1 = Counter()
let c2 = c1
c2.count = 10
// c1.count is also 10 — same instance
```

Rule of thumb: reach for `struct` (value semantics, thread-safe copies, no inheritance) by default, and use `class` when you specifically need shared, mutable identity (e.g., view controllers, caches, observable state).

**Tags:** `#oop` `#value-types` `#reference-types` `#swift`
**Difficulty:** Intermediate

---

## Q: What are the SOLID principles, and how do they apply in Swift?

**Answer:**
SOLID is a set of five design guidelines for maintainable OOP code:

| Principle | Idea | Swift application |
|--|--|--|
| **S**ingle Responsibility | A type should have one reason to change | Split a "God ViewController" into a ViewModel + Service |
| **O**pen/Closed | Open for extension, closed for modification | Add behavior via protocol conformance/extensions, not by editing existing types |
| **L**iskov Substitution | Subtypes must be usable wherever their base type is expected | A `Square: Rectangle` shouldn't break callers that resize rectangles independently |
| **I**nterface Segregation | Prefer many small protocols over one large one | `Codable` is `Encodable & Decodable` — adopt only what you need |
| **D**ependency Inversion | Depend on abstractions, not concrete types | Inject a `NetworkClientProtocol`, not a concrete `URLSessionClient` |

```swift
// Interface Segregation + Dependency Inversion together
protocol UserFetching {
    func fetchUser(id: String) async throws -> User
}

final class ProfileViewModel {
    private let fetcher: UserFetching   // depends on an abstraction

    init(fetcher: UserFetching) {
        self.fetcher = fetcher
    }
}
```

**Tags:** `#oop` `#solid` `#design-principles` `#interview`
**Difficulty:** Advanced

---

## Q: When should you choose composition over inheritance in Swift?

**Answer:**
Prefer **composition** (a type holds/uses other types to get behavior) when:
- The relationship is "has-a" rather than "is-a" (a `Car` *has an* `Engine`, it isn't *an* `Engine`)
- You need to mix behaviors from multiple sources (single inheritance can't do this; protocol composition can)
- You're working with `struct`s/`enum`s, which can't inherit at all
- You want to avoid deep, fragile class hierarchies that are hard to change later

Reach for **inheritance** only when there's a genuine "is-a" relationship *and* you need to share both implementation and a common type for polymorphic storage — e.g., `UIViewController` subclasses, where the framework itself dictates the hierarchy.

```swift
// Composition: Car is built from independently-testable pieces
struct Engine { func start() { } }
struct Wheels { func roll() { } }

struct Car {
    let engine: Engine
    let wheels: Wheels
    func drive() {
        engine.start()
        wheels.roll()
    }
}
```

This mirrors the broader Swift philosophy: model "is-a" relationships with protocols and "has-a" relationships with composition, reserving class inheritance for cases the platform requires.

**Tags:** `#oop` `#composition` `#inheritance` `#interview`
**Difficulty:** Intermediate
