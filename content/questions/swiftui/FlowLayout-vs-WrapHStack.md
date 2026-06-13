# FlowLayout vs WrapHStack

## Q: What is the difference between `FlowLayout` and `WrapHStack` for wrapping tag-style views in SwiftUI?

`FlowLayout` uses the **`Layout` protocol** (iOS 16+) — SwiftUI's official first-party layout system. You implement `sizeThatFits` (return required size given a proposal) and `placeSubviews` (position children in final bounds). It's clean, zero-boilerplate, and participates correctly in the layout system.

`WrapHStack` is a **`View`**, not a `Layout`. It measures its own width with `GeometryReader` and positions children manually using `alignmentGuide` inside a `ZStack`. Height is reported via a `PreferenceKey` two-pass trick: render → measure → resize with `@State var totalHeight`.

| | `FlowLayout` | `WrapHStack` |
|---|---|---|
| Approach | `Layout` protocol | `View` + `GeometryReader` |
| Width source | Layout proposal | `GeometryReader` (actual rendered) |
| Height reporting | Returned from `sizeThatFits` | Measured via `PreferenceKey` |
| Works in `ScrollView` | ❌ Unreliable | ✅ Reliable |
| Accepts any content | ✅ Yes | ❌ Needs `RandomAccessCollection` |
| Spacing configurable | ✅ Both axes | ❌ Row spacing hardcoded |
| iOS version | iOS 16+ | Any |

**Tags:** swiftui, layout, flowlayout, wraplayout, scrollview
**Difficulty:** Intermediate

---

## Q: Why does `FlowLayout` (using the `Layout` protocol) break inside a `ScrollView`?

Inside a `ScrollView`, SwiftUI's vertical scroll direction makes height unconstrained. In some layout passes, `proposal.width` can arrive as `nil`. `FlowLayout` falls back to `.infinity` → items never wrap → height calculation is wrong → views overlap.

The root cause: `FlowLayout` relies on the parent correctly proposing a finite width via `proposal.width`. `ScrollView` doesn't always guarantee this.

`WrapHStack` avoids this entirely because `GeometryReader` reads the *actual rendered frame width*, bypassing the layout proposal system.

**Tags:** swiftui, layout, scrollview, flowlayout, bug
**Difficulty:** Intermediate

---

## Q: How do you implement a wrapping flow layout using the SwiftUI `Layout` protocol?

```swift
struct FlowLayout: Layout {
    var horizontalSpacing: CGFloat = 12
    var verticalSpacing: CGFloat = 12

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        var width: CGFloat = 0
        var height: CGFloat = 0
        var rowHeight: CGFloat = 0
        let maxWidth = proposal.width ?? .infinity

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if width + size.width > maxWidth {
                width = 0
                height += rowHeight + verticalSpacing
                rowHeight = 0
            }
            width += size.width + horizontalSpacing
            rowHeight = max(rowHeight, size.height)
        }

        height += rowHeight
        return CGSize(width: maxWidth, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x: CGFloat = bounds.minX
        var y: CGFloat = bounds.minY
        var rowHeight: CGFloat = 0
        let maxWidth = bounds.width

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth {
                x = bounds.minX
                y += rowHeight + verticalSpacing
                rowHeight = 0
            }
            subview.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(size))
            x += size.width + horizontalSpacing
            rowHeight = max(rowHeight, size.height)
        }
    }
}
```

**Tags:** swiftui, layout, flowlayout, ios16
**Difficulty:** Intermediate

---

## Q: How do you implement `WrapHStack` — a flow layout that reliably wraps inside a `ScrollView`?

Use `GeometryReader` to get the real container width, `alignmentGuide` to position items, and a `PreferenceKey` to measure and report total height:

```swift
struct WrapHStack<Data: RandomAccessCollection, Content: View, ID: Hashable>: View {
    let items: Data
    let idKey: KeyPath<Data.Element, ID>
    let content: (Data.Element) -> Content

    @State private var totalHeight = CGFloat.zero

    var body: some View {
        GeometryReader { geometry in
            self.generateContent(in: geometry)
        }
        .frame(height: totalHeight)
    }

    private func generateContent(in geometry: GeometryProxy) -> some View {
        var width = CGFloat.zero
        var height = CGFloat.zero
        let rowSpacing: CGFloat = 5
        let maxWidth = geometry.size.width

        return ZStack(alignment: .topLeading) {
            ForEach(items, id: idKey) { item in
                content(item)
                    .padding(.horizontal, 4)
                    .alignmentGuide(.leading) { d in
                        if abs(width - d.width) > maxWidth {
                            width = 0
                            height -= d.height + rowSpacing
                        }
                        let result = width
                        if item[keyPath: idKey] == items.last?[keyPath: idKey] { width = 0 }
                        else { width -= d.width }
                        return result
                    }
                    .alignmentGuide(.top) { _ in
                        let result = height
                        if item[keyPath: idKey] == items.last?[keyPath: idKey] { height = 0 }
                        return result
                    }
            }
        }
        .background(viewHeightReader($totalHeight))
    }

    private func viewHeightReader(_ binding: Binding<CGFloat>) -> some View {
        GeometryReader { geometry in
            Color.clear
                .preference(key: ViewHeightKey.self, value: geometry.size.height)
        }
        .onPreferenceChange(ViewHeightKey.self) { binding.wrappedValue = $0 }
    }
}
```

**Limitations:** requires `RandomAccessCollection` input (no inline content), row spacing is hardcoded to 5, adds `.padding(.horizontal, 4)` to every item.

**Tags:** swiftui, layout, wraplayout, scrollview, geometryreader, preferencekey
**Difficulty:** Intermediate
