# Testing — Fundamentals

---

## Q: What is the difference between unit tests and UI tests?

**Answer:**
They test different layers of the app and run at different speeds.

| | Unit Tests | UI Tests |
|--|-----------|----------|
| What | Isolated logic | Full app user flows |
| Speed | Very fast (ms) | Slow (seconds) |
| Framework | `XCTest` | `XCUITest` |
| Dependencies | Mocked | Real app running |
| Flakiness | Low | Higher |

**Code Example:**
```swift
// Unit test — tests a function in isolation
class PriceFormatterTests: XCTestCase {
    func test_formatPrice_returnsCurrencyString() {
        let formatter = PriceFormatter()
        let result = formatter.format(9.99)
        XCTAssertEqual(result, "$9.99")
    }
}

// UI test — launches the app and interacts with it
class CheckoutUITests: XCTestCase {
    let app = XCUIApplication()

    override func setUp() { app.launch() }

    func test_addToCart_showsCartBadge() {
        app.buttons["Add to Cart"].tap()
        XCTAssertTrue(app.staticTexts["1"].exists)
    }
}
```

**Tags:** `#testing` `#unit-tests` `#ui-tests` `#interview`
**Difficulty:** Intermediate

---

## Q: What is a mock vs a stub vs a spy?

**Answer:**
All three are test doubles — fake objects used in place of real dependencies — but with different roles.

- **Stub** — returns hardcoded values, no behaviour verification
- **Mock** — verifies that specific methods were called
- **Spy** — wraps real implementation, records calls for later verification

**Code Example:**
```swift
protocol AnalyticsService {
    func track(_ event: String)
}

// Stub — just returns values, doesn't verify calls
class StubAnalytics: AnalyticsService {
    func track(_ event: String) { }  // does nothing
}

// Mock — verifies interactions
class MockAnalytics: AnalyticsService {
    var trackedEvents: [String] = []
    func track(_ event: String) {
        trackedEvents.append(event)
    }
}

// In test
func test_login_tracksEvent() {
    let analytics = MockAnalytics()
    let viewModel = LoginViewModel(analytics: analytics)
    viewModel.login(username: "alice", password: "pass")
    XCTAssertEqual(analytics.trackedEvents, ["login_success"])
}
```

**Tags:** `#testing` `#mocking` `#stubs` `#interview`
**Difficulty:** Intermediate

---

## Q: How do you test async code in XCTest?

**Answer:**
Swift's `async/await` is directly supported in XCTest — mark your test function as `async throws` and `await` the result.

**Code Example:**
```swift
class UserServiceTests: XCTestCase {

    // Modern — async/await (iOS 15.0+, Xcode 13.2+)
    func test_fetchUser_returnsUser() async throws {
        let mockClient = MockHTTPClient()
        mockClient.mockData = try JSONEncoder().encode(User.mock())

        let service = UserService(client: mockClient)
        let user = try await service.fetchUser(id: 1)

        XCTAssertEqual(user.name, "Alice")
    }

    // Legacy — XCTestExpectation for callback-based async
    func test_fetchUser_callsCompletion() {
        let expectation = expectation(description: "fetch completes")

        service.fetchUser(id: 1) { user in
            XCTAssertNotNil(user)
            expectation.fulfill()
        }

        waitForExpectations(timeout: 5)
    }
}
```

**Tags:** `#testing` `#async-await` `#xctest` `#interview`
**Difficulty:** Intermediate

---

## Q: What is `XCTestExpectation` and when do you need it?

**Answer:**
`XCTestExpectation` pauses a test until an async condition is fulfilled or a timeout is reached. Needed for callback-based async code where you can't use `async/await`.

