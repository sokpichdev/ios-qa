# MVP Feature Xcode Template (UIKit)

---

## Q: How do you create and install an Xcode File Template for a UIKit MVP architecture feature?

**Answer:**
An Xcode MVP Feature template generates four pre-wired files for UIKit screens (Contract, Presenter, View, and ViewController) using protocol abstractions and `@MainActor` isolation to maintain strict separation of concerns and full testability without simulator dependencies.

```
File ▸ New ▸ File from Template… ▸ UIKit ▸ MVP Feature ▸ "Profile"
```

Generates:
```
ProfileContract.swift        Protocols defining bidirectional view/presenter communication
ProfilePresenter.swift       Presentation logic (independent of UIKit)
ProfileView.swift            UIKit layout and subviews (no business logic)
ProfileViewController.swift  Coordinates the lifecycle, owns customView, and connects presenter
```

### 1. Installation Script

Run this shell script in **Terminal** to install the template into Xcode's user templates directory:

```bash
set -e
TPL=~/Library/Developer/Xcode/Templates/"File Templates"/UIKit/MVPFeature.xctemplate
mkdir -p "$TPL"; cd "$TPL"

V='___VARIABLE_productName:identifier___'
H='//
//  ___FILENAME___
//  ___PACKAGENAME___
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  ___COPYRIGHT___
//'

cat > TemplateInfo.plist <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Kind</key>
    <string>Xcode.IDEFoundation.TextSubstitutionFileTemplateKind</string>
    <key>Identifier</key>
    <string>com.template.UIKitMVPFeature</string>
    <key>Name</key>
    <string>MVP Feature</string>
    <key>Description</key>
    <string>Creates a UIKit MVP feature: Contract, Presenter, View and ViewController.</string>
    <key>Summary</key>
    <string>Create UIKit MVP Feature</string>
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
            <key>Description</key><string>Base name of the feature, e.g. Profile (no suffix).</string>
            <key>Type</key><string>text</string>
            <key>Required</key><true/>
            <key>NotPersisted</key><true/>
        </dict>
    </array>
</dict>
</plist>
EOF

cat > ___FILEBASENAME___Contract.swift <<EOF
$H

import Foundation

/// What the presenter is allowed to ask the view to do.
@MainActor
protocol ${V}ViewProtocol: AnyObject {
    func display(title: String)
}

/// What the view is allowed to ask the presenter to do.
@MainActor
protocol ${V}PresenterProtocol: AnyObject {
    func viewDidLoad()
}
EOF

cat > ___FILEBASENAME___Presenter.swift <<EOF
$H

import Foundation

final class ${V}Presenter: ${V}PresenterProtocol {

    /// Weak reference to avoid retain cycles with ViewController.
    private weak var view: ${V}ViewProtocol?

    init(view: ${V}ViewProtocol) {
        self.view = view
    }

    func viewDidLoad() {
        view?.display(title: "${V}")
    }
}
EOF

cat > ___FILEBASENAME___View.swift <<EOF
$H

import UIKit

/// All the layout for the screen. Holds no business logic.
final class ${V}View: UIView {

    let titleLabel: UILabel = {
        let label = UILabel()
        label.font = .preferredFont(forTextStyle: .largeTitle)
        label.numberOfLines = 0
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupViews()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func setupViews() {
        backgroundColor = .systemBackground

        addSubview(titleLabel)

        NSLayoutConstraint.activate([
            titleLabel.topAnchor.constraint(equalTo: safeAreaLayoutGuide.topAnchor, constant: 16),
            titleLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 16),
            titleLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -16)
        ])
    }
}
EOF

cat > ___FILEBASENAME___ViewController.swift <<EOF
$H

import UIKit

final class ${V}ViewController: UIViewController {

    private let customView = ${V}View()
    private lazy var presenter: ${V}PresenterProtocol = ${V}Presenter(view: self)

    override func loadView() {
        view = customView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        presenter.viewDidLoad()
    }
}

// MARK: - ${V}ViewProtocol

extension ${V}ViewController: ${V}ViewProtocol {

    func display(title: String) {
        customView.titleLabel.text = title
    }
}
EOF

plutil -lint TemplateInfo.plist
```

### 2. Architecture Details

- **Weak View Reference**: `Presenter` holds a `weak var view: ViewProtocol?` because `ViewController` owns the presenter. Strong back-references would create retain cycles and memory leaks.
- **Pure Swift Presenter**: The Presenter avoids importing `UIKit`, keeping business and presentation decisions decoupled from UI components.
- **Swift 6 Strict Concurrency**: All protocols and UI-facing types are annotated `@MainActor`.
- **Fast Unit Tests**: Presenter unit tests execute in milliseconds using a `ViewSpy` without launching a UIKit hierarchy or simulator.

### 3. Unit Testing the Presenter

```swift
import XCTest

@MainActor
final class ProfilePresenterTests: XCTestCase {

    final class ViewSpy: ProfileViewProtocol {
        var displayedTitle: String?
        func display(title: String) {
            displayedTitle = title
        }
    }

    func test_viewDidLoad_setsTitle() {
        let view = ViewSpy()
        let presenter = ProfilePresenter(view: view)

        presenter.viewDidLoad()

        XCTAssertEqual(view.displayedTitle, "Profile")
    }
}
```

**Tags:** `#xcode` `#templates` `#mvp` `#uikit` `#architecture` `#testing`
**Difficulty:** Intermediate
**References:**
- [How to create custom Xcode templates — Hacking with Swift](https://www.hackingwithswift.com/articles/230/how-to-create-custom-xcode-templates)

