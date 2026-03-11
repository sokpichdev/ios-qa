# Networking — Fundamentals

---

## Q: How does `URLSession` work?

**Answer:**
`URLSession` is Apple's networking API for HTTP requests. It manages connection pooling, caching, cookies, and authentication. You create tasks from it to perform requests.

**Code Example:**
```swift
// Modern async/await approach
func fetchUser(id: Int) async throws -> User {
    let url = URL(string: "https://api.example.com/users/\(id)")!
    let (data, response) = try await URLSession.shared.data(from: url)

    guard let httpResponse = response as? HTTPURLResponse,
          httpResponse.statusCode == 200 else {
        throw NetworkError.badResponse
    }

    return try JSONDecoder().decode(User.self, from: data)
}

// POST request
func createUser(_ user: User) async throws {
    var request = URLRequest(url: URL(string: "https://api.example.com/users")!)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONEncoder().encode(user)

    let (_, response) = try await URLSession.shared.data(for: request)
    // handle response
}
```

**Tags:** `#networking` `#urlsession` `#async-await` `#interview`

---

## Q: What is the difference between `dataTask`, `downloadTask`, and `uploadTask`?

**Answer:**
All three create `URLSessionTask` subclasses but handle data differently.

| Task | Best for | Data handling |
|------|----------|---------------|
| `dataTask` | API calls, small responses | In memory |
| `downloadTask` | Files, large responses | Written to disk |
| `uploadTask` | Sending files/data | Streams from memory or file |

**Code Example:**
```swift
// dataTask — API response stays in memory
URLSession.shared.dataTask(with: url) { data, response, error in
    guard let data = data else { return }
    let user = try? JSONDecoder().decode(User.self, from: data)
}

// downloadTask — saves to temp file, survives memory pressure
URLSession.shared.downloadTask(with: url) { tempURL, response, error in
    guard let tempURL = tempURL else { return }
    let dest = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    try? FileManager.default.moveItem(at: tempURL, to: dest.appendingPathComponent("video.mp4"))
}

// uploadTask — send a file
var request = URLRequest(url: uploadURL)
request.httpMethod = "POST"
URLSession.shared.uploadTask(with: request, fromFile: fileURL) { data, response, error in }
```

**Tags:** `#networking` `#urlsession` `#files`

---

## Q: How do you handle API errors gracefully?

**Answer:**
Define a clear error type, validate HTTP status codes, and propagate errors up to the UI where they can be shown to the user.

**Code Example:**
```swift
enum APIError: LocalizedError {
    case badURL
    case unauthorized
    case notFound
    case serverError(Int)
    case decodingFailed(Error)
    case unknown

    var errorDescription: String? {
        switch self {
        case .unauthorized:     return "Please log in again."
        case .notFound:         return "Resource not found."
        case .serverError(let code): return "Server error (\(code))."
        default:                return "Something went wrong."
        }
    }
}

func fetch<T: Decodable>(_ type: T.Type, from url: URL) async throws -> T {
    let (data, response) = try await URLSession.shared.data(from: url)

    guard let http = response as? HTTPURLResponse else { throw APIError.unknown }

    switch http.statusCode {
    case 200...299: break
    case 401: throw APIError.unauthorized
    case 404: throw APIError.notFound
    default:  throw APIError.serverError(http.statusCode)
    }

    do {
        return try JSONDecoder().decode(T.self, from: data)
    } catch {
        throw APIError.decodingFailed(error)
    }
}
```

**Tags:** `#networking` `#error-handling` `#interview`

---

## Q: How do you implement retry logic for failed network calls?

**Answer:**
Wrap the request in a loop with a limited retry count. Optionally add exponential backoff — increasing delay between retries to avoid hammering the server.