**Code Example:**
```swift
func test_download_completesSuccessfully() {
    // Create expectation
    let expectation = expectation(description: "download completes")

    downloader.download(url: testURL) { result in
        switch result {
        case .success(let data):
            XCTAssertFalse(data.isEmpty)
        case .failure(let error):
            XCTFail("Expected success, got \(error)")
        }
        expectation.fulfill()  // signal test to continue
    }

    // Wait up to 10 seconds
    waitForExpectations(timeout: 10)
}

// For multiple async operations
func test_multipleDownloads() {
    let exp1 = expectation(description: "download 1")
    let exp2 = expectation(description: "download 2")

    downloader.download(url: url1) { _ in exp1.fulfill() }
    downloader.download(url: url2) { _ in exp2.fulfill() }

    wait(for: [exp1, exp2], timeout: 10)
}
```

**Tags:** `#testing` `#xctest` `#async` `#expectation`
**Difficulty:** Intermediate

---

## Q: What is test coverage and how do you measure it?

**Answer:**
Test coverage measures what percentage of your code is executed by tests. Xcode reports it per file and per line.

**How to enable in Xcode:**
1. Edit Scheme → Test → Options
2. Enable **Code Coverage** checkbox
3. Run tests (`Cmd+U`)
4. View in Report Navigator → Coverage tab

**What to aim for:**
- 100% coverage doesn't mean bug-free — tests can pass the line without testing all logic branches
- Focus on **business logic, use cases, and ViewModels** — 80%+ there is a good target
- Don't obsess over coverage on pure UI code or auto-generated code

**Code Example:**
```swift
func discount(for quantity: Int) -> Double {
    if quantity >= 100 { return 0.20 }    // line covered?
    else if quantity >= 10 { return 0.10 } // line covered?
    return 0.0                             // line covered?
}

// Need 3 tests to cover all branches:
XCTAssertEqual(discount(for: 100), 0.20)
XCTAssertEqual(discount(for: 10),  0.10)
XCTAssertEqual(discount(for: 1),   0.0)
```

**Tags:** `#testing` `#coverage` `#xcode`
**Difficulty:** Intermediate

---

## Q: How do you test a ViewModel?

**Answer:**
Inject mock dependencies, call ViewModel methods, and assert on `@Published` properties. Use `async/await` for async ViewModels.

**Code Example:**
```swift
@MainActor
class ArticleViewModelTests: XCTestCase {

    func test_load_populatesArticles() async throws {
        // Arrange
        let mockRepo = MockArticleRepository()
        mockRepo.stubbedArticles = [Article(id: "1", title: "Test")]
        let viewModel = ArticleViewModel(repository: mockRepo)

        // Act
        await viewModel.load()

        // Assert
        XCTAssertFalse(viewModel.articles.isEmpty)
        XCTAssertEqual(viewModel.articles.first?.title, "Test")
        XCTAssertFalse(viewModel.isLoading)
    }

    func test_load_setsErrorOnFailure() async {
        let mockRepo = MockArticleRepository()
        mockRepo.shouldFail = true
        let viewModel = ArticleViewModel(repository: mockRepo)

        await viewModel.load()

        XCTAssertNotNil(viewModel.errorMessage)
    }
}
```

**Tags:** `#testing` `#viewmodel` `#mvvm` `#interview`
**Difficulty:** Intermediate

---

## Q: What is snapshot testing?

**Answer:**
Snapshot testing captures a reference image of a view and compares future runs against it. Any visual change fails the test, catching unintended UI regressions.

**Popular library:** `swift-snapshot-testing` by Point-Free

**Code Example:**
```swift
import SnapshotTesting

class ProfileCardTests: XCTestCase {

    func test_profileCard_defaultState() {
        let view = ProfileCardView(user: .mock())
        let vc = UIHostingController(rootView: view)

        // First run — creates reference snapshot
        // Subsequent runs — compares against saved image
        assertSnapshot(matching: vc, as: .image(on: .iPhone13))
    }

    func test_profileCard_premiumBadge() {
        let view = ProfileCardView(user: .mockPremium())
        assertSnapshot(matching: view, as: .image)
    }
}
```

