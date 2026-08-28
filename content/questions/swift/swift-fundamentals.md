# Swift — Fundamentals

---

## Q: What is `Optional` and how does it work?

**Answer:**
An `Optional` is a type that can hold either a value or `nil`. It's Swift's way of expressing the absence of a value safely, avoiding null pointer crashes common in Objective-C.

**Code Example:**
```swift
var name: String? = "Alice"  // Optional String
var age: Int? = nil          // no value

// Unwrapping safely
if let name = name {
    print("Hello, \(name)")
}

// Nil coalescing — provide a default
let displayName = name ?? "Guest"

// Optional chaining — safely access properties
let count = name?.count  // returns Int? not Int
```

**Key Points:**
- `String?` is shorthand for `Optional<String>`
- Never force unwrap (`!`) unless you are 100% certain it has a value
- Prefer `if let`, `guard let`, or `??` for safe unwrapping

**Tags:** `#swift` `#optional` `#interview`
**Difficulty:** Intermediate
**References:**
- [The Basics: Optionals — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/thebasics/)

---

## Q: What is `guard let` vs `if let`?

**Answer:**
Both safely unwrap optionals, but they differ in scope and intent.

- `if let` — unwrapped value exists only inside the `if` block
- `guard let` — unwrapped value exists in the surrounding scope after the check; must exit early if condition fails

**Code Example:**
```swift
// if let — value scoped inside the block
if let username = getUsername() {
    print("Welcome, \(username)")
}
// username not accessible here

// guard let — value available after the guard
func greetUser() {
    guard let username = getUsername() else {
        print("No user")
        return  // must exit
    }
    // username accessible here for the rest of the function
    print("Welcome, \(username)")
}
```

**Rule of thumb:** Use `guard let` for preconditions at the top of a function. Use `if let` when the unwrapped value is only needed in one branch.

**Tags:** `#swift` `#optional` `#guard` `#interview`
**Difficulty:** Intermediate

---

## Q: What is `Codable` and how does it work?

**Answer:**
`Codable` is a type alias for `Encodable & Decodable`. It lets you convert Swift types to and from external formats like JSON with minimal boilerplate. The compiler auto-synthesizes the implementation if property names match the JSON keys.

**Code Example:**
```swift
struct User: Codable {
    let id: Int
    let name: String
    let email: String
}

// Decoding JSON → Swift
let json = """
{ "id": 1, "name": "Alice", "email": "alice@example.com" }
""".data(using: .utf8)!

let user = try JSONDecoder().decode(User.self, from: json)
print(user.name) // "Alice"

// Encoding Swift → JSON
let encoded = try JSONEncoder().encode(user)

// Custom key mapping
struct Article: Codable {
    let title: String
    let publishedAt: Date

    enum CodingKeys: String, CodingKey {
        case title
        case publishedAt = "published_at"  // maps snake_case to camelCase
    }
}
```

