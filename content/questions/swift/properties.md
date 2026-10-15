# Swift — Properties

---

## Q: What is the difference between a stored property and a computed property?

**Answer:**
A stored property keeps a value in the instance's memory, while a computed property stores nothing and calculates its value every time it is read.

- **Stored** — `let` or `var`, part of the instance's layout. Available on structs and classes (not enums).
- **Computed** — always `var`, defined by a `get` (and optional `set`). Available on structs, classes, **and** enums, and can be added in extensions.

**Code Example:**
```swift
struct Rectangle {
    // Stored — takes up memory in every Rectangle
    var width: Double
    var height: Double

    // Computed — derived on every access, nothing stored
    var area: Double {
        width * height
    }
}

var rect = Rectangle(width: 4, height: 5)
print(rect.area) // 20.0
rect.width = 10
print(rect.area) // 50.0 — always in sync with its inputs
```

**Key Points:**
- Extensions can add computed properties but **cannot** add stored properties.
- A computed property can never fall out of sync with the values it derives from — that is the main reason to prefer it over caching a derived value in a stored property.
- Callers expect property access to be cheap. If the work is expensive, use a method (`func calculateArea()`) or cache the result in a `lazy` / stored property instead.

**Tags:** `#swift` `#properties` `#computed-property` `#stored-property` `#interview`
**Difficulty:** Beginner
**References:**
- [Properties — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties/)

---

## Q: How do you write a computed property with both a getter and a setter?

**Answer:**
Declare a `var` with a `get` block that returns the value and a `set` block that updates the underlying stored state. The setter receives the incoming value, named `newValue` by default.

**Code Example:**
```swift
struct Temperature {
    var celsius: Double

    var fahrenheit: Double {
        get {
            celsius * 9 / 5 + 32
        }
        set(newFahrenheit) {               // explicit parameter name
            celsius = (newFahrenheit - 32) * 5 / 9
        }
    }

    var kelvin: Double {
        get { celsius + 273.15 }
        set { celsius = newValue - 273.15 } // shorthand: implicit `newValue`
    }
}

var t = Temperature(celsius: 0)
t.fahrenheit = 212
print(t.celsius) // 100.0
```

**Key Points:**
- **Shorthand setter** — omit the parameter name and use `newValue`.
- **Shorthand getter** — if the getter is a single expression, the `return` is implicit (Swift 5.1+).
- A computed property cannot be setter-only; `set` always requires a `get`.
- On a struct, the setter is implicitly `mutating`, so it can only be called on a `var` instance.

**Tags:** `#swift` `#properties` `#computed-property` `#getter` `#setter`
**Difficulty:** Beginner
**References:**
- [Properties: Computed Properties — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties/)

---

## Q: What is a read-only computed property?

**Answer:**
A read-only computed property has a getter but no setter, so it can be read but never assigned to.

**Code Example:**
```swift
struct Cuboid {
    var width = 0.0, height = 0.0, depth = 0.0

    // Full form
    var volume: Double {
        get { width * height * depth }
    }

    // Shorthand — drop the `get` keyword and braces
    var surfaceArea: Double {
        2 * (width * height + width * depth + height * depth)
    }
}

let box = Cuboid(width: 2, height: 3, depth: 4)
print(box.volume) // 24.0
// box.volume = 10 // ❌ Cannot assign to property: 'volume' is a get-only property
```

**Key Points:**
- Must still be declared with `var`, not `let` — its value can change between reads because the inputs can change.
- `let` means "this value is fixed for the instance's lifetime"; a computed property makes no such promise.
- Read-only is different from `private(set) var`, which is a **stored** property with a restricted setter.

**Tags:** `#swift` `#properties` `#computed-property` `#interview`
**Difficulty:** Beginner
**References:**
- [Properties: Read-Only Computed Properties — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties/)

---

## Q: What are `willSet` and `didSet` property observers?

**Answer:**
`willSet` runs just before a new value is stored and `didSet` runs immediately after, letting you react to every change to a property.

- `willSet` receives the incoming value as `newValue` (renamable: `willSet(newTotal)`).
- `didSet` receives the previous value as `oldValue` (renamable: `didSet(previous)`).