**Code Example:**
```swift
func fetchWithRetry<T: Decodable>(
    _ type: T.Type,
    from url: URL,
    maxRetries: Int = 3
) async throws -> T {
    var lastError: Error?

    for attempt in 0..<maxRetries {
        do {
            return try await fetch(type, from: url)
        } catch {
            lastError = error

            // Don't retry on client errors (4xx)
            if let apiError = error as? APIError,
               case .unauthorized = apiError { throw error }

            // Exponential backoff: 1s, 2s, 4s...
            let delay = UInt64(pow(2.0, Double(attempt))) * 1_000_000_000
            try await Task.sleep(nanoseconds: delay)
        }
    }

    throw lastError ?? APIError.unknown
}
```

**Tags:** `#networking` `#retry` `#error-handling`

---

## Q: How do you handle authentication tokens and refresh them?

**Answer:**
Store tokens securely in the Keychain, attach them to requests via a header, and refresh automatically when a 401 is received.

**Code Example:**
```swift
class AuthenticatedSession {
    private var accessToken: String { Keychain.get("access_token") ?? "" }
    private var refreshToken: String { Keychain.get("refresh_token") ?? "" }

    func request<T: Decodable>(_ type: T.Type, from url: URL) async throws -> T {
        let result = try await performRequest(type, from: url, token: accessToken)
        return result
    }

    private func performRequest<T: Decodable>(
        _ type: T.Type, from url: URL, token: String
    ) async throws -> T {
        var req = URLRequest(url: url)
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let (data, response) = try await URLSession.shared.data(for: req)

        // Auto-refresh on 401
        if (response as? HTTPURLResponse)?.statusCode == 401 {
            let newToken = try await refreshAccessToken()
            return try await performRequest(type, from: url, token: newToken)
        }

        return try JSONDecoder().decode(T.self, from: data)
    }

    private func refreshAccessToken() async throws -> String {
        // call refresh endpoint, store new token in Keychain
    }
}
```

**Tags:** `#networking` `#authentication` `#keychain` `#security`

---

## Q: How do you mock network requests for testing?

**Answer:**
Use a protocol for `URLSession` or inject a custom `URLProtocol` subclass that intercepts requests and returns fake responses without hitting the network.

**Code Example:**
```swift
// Protocol approach — most common with async/await
protocol HTTPClient {
    func data(from url: URL) async throws -> (Data, URLResponse)
}

extension URLSession: HTTPClient {}

// Mock for tests
class MockHTTPClient: HTTPClient {
    var mockData: Data = Data()
    var mockResponse: URLResponse = HTTPURLResponse(
        url: URL(string: "https://example.com")!,
        statusCode: 200, httpVersion: nil, headerFields: nil
    )!

    func data(from url: URL) async throws -> (Data, URLResponse) {
        return (mockData, mockResponse)
    }
}

// Inject into your service
class UserService {
    private let client: HTTPClient
    init(client: HTTPClient = URLSession.shared) { self.client = client }
}

// In tests
let mock = MockHTTPClient()
mock.mockData = try! JSONEncoder().encode(User.mock())
let service = UserService(client: mock)
```

**Tags:** `#networking` `#testing` `#mocking` `#dependency-injection`

---

## Q: What is `URLCache` and how does caching work in iOS?

**Answer:**
`URLCache` stores responses from network requests in memory and/or on disk. It respects HTTP cache headers (`Cache-Control`, `ETag`, `Expires`) automatically.

**Code Example:**
```swift
// Configure a larger cache at app startup
URLCache.shared = URLCache(
    memoryCapacity: 50 * 1024 * 1024,  // 50MB memory
    diskCapacity: 200 * 1024 * 1024,   // 200MB disk
    directory: nil
)

// Control caching per request
var request = URLRequest(url: url)
request.cachePolicy = .returnCacheDataElseLoad  // use cache, fall back to network

// Cache policies:
// .useProtocolCachePolicy     — default, follows HTTP headers
// .reloadIgnoringLocalCache   — always hits network
// .returnCacheDataElseLoad    — use cache, only fetch if not cached
// .returnCacheDataDontLoad    — only use cache, never fetch (offline mode)

// Manually store a response
let cachedResponse = CachedURLResponse(response: response, data: data)
URLCache.shared.storeCachedResponse(cachedResponse, for: request)
```

