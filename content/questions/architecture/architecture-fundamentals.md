# Architecture — Fundamentals

---

## Q: What is the difference between MVC, MVVM, and MVP?

**Answer:**
All three separate concerns between data, UI, and logic — but they differ in how the middle layer connects to the view.

| | MVC | MVVM | MVP |
|--|-----|------|-----|
| Middle layer | Controller | ViewModel | Presenter |
| View ↔ Logic | Direct (tight coupling) | Data binding | Interface/protocol |
| Testability | Hard | Easy | Easy |
| iOS default | ✅ UIKit default | Popular in SwiftUI | Less common |

**MVC (Apple's flavor):**
```swift
// ViewController does too much — known as "Massive View Controller"
class UserViewController: UIViewController {
    func viewDidLoad() {
        super.viewDidLoad()
        fetchUser()  // network call in VC ❌
    }
}
```

**MVVM:**
```swift
// ViewModel handles logic, View just renders
class UserViewModel: ObservableObject {
    @Published var displayName = ""
    func load() async { displayName = await fetchUser().name }
}
struct UserView: View {
    @StateObject var vm = UserViewModel()
    var body: some View { Text(vm.displayName).task { await vm.load() } }
}
```

**Tags:** `#architecture` `#mvc` `#mvvm` `#interview`
**Difficulty:** Intermediate

---

## Q: What is Dependency Injection and why is it important?

**Answer:**
Dependency Injection (DI) means a type receives its dependencies from outside rather than creating them internally. This makes code testable, modular, and easier to change.

**Code Example:**
```swift
// ❌ Without DI — hard to test, tightly coupled
class OrderService {
    private let network = NetworkClient()  // created internally
    private let db = Database()
}

// ✅ With DI — inject dependencies
class OrderService {
    private let network: NetworkClientProtocol
    private let db: DatabaseProtocol

    init(network: NetworkClientProtocol, db: DatabaseProtocol) {
        self.network = network
        self.db = db
    }
}

// Production
let service = OrderService(network: NetworkClient(), db: Database())

// Testing — inject mocks
let service = OrderService(network: MockNetwork(), db: MockDatabase())
```

**Three types:**
- **Constructor injection** — via `init` (preferred)
- **Property injection** — via settable property
- **Method injection** — via function parameter

**Tags:** `#architecture` `#dependency-injection` `#testing` `#interview`
**Difficulty:** Intermediate

---

## Q: What is the Repository pattern?

**Answer:**
The Repository pattern abstracts the data layer behind a protocol. The rest of the app doesn't know or care whether data comes from a network, database, or cache.

**Code Example:**
```swift
// Protocol — defines what the repo can do
protocol ArticleRepository {
    func fetchAll() async throws -> [Article]
    func fetch(id: String) async throws -> Article
    func save(_ article: Article) async throws
}

// Real implementation — hits network + caches to CoreData
class RemoteArticleRepository: ArticleRepository {
    func fetchAll() async throws -> [Article] {
        let articles = try await api.getArticles()
        cache.save(articles)
        return articles
    }
}

// Test implementation — returns fake data instantly
class MockArticleRepository: ArticleRepository {
    func fetchAll() async throws -> [Article] {
        return [Article.mock()]
    }
}

// ViewModel uses the protocol — doesn't know which implementation it has
class ArticleViewModel: ObservableObject {
    private let repo: ArticleRepository
    init(repo: ArticleRepository) { self.repo = repo }
}
```

**Tags:** `#architecture` `#repository` `#testability` `#interview`
**Difficulty:** Intermediate

---

## Q: What is the Singleton pattern and what are its downsides?

**Answer:**
A Singleton ensures only one instance of a class exists globally. It's convenient but widely overused in iOS.

**Code Example:**
```swift
// Standard Swift singleton
class AnalyticsManager {
    static let shared = AnalyticsManager()
    private init() {}  // prevent external instantiation

    func track(_ event: String) { ... }
}

// Usage
AnalyticsManager.shared.track("button_tapped")
```

**Downsides:**
- **Hard to test** — can't inject a mock; tests share global state
- **Hidden dependencies** — callers depend on it without declaring it
- **Threading issues** — shared mutable state needs synchronization
- **Tight coupling** — callers are coupled to the concrete type

**When it's acceptable:**
- Logging, analytics, app-level config (read-only)
- Avoid for anything that manages data or has side effects

**Tags:** `#architecture` `#singleton` `#patterns` `#interview`
**Difficulty:** Intermediate

---

## Q: What is the difference between composition and inheritance?

**Answer:**
- **Inheritance** — a class derives behaviour from a parent class ("is-a" relationship)
- **Composition** — a type gets behaviour by holding references to other objects ("has-a" relationship)

Swift favours composition through protocols and protocol extensions.

**Code Example:**
```swift
// ❌ Inheritance — rigid, can't mix and match
class Animal {
    func breathe() { }
}
class Dog: Animal {
    func bark() { }
}
class FlyingDog: Dog { }  // gets everything even if unneeded

// ✅ Composition — flexible, modular
protocol Breathable { func breathe() }
protocol Swimmable { func swim() }
protocol Flyable { func fly() }

struct Duck: Breathable, Swimmable, Flyable {
    func breathe() { }
    func swim() { }
    func fly() { }
}

// Protocol extensions provide default implementations
extension Swimmable {
    func swim() { print("Splashing...") }
}
```

**Tags:** `#architecture` `#composition` `#inheritance` `#protocols` `#interview`
**Difficulty:** Intermediate

---

## Q: What is SOLID and how does it apply to Swift?

**Answer:**
SOLID is five principles for writing maintainable, extensible code.

**S — Single Responsibility:** A type should do one thing.
```swift
// ❌ ViewController fetching, parsing, and displaying
// ✅ Separate into ViewController + ViewModel + Repository
```

**O — Open/Closed:** Open for extension, closed for modification.
```swift
protocol PaymentMethod { func pay(amount: Double) }
struct ApplePay: PaymentMethod { func pay(amount: Double) { } }
struct CreditCard: PaymentMethod { func pay(amount: Double) { } }
// Add new payment types without changing existing code
```

**L — Liskov Substitution:** Subtypes must be substitutable for base types.
```swift
// Any ArticleRepository implementation should work wherever the protocol is used
```

**I — Interface Segregation:** Prefer small, focused protocols.
```swift
protocol Readable { func read() -> Data }
protocol Writable { func write(_ data: Data) }
// Rather than one large DataStore protocol
```

**D — Dependency Inversion:** Depend on abstractions, not concretions.
```swift
class ViewModel {
    let repo: ArticleRepository  // protocol, not RemoteArticleRepository
}
```

**Tags:** `#architecture` `#solid` `#interview`
**Difficulty:** Intermediate

---

## Q: What is the Observer pattern and how is it used in iOS?

**Answer:**
The Observer pattern lets objects subscribe to events from another object without tight coupling. One-to-many event broadcasting.

**iOS implementations:**

```swift
// 1. Combine / @Published (modern, SwiftUI)
class ViewModel: ObservableObject {
    @Published var count = 0
}
// Views automatically observe and re-render

// 2. NotificationCenter (app-wide broadcasts)
NotificationCenter.default.post(name: .userLoggedIn, object: nil)
NotificationCenter.default.addObserver(self,
    selector: #selector(handleLogin),
    name: .userLoggedIn, object: nil)

// 3. Delegate pattern (one-to-one observer)
protocol DownloadDelegate: AnyObject {
    func didFinishDownload(url: URL)
}
class Downloader {
    weak var delegate: DownloadDelegate?
}

// 4. KVO (Key-Value Observing) — mostly Objective-C legacy
```

**Tags:** `#architecture` `#observer` `#combine` `#patterns` `#interview`
**Difficulty:** Intermediate
**References:**
- [Observation — Apple Developer](https://developer.apple.com/documentation/observation)

---

## Q: What is the Factory pattern?

**Answer:**
The Factory pattern creates objects without exposing the creation logic. The caller asks for an object and gets one back — without knowing which concrete type was created.

**Code Example:**
```swift
// Simple factory function
enum Environment { case dev, staging, production }

struct NetworkClientFactory {
    static func make(for environment: Environment) -> NetworkClientProtocol {
        switch environment {
        case .dev:
            return MockNetworkClient()
        case .staging:
            return NetworkClient(baseURL: "https://staging.api.com")
        case .production:
            return NetworkClient(baseURL: "https://api.com")
        }
    }
}

// Caller doesn't care which type comes back
let client = NetworkClientFactory.make(for: .production)

// Factory method on a protocol
protocol ViewControllerFactory {
    func makeLoginViewController() -> UIViewController
    func makeHomeViewController() -> UIViewController
}
```

**Tags:** `#architecture` `#factory` `#patterns`
**Difficulty:** Intermediate

---

## Q: What is Clean Architecture in iOS?

**Answer:**
Clean Architecture organises code into concentric layers where dependencies only point inward. The inner layers have no knowledge of the outer layers.

```
[ UI / Presentation ]
       ↓
[ Use Cases / Interactors ]
       ↓
[ Domain / Entities ]
       ↑
[ Data / Repositories ]  (implements interfaces defined in Domain)
```

**Key rule:** The Domain layer has zero imports of UIKit, SwiftUI, or any framework.

**Code Example:**
```swift
// Domain — pure Swift, no framework imports
struct Article { let id: String; let title: String }

protocol ArticleRepository {
    func fetchAll() async throws -> [Article]
}

class FetchArticlesUseCase {
    private let repo: ArticleRepository
    init(repo: ArticleRepository) { self.repo = repo }
    func execute() async throws -> [Article] { try await repo.fetchAll() }
}

// Data layer — implements the protocol
class RemoteArticleRepository: ArticleRepository { ... }

// Presentation layer — uses the use case
class ArticleViewModel: ObservableObject {
    private let useCase: FetchArticlesUseCase
    @Published var articles: [Article] = []
    func load() async { articles = try await useCase.execute() }
}
```

**Tags:** `#architecture` `#clean-architecture` `#advanced` `#interview`
**Difficulty:** Intermediate

---

## Q: What is TCA (The Composable Architecture)?

**Answer:**
TCA is an open-source architecture library by Point-Free. It structures apps around a unidirectional data flow: `State`, `Action`, `Reducer`, and `Effect`.

```
View → sends Action → Reducer → mutates State → View re-renders
                           ↓
                        Effect (async work) → returns Action
```

**Code Example:**
```swift
import ComposableArchitecture

@Reducer
struct Counter {
    struct State: Equatable {
        var count = 0
    }

    enum Action {
        case increment
        case decrement
    }

    var body: some Reducer<State, Action> {
        Reduce { state, action in
            switch action {
            case .increment: state.count += 1; return .none
            case .decrement: state.count -= 1; return .none
            }
        }
    }
}

struct CounterView: View {
    let store: StoreOf<Counter>
    var body: some View {
        WithViewStore(store, observe: { $0 }) { viewStore in
            HStack {
                Button("-") { viewStore.send(.decrement) }
                Text("\(viewStore.count)")
                Button("+") { viewStore.send(.increment) }
            }
        }
    }
}
```

**Tags:** `#architecture` `#tca` `#advanced` `#swiftui`
**Difficulty:** Intermediate
**References:**
- [pointfreeco/swift-composable-architecture — GitHub](https://github.com/pointfreeco/swift-composable-architecture)
