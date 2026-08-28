# Xcode File Templates Guide

---

## Q: What are Xcode File Templates and how do you configure custom multi-file architecture templates?

**Answer:**
Xcode File Templates are blueprint files and metadata plists stored in `~/Library/Developer/Xcode/Templates/File Templates/` that allow generating multiple pre-wired Swift files with automatic text and identifier substitution in a single step.

Xcode locates custom templates inside your home directory:
```
~/Library/Developer/Xcode/Templates/
└── File Templates/
    └── <Section Name>/
        └── <TemplateName>.xctemplate/
            ├── TemplateInfo.plist
            └── ___FILEBASENAME___*.swift
```

### Key Components

1. **Folder Hierarchy**:
   - `File Templates`: Mandatory folder name required by Xcode.
   - `<Section Name>`: The category group displayed in Xcode's template picker (e.g., `UIKit`, `SwiftUI`, `Architecture`).
   - `<TemplateName>.xctemplate`: The template package folder. Must have the `.xctemplate` extension.

2. **The Two Placeholder Rules**:
   - `___FILEBASENAME___` in **file names**: Expands to the output file's own name without extension (e.g., `___FILEBASENAME___Presenter.swift` -> `ProfilePresenter.swift`).
   - `___VARIABLE_productName:identifier___` in **file contents**: Expands to the value entered in the template option dialog sanitized as a valid Swift identifier (e.g. `Profile`).
   - *Never* use `___FILEBASENAME___` inside file contents for multi-file templates, or it will generate doubled names like `ProfilePresenterPresenter`.

3. **`TemplateInfo.plist` Configuration**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Kind</key>
    <string>Xcode.IDEFoundation.TextSubstitutionFileTemplateKind</string>
    <key>Identifier</key>
    <string>com.template.ArchitectureFeature</string>
    <key>Name</key>
    <string>Architecture Feature</string>
    <key>Description</key>
    <string>Generates multi-file architecture components.</string>
    <key>Summary</key>
    <string>Architecture Feature Template</string>
    <key>SortOrder</key>
    <string>1</string>
    <key>Platforms</key>
    <array>
        <string>com.apple.platform.iphoneos</string>
    </array>
    <key>Options</key>
    <array>
        <dict>
            <key>Identifier</key><string>productName</string>
            <key>Name</key><string>Feature Name:</string>
            <key>Description</key><string>Base name of the feature (e.g. Profile)</string>
            <key>Type</key><string>text</string>
            <key>Required</key><true/>
            <key>NotPersisted</key><true/>
        </dict>
    </array>
