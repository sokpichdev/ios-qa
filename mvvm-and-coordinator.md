# Architecture

---

## Q: What is MVVM and how does it work in iOS?

**Answer:**
MVVM (Model-View-ViewModel) separates business logic from UI. The ViewModel exposes data and actions; the View observes and renders. No direct reference from ViewModel → View.

```
Model ←→ ViewModel ←→ View
           ↑
    (no UIKit/SwiftUI imports)
```

**Code Example:**
```swift
// Model
struct Article: Codable {
    let title: String
    let body: String
}

// ViewModel — no UIKit, no View references
@MainActor
class ArticleViewModel: ObservableObject {
    @Published var title: String = ""
    @Published var body: String = ""
    @Published var isLoading: Bool = false

    func load(id: String) async {
        isLoading = true
        let article = try? await ArticleService.fetch(id: id)
        title = article?.title ?? ""
        body = article?.body ?? ""
        isLoading = false
    }
}

// View — only rendering logic
struct ArticleView: View {
    @StateObject var viewModel = ArticleViewModel()

    var body: some View {
        VStack {
            if viewModel.isLoading {
                ProgressView()
            } else {
                Text(viewModel.title).font(.title)
                Text(viewModel.body)
            }
        }
        .task { await viewModel.load(id: "123") }
    }
}
```

**Tags:** `#architecture` `#mvvm` `#swiftui` `#interview`

---

## Q: What is the Coordinator pattern and why use it?

**Answer:**
The Coordinator pattern moves navigation logic out of ViewControllers into dedicated Coordinator objects. Each coordinator owns a navigation flow.

**Why:**
- ViewControllers shouldn't know about other ViewControllers
- Enables reuse and deep-linking
- Easier to test navigation flows

**Code Example:**
```swift
protocol Coordinator: AnyObject {
    var navigationController: UINavigationController { get }
    func start()
}

class HomeCoordinator: Coordinator {
    var navigationController: UINavigationController
    
    init(nav: UINavigationController) {
        self.navigationController = nav
    }

    func start() {
        let vc = HomeViewController()
        vc.coordinator = self
        navigationController.pushViewController(vc, animated: false)
    }

    func showDetail(for item: Item) {
        let vc = DetailViewController(item: item)
        vc.coordinator = self
        navigationController.pushViewController(vc, animated: true)
    }
}
```

**Tags:** `#architecture` `#coordinator` `#uikit` `#navigation`
