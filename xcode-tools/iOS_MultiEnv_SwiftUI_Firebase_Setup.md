# iOS Multi-Environment Setup — Dev, SIT, UAT, Prod

## Q: How do you configure an iOS app to support multiple environments (Dev, SIT, UAT, Prod) so all can be installed simultaneously on the same device?

Use separate **Xcode Schemes**, **Build Configurations**, **Bundle Identifiers**, and **Firebase plists** — one set per environment.

| Environment | Bundle ID Suffix | Firebase Plist | App Display Name |
|-------------|-----------------|----------------|-----------------|
| Dev | `.dev` | `GoogleService-Info-Dev.plist` | YourApp Dev |
| SIT | `.sit` | `GoogleService-Info-SIT.plist` | YourApp SIT |
| UAT | `.uat` | `GoogleService-Info-UAT.plist` | YourApp UAT |
| Prod | *(none)* | `GoogleService-Info.plist` | YourApp |

**Step-by-step:**

1. **Schemes** — Product → Scheme → Manage Schemes → `+` → name it `Dev`, `SIT`, `UAT` (Prod reuses the default).
2. **Build Configurations** — Project (root) → Info → Configurations → `+` (Duplicate) → name to match environment.
3. **Link scheme to config** — Edit Scheme → each action (Run/Test/Archive/etc.) → set Build Configuration to the matching one.
4. **Firebase plists** — Download from each Firebase console, rename (`GoogleService-Info-Dev.plist`, etc.), drag all into Xcode with Target Membership checked. Do **not** conditionally exclude them from the bundle — all four must be present at runtime.
5. **Active Compilation Conditions** — Target → Build Settings → `Active Compilation Conditions` → set `Dev`, `SIT`, `UAT` per config; leave Prod empty.
6. **Bundle Identifiers** — Signing & Capabilities → switch configuration → set unique bundle ID per config.
7. **App Display Name** — Add a User-Defined Build Setting `APP_DISPLAY_NAME` with a value per config, then set `CFBundleDisplayName` = `$(APP_DISPLAY_NAME)` in Info.plist.

**Tags:** xcode, multi-environment, firebase, schemes, build-configuration

---

## Q: What is the correct Xcode build setting for enabling `#if Dev` / `#elseif SIT` Swift compiler flags?

**Active Compilation Conditions** — not "Other Swift Flags".

Go to **Target → Build Settings**, search for `Active Compilation Conditions`, and set the value per configuration:

| Configuration | Active Compilation Conditions |
|---------------|-------------------------------|
| Dev           | `Dev`                         |
| SIT           | `SIT`                         |
| UAT           | `UAT`                         |
| Prod          | *(leave empty)*               |

> ⚠️ If you add flags to **Other Swift Flags** instead, `#if` checks will silently fall through to `#else`. Values are case-sensitive and must exactly match what you write in Swift.

Leaving Prod empty means the `#else` branch handles production — the safest fallback pattern.

**Tags:** xcode, swift, compiler-flags, active-compilation-conditions, multi-environment

---

## Q: How do you configure Firebase for multiple environments in a SwiftUI app using compiler flags?

Select the correct `GoogleService-Info.plist` at launch based on the active build configuration:

```swift
import SwiftUI
import FirebaseCore

enum AppEnvironment { case dev, sit, uat, prod }

@main
struct YourApp: App {

    init() {
        configureFirebase()
    }

    var body: some Scene {
        WindowGroup {
            NavigationStack { RootView() }
        }
    }

    private var currentEnvironment: AppEnvironment {
        #if Dev
        return .dev
        #elseif SIT
        return .sit
        #elseif UAT
        return .uat
        #else
        return .prod
        #endif
    }

    private func configureFirebase() {
        let plistName: String
        switch currentEnvironment {
        case .dev:  plistName = "GoogleService-Info-Dev"
        case .sit:  plistName = "GoogleService-Info-SIT"
        case .uat:  plistName = "GoogleService-Info-UAT"
        case .prod: plistName = "GoogleService-Info"
        }

        guard let filePath = Bundle.main.path(forResource: plistName, ofType: "plist") else {
            fatalError("❌ Could not find plist file: \(plistName).plist")
        }
        guard let options = FirebaseOptions(contentsOfFile: filePath) else {
            fatalError("❌ Could not load Firebase options from: \(plistName).plist")
        }

        FirebaseApp.configure(options: options)
        print("✅ Firebase configured for \(currentEnvironment) — Bundle ID: \(options.bundleID)")
    }
}
```

The `fatalError` guards are intentional — a misconfigured Firebase setup should fail loudly at launch during development, not silently at runtime.

**Tags:** firebase, swiftui, multi-environment, compiler-flags, configuration

---

## Q: What are the common pitfalls when setting up multiple Xcode build environments?

| Problem | Cause | Fix |
|---------|-------|-----|
| `#if SIT` always falls through to `#else` | Flag added to **Other Swift Flags** instead of **Active Compilation Conditions** | Move flag to the correct build setting |
| Firebase crashes at launch | Plist file not included in Target Membership | Re-add plist and check Target Membership |
| All environments overwrite each other on device | Bundle identifiers are identical across configurations | Set a unique bundle ID per configuration |
| App name doesn't change per environment | `CFBundleDisplayName` not added or still hardcoded | Add `$(APP_DISPLAY_NAME)` to `CFBundleDisplayName` in Info.plist |
| Firebase Auth rejects requests | Bundle ID in app doesn't match the one registered in Firebase Console | Ensure Firebase Console bundle ID matches exactly per environment |

**Tags:** xcode, multi-environment, firebase, debugging, common-mistakes
