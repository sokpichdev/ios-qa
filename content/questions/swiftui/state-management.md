# SwiftUI

---

## Q: What is the difference between `@State`, `@Binding`, `@ObservedObject`, and `@StateObject`?

**Answer:**
These are SwiftUI's property wrappers for state management — each has a distinct ownership and lifecycle role.

| Wrapper | Owns data? | Source |
|---------|------------|--------|
| `@State` | ✅ Yes | Local to the view |
| `@Binding` | ❌ No | Passed in from parent |
| `@StateObject` | ✅ Yes | Owns the `ObservableObject` |
| `@ObservedObject` | ❌ No | Injected from outside |
| `@EnvironmentObject` | ❌ No | Injected via environment |

**Code Example:**
```swift
// Parent creates and owns the object
struct ParentView: View {
    @StateObject private var viewModel = CounterViewModel()

    var body: some View {
        ChildView(count: $viewModel.count) // passes binding
    }
}

// Child receives a binding — does not own the data
struct ChildView: View {
    @Binding var count: Int

    var body: some View {
        Button("Increment") { count += 1 }
    }
}
```

**Key Rule:**
- Use `@StateObject` when the view **creates** the object
- Use `@ObservedObject` when the object is **created elsewhere** and passed in

**Tags:** `#swiftui` `#state` `#binding` `#stateobject` `#interview`
**Difficulty:** Intermediate
**References:**
- [State — Apple Developer](https://developer.apple.com/documentation/swiftui/state)
- [StateObject — Apple Developer](https://developer.apple.com/documentation/swiftui/stateobject)
- [Managing model data in your app — Apple Developer](https://developer.apple.com/documentation/swiftui/managing-model-data-in-your-app)

---

## Q: What is `ViewBuilder` and how does it work?

**Answer:**
`@ViewBuilder` is a result builder that lets you write multiple views inside a closure and have them composed into a single view. It's what enables the DSL syntax inside `body`, `VStack`, `HStack`, etc.

**Code Example:**
```swift
// SwiftUI uses @ViewBuilder implicitly in most view builders
struct MyCard<Content: View>: View {
    let title: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading) {
            Text(title).font(.headline)
            content() // can be any number of views
        }
        .padding()
    }
}

// Usage
MyCard(title: "Summary") {
    Text("Line one")
    Text("Line two")
    Image(systemName: "star")
}
```

**Tags:** `#swiftui` `#viewbuilder` `#advanced`
**Difficulty:** Intermediate

---

## Q: When should you use `task {}` vs `onAppear {}` in SwiftUI?

**Answer:**
Both run code when a view appears, but `task {}` is purpose-built for async work.

| | `onAppear` | `task` |
|--|-----------|--------|
| Async support | ❌ No | ✅ Yes |
| Auto-cancels | ❌ No | ✅ Yes (when view disappears) |
| Retry on id change | ❌ No | ✅ With `id:` parameter |

**Code Example:**
```swift
struct ArticleView: View {
    @State private var article: Article?

    var body: some View {
        Text(article?.title ?? "Loading...")
            .task {
                // automatically cancelled if view disappears
                article = await ArticleService.fetch()
            }
    }
}
```

**Tags:** `#swiftui` `#async-await` `#concurrency` `#lifecycle`
**Difficulty:** Intermediate
