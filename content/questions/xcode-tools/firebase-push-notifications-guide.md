# Firebase FCM Push Notifications Guide (iOS + SPM)

## Q: How do you implement push notifications end-to-end using Firebase Cloud Messaging (FCM) with Swift Package Manager?

Firebase Cloud Messaging (FCM) lets you send push notifications to your iOS app through Apple Push Notification service (APNs). FCM acts as a bridge — you send a message to FCM, and FCM forwards it to APNs, which delivers it to the device.

**Jump to:** [How It Works](#1-how-it-works) · [Prerequisites](#2-prerequisites) · [Apple Developer Setup](#3-apple-developer-setup) · [Firebase Project Setup](#4-firebase-project-setup) · [Add Firebase via SPM](#5-add-firebase-via-spm) · [Configure Your App](#6-configure-your-app) · [Request Permission](#7-request-notification-permission) · [Handle FCM Token](#8-handle-fcm-token) · [Handle Notifications](#9-handle-incoming-notifications) · [Handle Notification Taps](#10-handle-notification-taps) · [Send a Test Notification](#11-send-a-test-notification) · [Background Modes](#12-background-modes) · [Common Errors](#13-common-errors-and-fixes)

---

### 1. How It Works

```
Your Server / Firebase Console
        │
        ▼
Firebase Cloud Messaging (FCM)
        │   ← FCM Token identifies the device
        ▼
Apple Push Notification service (APNs)
        │   ← APNs Key authenticates your app to APNs
        ▼
User's Device
```

**Key concepts:**

| Term | What It Is |
|---|---|
| APNs | Apple's delivery infrastructure for push notifications |
| APNs Auth Key | A `.p8` key you create in Apple Developer — proves your server is allowed to send pushes to your app |
| FCM Token | A unique string FCM assigns to each app install — used to target a specific device |
| `GoogleService-Info.plist` | Firebase config file that links your app to your Firebase project |

---

### 2. Prerequisites

| Requirement | How to Check |
|---|---|
| Xcode 15+ | `xcode-select -p` |
| Apple Developer Account (paid) | developer.apple.com — free accounts cannot use push notifications |
| Firebase account | console.firebase.google.com |
| Physical device for testing | Push notifications do not work in the iOS Simulator |
| iOS deployment target 13.0+ | Project settings → General → Minimum Deployments |

---

### 3. Apple Developer Setup

You need to create an **APNs Auth Key** and upload it to Firebase. This is a one-time setup per Apple Developer team.

#### 3.1 — Create an APNs Auth Key

1. Go to [developer.apple.com](https://developer.apple.com) → **Account**
2. Under **Certificates, Identifiers & Profiles**, select **Keys** from the sidebar
3. Click **+** to create a new key
4. Enter a name (e.g. `FCM APNs Key`)
5. Check **Apple Push Notifications service (APNs)**
6. Click **Continue** → **Register**
7. **Download the `.p8` file** — you can only download it once
8. Note your **Key ID** (shown on the key detail page)
9. Note your **Team ID** (top-right of the developer portal, or under Membership)

> Keep the `.p8` file safe. Do not commit it to version control.

#### 3.2 — Enable Push Notifications in Your App ID

1. In the Apple Developer portal → **Identifiers**
2. Select your app's Bundle ID
3. Scroll to **Push Notifications** → click **Edit** → **Save**

---

### 4. Firebase Project Setup

#### 4.1 — Create or Open a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** (or select an existing project)
3. Follow the prompts → **Create project**

#### 4.2 — Add Your iOS App to Firebase

1. On the Firebase project overview, click the **iOS+** icon
2. Enter your app's **Bundle ID** (must match exactly what's in Xcode)
3. Optionally enter an App nickname
4. Click **Register app**
5. **Download `GoogleService-Info.plist`** — keep this for Step 6
6. Skip the SDK steps on this page — you'll use SPM instead
7. Click through to **Continue to console**

#### 4.3 — Upload Your APNs Auth Key to Firebase

1. In the Firebase console, go to **Project Settings** (gear icon, top-left)
2. Select the **Cloud Messaging** tab
3. Scroll to **Apple app configuration**
4. Under **APNs authentication key**, click **Upload**
5. Select your `.p8` file
6. Enter your **Key ID** and **Team ID**
7. Click **Upload**

---

### 5. Add Firebase via SPM

#### 5.1 — Add the Firebase Package

1. In Xcode, go to **File → Add Package Dependencies…**
2. In the search field, enter:
   ```
   https://github.com/firebase/firebase-ios-sdk
   ```
3. Select the package → choose **Up to Next Major Version** from the latest release
4. Click **Add Package**

#### 5.2 — Select Required Libraries

When prompted to choose products, add **only** what you need:

| Product | Required? | Purpose |
|---|---|---|
| `FirebaseMessaging` | **Yes** | Core FCM functionality |
| `FirebaseAnalytics` | Optional | Firebase Analytics |

Click **Add Package**. Xcode will resolve and link the packages.

---

### 6. Configure Your App

#### 6.1 — Add `GoogleService-Info.plist`

1. Drag the downloaded `GoogleService-Info.plist` into your Xcode project navigator
2. In the dialog, ensure **Copy items if needed** is checked
3. Ensure your app target is checked under **Add to targets**
4. Click **Finish**

> The file must be at the root of your app target (not inside a subfolder).

#### 6.2 — Enable Push Notifications Capability

1. In Xcode, select your project → your app target
2. Go to **Signing & Capabilities**
3. Click **+ Capability**
4. Add **Push Notifications**
5. Also add **Background Modes** → check **Remote notifications**

#### 6.3 — Configure AppDelegate

If you are using SwiftUI's `@main` App struct, add an `AppDelegate` and connect it via `UIApplicationDelegateAdaptor`.

**AppDelegate.swift:**

```swift
import UIKit
import FirebaseCore
import FirebaseMessaging
import UserNotifications

class AppDelegate: NSObject, UIApplicationDelegate {

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        FirebaseApp.configure()

        UNUserNotificationCenter.current().delegate = self
        Messaging.messaging().delegate = self

        return true
    }

    // Called after APNs registration succeeds — pass the token to FCM
    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        Messaging.messaging().apnsToken = deviceToken
    }

    // Called if APNs registration fails
    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        print("APNs registration failed: \(error.localizedDescription)")
    }
}
```

**YourApp.swift (SwiftUI entry point):**

```swift
import SwiftUI

@main
struct YourApp: App {

    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

> If your project uses a UIKit `AppDelegate` instead of SwiftUI `@main`, add the `FirebaseApp.configure()` and delegate assignments directly to your existing `application(_:didFinishLaunchingWithOptions:)`.

---

### 7. Request Notification Permission

Request permission as early as appropriate in your user flow — commonly on first launch or at a contextually relevant moment.

```swift
import UserNotifications

func requestNotificationPermission() {
    UNUserNotificationCenter.current().requestAuthorization(
        options: [.alert, .sound, .badge]
    ) { granted, error in
        if let error {
            print("Permission error: \(error.localizedDescription)")
            return
        }
        guard granted else {
            print("Notification permission denied")
            return
        }
        DispatchQueue.main.async {
            UIApplication.shared.registerForRemoteNotifications()
        }
    }
}
```

Call this from your `AppDelegate` after `FirebaseApp.configure()`, or from a SwiftUI view at the right moment:

```swift
// In AppDelegate didFinishLaunchingWithOptions, after FirebaseApp.configure():
requestNotificationPermission()
```

---

### 8. Handle FCM Token

FCM assigns a unique token to each app install. You need this token to send targeted pushes.

Add `MessagingDelegate` conformance to your `AppDelegate`:

```swift
extension AppDelegate: MessagingDelegate {

    // Called whenever FCM issues or refreshes a token
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        guard let fcmToken else { return }
        print("FCM Token: \(fcmToken)")

        // Send this token to your backend server so it can target this device
        sendTokenToServer(fcmToken)
    }

    private func sendTokenToServer(_ token: String) {
        // Example: POST token to your API
        // UserDefaults.standard.set(token, forKey: "fcmToken")
    }
}
```

**Retrieve the token on demand:**

```swift
Messaging.messaging().token { token, error in
    if let error {
        print("Error fetching token: \(error)")
    } else if let token {
        print("FCM Token: \(token)")
    }
}
```

> Tokens can change — always use `didReceiveRegistrationToken` to keep your server in sync rather than caching the token statically.

---

### 9. Handle Incoming Notifications

Add `UNUserNotificationCenterDelegate` conformance to `AppDelegate`:

```swift
extension AppDelegate: UNUserNotificationCenterDelegate {

