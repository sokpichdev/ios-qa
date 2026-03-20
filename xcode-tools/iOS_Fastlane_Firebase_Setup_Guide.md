# iOS App — Fastlane + Firebase App Distribution
## Complete Setup & Configuration Guide

---

## Table of Contents

1. [Overview](#1-overview)
2. [Environment Configuration](#2-environment-configuration)
3. [Prerequisites & Installation](#3-prerequisites--installation)
4. [Project Setup](#4-project-setup)
5. [Fastfile Configuration](#5-fastfile-configuration)
6. [Running the Lanes](#6-running-the-lanes)
7. [Firebase App Distribution](#7-firebase-app-distribution)
8. [Code Signing](#8-code-signing)
9. [Troubleshooting](#9-troubleshooting)
10. [Security Checklist](#10-security-checklist)
11. [Quick Reference](#11-quick-reference)

---

## 1. Overview

This guide describes the complete setup of Fastlane and Firebase CLI for automated iOS build distribution across multiple environments (e.g. Dev, SIT, UAT, and Prod). The workflow automates compiling the app and uploading it to Firebase App Distribution for internal testing.

### 1.1 Tools Used

| Tool | Version | Purpose |
|------|---------|---------|
| Fastlane | 2.232.2+ | Build automation and lane management |
| firebase_app_distribution plugin | 1.0.0+ | Upload IPA to Firebase App Distribution |
| Firebase CLI | Latest | Project authentication and group management |
| Ruby | 3.x / 4.x | Runtime for Fastlane |
| Bundler | Latest | Gem dependency management |
| Xcode | Latest | iOS build toolchain |

### 1.2 Firebase Project Info to Collect

Before starting, gather the following from your Firebase Console and Apple Developer account:

| Field | Where to Find It |
|-------|-----------------|
| Firebase Project ID | Firebase Console → Project Settings |
| Firebase App IDs (per environment) | Firebase Console → Project Settings → Your Apps |
| Apple Team ID | developer.apple.com → Account → Membership |
| Apple ID | Your Apple Developer account email |

---

## 2. Environment Configuration

A typical iOS project has multiple environments, each with its own Firebase App ID, bundle identifier, Xcode scheme, and provisioning profile. Adapt the table below to match your project setup.

| Environment | Scheme | Bundle ID | Export Method | Firebase App ID |
|-------------|--------|-----------|---------------|-----------------|
| Dev | Dev-`<YourApp>`-iOS | com.yourcompany.yourapp.dev | development | `<firebase-app-id-dev>` |
| SIT | SIT-`<YourApp>`-iOS | com.yourcompany.yourapp.sit | development | `<firebase-app-id-sit>` |
| UAT | UAT-`<YourApp>`-iOS | com.yourcompany.yourapp.uat | development | `<firebase-app-id-uat>` |
| Prod | `<YourApp>`-iOS | com.yourcompany.yourapp | ad-hoc | `<firebase-app-id-prod>` |

> **Note:** Scheme names must match exactly what appears in Xcode under **Product → Scheme → Manage Schemes**.

### 2.1 Provisioning Profiles

| Environment | Profile Name | Type |
|-------------|-------------|------|
| Dev | `<YourApp>`_Dev_Provisioning_Development | Development |
| SIT | `<YourApp>`_SIT_Provisioning_Development | Development |
| UAT | `<YourApp>`_UAT_Provisioning_Development | Development |
| Prod | `<YourApp>`_Provisioning_AdHoc | Ad-Hoc |

> **Note:** Dev, SIT, and UAT use development provisioning profiles. Prod uses an ad-hoc provisioning profile for wider distribution. All profiles are manually managed — **Automatically manage signing** must be turned **OFF** in Xcode.

---

## 3. Prerequisites & Installation

### 3.1 Install Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 3.2 Install Xcode Command Line Tools

```bash
xcode-select --install
```

### 3.3 Install Ruby via Homebrew

macOS ships with an outdated system Ruby (2.6) that has permission restrictions. Install a modern version via Homebrew instead:

```bash
brew install ruby

# Add to PATH (Apple Silicon machines use /opt/homebrew)
echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
ruby --version  # Should show 3.x or 4.x
```

### 3.4 Install Bundler

```bash
gem install bundler
```

### 3.5 Install Fastlane

```bash
brew install fastlane

# Verify
fastlane --version
```

### 3.6 Install Firebase CLI

```bash
npm install -g firebase-tools

# Authenticate
firebase login

# Verify project access
firebase projects:list
```

---

## 4. Project Setup

### 4.1 Initialize Fastlane

Navigate to the iOS project root and run:

```bash
cd /path/to/your-ios-project
fastlane init
# Select option 4: Manual setup
```

This creates the following structure:

```
YourApp-iOS/
├── fastlane/
│   ├── Fastfile
│   ├── Appfile
│   └── Pluginfile
├── Gemfile
└── Gemfile.lock
```

### 4.2 Install Firebase App Distribution Plugin

```bash
fastlane add_plugin firebase_app_distribution
# When prompted to modify Gemfile: enter y
```

### 4.3 Configure Appfile

The Appfile stores your app's core identifiers. Location: `fastlane/Appfile`

```ruby
app_identifier("com.yourcompany.yourapp")   # Default / Prod bundle ID
apple_id("your-apple-id@example.com")
team_id("YOUR_APPLE_TEAM_ID")
```

### 4.4 Generate Firebase CI Token

The Firebase CLI token allows Fastlane to authenticate with Firebase in non-interactive (CI) environments.

```bash
firebase login:ci
# Opens browser for authentication
# Copy the printed token — store it securely
```

> ⚠️ **WARNING:** Treat this token like a password. Never commit it to Git. If it is ever exposed, regenerate it immediately with `firebase login:ci`.

### 4.5 Create Environment File

Store the Firebase token in a local `.env` file that is excluded from version control:

```bash
# fastlane/.env
FIREBASE_TOKEN=your_firebase_ci_token_here
```

Add the following to your `.gitignore`:

```
fastlane/.env
build/
```

---

## 5. Fastfile Configuration

Full Fastfile location: `fastlane/Fastfile`

### 5.1 Complete Fastfile

The example below covers four environments. Adjust the scheme names, bundle IDs, provisioning profile names, and Firebase App IDs to match your project.

```ruby
default_platform(:ios)

platform :ios do

  # ─────────────────────────────────────────────
  # Helper: collect tester and release note input
  # ─────────────────────────────────────────────
  def get_distribution_inputs
    testers_input = UI.input("Enter tester emails (comma separated, or press Enter for all testers): ")
    release_notes = UI.input("Enter release notes: ")
    testers = testers_input.strip.empty? ? nil : testers_input
    groups  = testers_input.strip.empty? ? "internal-testers" : nil
    return testers, groups, release_notes
  end

  # ─────────────────────────────────────────────
  # Dev
  # ─────────────────────────────────────────────
  desc "Distribute Dev"
  lane :distribute_dev do
    testers, groups, release_notes = get_distribution_inputs

    build_app(
      scheme: "Dev-<YourApp>-iOS",
      export_method: "development",
      export_options: {
        signingStyle: "manual",
        provisioningProfiles: {
          "com.yourcompany.yourapp.dev" => "<YourApp>_Dev_Provisioning_Development"
        }
      },
      output_directory: "./build",
      output_name: "<YourApp>-Dev.ipa"
    )

    firebase_app_distribution(
      app: "<firebase-app-id-dev>",
      testers: testers,
      groups: groups,
      release_notes: release_notes,
      ipa_path: "./build/<YourApp>-Dev.ipa",
      firebase_cli_token: ENV["FIREBASE_TOKEN"]
    )
  end

  # ─────────────────────────────────────────────
  # SIT
  # ─────────────────────────────────────────────
  desc "Distribute SIT"
  lane :distribute_sit do
    testers, groups, release_notes = get_distribution_inputs

    build_app(
      scheme: "SIT-<YourApp>-iOS",
      export_method: "development",
      export_options: {
        signingStyle: "manual",
        provisioningProfiles: {
          "com.yourcompany.yourapp.sit" => "<YourApp>_SIT_Provisioning_Development"
        }
      },
      output_directory: "./build",
      output_name: "<YourApp>-SIT.ipa"
    )

    firebase_app_distribution(
      app: "<firebase-app-id-sit>",
      testers: testers,
      groups: groups,
      release_notes: release_notes,
      ipa_path: "./build/<YourApp>-SIT.ipa",
      firebase_cli_token: ENV["FIREBASE_TOKEN"]
    )
  end

  # ─────────────────────────────────────────────
  # UAT
  # ─────────────────────────────────────────────
  desc "Distribute UAT"
  lane :distribute_uat do
    testers, groups, release_notes = get_distribution_inputs

    build_app(
      scheme: "UAT-<YourApp>-iOS",
      export_method: "development",
      export_options: {
        signingStyle: "manual",
        provisioningProfiles: {
          "com.yourcompany.yourapp.uat" => "<YourApp>_UAT_Provisioning_Development"
        }
      },
      output_directory: "./build",
      output_name: "<YourApp>-UAT.ipa"
    )

    firebase_app_distribution(
      app: "<firebase-app-id-uat>",
      testers: testers,
      groups: groups,
      release_notes: release_notes,
      ipa_path: "./build/<YourApp>-UAT.ipa",
      firebase_cli_token: ENV["FIREBASE_TOKEN"]
    )
  end

  # ─────────────────────────────────────────────
  # Prod
  # ─────────────────────────────────────────────
  desc "Distribute Prod"
  lane :distribute_prod do
    testers, groups, release_notes = get_distribution_inputs

    build_app(
      scheme: "<YourApp>-iOS",
      export_method: "ad-hoc",
      export_options: {
        signingStyle: "manual",
        provisioningProfiles: {
          "com.yourcompany.yourapp" => "<YourApp>_Provisioning_AdHoc"
        }
      },
      output_directory: "./build",
      output_name: "<YourApp>-Prod.ipa"
    )

    firebase_app_distribution(
      app: "<firebase-app-id-prod>",
      testers: testers,
      groups: groups,
      release_notes: release_notes,
      ipa_path: "./build/<YourApp>-Prod.ipa",
      firebase_cli_token: ENV["FIREBASE_TOKEN"]
    )
  end

end
```

### 5.2 Helper Method Behaviour

The `get_distribution_inputs` helper is called at the start of every lane:

- **Press Enter** → distributes to the `internal-testers` group (all registered testers)
- **Type specific emails** → distributes only to those addresses (comma-separated)

---

## 6. Running the Lanes

### 6.1 Commands

| Environment | Command |
|-------------|---------|
| Dev | `bundle exec fastlane distribute_dev` |
| SIT | `bundle exec fastlane distribute_sit` |
| UAT | `bundle exec fastlane distribute_uat` |
| Prod | `bundle exec fastlane distribute_prod` |

### 6.2 Interactive Prompts

Each lane prompts for two inputs before building:

```
Enter tester emails (comma separated, or press Enter for all testers):
> [press Enter for all, or type: user1@email.com, user2@email.com]

Enter release notes:
> Fixed login bug, updated dashboard UI
```

### 6.3 Expected Output

A successful run produces a summary like:

```
+--------------------------------------------------+
|               fastlane summary                   |
+------+---------------------------+---------------+
| Step | Action                    | Time (in s)   |
+------+---------------------------+---------------+
| 1    | default_platform          | 0             |
| 2    | build_app                 | 135           |
| 3    | firebase_app_distribution | 18            |
+------+---------------------------+---------------+

fastlane.tools finished successfully 🎉
```

---

## 7. Firebase App Distribution

### 7.1 Tester Groups

Testers are organised into named groups in Firebase. The default group used by this setup is:

| Field | Value |
|-------|-------|
| Group Display Name | Internal Testers |
| Group Alias | `internal-testers` |
| Firebase Project ID | `<your-firebase-project-id>` |

You can create and manage groups from the Firebase Console under **App Distribution → Testers & Groups**.

### 7.2 Useful Firebase CLI Commands

List all tester groups:

```bash
firebase appdistribution:groups:list --project <your-firebase-project-id>
```

List all apps in a project:

```bash
firebase apps:list --project <your-firebase-project-id>
```

### 7.3 Switching Firebase Accounts

```bash
firebase logout
firebase login
firebase login:list  # verify active account
```

---

## 8. Code Signing

### 8.1 Approach

This setup uses **manual code signing**. Automatic signing is disabled in Xcode. Each target has its provisioning profile explicitly set in the Fastfile.

**Why manual over Match:**
- Simpler for single-developer or small-team setups
- No need for a separate certificates Git repository
- Profiles already configured and working in Xcode
- Can migrate to Fastlane Match later if the team grows

### 8.2 Xcode Settings

| Setting | Value |
|---------|-------|
| Automatically manage signing | **OFF** (unchecked) |
| Signing Style | Manual |
| Signing Certificate | iPhone Distribution (per environment) |
| Provisioning Profile | Set per target/scheme |

### 8.3 Provisioning Profile Notes

**Development profiles (Dev, SIT, UAT):**
- Require device UDIDs to be registered in Apple Developer Portal
- New testers must have their device UDID added before they can install the app
- After adding a UDID, regenerate the profile and rebuild

**Ad-hoc profile (Prod):**
- Also requires device UDIDs to be registered in Apple Developer Portal
- Supports up to 100 devices per year
- Appropriate for wider pre-release / beta distribution

---

## 9. Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `zsh: command not found: fastlane` | Fastlane not installed | `brew install fastlane` |
| `FilePermissionError` for Ruby Gems | Using system Ruby (2.6) | `brew install ruby` and update PATH to `/opt/homebrew` |
| `Could not find bundler` | Wrong Ruby version active | `source ~/.zshrc` then verify `ruby --version` shows 3.x or 4.x |
| Code signing error | Wrong profile or bundle ID mismatch | Check bundle ID in Xcode matches the `provisioningProfiles` key in Fastfile |
| Firebase auth error | Token expired or missing | Run `firebase login:ci` to generate a new token and update `fastlane/.env` |
| `build_app` scheme not found | Wrong scheme name | Check exact scheme name in Xcode → Product → Scheme → Manage Schemes |
| Firebase group not found | Wrong group alias | Run `firebase appdistribution:groups:list` to confirm the correct alias |
| `increment_version_number` fails | Wrong `.xcodeproj` name | Verify the `.xcodeproj` filename matches what Fastlane expects |

---

## 10. Security Checklist

- [ ] `fastlane/.env` is added to `.gitignore` — **never commit the Firebase token**
- [ ] `build/` directory is added to `.gitignore` — **never commit compiled IPAs**
- [ ] Firebase CI token is regenerated periodically
- [ ] If the Firebase token is ever exposed, regenerate it immediately: `firebase login:ci`
- [ ] Apple Team ID and App IDs are internal — do not share publicly
- [ ] Provisioning profiles contain signing credentials — manage only via Apple Developer Portal

---

## 11. Quick Reference

### Daily Usage

```bash
# Build and distribute to Dev
bundle exec fastlane distribute_dev

# Build and distribute to SIT
bundle exec fastlane distribute_sit

# Build and distribute to UAT
bundle exec fastlane distribute_uat

# Build and distribute to Prod
bundle exec fastlane distribute_prod
```

### Useful Firebase CLI Commands

```bash
# List all Firebase projects you have access to
firebase projects:list

# List all apps in a project
firebase apps:list --project <your-firebase-project-id>

# List tester groups
firebase appdistribution:groups:list --project <your-firebase-project-id>

# Generate a new CI token
firebase login:ci

# Switch accounts
firebase logout && firebase login
```

### Key Files

| File | Purpose |
|------|---------|
| `fastlane/Fastfile` | Lane definitions and build logic |
| `fastlane/Appfile` | App identifiers (bundle ID, Apple ID, Team ID) |
| `fastlane/Pluginfile` | Plugin declarations (firebase_app_distribution) |
| `fastlane/.env` | Firebase CI token — **never commit** |
| `Gemfile` | Ruby gem dependencies |

---

## Resources

- [Fastlane Documentation](https://docs.fastlane.tools)
- [Firebase App Distribution](https://firebase.google.com/docs/app-distribution)
- [fastlane-plugin-firebase_app_distribution](https://github.com/fastlane/fastlane-plugin-firebase_app_distribution)
- [Apple Developer Portal](https://developer.apple.com/account)

---

*— End of Document —*