**Code Example:**
```swift
class StepCounter {
    var totalSteps: Int = 0 {
        willSet {
            print("About to set totalSteps to \(newValue)")
        }
        didSet {
            if totalSteps > oldValue {
                print("Added \(totalSteps - oldValue) steps")
            }
        }
    }
}

let counter = StepCounter()
counter.totalSteps = 200
// About to set totalSteps to 200
// Added 200 steps
counter.totalSteps = 360
// About to set totalSteps to 360
// Added 160 steps
```

**Common iOS uses:**
- Refresh UI when a model changes (`var items: [Item] = [] { didSet { tableView.reloadData() } }`)
- Validate or clamp a value
- Persist a setting to `UserDefaults` whenever it changes

**Key Points:**
- Observers are called on **every** set, even when the new value equals the current value.
- Observers only work on stored properties you declare, or on inherited properties via `override`.

**Tags:** `#swift` `#properties` `#willset` `#didset` `#property-observers` `#interview`
**Difficulty:** Beginner
**References:**
- [Properties: Property Observers — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties/)

---

## Q: Are `willSet` and `didSet` called when a property is set inside the initializer?

**Answer:**
No — a type's own property observers are not called while its initializer sets the property; they only fire for assignments after initialization.

**Code Example:**
```swift
class Profile {
    var name: String {
        didSet { print("name changed to \(name)") }
    }

    init(name: String) {
        self.name = name      // ❌ didSet NOT called
    }
}

let p = Profile(name: "Mia") // prints nothing
p.name = "Lina"              // ✅ "name changed to Lina"
```

**Subclass exception:**
When a subclass initializer sets a property **inherited** from its superclass, the superclass's observers *are* called — but only after `super.init()` has returned.

```swift
class Base {
    var value = 0 {
        didSet { print("Base.didSet: \(value)") }
    }
}

class Child: Base {
    override init() {
        super.init()
        value = 10   // ✅ "Base.didSet: 10"
    }
}
```

**Workaround — force observers to run during init:**
```swift
init(name: String) {
    defer { self.name = name } // runs after init's body, so didSet fires
    self.name = ""
}
```
This works but is easy to misread — prefer calling the side-effect explicitly from `init` instead.

**Tags:** `#swift` `#properties` `#didset` `#initialization` `#interview`
**Difficulty:** Intermediate
**References:**
- [Properties: Property Observers — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties/)
- [Initialization — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/initialization/)

---

## Q: Which properties can you add `willSet` / `didSet` observers to?

**Answer:**
You can add observers to stored properties you define, and to inherited stored or computed properties by overriding them in a subclass.

| Property kind | Can add observers? |
|--|--|
| Stored `var` you define | ✅ Yes |
| Inherited stored property (via `override`) | ✅ Yes |
| Inherited computed property (via `override`) | ✅ Yes |
| Computed property you define | ❌ No — put the logic in its `set` |
| `let` constant | ❌ No — it never changes |

**Code Example:**
```swift
class Vehicle {
    var currentSpeed = 0.0
    var description: String { "traveling at \(currentSpeed) mph" }
}

class Car: Vehicle {
    var gear = 1

    // Observing an inherited stored property
    override var currentSpeed: Double {
        didSet {
            gear = Int(currentSpeed / 10) + 1
        }
    }
}

let car = Car()
car.currentSpeed = 35
print(car.gear) // 4
```

**Key Points:**
- An overriding property observer cannot also provide its own setter — choose one or the other.
- You cannot add observers to an inherited **read-only** computed property, since it is never set.
- The superclass's own observers still run; the subclass's observers run around them.

**Tags:** `#swift` `#properties` `#property-observers` `#inheritance` `#override`
**Difficulty:** Intermediate
**References:**
- [Properties: Property Observers — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties/)
- [Inheritance: Overriding Property Observers — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/inheritance/)

---

## Q: What happens if you assign to a property inside its own `didSet`?

**Answer:**
The value you assign replaces the one that was just set, and the observers are not triggered again, so there is no infinite loop.

**Code Example:**
```swift
struct Volume {
    var level: Int = 0 {
        didSet {
            // Clamp into 0...100 — does NOT re-trigger didSet
            if level > 100 { level = 100 }
            if level < 0 { level = 0 }
        }
    }
}

var v = Volume()
v.level = 150
print(v.level) // 100
```