    // Notification received while the app is in the FOREGROUND
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        let userInfo = notification.request.content.userInfo
        print("Foreground notification received: \(userInfo)")

        // Show banner + sound even in foreground
        completionHandler([.banner, .sound, .badge])
    }
}
```

**Background / quit state:** When the app is in the background or not running, iOS displays the notification automatically. No code is needed for delivery — see Section 10 for handling the tap.

---

### 10. Handle Notification Taps

When the user taps a notification, this delegate method fires:

```swift
extension AppDelegate: UNUserNotificationCenterDelegate {

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo
        print("Notification tapped: \(userInfo)")

        // Read custom data from the payload
        if let deepLink = userInfo["deep_link"] as? String {
            handleDeepLink(deepLink)
        }

        completionHandler()
    }

    private func handleDeepLink(_ link: String) {
        // Navigate to the appropriate screen
    }
}
```

**Reading standard FCM fields from `userInfo`:**

```swift
// Title and body (for data messages)
let title = userInfo["title"] as? String
let body  = userInfo["body"]  as? String

// FCM message ID
let messageID = userInfo["gcm.message_id"] as? String
```

---

### 11. Send a Test Notification

#### 11.1 — From Firebase Console (no server needed)

1. In the Firebase console, go to **Messaging** (left sidebar)
2. Click **Send your first message** (or **New campaign**)
3. Select **Firebase Notification messages**
4. Fill in **Notification title** and **Notification text**
5. Under **Target**, select **Single device**
6. Paste your FCM token (printed by `messaging(_:didReceiveRegistrationToken:)`)
7. Click **Test** → **Send test message**

The notification should appear on your physical device within a few seconds.

#### 11.2 — From Terminal via HTTP v1 API

For scripted testing, you can send via `curl` using the FCM HTTP v1 API. You'll need an access token from your Firebase service account.

```bash
curl -X POST \
  https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "YOUR_FCM_TOKEN",
      "notification": {
        "title": "Hello",
        "body": "Test notification from curl"
      }
    }
  }'
