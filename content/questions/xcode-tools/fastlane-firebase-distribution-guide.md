# Fastlane + Firebase App Distribution Guide

## Q: How do you set up Fastlane with Firebase App Distribution to automate iOS build delivery to testers?

Use Fastlane's `firebase_app_distribution` plugin to build an Ad Hoc `.ipa` and upload it to Firebase — testers receive a download link by email within minutes.

**Jump to:** [What Are These Tools?](#1-what-are-these-tools) · [Prerequisites](#2-prerequisites) · [Firebase Setup](#3-set-up-firebase-project) · [Install Fastlane](#4-install-fastlane) · [Initialize Fastlane](#5-initialize-fastlane-in-your-project) · [Firebase Plugin](#6-install-the-firebase-plugin) · [Code Signing](#7-configure-code-signing) · [Write Lanes](#8-write-your-fastlane-lanes) · [Authenticate](#9-authenticate-with-firebase) · [Add Testers](#10-add-testers-in-firebase) · [Run Distribution](#11-run-your-first-distribution) · [Common Errors](#12-common-errors-and-fixes) · [Next Steps](#13-next-steps)

---

### 1. What Are These Tools?

**Fastlane** — a command-line tool that automates repetitive iOS tasks: building your app, managing code signing, and uploading builds.

**Firebase App Distribution** — Google's service for sending your `.ipa` to testers. Testers get an email download link with no App Store review and no TestFlight delays.

**How they work together:**

```
You run: fastlane distribute
    │
    ├─ Fastlane builds your .ipa (gym)
    └─ Fastlane uploads to Firebase (firebase_app_distribution plugin)
           │
           └─ Firebase emails testers a download link
```

---

### 2. Prerequisites

| Requirement | How to Check |
|---|---|
| macOS (Ventura or later) | Apple menu → About This Mac |
| Xcode installed | `xcode-select -p` |
| Xcode Command Line Tools | `xcode-select --install` |
| Ruby 2.7+ | `ruby -v` |
| Bundler gem | `gem install bundler` |
| Apple Developer Account | developer.apple.com |
| Firebase account | console.firebase.google.com |

---

### 3. Set Up Firebase Project

**3.1 — Create a Firebase Project**

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → enter a name → disable Analytics if not needed → **Create project**

**3.2 — Register Your iOS App**

1. Inside your project, click the **iOS icon**
2. Enter your app's **Bundle ID** (Xcode → Target → General → Bundle Identifier)
3. Click **Register app** → download `GoogleService-Info.plist` → skip remaining SDK steps

**3.3 — Find Your Firebase App ID**

Project Settings (gear icon) → **Your apps** → copy the **App ID**:
`1:123456789012:ios:abcdef1234567890`

> Save this — you'll paste it into your Fastfile.

---

### 4. Install Fastlane

**4.1 — Create a Gemfile** in your project root (same level as `.xcodeproj`):

```ruby
# Gemfile
source "https://rubygems.org"
gem "fastlane"
```

**4.2 — Install:**

```bash
cd /path/to/your/project
bundle install
```

**4.3 — Verify:**

```bash
bundle exec fastlane --version
```

> Always prefix commands with `bundle exec` to use the project's locked version.

---

### 5. Initialize Fastlane in Your Project

```bash
bundle exec fastlane init
```

Choose **option 4 (Manual setup)**. Fastlane creates:

```
fastlane/
├── Appfile       ← your app's identifiers
└── Fastfile      ← your automation lanes
```

**Configure Appfile:**

```ruby
app_identifier("com.yourcompany.myapp")
apple_id("your@email.com")
```

---

### 6. Install the Firebase Plugin

```bash
bundle exec fastlane add_plugin firebase_app_distribution
bundle install
```

Verify:

```bash
bundle exec fastlane firebase_app_distribution help
```

---

### 7. Configure Code Signing

For distributable `.ipa` files, you need an **Ad Hoc provisioning profile**.

**Simplest approach (beginners):** In Xcode → Target → Signing & Capabilities → check **Automatically manage signing** → select your Team. Fastlane's `gym` will handle the rest with `export_method: "ad-hoc"`.

**Team approach:** Use [Fastlane Match](https://docs.fastlane.tools/actions/match/) to store certificates and profiles in a private Git repo — shareable across team members and CI.

---

### 8. Write Your Fastlane Lanes

Replace `fastlane/Fastfile` contents:

```ruby
# fastlane/Fastfile
default_platform(:ios)

platform :ios do

  desc "Build and distribute to Firebase App Distribution"
  lane :distribute do

    # Unique build number per upload (Firebase rejects duplicate build numbers)
    increment_build_number(
      build_number: Time.now.strftime("%Y%m%d%H%M")
    )

    # Build the .ipa
    build_ios_app(
      scheme: "YourSchemeName",        # ← CHANGE THIS
      export_method: "ad-hoc",
      configuration: "Release",
      output_directory: "./build",
      output_name: "MyApp.ipa"         # ← CHANGE THIS
    )

    # Upload to Firebase
    firebase_app_distribution(
      app: "1:123456789012:ios:abcdef1234567890",  # ← CHANGE THIS
      testers: "tester1@example.com, tester2@example.com",  # ← CHANGE THIS
      release_notes: "Build #{lane_context[SharedValues::BUILD_NUMBER]}",
      firebase_cli_token: ENV["FIREBASE_TOKEN"]
    )

    UI.success("✅ Build successfully distributed to Firebase!")
  end


  desc "Build only (no upload)"
  lane :build_only do
    build_ios_app(
      scheme: "YourSchemeName",        # ← CHANGE THIS
      export_method: "ad-hoc",
      configuration: "Release"
    )
    UI.success("✅ Build succeeded!")
  end

end
```

**Values to replace:**

| Placeholder | Where to Find |
|---|---|
| `"YourSchemeName"` | Xcode → Product → Scheme → Manage Schemes |
| Firebase App ID | Firebase Console → Project Settings → Your apps |
| Tester emails | Your testers' email addresses |

---

### 9. Authenticate with Firebase

**9.1 — Install Firebase CLI:**

```bash
npm install -g firebase-tools
```

**9.2 — Generate a CI token:**

```bash
firebase login:ci
```

A browser opens for Google sign-in. After login, a token is printed in Terminal — copy it.

**9.3 — Set as environment variable:**

```bash
echo 'export FIREBASE_TOKEN="your-token-here"' >> ~/.zshrc
source ~/.zshrc
```

> Never hardcode the token in your Fastfile. Use env vars or `fastlane/.env` (add to `.gitignore`).

**Optional `.env` file** (`fastlane/.env` — gitignored):

```
FIREBASE_TOKEN=your-token-here
```

---

### 10. Add Testers in Firebase

**Via Firebase Console:** App Distribution → **Testers & Groups** → **Add testers** → enter emails.

**Via a testers file** (`fastlane/testers.txt`):

```
tester1@example.com
tester2@example.com
qa-team@yourcompany.com
```

```ruby
firebase_app_distribution(
  app: "...",
  testers_file: "fastlane/testers.txt",
  release_notes: "Latest build",
  firebase_cli_token: ENV["FIREBASE_TOKEN"]
)
```

> **Important:** Each tester's device UDID must be registered in your Apple Developer account (developer.apple.com → Certificates, IDs & Profiles → Devices) for Ad Hoc builds.

---

### 11. Run Your First Distribution

```bash
bundle exec fastlane distribute
```

Expected output:

```
[✔] Build number set to 202501151045
[✔] Successfully exported and signed the IPA
[✔] Uploading IPA...
[✔] Distributed to 2 tester(s)
✅ Build successfully distributed to Firebase!
fastlane.tools finished successfully 🎉
```

---

### 12. Common Errors and Fixes

**`No profiles for 'com.yourcompany.app' were found`**
→ Enable Automatic Signing in Xcode, or create an Ad Hoc profile at developer.apple.com.

**`Firebase App Distribution: App not found`**
→ Wrong App ID in Fastfile. Check Firebase Console → Project Settings → Your apps.

**`FIREBASE_TOKEN not set` / Authentication error**
```bash
source ~/.zshrc
echo $FIREBASE_TOKEN      # should print your token
firebase login:ci          # regenerate if needed
```

**`Build number already exists`**
→ Make sure `increment_build_number` with `Time.now.strftime` is in your lane and not commented out.

**`The provided scheme ... is invalid`**
```bash
xcodebuild -list           # lists all schemes — must match exactly (case-sensitive)
```

**`bundle exec fastlane: command not found`**
```bash
gem install bundler && bundle install
```

---

### 13. Next Steps

**Tester Groups** — use Firebase groups instead of individual emails:

```ruby
firebase_app_distribution(
  app: "...",
  groups: "ios-qa-team, stakeholders",
  release_notes: "Latest build"
)
```

**Multi-environment lanes:**

```ruby
lane :distribute_dev do
  build_ios_app(scheme: "MyApp-Dev", export_method: "ad-hoc", configuration: "Release")
  firebase_app_distribution(app: "firebase-dev-app-id", groups: "developers", ...)
end

lane :distribute_uat do
  build_ios_app(scheme: "MyApp-UAT", export_method: "ad-hoc", configuration: "Release")
  firebase_app_distribution(app: "firebase-uat-app-id", groups: "uat-testers", ...)
end
```

**Slack notifications:**

```ruby
slack(
  message: "New iOS build distributed to Firebase! 🚀",
  channel: "#ios-builds",
  slack_url: ENV["SLACK_WEBHOOK_URL"]
)
```

**Automate with GitHub Actions** — trigger `bundle exec fastlane distribute` on push to specific branches.

**Migrate to Fastlane Match** — for teams, store certificates/profiles in a private Git repo shared across all machines.

---

### Quick Reference

```bash
bundle install                      # first-time setup
bundle exec fastlane distribute     # build + upload to Firebase
bundle exec fastlane build_only     # build only, no upload
firebase login:ci                   # regenerate Firebase token
xcodebuild -list                    # list Xcode schemes
bundle exec fastlane lanes          # list all available lanes
```

### Project Structure After Setup

```
YourProject/
├── YourProject.xcodeproj
├── Gemfile                    ← commit this
├── Gemfile.lock               ← commit this
└── fastlane/
    ├── Appfile
    ├── Fastfile
    ├── Pluginfile
    ├── .env                   ← add to .gitignore!
    └── testers.txt            ← optional
```

Add to `.gitignore`:

```
fastlane/.env
fastlane/report.xml
build/
*.ipa
*.dSYM.zip
```

**Tags:** fastlane, firebase, distribution, ci-cd, ad-hoc, automation, testing
**Difficulty:** Intermediate