</dict>
</plist>
```

### Full Placeholder Reference

| Placeholder | Expands To | Usage Scope |
|---|---|---|
| `___FILEBASENAME___` | The generated file's own name (without `.swift`) | Blueprint file names |
| `___VARIABLE_productName:identifier___` | The sanitized Swift identifier from the dialog prompt | Blueprint file contents |
| `___FILENAME___` | Full output filename with extension | Header comments |
| `___PACKAGENAME___` | Xcode target or package name | Header comments |
| `___FULLUSERNAME___` | macOS account full name | Header comments |
| `___DATE___` | Today's date (short format) | Header comments |
| `___COPYRIGHT___` | Project copyright header | Header comments |

### Using Custom Templates in Xcode

1. Select the destination group in Xcode's Project navigator.
2. Select **File ▸ New ▸ File from Template…** (Note: `File ▸ New ▸ File` only shows built-in templates).
3. Scroll to the bottom to find your custom category section.
4. Enter the feature name (e.g., `Profile`), click **Next**, enter the matching name in **Save As**, select the target membership, and click **Create**.

### Troubleshooting & Diagnostics

- **Template does not appear**: Ensure `TemplateInfo.plist` is valid (`plutil -lint TemplateInfo.plist`). Xcode must be fully quit (⌘Q) and restarted because templates load once at launch.
- **Empty type names in files**: Ensure `TemplateInfo.plist` includes the `Options` block declaring `productName`.
- **Doubled type names**: Replace `___FILEBASENAME___` inside file contents with `___VARIABLE_productName:identifier___`.

**Tags:** `#xcode` `#templates` `#tooling` `#architecture` `#code-generation`
**Difficulty:** Intermediate
**References:**
- [Create Custom Xcode Templates — Mindful Engineering](https://medium.com/mindful-engineering/create-custom-xcode-templates-908fdd14fbd8)
- [Create Xcode Templates: A Comprehensive Guide — Fabio Giannelli](https://medium.com/@fabiogiannelli/create-xcode-templates-a-comprehensive-guide-part-1-introduction-0e077352de9a)
- [Xcode Templates Tutorial — ITCraft](https://itcraftapps.com/blog/xcode-templates-tutorial/)
- [How to create custom Xcode templates — Hacking with Swift](https://www.hackingwithswift.com/articles/230/how-to-create-custom-xcode-templates)

---

## Q: How do you create your own custom Xcode File Template from scratch?

**Answer:**
To create a custom Xcode File Template from scratch, create a `.xctemplate` directory inside `~/Library/Developer/Xcode/Templates/File Templates/<Category>/`, add a `TemplateInfo.plist` declaring the substitution kind and options, and create blueprint source files with `___FILEBASENAME___` in file names and `___VARIABLE_productName:identifier___` in source code.

### Step-by-Step Guide

#### 1. Create the Template Directory
Choose a category name (e.g., `Architecture`, `Networking`, `VIPER`, or your company name) and a template folder ending with `.xctemplate`:

```bash
mkdir -p ~/Library/Developer/Xcode/Templates/"File Templates"/Architecture/VIPERFeature.xctemplate
cd ~/Library/Developer/Xcode/Templates/"File Templates"/Architecture/VIPERFeature.xctemplate
```

#### 2. Create `TemplateInfo.plist`
This file defines the template's metadata, picker UI, and user input variables:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Kind</key>
    <string>Xcode.IDEFoundation.TextSubstitutionFileTemplateKind</string>
    <key>Identifier</key>
    <string>com.mycompany.Architecture.VIPERFeature</string>
    <key>Name</key>
    <string>VIPER Feature</string>
    <key>Description</key>
    <string>Generates a complete VIPER module (View, Interactor, Presenter, Entity, Router).</string>
    <key>Summary</key>
    <string>Creates VIPER module files</string>
    <key>SortOrder</key>
    <string>1</string>
    <key>Platforms</key>
    <array>
        <string>com.apple.platform.iphoneos</string>
    </array>
    <key>Options</key>
    <array>
        <dict>
            <key>Identifier</key>
            <string>productName</string>
            <key>Name</key>
            <string>Feature Name:</string>
            <key>Description</key>
            <string>The base name of the module, e.g. Payment (no suffix).</string>
            <key>Type</key>
            <string>text</string>
            <key>Required</key>
            <true/>
            <key>NotPersisted</key>
            <true/>
        </dict>
    </array>
</dict>
</plist>
```

#### 3. Create the Blueprint Source Files
Create a file for each component your architecture requires. Name the files using `___FILEBASENAME___<Suffix>.swift`:

```bash
touch '___FILEBASENAME___Contract.swift'
touch '___FILEBASENAME___Presenter.swift'
touch '___FILEBASENAME___Interactor.swift'
touch '___FILEBASENAME___Router.swift'
touch '___FILEBASENAME___ViewController.swift'
```

#### 4. Author Blueprint Contents with Placeholders
Inside each file, use `___VARIABLE_productName:identifier___` for class, struct, and protocol names:

```swift
//
//  ___FILENAME___
//  ___PACKAGENAME___
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  ___COPYRIGHT___
//

import Foundation

/// Interactor logic for ___VARIABLE_productName:identifier___
final class ___VARIABLE_productName:identifier___Interactor: ___VARIABLE_productName:identifier___InteractorProtocol {
    weak var presenter: ___VARIABLE_productName:identifier___PresenterProtocol?

    func fetchData() {
        // Business logic here
    }
}
```

> **Crucial Rule:**
> - In **File Names**: Use `___FILEBASENAME___` (e.g. `___FILEBASENAME___Interactor.swift`).
> - In **File Contents**: Use `___VARIABLE_productName:identifier___` (e.g. `final class ___VARIABLE_productName:identifier___Interactor`).

#### 5. Adding Advanced Template Options (Checkboxes & Dropdowns)
You can prompt for additional options like including unit test files or choosing between UIKit and SwiftUI:

```xml
<dict>
    <key>Identifier</key>
    <string>hasUnitTests</string>
    <key>Name</key>
    <string>Include Unit Tests</string>
    <key>Description</key>
    <string>Generate a test file alongside the module</string>
    <key>Type</key>
    <string>checkbox</string>
    <key>Default</key>
    <string>true</string>
</dict>
```

#### 6. Validate and Test
Validate the plist syntax:
```bash
plutil -lint TemplateInfo.plist
```

Run an automated health check:
```bash
bash -c '
TPL=~/Library/Developer/Xcode/Templates/"File Templates"/Architecture/VIPERFeature.xctemplate
if [ -d "$TPL" ] && plutil -lint "$TPL/TemplateInfo.plist" >/dev/null 2>&1; then
    echo "✓ Template structure and plist are valid!"
else
    echo "✗ Check template folder or plist syntax."
fi
'
```

#### 7. Restart Xcode and Generate
1. Quit Xcode completely with **⌘Q** (templates load once on startup).
2. Reopen Xcode and open your project.
3. In the Project Navigator, select the destination group.
4. Go to **File ▸ New ▸ File from Template…**
5. Scroll down to your custom category (e.g., `Architecture`), select your template, and click **Next**.
6. Type the module name in **Feature Name:**, and type the same name in **Save As:**.

**Tags:** `#xcode` `#templates` `#architecture` `#code-generation` `#tooling`
**Difficulty:** Intermediate
**References:**
- [Create Custom Xcode Templates — Mindful Engineering](https://medium.com/mindful-engineering/create-custom-xcode-templates-908fdd14fbd8)
- [Create Xcode Templates: A Comprehensive Guide — Fabio Giannelli](https://medium.com/@fabiogiannelli/create-xcode-templates-a-comprehensive-guide-part-1-introduction-0e077352de9a)
- [Xcode Templates Tutorial — ITCraft](https://itcraftapps.com/blog/xcode-templates-tutorial/)
- [How to create custom Xcode templates — Hacking with Swift](https://www.hackingwithswift.com/articles/230/how-to-create-custom-xcode-templates)



