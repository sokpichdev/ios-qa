# SwiftUI — Fundamentals

---

## Q: What is the difference between `@Environment` and `@EnvironmentObject`?

**Answer:**
Both inject values from the environment, but they serve different purposes.

- `@Environment` — reads system or built-in values (color scheme, locale, font, dismiss action)
- `@EnvironmentObject` — reads a custom `ObservableObject` injected by a parent view

**Code Example:**
```swift
// @Environment — built-in system values
struct ThemeAwareView: View {
    @Environment(\.colorScheme) var colorScheme
    @Environment(\.dismiss) var dismiss

    var body: some View {
        Text(colorScheme == .dark ? "Dark mode" : "Light mode")
        Button("Close") { dismiss() }
    }
}

// @EnvironmentObject — custom shared object
class AppSettings: ObservableObject {
    @Published var fontSize: CGFloat = 16
}

struct ChildView: View {
    @EnvironmentObject var settings: AppSettings

    var body: some View {
        Text("Hello").font(.system(size: settings.fontSize))
    }
}

// Must be injected by a parent
ContentView()
    .environmentObject(AppSettings())
```

**Tags:** `#swiftui` `#environment` `#state` `#interview`

---

## Q: How does SwiftUI's diffing algorithm work?

**Answer:**
SwiftUI compares the new view tree with the previous one on every state change. It uses the structural identity of views (their type and position in the hierarchy) to determine what changed and only re-renders the minimum necessary.

**Key Points:**
- Views are value types — SwiftUI compares them cheaply
- Identity is determined by position and type, not by reference
- Using `id()` modifier lets you override identity — changing `id` destroys and recreates the view
- `equatable()` modifier lets you skip re-renders when inputs haven't changed

**Code Example:**
```swift
// SwiftUI only re-renders views whose inputs changed
struct ParentView: View {
    @State private var count = 0

    var body: some View {
        VStack {
            CounterView(count: count)  // re-renders when count changes
            StaticLabel()              // never re-renders — no dependencies
        }
    }
}

// Force recreation when id changes (e.g. reset a text field)
TextField("Name", text: $name)
    .id(resetToken)  // change resetToken to fully recreate
```

**Tags:** `#swiftui` `#performance` `#diffing` `#advanced`

---

## Q: What is `GeometryReader` and what are its pitfalls?

**Answer:**
`GeometryReader` is a container view that exposes the size and coordinate space of its parent, letting you build size-dependent layouts. However it comes with notable downsides.

**Code Example:**
```swift
struct ProportionalView: View {
    var body: some View {
        GeometryReader { geometry in
            Rectangle()
                .frame(width: geometry.size.width * 0.5,
                       height: geometry.size.height * 0.3)
        }
    }
}
```

**Pitfalls:**
- Expands to fill all available space by default — can break layouts
- Triggers layout recalculation which can hurt performance
- Avoid wrapping simple views in it unnecessarily

**Better alternatives in many cases:**
```swift
// Use .containerRelativeFrame for proportional sizing (iOS 17+)
Rectangle()
    .containerRelativeFrame(.horizontal) { size, _ in size * 0.5 }
```

**Tags:** `#swiftui` `#layout` `#geometryreader`

---

## Q: How do you animate transitions between views in SwiftUI?

**Answer:**
SwiftUI animates changes by watching state. You trigger animations by wrapping state changes in `withAnimation {}` or by attaching `.animation()` modifiers.

**Code Example:**
```swift
struct AnimatedView: View {
    @State private var isExpanded = false

    var body: some View {
        VStack {
            Button("Toggle") {
                withAnimation(.spring(duration: 0.4)) {
                    isExpanded.toggle()
                }
            }

            if isExpanded {
                Text("Expanded content")
                    .transition(.move(edge: .top).combined(with: .opacity))
            }
        }
    }
}

// Animating between two views with matchedGeometryEffect
@Namespace private var animation

// Source view
Image("thumbnail")
    .matchedGeometryEffect(id: "image", in: animation)

// Destination view
Image("thumbnail")
    .matchedGeometryEffect(id: "image", in: animation)
```

**Tags:** `#swiftui` `#animation` `#transitions`

---

## Q: What is `LazyVStack` vs `VStack` — when does it matter?

**Answer:**
`VStack` renders all its children immediately. `LazyVStack` only renders views as they become visible on screen — essential for large lists.

**Code Example:**
```swift
// VStack — all 1000 rows created immediately
ScrollView {
    VStack {
        ForEach(0..<1000) { i in
            ExpensiveRow(index: i)  // all 1000 created at once ❌
        }
    }
}

// LazyVStack — only visible rows created
ScrollView {
    LazyVStack {
        ForEach(0..<1000) { i in
            ExpensiveRow(index: i)  // only ~20 visible rows created ✅
        }
    }
}
```

