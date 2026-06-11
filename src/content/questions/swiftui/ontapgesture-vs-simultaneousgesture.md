# onTapGesture vs onSimultaneousGesture

## Q: When should you use .onTapGesture vs .onSimultaneousGesture in SwiftUI?

Use `.onTapGesture` for standard taps, and `.onSimultaneousGesture` when you need two gestures to fire together without one cancelling the other.

**Use `.onTapGesture` when:**

- A button-like element (e.g., chat bubble, emoji button)
- Opening a bottom sheet
- Selecting an item from a list
- Toggling a state (expand/collapse)

**Use `.onSimultaneousGesture` when:**

- A scroll view needs a tap gesture (avoid losing scrolling)
- A draggable view that still detects taps
- A long press that shouldn't block taps
- Multi-gesture components (like a map: drag + tap markers)

```swift
// Standard tap — cancels scroll gesture
ScrollView {
    Text("Hello")
        .onTapGesture { print("tapped") }  // blocks scroll in some cases
}

// Simultaneous — both gestures fire independently
ScrollView {
    Text("Hello")
        .onSimultaneousGesture(TapGesture().onEnded {
            print("tapped without blocking scroll")
        })
}
```

**Common Misunderstanding:**

`.onSimultaneousGesture` is not a replacement for `.onTapGesture`.

| Modifier | Purpose |
|----------|---------|
| `.onTapGesture` | Detecting taps — exclusive, can cancel competing gestures |
| `.onSimultaneousGesture` | Combining gestures without conflict — both fire at once |

> Use `.onTapGesture` by default. Only switch to `.onSimultaneousGesture` when you notice a parent gesture (like `ScrollView`) is being blocked.

**Tags:** swiftui, gestures, ontapgesture, simultaneousgesture, scrollview
**Difficulty:** Intermediate
