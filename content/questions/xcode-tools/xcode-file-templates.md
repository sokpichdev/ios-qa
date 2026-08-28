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
- [Customizing Xcode file templates — Apple Developer](https://developer.apple.com/documentation/xcode)
- [Creating custom Xcode project and file templates — Swift by Sundell](https://swiftbysundell.com/articles/creating-custom-xcode-project-and-file-templates/)
- [How to create custom Xcode templates — Hacking with Swift](https://www.hackingwithswift.com/articles/230/how-to-create-custom-xcode-templates)
