# UIKit — Fundamentals

---

## Q: What is the `UIViewController` lifecycle?

**Answer:**
A `UIViewController` goes through a predictable sequence of method calls as its view is created, displayed, and removed.

```
init → loadView → viewDidLoad → viewWillAppear → viewDidAppear
                                                        ↓
                               viewWillDisappear → viewDidDisappear → deinit
```

**Key methods and their purpose:**
```swift
class MyViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        // Called once — set up UI, configure views, add subviews
        setupUI()
        bindViewModel()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        // Called every time view is about to appear — refresh data, show nav bar
        navigationController?.setNavigationBarHidden(false, animated: animated)
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        // View is visible — start animations, begin location updates
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        // About to leave — pause video, resign first responder
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        // Gone — stop timers, save state
    }
}
```

**Tags:** `#uikit` `#lifecycle` `#viewcontroller` `#interview`
**Difficulty:** Intermediate
**References:**
- [UIViewController — Apple Developer](https://developer.apple.com/documentation/uikit/uiviewcontroller)
- [Managing your app's life cycle — Apple Developer](https://developer.apple.com/documentation/uikit/managing-your-app-s-life-cycle)

---

## Q: What is the difference between `frame` and `bounds`?

**Answer:**
- `frame` — position and size in the **parent view's** coordinate system
- `bounds` — position and size in the **view's own** coordinate system (origin is usually `0,0`)

**Code Example:**
```swift
let parent = UIView(frame: CGRect(x: 0, y: 0, width: 300, height: 300))
let child = UIView(frame: CGRect(x: 50, y: 100, width: 100, height: 50))
parent.addSubview(child)

print(child.frame)   // (50, 100, 100, 50) — position relative to parent
print(child.bounds)  // (0, 0, 100, 50)    — always starts at 0,0

// When to use each:
// frame — positioning a view within its parent
// bounds — drawing inside a view (custom draw, scroll offset)

// ScrollView example — bounds.origin changes as you scroll
scrollView.contentOffset = CGPoint(x: 0, y: 200)
print(scrollView.bounds.origin)  // (0, 200) — scrolled 200pt down
```

**Tags:** `#uikit` `#layout` `#frame` `#bounds` `#interview`
**Difficulty:** Intermediate

---

## Q: How does Auto Layout work and what is constraint priority?

**Answer:**
Auto Layout calculates view frames at runtime by solving a system of linear equations defined by your constraints. Priority determines which constraints can break when there's a conflict.

**Code Example:**
```swift
let label = UILabel()
label.translatesAutoresizingMaskIntoConstraints = false
view.addSubview(label)

// Activate constraints
NSLayoutConstraint.activate([
    label.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
    label.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
    label.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16)
])

// Priority — 1000 = required, 750 = high, 250 = low
let widthConstraint = label.widthAnchor.constraint(equalToConstant: 200)
widthConstraint.priority = .defaultHigh  // 750 — can be broken if needed
widthConstraint.isActive = true

// Content Hugging — how hard a view resists growing
label.setContentHuggingPriority(.required, for: .horizontal)

// Compression Resistance — how hard a view resists shrinking
label.setContentCompressionResistancePriority(.required, for: .horizontal)
```

**Tags:** `#uikit` `#autolayout` `#constraints` `#interview`
**Difficulty:** Intermediate
**References:**
- [NSLayoutConstraint — Apple Developer](https://developer.apple.com/documentation/uikit/nslayoutconstraint)

---

## Q: What is `UITableView` reuse and why does it matter?

**Answer:**
`UITableView` reuses cell objects as they scroll off screen rather than creating new ones, keeping memory usage constant regardless of how many rows exist.

**Code Example:**
```swift
class MyViewController: UIViewController, UITableViewDataSource {

    override func viewDidLoad() {
        super.viewDidLoad()
        // Register cell class with a reuse identifier
        tableView.register(UserCell.self, forCellReuseIdentifier: "UserCell")
    }

    func tableView(_ tableView: UITableView,
                   cellForRowAt indexPath: IndexPath) -> UITableViewCell {

        // Dequeue a recycled cell (or create one if none available)
        let cell = tableView.dequeueReusableCell(
            withIdentifier: "UserCell", for: indexPath) as! UserCell

        // ALWAYS configure fully — recycled cells carry old data
        let user = users[indexPath.row]
        cell.nameLabel.text = user.name
        cell.avatarImageView.image = nil  // reset before async load

        return cell
    }
}
```

**Common mistake:** Not resetting cell state before configuring — old data shows briefly during scroll.

**Tags:** `#uikit` `#tableview` `#reuse` `#performance` `#interview`
**Difficulty:** Intermediate
**References:**
- [UITableView — Apple Developer](https://developer.apple.com/documentation/uikit/uitableview)

---

## Q: What is the `UIResponder` and the responder chain?

**Answer:**
The responder chain is a sequence of `UIResponder` objects that can handle events (touches, key presses, actions). Events travel up the chain until something handles them.

```
UIView → parent UIView → UIViewController → UIWindow → UIApplication → AppDelegate
```

**Code Example:**
```swift
// Custom action sent up the responder chain
// No need to know which object handles it
UIApplication.shared.sendAction(#selector(handleLogout), to: nil, from: nil, for: nil)

// Any UIResponder in the chain can handle it
class RootViewController: UIViewController {
    @objc func handleLogout() {
        // Handles the action wherever it is in the chain
        AuthManager.shared.logout()
    }
}

// First responder — the view currently receiving input
textField.becomeFirstResponder()  // show keyboard
textField.resignFirstResponder()  // hide keyboard
```

**Tags:** `#uikit` `#responder-chain` `#events` `#interview`
**Difficulty:** Intermediate
**References:**
- [UIResponder — Apple Developer](https://developer.apple.com/documentation/uikit/uiresponder)

---

## Q: How does `layoutSubviews` work and when is it called?

**Answer:**
`layoutSubviews` is called by the system whenever a view's bounds change or its subview layout needs to be recalculated. Override it for manual layout.

**Code Example:**
```swift
class CustomView: UIView {

    override func layoutSubviews() {
        super.layoutSubviews()  // always call super first

        // Manual frame-based layout using self.bounds
        let padding: CGFloat = 16
        avatarImageView.frame = CGRect(x: padding, y: padding,
                                       width: 44, height: 44)
        nameLabel.frame = CGRect(x: avatarImageView.frame.maxX + 8,
                                  y: padding,
                                  width: bounds.width - 72,
                                  height: 44)
    }
}

// Trigger layout
view.setNeedsLayout()     // marks as dirty, updates on next render cycle
view.layoutIfNeeded()     // forces immediate layout (e.g. before animation)
```

**When it's called:** bounds change, `setNeedsLayout`, adding/removing subviews, device rotation.

**Tags:** `#uikit` `#layout` `#layoutsubviews`
**Difficulty:** Intermediate

---

## Q: What is `intrinsicContentSize`?

**Answer:**
`intrinsicContentSize` is the natural size a view prefers based on its content — like a label fitting its text, or a button fitting its title. Auto Layout uses this when no explicit size constraint is set.

**Code Example:**
```swift
// UILabel and UIButton have intrinsicContentSize automatically
let label = UILabel()
label.text = "Hello"
print(label.intrinsicContentSize)  // e.g. (33.0, 20.5)

// Custom view — override to declare your preferred size
class BadgeView: UIView {
    var count: Int = 0 {
        didSet { invalidateIntrinsicContentSize() }  // tell Auto Layout size changed
    }

    override var intrinsicContentSize: CGSize {
        let size = max(24, CGFloat(count) * 10)
        return CGSize(width: size, height: 24)
    }
}

// Return this to say "I have no opinion on this dimension"
return CGSize(width: UIView.noIntrinsicMetric, height: 44)
```

**Tags:** `#uikit` `#autolayout` `#intrinsiccontentsize`
**Difficulty:** Intermediate

---

## Q: What is `CALayer` and how does it relate to `UIView`?

**Answer:**
Every `UIView` has a `CALayer` that does the actual drawing and compositing. `UIView` is a wrapper that adds event handling on top of `CALayer`.

**Code Example:**
```swift
let view = UIView()

// Common layer properties
view.layer.cornerRadius = 12
view.layer.borderWidth = 1
view.layer.borderColor = UIColor.systemBlue.cgColor
view.layer.shadowColor = UIColor.black.cgColor
view.layer.shadowOpacity = 0.2
view.layer.shadowRadius = 4
view.layer.shadowOffset = CGSize(width: 0, height: 2)

// Clip to bounds — apply on both for correctness
view.clipsToBounds = true          // UIView level
view.layer.masksToBounds = true    // CALayer level

// CALayer animations — lower level than UIView.animate
let animation = CABasicAnimation(keyPath: "opacity")
animation.fromValue = 1.0
animation.toValue = 0.0
animation.duration = 0.3
view.layer.add(animation, forKey: "fade")
```

**Key distinction:** `UIView` is on the main thread; `CALayer` can render on background threads.

**Tags:** `#uikit` `#calayer` `#animation` `#drawing`
**Difficulty:** Intermediate
**References:**
- [CALayer — Apple Developer](https://developer.apple.com/documentation/quartzcore/calayer)

---

## Q: How do you handle keyboard appearance and dismissal?

**Answer:**
Subscribe to keyboard notifications to adjust your layout when the keyboard appears or hides, so it doesn't cover your input fields.

**Code Example:**
```swift
class FormViewController: UIViewController {

    var bottomConstraint: NSLayoutConstraint!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupBottomConstraint()

        NotificationCenter.default.addObserver(self,
            selector: #selector(keyboardWillShow),
            name: UIResponder.keyboardWillShowNotification, object: nil)
        NotificationCenter.default.addObserver(self,
            selector: #selector(keyboardWillHide),
            name: UIResponder.keyboardWillHideNotification, object: nil)
    }

    @objc func keyboardWillShow(_ notification: Notification) {
        guard let keyboardFrame = notification.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect,
              let duration = notification.userInfo?[UIResponder.keyboardAnimationDurationUserInfoKey] as? Double
        else { return }

        UIView.animate(withDuration: duration) {
            self.bottomConstraint.constant = -keyboardFrame.height
            self.view.layoutIfNeeded()
        }
    }

    @objc func keyboardWillHide(_ notification: Notification) {
        UIView.animate(withDuration: 0.3) {
            self.bottomConstraint.constant = 0
            self.view.layoutIfNeeded()
        }
    }
}
```

**SwiftUI alternative:** `.ignoresSafeArea(.keyboard)` or `ScrollView` handles it automatically.

**Tags:** `#uikit` `#keyboard` `#layout`
**Difficulty:** Intermediate

---

## Q: What is `UIStackView` and when should you use it?

**Answer:**
`UIStackView` arranges views in a horizontal or vertical line and manages all constraints for you. It removes the need to manually write spacing and distribution constraints.

**Code Example:**
```swift
// Vertical stack with spacing
let stack = UIStackView(arrangedSubviews: [titleLabel, subtitleLabel, actionButton])
stack.axis = .vertical
stack.spacing = 12
stack.alignment = .leading   // .fill, .center, .leading, .trailing
stack.distribution = .fill   // .fillEqually, .equalSpacing, .equalCentering

// Add/remove views dynamically
stack.addArrangedSubview(newLabel)
stack.removeArrangedSubview(oldLabel)
oldLabel.removeFromSuperview()

// Hide a view without removing it (stack adjusts automatically)
subtitleLabel.isHidden = true  // stack collapses the space

// Nested stacks — very powerful for complex layouts
let hStack = UIStackView(arrangedSubviews: [icon, vStack])
hStack.axis = .horizontal
hStack.spacing = 8
```

**When to use:** Almost always prefer `UIStackView` over manual constraints for linear arrangements — it's simpler, more maintainable, and easier to animate.

**Tags:** `#uikit` `#stackview` `#autolayout` `#layout`
**Difficulty:** Intermediate
