# Swift Array Optionals

## Q: What is the difference between [Obj], [Obj?], [Obj]?, and [Obj?]? in Swift?

These four declarations differ in two dimensions: whether the **array itself** is optional, and whether the **elements inside** are optional.

**Jump to:** [Plain Array](#1-obj--plain-array) · [Array of Optionals](#2-obj--array-of-optionals) · [Optional Array](#3-obj--optional-array) · [Optional Array of Optionals](#4-obj--optional-array-of-optionals) · [Quick Decision Guide](#quick-decision-guide)

---

**The 4 Variations:**

```swift
var items: [Obj]    // Array NOT optional, elements NOT nil
var items: [Obj?]   // Array NOT optional, elements CAN be nil
var items: [Obj]?   // Array IS optional, elements NOT nil
var items: [Obj?]?  // Array IS optional, elements CAN be nil
```

| Declaration | Array can be nil? | Elements can be nil? |
|------------|-------------------|----------------------|
| `[Obj]`    | No                | No                   |
| `[Obj?]`   | No                | Yes                  |
| `[Obj]?`   | Yes               | No                   |
| `[Obj?]?`  | Yes               | Yes                  |

---

### 1. `[Obj]` — Plain Array

The safest and most common. Array always exists, all elements are real objects.

```swift
var items: [String] = []

items = ["Apple", "Banana"]   // OK
items = nil                   // ERROR - cannot be nil
items.append(nil)             // ERROR - elements cannot be nil

// No unwrapping needed
for item in items {
    print(item.uppercased())  // always safe
}
```

---

### 2. `[Obj?]` — Array of Optionals

Array always exists, but **individual elements** might be `nil` (e.g., gaps in data).

```swift
var items: [String?] = []

items = ["Apple", nil, "Cherry"]  // nil elements OK
items = nil                        // ERROR - array itself cannot be nil

// Must unwrap each element
for item in items {
    if let item = item {
        print(item.uppercased())
    } else {
        print("empty slot")
    }
}
```

> **Real-world use case:** A list of optional user inputs, or API data where some fields may be missing.

---

### 3. `[Obj]?` — Optional Array

The **array itself** might not exist yet, but if it does, all elements are real.

```swift
var items: [String]? = nil

items = ["Apple", "Banana"]  // OK
items = nil                   // OK

// Must unwrap the array first
if let items = items {
    for item in items {
        print(item.uppercased())  // always a String here
    }
}

// Or use optional chaining
let count = items?.count ?? 0
```

> **Real-world use case:** A list that hasn't been loaded yet (e.g., waiting for an API response).

---

### 4. `[Obj?]?` — Optional Array of Optionals

The most flexible (and most complex). Both the array and its elements can be `nil`.

```swift
var items: [String?]? = nil

items = ["Apple", nil, "Cherry"]  // OK
items = nil                        // OK

// Must unwrap array AND each element
if let items = items {
    for item in items {
        print(item ?? "empty")
    }
}
```

> **Real-world use case:** An optional dataset where rows themselves can have missing values.

---

### Quick Decision Guide

```
Do you need the array to possibly not exist?
  |
  +-- YES → [Obj]?  or  [Obj?]?
  +-- NO  → [Obj]   or  [Obj?]
              |
              Do you need elements to possibly be nil?
                |
                +-- YES → [Obj?]  or  [Obj?]?
                +-- NO  → [Obj]   or  [Obj]?
```

> **Rule of thumb:** Start with `[Obj]` and only add `?` when you have a clear reason to.

**Tags:** swift, optionals, arrays, nil, type-safety
**Difficulty:** Beginner