**Tags:** `#swift` `#codable` `#json` `#networking` `#interview`
**Difficulty:** Intermediate
**References:**
- [Codable — Apple Developer](https://developer.apple.com/documentation/swift/codable)

---

## Q: What is the difference between `map`, `flatMap`, and `compactMap`?

**Answer:**
All three transform collections but handle the results differently.

| Function | Use case |
|----------|----------|
| `map` | Transform each element, keep all results |
| `compactMap` | Transform and remove `nil` results |
| `flatMap` | Transform and flatten nested collections |

**Code Example:**
```swift
let numbers = [1, 2, 3, 4]

// map — transforms every element
let doubled = numbers.map { $0 * 2 }
// [2, 4, 6, 8]

// compactMap — removes nils
let strings = ["1", "two", "3", "four"]
let integers = strings.compactMap { Int($0) }
// [1, 3]

// flatMap — flattens nested arrays
let nested = [[1, 2], [3, 4], [5, 6]]
let flat = nested.flatMap { $0 }
// [1, 2, 3, 4, 5, 6]
```

**Tags:** `#swift` `#collections` `#functional` `#interview`
**Difficulty:** Intermediate

---

## Q: What is `lazy` property and when is it useful?

**Answer:**
A `lazy` property is only computed the first time it is accessed. Useful for expensive operations you may not always need.

**Code Example:**
```swift
class DataProcessor {
    // Only created when first accessed
    lazy var expensiveData: [String] = {
        print("Computing...")
        return loadFromDisk() // expensive operation
    }()
}

let processor = DataProcessor()
// expensiveData not computed yet
let data = processor.expensiveData // computed now, cached after
let again = processor.expensiveData // returned from cache, no recompute
```

**Key Points:**
- Must be `var`, not `let`
- Not thread-safe by default — use care in concurrent contexts
- Great for views, formatters, and other setup-heavy properties

**Tags:** `#swift` `#lazy` `#performance`
**Difficulty:** Intermediate

---

## Q: What is `Result` type and when should you use it?

**Answer:**
`Result<Success, Failure>` is an enum with `.success` and `.failure` cases. It makes error handling explicit and is ideal for async operations, replacing optional + error patterns.

**Code Example:**
```swift
enum NetworkError: Error {
    case badURL
    case noData
    case decodingFailed
}

func fetchUser(id: Int, completion: @escaping (Result<User, NetworkError>) -> Void) {
    guard let url = URL(string: "https://api.example.com/users/\(id)") else {
        completion(.failure(.badURL))
        return
    }
    // ... network call
    completion(.success(user))
}

// Usage
fetchUser(id: 1) { result in
    switch result {
    case .success(let user):
        print("Got user: \(user.name)")
    case .failure(let error):
        print("Error: \(error)")
    }
}
```

**Tags:** `#swift` `#error-handling` `#result` `#interview`
**Difficulty:** Intermediate

---

## Q: What is `Hashable`, `Equatable`, and `Comparable`?

**Answer:**
These protocols define how types support equality checks, hashing, and ordering.

- `Equatable` — can compare with `==`
- `Hashable` — can be used as dictionary keys or in sets (requires `Equatable`)
- `Comparable` — can be ordered with `<`, `>`, etc.

**Code Example:**
```swift
struct Point: Hashable, Comparable {
    let x: Int
    let y: Int

    // Comparable — sort by x, then y
    static func < (lhs: Point, rhs: Point) -> Bool {
        lhs.x == rhs.x ? lhs.y < rhs.y : lhs.x < rhs.x
    }
}

let points: Set<Point> = [Point(x: 1, y: 2), Point(x: 3, y: 4)]
let sorted = points.sorted() // works because of Comparable
```

**Note:** Swift auto-synthesizes `Equatable` and `Hashable` for structs if all stored properties conform.

**Tags:** `#swift` `#protocols` `#hashable` `#equatable`
**Difficulty:** Intermediate

---

## Q: What is `@propertyWrapper` and how do you create one?

**Answer:**
A property wrapper adds custom logic around getting and setting a property. SwiftUI's `@State`, `@Binding`, and `@Published` are all property wrappers.

**Code Example:**
```swift
@propertyWrapper
struct Clamped {
    private var value: Int
    let range: ClosedRange<Int>

    var wrappedValue: Int {
        get { value }
        set { value = min(max(newValue, range.lowerBound), range.upperBound) }
    }

    init(wrappedValue: Int, _ range: ClosedRange<Int>) {
        self.range = range
        self.value = min(max(wrappedValue, range.lowerBound), range.upperBound)
    }
}

struct Player {
    @Clamped(0...100) var health: Int = 100
}

var player = Player()
player.health = 150  // clamped to 100
player.health = -10  // clamped to 0
```

**Tags:** `#swift` `#propertywrapper` `#advanced`
**Difficulty:** Intermediate

---

## Q: What is `some` keyword (opaque types)?

**Answer:**
`some` declares an opaque return type — the function returns a specific concrete type that conforms to a protocol, but the caller doesn't need to know which type it is. Used heavily in SwiftUI's `body: some View`.

**Code Example:**
```swift
// Without some — must specify exact type (often impossible with complex views)
func makeView() -> VStack<TupleView<(Text, Text)>> { ... } // ugly

// With some — hides the concrete type
func makeView() -> some View {
    VStack {
        Text("Hello")
        Text("World")
    }
}

// Also useful for protocols with associated types
protocol Shape {
    func area() -> Double
}

func makeShape() -> some Shape {
    Circle(radius: 5)
}
```

**Key difference from `any`:** `some` is a specific type (compiler-optimized), `any` is a type-erased existential (runtime overhead).

**Tags:** `#swift` `#opaque-types` `#swiftui` `#advanced`
**Difficulty:** Intermediate
**References:**
- [Opaque and Boxed Protocol Types — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/opaquetypes/)

---

## Q: What is copy-on-write (COW) and which types use it?

**Answer:**
Copy-on-write means a value type shares its underlying storage with copies until one of them is mutated — only then is a real copy made. This makes copying large collections cheap.

**Code Example:**
```swift
var array1 = [1, 2, 3, 4, 5]
var array2 = array1  // no copy yet — shared storage

array2.append(6)     // copy happens NOW — array1 is unaffected

print(array1) // [1, 2, 3, 4, 5]
print(array2) // [1, 2, 3, 4, 5, 6]
```

**Types that use COW in Swift:**
- `Array`
- `Dictionary`
- `Set`
- `String`
- `Data`

**Note:** Custom structs do NOT get COW automatically. You have to implement it manually if needed.

**Tags:** `#swift` `#memory` `#performance` `#cow` `#interview`
**Difficulty:** Intermediate

---

## Q: What is the difference between `static` and `class` functions and variables in Swift?

**Answer:**
Both `static` and `class` define type-level properties and methods, but `static` members cannot be overridden by subclasses (final), whereas `class` members allow dynamic dispatch and can be overridden.

| Feature | `static` | `class` |
|---|---|---|
| **Can be overridden?** | No (implicitly `final`) | Yes (supports polymorphism) |
| **Supported types** | `class`, `struct`, `enum`, `actor`, `protocol` | `class` only (and class-bound protocols) |
| **Stored properties** | Yes (`static let` / `static var`) | No (computed properties only) |
| **Dispatch mechanism** | Static / direct dispatch (fast) | Dynamic / table dispatch |
| **Equivalence** | `static func` is equivalent to `class final func` | `class func` |

**Code Example:**
```swift
class Vehicle {
    // static stored property (lazy & thread-safe)
    static let defaultWheelCount = 4

    // static method — CANNOT be overridden
    static func generalInfo() -> String {
        return "Vehicles are used for transportation."
    }

    // class computed property — CAN be overridden
    class var category: String {
        return "Generic Vehicle"
    }

    // class method — CAN be overridden
    class func maxSpeed() -> Int {
        return 120
    }
}

class SportsCar: Vehicle {
    // ❌ Error: Cannot override static method
    // override static func generalInfo() -> String { ... }

    // ✅ OK: Overriding class computed property
    override class var category: String {
        return "High Performance Vehicle"
    }

    // ✅ OK: Overriding class method
    override class func maxSpeed() -> Int {
        return 300
    }
}
```

**Key Points:**
- `static` is available across structs, enums, actors, and classes; `class` is strictly for class types.
- `static let / var` stored properties are lazily initialized on first access and guaranteed thread-safe (via `dispatch_once` under the hood).
- In protocols, type requirements are always declared using `static`. Conforming classes can implement them with either `static` (to prevent subclass overrides) or `class` (to allow subclass overrides).
- Prefer `static` by default unless you explicitly intend for subclasses to override the behavior.

**Tags:** `#swift` `#oop` `#static` `#class` `#methods` `#properties` `#interview`
**Difficulty:** Intermediate
**References:**
- [Methods: Type Methods — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/methods/)
- [Properties: Type Properties — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties/)
- [What's the difference between a static variable and a class variable? — Hacking with Swift](https://www.hackingwithswift.com/example-code/language/whats-the-difference-between-a-static-variable-and-a-class-variable)
- [What is the difference between static func and class func in Swift? — Stack Overflow](https://stackoverflow.com/questions/25156377/what-is-the-difference-between-static-func-and-class-func-in-swift)
- [The difference between static vs class function in Swift — Medium](https://medium.com/@nguyentrongbang/the-difference-between-static-vs-class-function-in-swift-can-screw-you-c2501b494ff6)