**Tags:** `#networking` `#caching` `#urlcache` `#performance`

---

## Q: What is `multipart/form-data` and how do you send it in iOS?

**Answer:**
`multipart/form-data` is a content type used to send mixed data — like a file and text fields together — in a single request. Common for image/file uploads.

**Code Example:**
```swift
func uploadImage(_ image: UIImage, name: String) async throws {
    let url = URL(string: "https://api.example.com/upload")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"

    let boundary = UUID().uuidString
    request.setValue("multipart/form-data; boundary=\(boundary)",
                     forHTTPHeaderField: "Content-Type")

    var body = Data()
    let imageData = image.jpegData(compressionQuality: 0.8)!

    // Add text field
    body.append("--\(boundary)\r\n".data(using: .utf8)!)
    body.append("Content-Disposition: form-data; name=\"name\"\r\n\r\n".data(using: .utf8)!)
    body.append("\(name)\r\n".data(using: .utf8)!)

    // Add image
    body.append("--\(boundary)\r\n".data(using: .utf8)!)
    body.append("Content-Disposition: form-data; name=\"file\"; filename=\"photo.jpg\"\r\n".data(using: .utf8)!)
    body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
    body.append(imageData)
    body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)

    request.httpBody = body
    let (_, _) = try await URLSession.shared.data(for: request)
}
```

**Tags:** `#networking` `#upload` `#multipart` `#images`

---

## Q: How do you handle SSL pinning in iOS?

**Answer:**
SSL pinning validates that the server's certificate matches a known copy embedded in the app, preventing man-in-the-middle attacks even with valid certificates.

**Code Example:**
```swift
class PinnedSessionDelegate: NSObject, URLSessionDelegate {
    func urlSession(_ session: URLSession,
                    didReceive challenge: URLAuthenticationChallenge,
                    completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {

        guard challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust,
              let serverTrust = challenge.protectionSpace.serverTrust else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }

        // Load pinned certificate from bundle
        guard let certPath = Bundle.main.path(forResource: "api_cert", ofType: "cer"),
              let pinnedData = NSData(contentsOfFile: certPath),
              let serverCert = SecTrustGetCertificateAtIndex(serverTrust, 0) else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }

        let serverData = SecCertificateCopyData(serverCert) as NSData
        if serverData.isEqual(to: pinnedData as Data) {
            completionHandler(.useCredential, URLCredential(trust: serverTrust))
        } else {
            completionHandler(.cancelAuthenticationChallenge, nil)
        }
    }
}

let session = URLSession(configuration: .default,
                         delegate: PinnedSessionDelegate(),
                         delegateQueue: nil)
```

**Tags:** `#networking` `#security` `#ssl-pinning` `#advanced`

---

## Q: What is Combine and how does it relate to networking?

**Answer:**
Combine is Apple's reactive framework for processing asynchronous events over time. `URLSession` has a built-in Combine publisher, making it natural to chain networking, decoding, and UI updates.

**Code Example:**
```swift
import Combine

class ArticleService {
    private var cancellables = Set<AnyCancellable>()

    func fetchArticles() -> AnyPublisher<[Article], Error> {
        let url = URL(string: "https://api.example.com/articles")!

        return URLSession.shared.dataTaskPublisher(for: url)
            .map(\.data)
            .decode(type: [Article].self, decoder: JSONDecoder())
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
}

// In ViewModel
service.fetchArticles()
    .sink(
        receiveCompletion: { completion in
            if case .failure(let error) = completion {
                print("Error: \(error)")
            }
        },
        receiveValue: { [weak self] articles in
            self?.articles = articles
        }
    )
    .store(in: &cancellables)
```

**Note:** `async/await` is now preferred for new code, but Combine is still widely used and worth knowing.

**Tags:** `#networking` `#combine` `#reactive` `#interview`
