#!/usr/bin/env bash
#
# install-xcode-templates.sh
# Installs custom Xcode architecture templates (MVP Feature for UIKit & MVVM Feature for SwiftUI)
# into ~/Library/Developer/Xcode/Templates/File Templates/
#

set -euo pipefail

BASE_DEST="$HOME/Library/Developer/Xcode/Templates/File Templates"
MVP_DEST="$BASE_DEST/UIKit/MVPFeature.xctemplate"
MVVM_DEST="$BASE_DEST/SwiftUI/MVVMFeature.xctemplate"

echo "==> Installing Xcode Architecture File Templates..."

# -------------------------------------------------------------
# 1. UIKit MVP Feature Template
# -------------------------------------------------------------
echo "==> Installing UIKit MVP Feature Template..."
mkdir -p "$MVP_DEST"

cat > "$MVP_DEST/TemplateInfo.plist" <<'EOF'
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

cat > "$MVP_DEST/___FILEBASENAME___Contract.swift" <<'EOF'
//
//  ___FILENAME___
//  ___PACKAGENAME___
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  ___COPYRIGHT___
//

import Foundation

/// What the presenter is allowed to ask the view to do.
@MainActor
protocol ___VARIABLE_productName:identifier___ViewProtocol: AnyObject {
    func display(title: String)
}

/// What the view is allowed to ask the presenter to do.
@MainActor
protocol ___VARIABLE_productName:identifier___PresenterProtocol: AnyObject {
    func viewDidLoad()
}
EOF

cat > "$MVP_DEST/___FILEBASENAME___Presenter.swift" <<'EOF'
//
//  ___FILENAME___
//  ___PACKAGENAME___
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  ___COPYRIGHT___
//

import Foundation

final class ___VARIABLE_productName:identifier___Presenter: ___VARIABLE_productName:identifier___PresenterProtocol {

    /// Weak reference to avoid retain cycles with ViewController.
    private weak var view: ___VARIABLE_productName:identifier___ViewProtocol?

    init(view: ___VARIABLE_productName:identifier___ViewProtocol) {
        self.view = view
    }

    func viewDidLoad() {
        view?.display(title: "___VARIABLE_productName:identifier___")
    }
}
EOF

cat > "$MVP_DEST/___FILEBASENAME___View.swift" <<'EOF'
//
//  ___FILENAME___
//  ___PACKAGENAME___
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  ___COPYRIGHT___
//

import UIKit

/// All the layout for the screen. Holds no business logic.
final class ___VARIABLE_productName:identifier___View: UIView {

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

cat > "$MVP_DEST/___FILEBASENAME___ViewController.swift" <<'EOF'
//
//  ___FILENAME___
//  ___PACKAGENAME___
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  ___COPYRIGHT___
//

import UIKit

final class ___VARIABLE_productName:identifier___ViewController: UIViewController {

    private let customView = ___VARIABLE_productName:identifier___View()
    private lazy var presenter: ___VARIABLE_productName:identifier___PresenterProtocol = ___VARIABLE_productName:identifier___Presenter(view: self)

    override func loadView() {
        view = customView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        presenter.viewDidLoad()
    }
}

// MARK: - ___VARIABLE_productName:identifier___ViewProtocol

extension ___VARIABLE_productName:identifier___ViewController: ___VARIABLE_productName:identifier___ViewProtocol {

    func display(title: String) {
        customView.titleLabel.text = title
    }
}
EOF

plutil -lint "$MVP_DEST/TemplateInfo.plist" >/dev/null
echo "✓ MVP Feature Template installed to $MVP_DEST"

# -------------------------------------------------------------
# 2. SwiftUI MVVM Feature Template
# -------------------------------------------------------------
echo "==> Installing SwiftUI MVVM Feature Template..."
mkdir -p "$MVVM_DEST"

cat > "$MVVM_DEST/TemplateInfo.plist" <<'EOF'
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

cat > "$MVVM_DEST/___FILEBASENAME___Model.swift" <<'EOF'
//
//  ___FILENAME___
//  ___PACKAGENAME___
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  ___COPYRIGHT___
//

import Foundation

/// One row of data shown by the screen.
struct ___VARIABLE_productName:identifier___Item: Identifiable, Equatable {
    let id: UUID
    let title: String

    init(id: UUID = UUID(), title: String) {
        self.id = id
        self.title = title
    }
}

/// Every state the screen can be in, as a single value.
enum ___VARIABLE_productName:identifier___State: Equatable {
    case loading
    case loaded([___VARIABLE_productName:identifier___Item])
    case failed(String)
}
EOF

cat > "$MVVM_DEST/___FILEBASENAME___ViewModel.swift" <<'EOF'
//
//  ___FILENAME___
//  ___PACKAGENAME___
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  ___COPYRIGHT___
//

import Foundation

/// The screen's data source, behind a protocol so it can be swapped
/// for a stub in tests and previews.
protocol ___VARIABLE_productName:identifier___Service {
    func fetchItems() async throws -> [___VARIABLE_productName:identifier___Item]
}

@MainActor
final class ___VARIABLE_productName:identifier___ViewModel: ObservableObject {

    @Published private(set) var state: ___VARIABLE_productName:identifier___State = .loading

    private let service: ___VARIABLE_productName:identifier___Service

    init(service: ___VARIABLE_productName:identifier___Service) {
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
struct ___VARIABLE_productName:identifier___StubService: ___VARIABLE_productName:identifier___Service {
    var items: [___VARIABLE_productName:identifier___Item] = [___VARIABLE_productName:identifier___Item(title: "Example")]
    var error: Error?

    func fetchItems() async throws -> [___VARIABLE_productName:identifier___Item] {
        if let error { throw error }
        return items
    }
}
#endif
EOF

cat > "$MVVM_DEST/___FILEBASENAME___View.swift" <<'EOF'
//
//  ___FILENAME___
//  ___PACKAGENAME___
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  ___COPYRIGHT___
//

import SwiftUI

struct ___VARIABLE_productName:identifier___View: View {

    @StateObject private var viewModel: ___VARIABLE_productName:identifier___ViewModel

    init(viewModel: @autoclosure @escaping () -> ___VARIABLE_productName:identifier___ViewModel) {
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
    ___VARIABLE_productName:identifier___View(viewModel: ___VARIABLE_productName:identifier___ViewModel(service: ___VARIABLE_productName:identifier___StubService()))
}

#Preview("Failed") {
    ___VARIABLE_productName:identifier___View(viewModel: ___VARIABLE_productName:identifier___ViewModel(
        service: ___VARIABLE_productName:identifier___StubService(error: URLError(.notConnectedToInternet))
    ))
}
#endif
EOF

plutil -lint "$MVVM_DEST/TemplateInfo.plist" >/dev/null
echo "✓ MVVM Feature Template installed to $MVVM_DEST"

echo
echo "🎉 Templates installed successfully!"
echo "👉 Note: If Xcode is currently open, quit with ⌘Q and restart it to refresh template cache."
echo "👉 In Xcode: Use File ▸ New ▸ File from Template… to generate architecture screens."