**Key Points:**
- This makes `didSet` a common place for clamping or normalizing input.
- In contrast, assigning to a property inside its **own computed setter** *does* recurse infinitely — a computed property has no storage, so `self.x = newValue` inside `x`'s `set` just calls the setter again.

```swift
var name: String {
    get { name }        // ❌ infinite recursion
    set { name = newValue }
}
```

**Tags:** `#swift` `#properties` `#didset` `#gotcha` `#interview`
**Difficulty:** Intermediate
**References:**
- [Properties: Property Observers — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties/)

---

## Q: Why does mutating an element of an array property trigger the array's `didSet`?

**Answer:**
Arrays and structs are value types, so changing anything inside them — appending, editing an element, or changing a nested field — counts as setting the whole property to a new value.

**Code Example:**
```swift
struct User {
    var name: String
}

class ViewModel {
    var users: [User] = [] {
        didSet { print("users changed: \(users.count)") }
    }
}

let vm = ViewModel()
vm.users.append(User(name: "Mia")) // ✅ didSet
vm.users[0].name = "Lina"          // ✅ didSet — nested mutation
vm.users.sort { $0.name < $1.name } // ✅ didSet
```

**If `User` were a class:**
```swift
final class User { var name: String; init(name: String) { self.name = name } }
vm.users[0].name = "Lina" // ❌ NO didSet — the array still holds the same reference
```

**Key Points:**
- Each mutation fires `didSet` once — a loop of 1,000 `append`s fires it 1,000 times. Batch changes into a local copy and assign once if the observer is expensive (e.g. reloads a table view).
- This is the same mechanism SwiftUI's `@Published` / `@State` rely on to detect value-type changes.

**Tags:** `#swift` `#properties` `#didset` `#value-types` `#interview`
**Difficulty:** Intermediate
**References:**
- [Properties: Property Observers — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties/)
- [Structures and Classes — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/classesandstructures/)

---

## Q: Do `willSet` and `didSet` fire when a property is passed as an `inout` argument?

**Answer:**
Yes — passing an observed property as `inout` always calls both `willSet` and `didSet`, even if the function never modifies the value.

**Code Example:**
```swift
var score = 10 {
    willSet { print("willSet \(newValue)") }
    didSet  { print("didSet \(oldValue) -> \(score)") }
}

func doNothing(_ value: inout Int) { }

doNothing(&score)
// willSet 10
// didSet 10 -> 10
```

**Why:**
`inout` uses **copy-in copy-out** semantics: the value is copied into the function, and when the function returns the (possibly unchanged) value is written back to the original property. That write-back is a normal set, so observers run.

**Key Points:**
- The observers fire once, at the end of the call — not for each modification inside the function.
- Mutating methods on a struct property behave the same way (`items.append(x)` is effectively an `inout` mutation of `items`).

**Tags:** `#swift` `#properties` `#inout` `#property-observers` `#gotcha`
**Difficulty:** Advanced
**References:**
- [Properties: Property Observers — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties/)
- [Declarations: In-Out Parameters — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/declarations/)

---

## Q: Why can't you change a `var` property of a struct assigned to a `let` constant?

**Answer:**
Because a struct is a value type, declaring the instance with `let` makes the entire value immutable — including all of its `var` stored properties.

**Code Example:**
```swift
struct FixedLengthRange {
    var firstValue: Int
    let length: Int
}

let range = FixedLengthRange(firstValue: 0, length: 4)
// range.firstValue = 6 // ❌ Cannot assign to property: 'range' is a 'let' constant

var mutableRange = FixedLengthRange(firstValue: 0, length: 4)
mutableRange.firstValue = 6 // ✅
// mutableRange.length = 5  // ❌ 'length' is a 'let' constant

class Box { var value = 0 }
let box = Box()
box.value = 5 // ✅ — `let` fixes the reference, not the object it points to
```

**Key Points:**
- For a **struct**, `let` freezes the value.
- For a **class**, `let` only freezes which instance the constant refers to; the instance's `var` properties stay mutable.
- The same rule explains why `mutating` methods and computed setters can't be called on a `let` struct.

