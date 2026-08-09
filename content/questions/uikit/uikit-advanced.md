# UIKit — Advanced

---

## Q: What is delegation and how does it compare to closures and target-action?

**Answer:**
Delegation is a pattern where one object hands off responsibility to another through a protocol, letting a child communicate back to its owner without knowing its concrete type. UIKit uses it everywhere — `UITableViewDelegate`, `UITextFieldDelegate`, `UIScrollViewDelegate` — and the delegate property is always `weak` to break the retain cycle that would otherwise form between parent and child.

**Code Example:**
```swift
// 1. Delegation — best for multiple related callbacks
protocol PaymentViewDelegate: AnyObject {   // AnyObject required for weak
    func paymentViewDidTapPay(_ view: PaymentView, amount: Decimal)
    func paymentViewDidCancel(_ view: PaymentView)
}

final class PaymentView: UIView {
    weak var delegate: PaymentViewDelegate?  // weak — parent owns us, we don't own parent

    @objc private func payTapped() {
        delegate?.paymentViewDidTapPay(self, amount: total)
    }
}

// 2. Closure — best for a single callback, keeps call site local
final class TipView: UIView {
    var onPay: ((Decimal) -> Void)?
}

tipView.onPay = { [weak self] amount in       // [weak self] — view retains the closure
    self?.processPayment(amount)
}

// 3. Target-action — the Objective-C control mechanism
payButton.addTarget(self, action: #selector(payTapped), for: .touchUpInside)
// iOS 14+ modern equivalent, closure-based:
payButton.addAction(UIAction { [weak self] _ in self?.processPayment() }, for: .touchUpInside)
```

**Key Points:**
- Use **delegation** when there are several callbacks, or one needs a return value (`tableView(_:numberOfRowsInSection:)`)
- Use **closures** for one-off callbacks — less boilerplate, but always capture `self` weakly
- Use **target-action** only for `UIControl` subclasses; prefer `UIAction` on iOS 14+
- `weak var delegate` + `protocol X: AnyObject` is the rule — forgetting `weak` leaks the view controller