**Workflow:**
1. Write test → run → reference image saved to `__Snapshots__` folder
2. Commit snapshots to git
3. Future UI changes fail the test — you review and update the snapshot if intentional

**Tags:** `#testing` `#snapshot` `#ui` `#regression`
**Difficulty:** Intermediate

---

## Q: How do you use dependency injection to make code testable?

**Answer:**
Inject dependencies through `init` using protocols. This lets tests swap real implementations with mocks, making tests fast and deterministic.

**Code Example:**
```swift
// Define behaviour as protocols
protocol Clock {
    var now: Date { get }
}

protocol Storage {
    func save(_ data: Data, key: String) throws
    func load(key: String) throws -> Data
}

// Real implementations
struct SystemClock: Clock { var now: Date { Date() } }
struct UserDefaultsStorage: Storage { ... }

// ViewModel takes protocols
class SessionViewModel {
    private let clock: Clock
    private let storage: Storage

    init(clock: Clock = SystemClock(),
         storage: Storage = UserDefaultsStorage()) {
        self.clock = clock
        self.storage = storage
    }

    func saveSession() throws {
        let session = Session(createdAt: clock.now)
        try storage.save(try JSONEncoder().encode(session), key: "session")
    }
}

// In tests — control time and storage
class MockClock: Clock { var now = Date(timeIntervalSince1970: 0) }
class MockStorage: Storage {
    var store: [String: Data] = [:]
    func save(_ data: Data, key: String) { store[key] = data }
    func load(key: String) throws -> Data { store[key]! }
}
```

**Tags:** `#testing` `#dependency-injection` `#mocking` `#interview`
**Difficulty:** Intermediate

---

## Q: What is `XCTAssert` and what are the main assertion types?

**Answer:**
`XCTAssert` functions are how you verify expected behaviour in tests. Each checks a different condition and fails the test with a message if the condition isn't met.

**Code Example:**
```swift
// Equality
XCTAssertEqual(result, 42)
XCTAssertNotEqual(result, 0)

// Boolean
XCTAssertTrue(isValid)
XCTAssertFalse(isLoading)

// Nil checks
XCTAssertNil(errorMessage)
XCTAssertNotNil(user)

// Comparable
XCTAssertGreaterThan(score, 0)
XCTAssertLessThanOrEqual(count, 100)

// Throws
XCTAssertThrowsError(try service.fetch()) { error in
    XCTAssertEqual(error as? APIError, .unauthorized)
}
XCTAssertNoThrow(try validator.validate(input))

// Always fail (e.g. in a switch default)
XCTFail("Unexpected state reached")
```

**Tags:** `#testing` `#xctest` `#assertions`
**Difficulty:** Intermediate

---

## Q: How do you test network code without hitting a real server?

**Answer:**
Use a custom `URLProtocol` subclass that intercepts `URLSession` requests and returns fake responses — no network needed, tests run instantly.

**Code Example:**
```swift
class MockURLProtocol: URLProtocol {
    static var mockData: Data = Data()
    static var mockStatusCode: Int = 200

    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }

    override func startLoading() {
        let response = HTTPURLResponse(
            url: request.url!,
            statusCode: MockURLProtocol.mockStatusCode,
            httpVersion: nil,
            headerFields: nil
        )!
        client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
        client?.urlProtocol(self, didLoad: MockURLProtocol.mockData)
        client?.urlProtocolDidFinishLoading(self)
    }

    override func stopLoading() {}
}

// In test setup
let config = URLSessionConfiguration.ephemeral
config.protocolClasses = [MockURLProtocol.self]
let session = URLSession(configuration: config)

// Inject into service
MockURLProtocol.mockData = try! JSONEncoder().encode([Article.mock()])
let service = ArticleService(session: session)
let articles = try await service.fetchArticles()
XCTAssertEqual(articles.count, 1)
```

**Tags:** `#testing` `#networking` `#mocking` `#urlprotocol`
**Difficulty:** Intermediate