**Tags:** `#swift` `#properties` `#struct` `#class` `#value-types` `#interview`
**Difficulty:** Beginner
**References:**
- [Properties: Stored Properties of Constant Structure Instances — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties/)

---

## Q: How do `{ get }` and `{ get set }` protocol property requirements differ?

**Answer:**
`{ get }` only requires that the property be readable, so any kind of property satisfies it, while `{ get set }` requires a property that is both readable and writable.

**Code Example:**
```swift
protocol Named {
    var name: String { get }
}

protocol Scored {
    var score: Int { get set }
}

struct A: Named { let name: String }            // ✅ stored let
struct B: Named { var name: String }            // ✅ stored var
struct C: Named { var name: String { "C" } }    // ✅ read-only computed

struct D: Scored { var score: Int }             // ✅ stored var
struct E: Scored {                              // ✅ computed get + set
    private var raw = 0
    var score: Int {
        get { raw }
        set { raw = max(0, newValue) }
    }
}
// struct F: Scored { let score: Int }          // ❌ not settable
```

**Key Points:**
- Protocols never specify *stored* vs *computed* — only the access requirements.
- `{ get }` is a minimum: a conforming type may still expose a setter, but code that sees only the protocol type can't use it.
- Protocol property requirements are always declared with `var`.

**Tags:** `#swift` `#properties` `#protocols` `#interview`
**Difficulty:** Intermediate
**References:**
- [Protocols: Property Requirements — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols/)

---

## Q: Can a computed property be `async` or `throw` errors?

**Answer:**
Yes — since Swift 5.5, a read-only computed property can mark its getter `async`, `throws`, or both, and callers must use `await` / `try` to read it.

**Code Example:**
```swift
struct RemoteImage {
    let url: URL

    var data: Data {
        get async throws {
            let (data, _) = try await URLSession.shared.data(from: url)
            return data
        }
    }
}

let image = RemoteImage(url: someURL)
let bytes = try await image.data
```

**Key Points:**
- Only **read-only** computed properties (and subscripts) can be effectful — a property with a setter cannot.
- Use this for values that are naturally properties but need async work, such as an actor-isolated or lazily loaded value.
- If the operation takes parameters or does heavy work, a method is still clearer.

**Tags:** `#swift` `#properties` `#computed-property` `#async-await` `#concurrency`
**Difficulty:** Advanced
**References:**
- [Properties: Read-Only Computed Properties — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties/)
- [SE-0310: Effectful Read-only Properties — Swift Evolution](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0310-effectful-readonly-properties.md)

---

## Q: When should you use a computed property versus a method or a stored property?

**Answer:**
Use a computed property for a cheap, side-effect-free value derived from existing state; use a method for expensive work, side effects, or anything that needs arguments.

| Choose | When |
|--|--|
| Stored property | The value is its own state (not derivable), or caching an expensive result is worth the sync risk |
| Computed property | Derived from other state, O(1)-ish, no side effects, reads like an attribute (`isEmpty`, `fullName`) |
| Method | Expensive (O(n) or I/O), has side effects, may fail, or takes parameters (`fetchUser()`, `distance(to:)`) |
| `lazy var` | Expensive, needed at most once, and the inputs never change afterwards |

**Code Example:**
```swift
struct Order {
    var items: [Item]

    var isEmpty: Bool { items.isEmpty }                 // ✅ cheap, derived
    var itemCount: Int { items.count }                  // ✅ cheap, derived

    func totalPrice(applying discount: Discount) -> Decimal { // ✅ method — takes input
        items.reduce(0) { $0 + $1.price } * discount.multiplier
    }
}
```

**Key Points:**
- Readers assume property access is fast — a computed property that hits disk or the network is a surprise.
- Caching a derived value in a stored property creates two sources of truth that can drift apart; prefer computed unless profiling says otherwise.

**Tags:** `#swift` `#properties` `#computed-property` `#api-design` `#interview`
**Difficulty:** Intermediate
**References:**
- [Properties — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties/)
- [API Design Guidelines — Swift.org](https://www.swift.org/documentation/api-design-guidelines/)