```

Replace `YOUR_PROJECT_ID` with the value from `GoogleService-Info.plist` (`PROJECT_ID`).

---

### 12. Background Modes

For **silent (data-only) push notifications** — pushes that wake your app without showing a banner:

#### 12.1 — Send a Data Message

In your payload, omit `notification` and use only `data`, plus set `content_available: true`:

```json
{
  "message": {
    "token": "DEVICE_FCM_TOKEN",
    "data": {
      "key": "value"
    },
    "apns": {
      "headers": {
        "apns-push-type": "background",
        "apns-priority": "5"
      },
      "payload": {
        "aps": {
          "content-available": 1
        }
      }
    }
  }
}
```

#### 12.2 — Handle in AppDelegate

```swift
func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
) {
    print("Silent push received: \(userInfo)")
    // Perform background work (max ~30 seconds)
    completionHandler(.newData)
}
```

> Background mode capability **Remote notifications** must be checked (Step 6.2) for this to fire.

---

### 13. Common Errors and Fixes

| Error | Cause | Fix |
|---|---|---|
| `No APNs token` in Firebase logs | Token not forwarded to FCM | Ensure `Messaging.messaging().apnsToken = deviceToken` is called in `didRegisterForRemoteNotificationsWithDeviceToken` |
| Notifications arrive on simulator | Simulator does not support APNs | Test on a physical device |
| `permission denied` / no permission prompt | Permission not requested, or user denied | Check `requestNotificationPermission()` is called; user must reset in Settings → Notifications |
| `GoogleService-Info.plist` not found | Plist not added to target | Select the file in Xcode → File Inspector → confirm your target is checked |
| FCM token is `nil` | Firebase not configured before `Messaging` is accessed | Ensure `FirebaseApp.configure()` runs before any Firebase call |
| Token never refreshes on server | Only storing token once | Always update your server in `didReceiveRegistrationToken` |
| Notification not shown in foreground | `willPresent` not implemented | Add `UNUserNotificationCenterDelegate` and return `.banner` |
| APNs key upload fails in Firebase | Wrong Key ID or Team ID | Double-check values in Apple Developer portal → Keys |

---

### Complete AppDelegate Reference

```swift
import UIKit
import FirebaseCore
import FirebaseMessaging
import UserNotifications

class AppDelegate: NSObject, UIApplicationDelegate {

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        FirebaseApp.configure()
        UNUserNotificationCenter.current().delegate = self
        Messaging.messaging().delegate = self
        requestNotificationPermission()
        return true
    }

    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        Messaging.messaging().apnsToken = deviceToken
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        print("APNs registration failed: \(error)")
    }

    func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable: Any],
        fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        completionHandler(.newData)
    }

    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(
            options: [.alert, .sound, .badge]
        ) { granted, _ in
            guard granted else { return }
            DispatchQueue.main.async {
                UIApplication.shared.registerForRemoteNotifications()
            }
        }
    }
}

extension AppDelegate: MessagingDelegate {
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        guard let fcmToken else { return }
        print("FCM Token: \(fcmToken)")
        // Send token to your server
    }
}

extension AppDelegate: UNUserNotificationCenterDelegate {
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound, .badge])
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo
        print("Notification tapped: \(userInfo)")
        completionHandler()
    }
}
```

**Tags:** firebase, fcm, push-notifications, apns, spm, swift-package-manager, notifications, background-modes, messaging
