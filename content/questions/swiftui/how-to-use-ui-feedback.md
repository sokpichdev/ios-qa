# How to Use Loader, Alert and Toast Correctly

## Q: When should you use a Loader, Toast, or Alert for user feedback in a SwiftUI app?

Each feedback type has a very different responsibility — don't let them overlap.

**Jump to:** [Loader](#1-loader) · [Toast](#2-toast) · [Alert](#3-alert) · [Centralize the Logic](#productivity-tip-centralize-the-logic) · [Full Flow Example](#recommended-flow)

---

**Big picture:**

| Type | Message |
|------|---------|
| **Loader** | "Something is happening, please wait" |
| **Toast** | "FYI, something happened" |
| **Alert** | "Stop. You need to decide / know this" |

---

### 1. Loader

**Use loaders when:**

- The user **cannot continue** until the API finishes
- The screen depends on the result

**Good places to show a loader:**

- App launch → checking session / refresh token
- Login / Sign up
- Placing an order
- Fetching orders, loyalty points, card balance
- Checkout / payment request

**Avoid loaders for:**

- Tiny actions that finish fast (< 100ms)
- Non-critical background calls

> **UX rule:** Block interaction while showing. Only show while the task is running. Optionally enforce a minimum duration (200–300ms) so it doesn't flash.

---

### 2. Toast

**Use toast when:**

- The action already succeeded or failed
- The user doesn't need to react — just be informed

**Perfect for:**

- "Added to cart"
- "Favorite saved"
- "Removed from cart"
- "Profile updated"
- "Points updated +10"

**Avoid toast for:**

- Errors that block progress
- Anything that requires confirmation

> **UX rule:** Auto-dismiss after 2–4s. No buttons. Don't stack too many. Toast = a polite tap on the shoulder, not a conversation.

---

### 3. Alert

**Use alerts when:**

- The user must **confirm** an action
- The user must **fix** something
- The error is **blocking**

**Good uses:**

- "Are you sure you want to cancel this order?"
- "Payment failed. Try again?"
- "Session expired. Please log in again."
- "Location permission required to place order"

**Avoid alerts for:**

- Success messages
- Simple info ("Order placed successfully" → use toast instead)

> **UX rule:** Interrupts flow. Requires user action. Keep copy short and clear. Alert = brake pedal — use it sparingly.

---

### Productivity Tip: Centralize the Logic

Instead of scattering loaders everywhere, random alerts in view code, and duplicated toast logic — create a centralized UI feedback manager.

**AppUIState (conceptual model):**

```swift
class AppUIState: ObservableObject {
    @Published var isLoading = false
    @Published var alert: AlertItem?
    @Published var toast: ToastItem?
}

struct AlertItem: Identifiable {
    let id = UUID()
    let title: String
    let message: String
    let action: (() -> Void)?
}

struct ToastItem: Identifiable {
    let id = UUID()
    let message: String
}
```

**The flow:**

```
API layer     → throws meaningful typed errors
ViewModel     → decides: loader on/off, toast vs alert
View          → just reacts to AppUIState
```

This gives you consistent UX, less repeated code, easier debugging, and easier future changes.

---

### Recommended Flow

**Example: Place Order**

```
1. User taps "Place Order"
2. Show Loader
3a. API success:
    - Hide loader
    - Show Toast → "Order placed ☕"
    - Navigate to order tracking
3b. API failure:
    - Hide loader
    - Show Alert → "Payment failed. Try again?"
```

**Tags:** swiftui, ux, loader, toast, alert, feedback, architecture
**Difficulty:** Intermediate
