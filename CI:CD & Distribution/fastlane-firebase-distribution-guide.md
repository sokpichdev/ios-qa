# Fastlane + Firebase App Distribution — Complete Beginner Guide (iOS)

> **Who this is for:** iOS developers who have never used Fastlane or Firebase App Distribution before. This guide walks you through every step from scratch, with explanations for *why* each step exists.

---

## Table of Contents

1. [What Are These Tools?](#1-what-are-these-tools)
2. [Prerequisites](#2-prerequisites)
3. [Set Up Firebase Project](#3-set-up-firebase-project)
4. [Install Fastlane](#4-install-fastlane)
5. [Initialize Fastlane in Your Project](#5-initialize-fastlane-in-your-project)
6. [Install the Firebase Plugin for Fastlane](#6-install-the-firebase-plugin-for-fastlane)
7. [Configure Code Signing](#7-configure-code-signing)
8. [Write Your Fastlane Lanes](#8-write-your-fastlane-lanes)
9. [Authenticate with Firebase](#9-authenticate-with-firebase)
10. [Add Testers in Firebase](#10-add-testers-in-firebase)
11. [Run Your First Distribution](#11-run-your-first-distribution)
12. [Common Errors and Fixes](#12-common-errors-and-fixes)
13. [Next Steps](#13-next-steps)

---

## 1. What Are These Tools?

Before touching any code, understand what each tool actually does:

### Fastlane
Fastlane is a command-line tool that **automates repetitive iOS tasks** — building your app, managing code signing certificates, and uploading builds. Instead of doing 10 manual steps in Xcode every time you want to distribute a build, you run one command.

### Firebase App Distribution
Firebase App Distribution is Google's service for **sending your `.ipa` file to testers**. Testers get an email with a download link. No App Store review, no TestFlight processing delays — testers have the build within minutes.

### How They Work Together
```
You run: fastlane distribute
    │
    ├─ Fastlane builds your .ipa (gym)
    └─ Fastlane uploads the .ipa to Firebase (firebase_app_distribution plugin)
           │
           └─ Firebase emails your testers a download link
```

---

## 2. Prerequisites

Before starting, make sure you have the following:

| Requirement | How to Check |
|---|---|
| macOS (Ventura or later recommended) | Apple menu → About This Mac |
| Xcode installed | `xcode-select -p` in Terminal |
| Xcode Command Line Tools | `xcode-select --install` |
| Ruby 2.7 or later | `ruby -v` in Terminal |
| Bundler gem | `gem install bundler` |
| Apple Developer Account | [developer.apple.com](https://developer.apple.com) |
| Firebase account | [console.firebase.google.com](https://console.firebase.google.com) |
| An existing iOS Xcode project | — |

> **Tip:** On modern Macs, Ruby comes pre-installed. If `ruby -v` shows version 2.6 or below, install a newer version via `brew install ruby`.

---

## 3. Set Up Firebase Project

### Step 3.1 — Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**
3. Enter your project name (e.g., `MyApp-Distribution`)
4. Disable Google Analytics if you don't need it → Click **Create project**

### Step 3.2 — Register Your iOS App in Firebase

1. Inside your Firebase project, click the **iOS icon** (looks like an Apple logo)
2. Enter your app's **Bundle ID** — find this in Xcode under your target → General → Bundle Identifier (e.g., `com.yourcompany.myapp`)
3. Enter an **App nickname** (optional but helpful)
4. Click **Register app**
5. Download `GoogleService-Info.plist` — you can add it to your Xcode project now, but it is **not required** for App Distribution to work
6. Skip the remaining SDK setup steps for now (click through "Next" → "Continue to console")

### Step 3.3 — Find Your Firebase App ID

You will need this later for Fastlane.

1. In Firebase Console → go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Copy the **App ID** — it looks like: `1:123456789012:ios:abcdef1234567890`

> **Save this value.** You will paste it into your Fastfile shortly.

---

## 4. Install Fastlane

There are two ways to install Fastlane. **Using Bundler is strongly recommended** — it locks the Fastlane version to your project so all teammates use the same version.

### Step 4.1 — Create a Gemfile

In your project's root directory (same level as your `.xcodeproj`), create a file named `Gemfile` with no extension:

```ruby
# Gemfile
source "https://rubygems.org"

gem "fastlane"
```

### Step 4.2 — Install via Bundler

Open Terminal, navigate to your project root, and run:

```bash
cd /path/to/your/project
bundle install
```

Bundler will install Fastlane and create a `Gemfile.lock` file. **Commit both `Gemfile` and `Gemfile.lock` to Git.**

### Step 4.3 — Verify Installation

```bash
bundle exec fastlane --version
```

You should see output like: `fastlane installation at path...` followed by a version number (e.g., `2.225.0`).

> **Why `bundle exec`?** Always prefix fastlane commands with `bundle exec` to ensure the project's locked version runs, not a globally installed one.

---

## 5. Initialize Fastlane in Your Project

```bash
bundle exec fastlane init
```

Fastlane will ask you 4 options. For a first-time setup, **choose option 4 (Manual setup)**:

```
What would you like to use fastlane for?
1. Automate screenshots
2. Automate beta distribution to TestFlight
3. Automate App Store distribution
4. Manual setup - manually setup your project to automate your tasks
```

Type `4` and press Enter. Fastlane will create a `fastlane/` directory in your project root with two files:

```
fastlane/
├── Appfile       ← your app's identifiers
└── Fastfile      ← your automation scripts (lanes)
```

### Configure the Appfile

Open `fastlane/Appfile` and fill in your details:

```ruby
app_identifier("com.yourcompany.myapp")  # Your bundle ID
apple_id("your@email.com")               # Your Apple ID email
```

---

## 6. Install the Firebase Plugin for Fastlane

Fastlane uses **plugins** to add extra capabilities. The Firebase App Distribution plugin is not built-in, so you need to install it separately.

```bash
bundle exec fastlane add_plugin firebase_app_distribution
```

When prompted `Should fastlane modify the Gemfile at path...?` → type `y` and press Enter.

This will:
- Add the plugin to your `Gemfile`
- Create a `fastlane/Pluginfile`

Run `bundle install` again to install the new gem:

```bash
bundle install
```

**Verify the plugin is installed:**

```bash
bundle exec fastlane firebase_app_distribution help
```

You should see the plugin's available parameters.

---

## 7. Configure Code Signing

For Fastlane to build a distributable `.ipa`, your project needs a valid **Ad Hoc provisioning profile**. Firebase App Distribution uses Ad Hoc distribution (not App Store, not Development).

### Option A — Use Xcode Automatic Signing (Simplest for Beginners)

1. Open your project in Xcode
2. Select your **Target** → **Signing & Capabilities**
3. Check **Automatically manage signing**
4. Select your **Team**

Then in your Fastfile (covered in the next step), set the export method to `ad-hoc` and let `gym` handle the rest.

> **Caveat:** With automatic signing, you need to make sure your Apple Developer account has an Ad Hoc profile created, or Xcode will create one automatically when you archive.

### Option B — Use Fastlane Match (Recommended for Teams)

[Fastlane Match](https://docs.fastlane.tools/actions/match/) stores certificates and profiles in a private Git repo, making them shareable across your team and CI. This is beyond the scope of this beginner guide, but it is the professional approach. Once comfortable with the basics, migrate to Match.

---

## 8. Write Your Fastlane Lanes

Open `fastlane/Fastfile` and replace its contents with the following. Read every comment — they explain what each line does.

```ruby
# fastlane/Fastfile

# The default platform for this project
default_platform(:ios)

platform :ios do

  # ─────────────────────────────────────────
  # LANE: distribute
  # Usage: bundle exec fastlane distribute
  # What it does: builds the app and uploads
  # it to Firebase App Distribution
  # ─────────────────────────────────────────
  desc "Build and distribute to Firebase App Distribution"
  lane :distribute do

    # Step 1: Increment the build number automatically
    # This ensures every build uploaded to Firebase has a unique number.
    # Firebase will reject a build if the same build number was uploaded before.
    increment_build_number(
      build_number: Time.now.strftime("%Y%m%d%H%M") # e.g., 202501151030
    )

    # Step 2: Build the .ipa file
    # - scheme: your Xcode scheme name (check Xcode → Product → Scheme)
    # - export_method: "ad-hoc" for Firebase distribution
    # - configuration: usually "Release" for distribution builds
    build_ios_app(
      scheme: "YourSchemeName",           # ← CHANGE THIS
      export_method: "ad-hoc",
      configuration: "Release",
      output_directory: "./build",        # where the .ipa will be saved
      output_name: "MyApp.ipa"           # ← CHANGE THIS to your app name
    )

    # Step 3: Upload to Firebase App Distribution
    firebase_app_distribution(
      app: "1:123456789012:ios:abcdef1234567890",   # ← CHANGE THIS (your Firebase App ID)
      testers: "tester1@example.com, tester2@example.com", # ← CHANGE THIS
      release_notes: "Build #{lane_context[SharedValues::BUILD_NUMBER]} — latest changes",
      firebase_cli_token: ENV["FIREBASE_TOKEN"]     # authentication token (set up in Step 9)
    )

    # Step 4: Notify in Terminal when done
    UI.success("✅ Build successfully distributed to Firebase!")

  end


  # ─────────────────────────────────────────
  # LANE: build_only
  # Usage: bundle exec fastlane build_only
  # What it does: just builds without uploading
  # Useful for testing that your build works
  # ─────────────────────────────────────────
  desc "Build only (no upload)"
  lane :build_only do
    build_ios_app(
      scheme: "YourSchemeName",           # ← CHANGE THIS
      export_method: "ad-hoc",
      configuration: "Release"
    )
    UI.success("✅ Build succeeded!")
  end

end
```

### Key Values to Replace

| Placeholder | Where to Find It |
|---|---|
| `"YourSchemeName"` | Xcode → Product menu → Scheme → Manage Schemes |
| `"1:123456789012:ios:abcdef..."` | Firebase Console → Project Settings → Your apps → App ID |
| `"tester1@example.com"` | The email addresses of your testers |
| `"MyApp.ipa"` | Whatever you want to name your output file |

---

## 9. Authenticate with Firebase

Fastlane needs permission to upload to your Firebase project. The recommended way for local development is a **Firebase CLI token**.

### Step 9.1 — Install Firebase CLI

```bash
# Using npm (recommended)
npm install -g firebase-tools

# Or using curl
curl -sL https://firebase.tools | bash
```

Verify installation:

```bash
firebase --version
```

### Step 9.2 — Generate a CI Token

```bash
firebase login:ci
```

This will:
1. Open a browser window asking you to sign in with your Google account
2. After sign-in, print a token in your Terminal that looks like: `1//0abcXYZ...`

**Copy this token.** Keep it secret — treat it like a password.

### Step 9.3 — Set the Token as an Environment Variable

Add the token to your shell profile so Fastlane can read it:

```bash
# For zsh (default on modern Macs)
echo 'export FIREBASE_TOKEN="your-token-here"' >> ~/.zshrc
source ~/.zshrc

# For bash
echo 'export FIREBASE_TOKEN="your-token-here"' >> ~/.bash_profile
source ~/.bash_profile
```

Verify it's set:

```bash
echo $FIREBASE_TOKEN
```

You should see your token printed.

> **Security note:** Never hardcode this token directly in your `Fastfile` or commit it to Git. Always use environment variables or a `.env` file (which is gitignored).

### Optional: Use a .env File

Create a `fastlane/.env` file (add it to `.gitignore`!):

```
FIREBASE_TOKEN=your-token-here
```

Fastlane automatically loads `.env` files in the `fastlane/` directory.

---

## 10. Add Testers in Firebase

Before testers can install builds, you need to register them in Firebase.

### Option A — Add Testers via Firebase Console

1. Firebase Console → **App Distribution** (left sidebar, under Release & Monitor)
2. Click the **Testers & Groups** tab
3. Click **Add testers**
4. Enter their email addresses (comma-separated)

### Option B — Add Testers via Fastlane

You can pass tester emails directly in your lane (already done in Step 8) or use a text file:

Create `fastlane/testers.txt`:
```
tester1@example.com
tester2@example.com
qa-team@yourcompany.com
```

Then update your Fastfile:

```ruby
firebase_app_distribution(
  app: "1:123456789012:ios:abcdef1234567890",
  testers_file: "fastlane/testers.txt",   # ← use a file instead
  release_notes: "Latest build",
  firebase_cli_token: ENV["FIREBASE_TOKEN"]
)
```

### How Testers Install the App

1. Testers receive an email from Firebase with a download link
2. First time: they need to install a **Firebase App Tester** app on their device, OR follow a profile installation flow
3. Their device **UDID must be registered** in your Apple Developer account for Ad Hoc builds
4. After installing once, they get notified automatically when new builds arrive

> **Registering UDIDs:** Go to [developer.apple.com](https://developer.apple.com) → Certificates, IDs & Profiles → Devices → Add a Device. You need each tester's device UDID (Settings → General → About → scroll to find it, or use Xcode Devices window).

---

## 11. Run Your First Distribution

You're ready. Open Terminal, navigate to your project root, and run:

```bash
bundle exec fastlane distribute
```

### What You'll See

```
[✔] 🚀  Lane Context
[✔] Driving the lane 'ios distribute'
---------------------------
--- Step: increment_build_number ---
---------------------------
[✔] Build number set to 202501151045

---------------------------
--- Step: build_ios_app ---
---------------------------
[✔] Successfully exported and signed the IPA
     Path: ./build/MyApp.ipa

---------------------------
--- Step: firebase_app_distribution ---
---------------------------
[✔] Uploading IPA...
[✔] Distributed to 2 tester(s)

✅ Build successfully distributed to Firebase!

fastlane.tools finished successfully 🎉
```

Your testers will receive an email within a minute or two.

---

## 12. Common Errors and Fixes

### ❌ `No profiles for 'com.yourcompany.app' were found`

**Cause:** No Ad Hoc provisioning profile exists for your bundle ID.

**Fix:**
1. Open Xcode → your Target → Signing & Capabilities
2. Make sure **Automatically manage signing** is checked
3. Connect a registered device and let Xcode regenerate profiles
4. Or go to [developer.apple.com](https://developer.apple.com) and manually create an Ad Hoc profile

---

### ❌ `Firebase App Distribution: App not found`

**Cause:** Wrong App ID in your Fastfile.

**Fix:** Double-check the App ID in Firebase Console → Project Settings → Your apps. It must match exactly, including the platform prefix `1:...:ios:...`.

---

### ❌ `FIREBASE_TOKEN not set` or `Authentication error`

**Cause:** The environment variable isn't loaded.

**Fix:**
```bash
source ~/.zshrc           # reload your shell profile
echo $FIREBASE_TOKEN      # verify it prints your token
firebase login:ci         # regenerate token if needed
```

---

### ❌ `Build number already exists`

**Cause:** You tried to upload a build with the same build number as one already in Firebase.

**Fix:** Your `increment_build_number` step using `Time.now.strftime` should prevent this automatically. If you're hitting this, make sure that line is in your lane and not commented out.

---

### ❌ `The provided scheme ... is invalid`

**Cause:** The scheme name in your Fastfile doesn't match what's in Xcode.

**Fix:**
```bash
# List all schemes in your project
xcodebuild -list
```

Copy the exact scheme name (case-sensitive) and update your Fastfile.

---

### ❌ `bundle exec fastlane: command not found`

**Cause:** Bundler isn't installed or Gemfile is missing.

**Fix:**
```bash
gem install bundler
bundle install
```

---

## 13. Next Steps

Now that you have a working Fastlane + Firebase distribution pipeline, here are logical next steps to improve it:

### Tester Groups
Instead of listing individual emails, create **tester groups** in Firebase Console and reference them in your Fastfile:

```ruby
firebase_app_distribution(
  app: "...",
  groups: "ios-qa-team, stakeholders",
  release_notes: "Latest build"
)
```

### Multi-Environment Lanes
If your project has multiple environments (Dev, SIT, UAT), create separate lanes per environment:

```ruby
lane :distribute_dev do
  build_ios_app(scheme: "MyApp-Dev", ...)
  firebase_app_distribution(app: "firebase-dev-app-id", groups: "developers", ...)
end

lane :distribute_uat do
  build_ios_app(scheme: "MyApp-UAT", ...)
  firebase_app_distribution(app: "firebase-uat-app-id", groups: "uat-testers", ...)
end
```

### Automate with GitHub Actions
To make distribution fully automatic (no manual `bundle exec fastlane distribute` needed), add a GitHub Actions workflow that triggers on push to specific branches. See the companion guide: **Fastlane + GitHub Actions**.

### Migrate Code Signing to Fastlane Match
For teams, replace manual certificate management with `fastlane match`, which stores all certificates and profiles in a private Git repo and syncs them automatically across all team members and CI machines.

### Add Slack Notifications
Add build notifications to your team's Slack channel:

```ruby
slack(
  message: "New iOS build distributed to Firebase! 🚀",
  channel: "#ios-builds",
  slack_url: ENV["SLACK_WEBHOOK_URL"]
)
```

---

## Quick Reference

```bash
# Install dependencies (first time setup)
bundle install

# Run the distribute lane
bundle exec fastlane distribute

# Build only (no upload, for testing)
bundle exec fastlane build_only

# Regenerate Firebase token
firebase login:ci

# List your Xcode schemes
xcodebuild -list

# View all available lanes
bundle exec fastlane lanes
```

---

## Project Structure After Setup

```
YourProject/
├── YourProject.xcodeproj
├── YourProject/
├── Gemfile                    ← Fastlane version lock
├── Gemfile.lock               ← Auto-generated, commit this
└── fastlane/
    ├── Appfile                ← Bundle ID + Apple ID
    ├── Fastfile               ← Your lanes (distribute, build_only, etc.)
    ├── Pluginfile             ← Firebase plugin reference
    ├── .env                   ← FIREBASE_TOKEN (add to .gitignore!)
    └── testers.txt            ← Tester emails (optional)
```

Add this to your `.gitignore`:

```
fastlane/.env
fastlane/report.xml
fastlane/Preview.html
fastlane/screenshots
fastlane/test_output
build/
*.ipa
*.dSYM.zip
```

---

*Guide written for Fastlane 2.x and Firebase App Distribution (2025). For the latest plugin parameters, refer to [firebase.google.com/docs/app-distribution](https://firebase.google.com/docs/app-distribution) and [docs.fastlane.tools](https://docs.fastlane.tools).*
