# MVVM Feature Xcode Template (SwiftUI)

---

## Q: How do you create and install an Xcode File Template for a SwiftUI MVVM architecture feature?

**Answer:**
An Xcode MVVM Feature template generates three pre-wired files for SwiftUI screens (Model with explicit state enum, ViewModel with injectable service protocol, and View with StateObject autoclosure and previews) to guarantee unidirectional data flow and instant previewability without backend dependencies.

```
File ▸ New ▸ File from Template… ▸ SwiftUI ▸ MVVM Feature ▸ "Profile"
```

Generates:
```
ProfileModel.swift      Domain model and single-source-of-truth State enum
ProfileViewModel.swift  ObservableObject ViewModel with protocol-based service and stub
ProfileView.swift       SwiftUI View with StateObject, task lifecycle, and interactive previews
```

### 1. Installation Script

Run this shell script in **Terminal** to install the template into Xcode's user templates directory:

```bash
set -e
TPL=~/Library/Developer/Xcode/Templates/"File Templates"/SwiftUI/MVVMFeature.xctemplate
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
    <string>com.template.SwiftUIMVVMFeature</string>
    <key>Name</key>
    <string>MVVM Feature</string>
    <key>Description</key>
    <string>Creates a SwiftUI MVVM feature: Model, ViewModel and View.</string>
    <key>Summary</key>
    <string>Create SwiftUI MVVM Feature</string>
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

cat > ___FILEBASENAME___Model.swift <<EOF
$H

import Foundation

/// One row of data shown by the screen.
struct ${V}Item: Identifiable, Equatable {
    let id: UUID
    let title: String

    init(id: UUID = UUID(), title: String) {
        self.id = id
        self.title = title
    }
}

/// Every state the screen can be in, as a single value.
enum ${V}State: Equatable {
    case loading
    case loaded([${V}Item])
    case failed(String)
}
EOF

cat > ___FILEBASENAME___ViewModel.swift <<EOF
$H

import Foundation

/// The screen's data source, behind a protocol so it can be swapped
/// for a stub in tests and previews.
protocol ${V}Service {
    func fetchItems() async throws -> [${V}Item]
}

@MainActor
final class ${V}ViewModel: ObservableObject {

    @Published private(set) var state: ${V}State = .loading

    private let service: ${V}Service

    init(service: ${V}Service) {
        self.service = service
    }

    func load() async {
        state = .loading
        do {
            state = .loaded(try await service.fetchItems())
        } catch {
            state = .failed(error.localizedDescription)
        }
    }
}

#if DEBUG
/// Stub for previews and tests.
struct ${V}StubService: ${V}Service {
    var items: [${V}Item] = [${V}Item(title: "Example")]
    var error: Error?

    func fetchItems() async throws -> [${V}Item] {
        if let error { throw error }
        return items
    }
}
#endif
EOF

cat > ___FILEBASENAME___View.swift <<EOF
$H

import SwiftUI

struct ${V}View: View {

    @StateObject private var viewModel: ${V}ViewModel

    init(viewModel: @autoclosure @escaping () -> ${V}ViewModel) {
        _viewModel = StateObject(wrappedValue: viewModel())
    }

    var body: some View {
        content
            .task { await viewModel.load() }
    }

    @ViewBuilder
    private var content: some View {
        switch viewModel.state {
        case .loading:
            ProgressView()

        case .loaded(let items):
            List(items) { item in
                Text(item.title)
            }

        case .failed(let message):
            VStack(spacing: 12) {
                Text(message)
                    .multilineTextAlignment(.center)
                Button("Try Again") {
                    Task { await viewModel.load() }
                }
            }
            .padding()
        }
    }
}

#if DEBUG
#Preview("Loaded") {
    ${V}View(viewModel: ${V}ViewModel(service: ${V}StubService()))
}

#Preview("Failed") {
    ${V}View(viewModel: ${V}ViewModel(
        service: ${V}StubService(error: URLError(.notConnectedToInternet))
    ))
}
#endif
EOF

plutil -lint TemplateInfo.plist
```

### 2. Architecture Details

- **Single Enum State**: Rather than juggling multiple boolean flags (`isLoading`, `errorMessage`, `data`), one enum prevents impossible states (e.g. loading while displaying an error).
- **`@autoclosure` StateObject Injection**: Wrapping the ViewModel initialiser parameter in an autoclosure prevents unnecessary re-instantiation across parent view re-evaluations.
- **Protocol-driven Service**: Separating data fetching behind a `${V}Service` protocol enables stubbing in SwiftUI Canvas Previews and fast unit testing.
- **Swift Concurrency**: The `.task` modifier handles automatic cancellation when views disappear, while `@MainActor` on the ViewModel prevents race conditions.

### 3. Unit Testing the ViewModel

```swift
import XCTest

@MainActor
final class ProfileViewModelTests: XCTestCase {

    func test_load_succeeds() async {
        let item = ProfileItem(title: "Example")
        let viewModel = ProfileViewModel(
            service: ProfileStubService(items: [item])
        )

        await viewModel.load()

        XCTAssertEqual(viewModel.state, .loaded([item]))
    }

    func test_load_failure() async {
        let viewModel = ProfileViewModel(
            service: ProfileStubService(error: URLError(.badServerResponse))
        )

        await viewModel.load()

        guard case .failed = viewModel.state else {
            return XCTFail("expected .failed state")
        }
    }
}
```

**Tags:** `#xcode` `#templates` `#mvvm` `#swiftui` `#architecture` `#testing`
**Difficulty:** Intermediate
**References:**
- [Managing model data in your app — Apple Developer](https://developer.apple.com/documentation/swiftui/managing-model-data-in-your-app)
- [Create Xcode Templates: A Comprehensive Guide — Fabio Giannelli](https://medium.com/@fabiogiannelli/create-xcode-templates-a-comprehensive-guide-part-1-introduction-0e077352de9a)
- [How to create a custom Xcode template for coordinators — Hacking with Swift](https://www.hackingwithswift.com/articles/158/how-to-create-a-custom-xcode-template-for-coordinators)
- [How to create custom Xcode templates — Hacking with Swift](https://www.hackingwithswift.com/articles/230/how-to-create-custom-xcode-templates)