**Rule of thumb:**
- Use `VStack` for small fixed lists (under ~50 items)
- Use `LazyVStack` inside `ScrollView` for dynamic or large data sets
- `List` uses lazy loading automatically

**Tags:** `#swiftui` `#performance` `#layout` `#lazy`

---

## Q: How do you handle navigation in SwiftUI using `NavigationStack`?

**Answer:**
`NavigationStack` (iOS 16+) replaces `NavigationView` and uses a path-based approach for programmatic navigation, making deep linking and state-driven navigation much cleaner.

**Code Example:**
```swift
struct AppView: View {
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            HomeView()
                .navigationDestination(for: Article.self) { article in
                    ArticleDetailView(article: article)
                }
                .navigationDestination(for: User.self) { user in
                    UserProfileView(user: user)
                }
        }
    }
}

// Navigate programmatically
path.append(someArticle)   // push
path.removeLast()          // pop
path = NavigationPath()    // pop to root
```

**Tags:** `#swiftui` `#navigation` `#navigationstack` `#interview`

---

## Q: What is `@AppStorage` and when would you use it?

**Answer:**
`@AppStorage` is a property wrapper that reads and writes to `UserDefaults` and automatically refreshes the view when the value changes. Use it for lightweight user preferences.

**Code Example:**
```swift
struct SettingsView: View {
    @AppStorage("isDarkMode") private var isDarkMode = false
    @AppStorage("fontSize") private var fontSize = 16.0
    @AppStorage("username") private var username = ""

    var body: some View {
        Form {
            Toggle("Dark Mode", isOn: $isDarkMode)
            Slider(value: $fontSize, in: 12...24)
            TextField("Username", text: $username)
        }
    }
}
```

**When to use vs not:**
- ✅ Simple user preferences (theme, font size, onboarding seen)
- ❌ Large data, sensitive data, or complex objects — use Core Data, Keychain, or a file instead

**Tags:** `#swiftui` `#appstorage` `#userdefaults` `#persistence`

---

## Q: How do you create a custom `ViewModifier`?

**Answer:**
A `ViewModifier` packages reusable view transformations into a clean, composable unit — like a custom modifier you can chain like `.padding()` or `.foregroundColor()`.

**Code Example:**
```swift
struct CardStyle: ViewModifier {
    var color: Color = .white

    func body(content: Content) -> some View {
        content
            .padding()
            .background(color)
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

// Extend View for clean call-site syntax
extension View {
    func cardStyle(color: Color = .white) -> some View {
        modifier(CardStyle(color: color))
    }
}

// Usage
Text("Hello")
    .cardStyle()

VStack { ... }
    .cardStyle(color: .blue)
```

**Tags:** `#swiftui` `#viewmodifier` `#reusability`

---

## Q: How do you pass data between a sheet and the parent view?

**Answer:**
Use `@Binding` to pass a two-way connection into the sheet, so changes inside the sheet reflect in the parent.

**Code Example:**
```swift
struct ParentView: View {
    @State private var isSheetPresented = false
    @State private var selectedColor = "Red"

    var body: some View {
        VStack {
            Text("Selected: \(selectedColor)")
            Button("Open Sheet") { isSheetPresented = true }
        }
        .sheet(isPresented: $isSheetPresented) {
            ColorPickerSheet(selectedColor: $selectedColor)
        }
    }
}

struct ColorPickerSheet: View {
    @Binding var selectedColor: String
    @Environment(\.dismiss) var dismiss

    var body: some View {
        VStack {
            ForEach(["Red", "Green", "Blue"], id: \.self) { color in
                Button(color) {
                    selectedColor = color  // updates parent
                    dismiss()
                }
            }
        }
    }
}
```

**Tags:** `#swiftui` `#sheets` `#binding` `#navigation`

---

## Q: What is the `Identifiable` protocol and why does SwiftUI need it?

**Answer:**
`Identifiable` requires a type to have a unique `id` property. SwiftUI uses this in `ForEach` and `List` to track which items are which across state changes — enabling correct animations and avoiding UI glitches.

**Code Example:**
```swift
struct Article: Identifiable {
    let id: UUID
    let title: String
}

// SwiftUI can now track each Article by id
List(articles) { article in
    Text(article.title)
}

// Without Identifiable — must provide keypath manually
List(articles, id: \.title) { article in
    Text(article.title)
}
// ⚠️ Only safe if titles are unique — id should always be truly unique
```

**Key Points:**
- `id` can be any `Hashable` type — `UUID`, `Int`, `String`
- Using a non-unique `id` causes incorrect animations and potential crashes
- `UUID()` is the safest default for new models

**Tags:** `#swiftui` `#identifiable` `#list` `#interview`