**Tags:** `#uikit` `#delegation` `#closures` `#patterns` `#interview`
**Difficulty:** Intermediate
**References:**
- [Using delegates to customize object behavior — Apple Developer](https://developer.apple.com/documentation/swift/using-delegates-to-customize-object-behavior)
- [UIControl — Apple Developer](https://developer.apple.com/documentation/uikit/uicontrol)

---

## Q: What is a diffable data source and why does it replace `reloadData`?

**Answer:**
A diffable data source is a data source that you drive with immutable snapshots of `Hashable` identifiers instead of index-path callbacks, and it computes the inserts, deletes, and moves for you. It eliminates the entire class of "invalid number of rows" crashes caused by the model and the `performBatchUpdates` calls falling out of sync.

**Code Example:**
```swift
enum Section: Hashable { case pinned, all }

struct Contact: Hashable, Identifiable {
    let id: UUID
    let name: String
    let isPinned: Bool
}

final class ContactsViewController: UIViewController {

    private var dataSource: UICollectionViewDiffableDataSource<Section, Contact.ID>!
    private var contactsByID: [Contact.ID: Contact] = [:]

    private func makeDataSource() {
        let cellReg = UICollectionView.CellRegistration<UICollectionViewListCell, Contact.ID> {
            [weak self] cell, _, id in
            var config = cell.defaultContentConfiguration()
            config.text = self?.contactsByID[id]?.name
            cell.contentConfiguration = config
        }

        dataSource = UICollectionViewDiffableDataSource(collectionView: collectionView) {
            collectionView, indexPath, id in
            collectionView.dequeueConfiguredReusableCell(using: cellReg, for: indexPath, item: id)
        }
    }

    private func apply(_ contacts: [Contact], animated: Bool = true) {
        var snapshot = NSDiffableDataSourceSnapshot<Section, Contact.ID>()
        snapshot.appendSections([.pinned, .all])
        snapshot.appendItems(contacts.filter(\.isPinned).map(\.id), toSection: .pinned)
        snapshot.appendItems(contacts.map(\.id), toSection: .all)
        dataSource.apply(snapshot, animatingDifferences: animated)  // diffs + animates for you
    }
}

// Compositional layout — list appearance with a header
let layout = UICollectionViewCompositionalLayout { _, environment in
    var config = UICollectionLayoutListConfiguration(appearance: .insetGrouped)
    config.headerMode = .supplementary
    return .list(using: config, layoutEnvironment: environment)
}
```

**Key Points:**
- Section and item types must be `Hashable`, and each item's hash must be **stable and unique** — prefer an `ID` over the whole model, otherwise editing a field reads as delete + insert
- `apply(_:animatingDifferences:)` is safe to call from a background queue as long as you're consistent; on iOS 15+ use `await dataSource.apply(snapshot)`
- Use `reconfigureItems` (iOS 15+) instead of `reloadItems` to update a visible cell in place without recreating it
- Pairs naturally with `UICollectionViewCompositionalLayout` and `CellRegistration`, which remove the `register`/`reuseIdentifier` string dance

**Tags:** `#uikit` `#collectionview` `#diffabledatasource` `#compositionallayout` `#interview`
**Difficulty:** Advanced
**References:**
- [UICollectionViewDiffableDataSource — Apple Developer](https://developer.apple.com/documentation/uikit/uicollectionviewdiffabledatasource)
- [NSDiffableDataSourceSnapshot — Apple Developer](https://developer.apple.com/documentation/uikit/nsdiffabledatasourcesnapshot)

---

## Q: What is the difference between `setNeedsLayout`, `layoutIfNeeded`, and `setNeedsDisplay`?

**Answer:**
`setNeedsLayout` schedules a layout pass for later, `layoutIfNeeded` forces any pending layout to happen immediately, and `setNeedsDisplay` schedules a redraw of the view's content. The first two drive `layoutSubviews` and reposition subviews; the third drives `draw(_:)` and repaints pixels, and they run at different points in the frame.

**Code Example:**
```swift
// Deferred — coalesced, runs once before the next frame is drawn. Cheap, prefer this.
view.setNeedsLayout()

// Synchronous — flushes the pending layout pass immediately. Use only when you need
// final frames right now (e.g. before measuring, or to animate constraint changes).
view.layoutIfNeeded()

// Redraw content — triggers draw(_:) on the next cycle, not layoutSubviews.
customChartView.setNeedsDisplay()

// The classic constraint-animation idiom:
view.layoutIfNeeded()                 // 1. flush pending layout so we start from a known state
heightConstraint.constant = 200       // 2. change the constraint
UIView.animate(withDuration: 0.3) {
    self.view.layoutIfNeeded()        // 3. animate to the new layout inside the block
}
// Without step 3 the constraint just snaps — constraints animate by animating the layout pass.

// Measuring after a data change
label.text = "New longer text"
label.setNeedsLayout()
label.layoutIfNeeded()
print(label.frame.height)             // now correct; without layoutIfNeeded it's stale
```

**Key Points:**
- Never call `layoutSubviews()` or `draw(_:)` directly — mark dirty and let UIKit schedule the pass
- `setNeedsLayout` calls are coalesced, so calling it in a loop costs nothing; `layoutIfNeeded` is real work every time
- `setNeedsUpdateConstraints` / `updateConstraintsIfNeeded` are the same pairing one stage earlier, for `updateConstraints()`
- Order per frame: update constraints → layout (`layoutSubviews`) → display (`draw(_:)`)

**Tags:** `#uikit` `#layout` `#autolayout` `#rendering` `#interview`
**Difficulty:** Intermediate
**References:**
- [setNeedsLayout() — Apple Developer](https://developer.apple.com/documentation/uikit/uiview/setneedslayout())
- [layoutIfNeeded() — Apple Developer](https://developer.apple.com/documentation/uikit/uiview/layoutifneeded())
- [setNeedsDisplay() — Apple Developer](https://developer.apple.com/documentation/uikit/uiview/setneedsdisplay())

---

## Q: What is view controller containment and when should you use a child view controller?

**Answer:**
View controller containment is the API for embedding one view controller inside another so the child keeps its own lifecycle. It requires a specific three-step sequence — `addChild`, add the view, then `didMove(toParent:)` — with a mirrored sequence for removal. It's how `UINavigationController` and `UITabBarController` are built, and how you break a large screen into independently owned pieces instead of a 1,000-line view controller.

**Code Example:**
```swift
extension UIViewController {

    func add(_ child: UIViewController, to container: UIView) {
        addChild(child)                       // 1. establish the parent-child relationship
        container.addSubview(child.view)      // 2. add the view and lay it out
        child.view.frame = container.bounds
        child.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        child.didMove(toParent: self)         // 3. tell the child the move finished
    }

    func remove() {
        guard parent != nil else { return }
        willMove(toParent: nil)               // 1. tell the child it's about to leave
        view.removeFromSuperview()            // 2. remove the view
        removeFromParent()                    // 3. break the relationship
    }
}

// Swapping content — e.g. loading → loaded → error states
func showState(_ state: State) {
    children.forEach { $0.remove() }
    switch state {
    case .loading: add(LoadingViewController(), to: containerView)
    case .loaded(let items): add(ListViewController(items: items), to: containerView)
    case .error(let e): add(ErrorViewController(error: e), to: containerView)
    }
}

// Hosting SwiftUI is containment too
let host = UIHostingController(rootView: ProfileView())
add(host, to: containerView)
```

**Key Points:**
- Skipping `addChild`/`didMove` breaks `viewWillAppear`, trait collection changes, rotation, and `preferredStatusBarStyle` forwarding to the child
- The asymmetry trips people up: **adding** calls `didMove(toParent:)` at the end; **removing** calls `willMove(toParent: nil)` at the start (`addChild` and `removeFromParent` call the other half for you)
- Use it for reusable sub-screens, state swapping, and hosting SwiftUI via `UIHostingController` — not for anything that's just a view with no lifecycle needs
- The parent **strongly** retains children in its `children` array, so always `remove()` when swapping

**Tags:** `#uikit` `#viewcontroller` `#containment` `#architecture` `#interview`
**Difficulty:** Intermediate
**References:**
- [Creating a custom container view controller — Apple Developer](https://developer.apple.com/documentation/uikit/creating-a-custom-container-view-controller)
- [addChild(_:) — Apple Developer](https://developer.apple.com/documentation/uikit/uiviewcontroller/addchild(_:))

---

## Q: What is `UIViewPropertyAnimator` and how does it differ from `UIView.animate`?

**Answer:**
`UIViewPropertyAnimator` is an object that owns an animation, which makes that animation interruptible, reversible, and scrubbable. You can pause it mid-flight, read and set `fractionComplete`, reverse its direction, and resume it — `UIView.animate` is fire-and-forget: once started you cannot inspect it, retarget it, or drive it from a gesture.

**Code Example:**
```swift
// Fire-and-forget — still the right call for simple, uninterruptible animations
UIView.animate(withDuration: 0.3) {
    self.card.alpha = 1
}

// Interactive, gesture-driven sheet
final class SheetController: UIViewController {

    private var animator: UIViewPropertyAnimator?

    @objc func handlePan(_ gesture: UIPanGestureRecognizer) {
        let translation = gesture.translation(in: view).y

        switch gesture.state {
        case .began:
            animator = UIViewPropertyAnimator(duration: 0.4, dampingRatio: 0.8) {
                self.sheet.transform = CGAffineTransform(translationX: 0, y: -400)
            }
            animator?.pauseAnimation()          // pause so we can scrub it manually

        case .changed:
            animator?.fractionComplete = -translation / 400   // drive it with the finger

        case .ended:
            let velocity = gesture.velocity(in: view).y
            animator?.isReversed = velocity > 0               // flick down → play backwards
            animator?.continueAnimation(
                withTimingParameters: UISpringTimingParameters(dampingRatio: 0.8),
                durationFactor: 0
            )

        default: break
        }
    }
}

// Custom timing curves and staged work
let animator = UIViewPropertyAnimator(duration: 0.5, curve: .easeOut) {
    self.header.transform = .init(scaleX: 1.2, y: 1.2)
}
animator.addAnimations({ self.header.alpha = 0 }, delayFactor: 0.5)  // second half only
animator.addCompletion { position in
    print(position == .end ? "finished" : "reversed or stopped")
}
animator.startAnimation()
```

**Key Points:**
- Only `UIViewPropertyAnimator` gives you `fractionComplete`, `pauseAnimation()`, `isReversed`, and `stopAnimation(_:)` — the building blocks of any interactive transition
- Hold a strong reference to the animator; a local one deallocates and the animation stops
- `stopAnimation(false)` freezes the presentation values, then `finishAnimation(at:)` commits them — `stopAnimation(true)` leaves the model layer untouched
- Reach for `UIView.animate` when the animation just needs to run to completion; the extra API isn't free in complexity

**Tags:** `#uikit` `#animation` `#uiviewpropertyanimator` `#interactive` `#interview`
**Difficulty:** Advanced
**References:**

---
