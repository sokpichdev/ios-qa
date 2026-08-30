# Security — Themis Cryptographic Library

---

## Q: What is Themis?

**Answer:**
Themis is an open-source, cross-platform cryptographic library that packages a few high-level, hard-to-misuse primitives instead of exposing raw ciphers. It wraps OpenSSL, LibreSSL, or BoringSSL and ships identical wire formats for iOS, Android, and server languages, so a payload encrypted on one platform decrypts unchanged on another.

Its value is not new cryptography — it is removing the decisions that cause most application-level crypto bugs. You never choose a mode, an IV, a padding scheme, or a KDF; each primitive exposes one encrypt call and one decrypt call, and misuse generally produces an error rather than silently weak output.

**Code Example:**
```ruby
# CocoaPods — the default subspec pins an OpenSSL build
pod 'themis'
```

```swift
import themis

// Every primitive follows the same shape: construct, then wrap/unwrap.
let keypair = TSKeyGen(algorithm: .EC)!
let privateKey = keypair.privateKey as Data
let publicKey  = keypair.publicKey  as Data
```

**Key Points:**
- Apache 2.0, maintained by Cossack Labs, and independently audited.
- Four primitives only: Secure Cell, Secure Message, Secure Session, Secure Comparator.
- Wire-format compatible across Swift, Kotlin/Java, Go, Python, Node, PHP, Rust, C++.
- Common in fintech and messaging apps that need payload crypto independent of TLS.

**Tags:** `#security` `#themis` `#cryptography` `#interview`
**Difficulty:** Beginner
**References:**
- [Themis — GitHub](https://github.com/cossacklabs/themis)
- [Themis documentation — Cossack Labs](https://docs.cossacklabs.com/themis/)

---

## Q: Which four primitives does Themis provide, and what is each one for?

**Answer:**
Themis exposes Secure Cell for encrypting data at rest, Secure Message for encrypting or signing individual payloads between two parties, Secure Session for an encrypted stateful channel over an untrusted transport, and Secure Comparator for proving two sides share a secret without revealing it.

| Primitive | Objective-C/Swift class | Problem it solves |
|---|---|---|
| Secure Cell | `TSCellSeal`, `TSCellToken`, `TSCellContextImprint` | Data at rest — local database, cached files, Keychain blobs |
| Secure Message | `TSMessage` | One-shot encrypt or sign of a discrete payload |
| Secure Session | `TSSession` | Long-lived encrypted channel with forward secrecy |
| Secure Comparator | `TSComparator` | Zero-knowledge proof of a shared secret |

Picking the wrong one is the most common integration mistake: Secure Session for a stateless REST API adds a handshake you cannot maintain, and Secure Cell for client-server traffic gives you a symmetric key that both ends must already share.

**Key Points:**
- Secure Cell is symmetric; Secure Message and Secure Session are asymmetric.
- Secure Message is stateless — ideal for request/response APIs.
- Secure Session is stateful and needs a persistent connection.

**Tags:** `#security` `#themis` `#cryptography`
**Difficulty:** Intermediate
**References:**
- [Themis documentation — Cossack Labs](https://docs.cossacklabs.com/themis/)

---

## Q: What is Secure Cell in Themis?

**Answer:**
Secure Cell is Themis's symmetric authenticated encryption primitive for data at rest, taking a key or passphrase plus an optional context and returning ciphertext that cannot be decrypted or tampered with without both. It is what you reach for when encrypting a local cache, a SQLite blob, or a value before writing it to the Keychain.

The optional *context* is associated data: it is authenticated but not stored in the ciphertext. Binding a record's primary key as context means an attacker cannot move an encrypted row to a different record, because decryption with a different context fails.

**Code Example:**
```swift
import themis

let cell = TSCellSeal(key: symmetricKey)!   // symmetricKey: Data, 32 bytes
let plaintext = "4111 1111 1111 1111".data(using: .utf8)!

// Context binds the ciphertext to this specific record.
let context = "card:\(cardID)".data(using: .utf8)!
let encrypted = try cell.encrypt(plaintext, context: context)

// Decryption fails if key, context, or ciphertext was altered.
let decrypted = try cell.decrypt(encrypted, context: context)
```

**Key Points:**
- Authenticated encryption — tampering throws instead of returning garbage.
- Context is not stored, so you must supply the identical value on decrypt.
- Lose the key and the data is unrecoverable; there is no escrow.

**Tags:** `#security` `#themis` `#encryption` `#data-at-rest`
**Difficulty:** Intermediate
**References:**
- [Secure Cell — Cossack Labs](https://docs.cossacklabs.com/themis/crypto-theory/cryptosystems/secure-cell/)

---

## Q: What is the difference between Secure Cell's Seal, Token Protect, and Context Imprint modes?

**Answer:**
The three modes differ in where the authentication token lives and whether the output grows: Seal appends the token to the ciphertext, Token Protect returns the token separately so the ciphertext stays the same length as the plaintext, and Context Imprint produces length-preserving output with no token and therefore no integrity check.

| Mode | Output size | Integrity check | Use when |
|---|---|---|---|
| Seal | plaintext + ~44 bytes | Yes | Default — you control the storage |
| Token Protect | exactly plaintext length, plus a separate token | Yes | Fixed-width DB column; token stored in another column |
| Context Imprint | exactly plaintext length | **No** | Legacy formats with zero room for overhead |

Context Imprint is a last resort. Without a token it cannot detect tampering, and it *requires* a non-empty context to be secure at all.

**Code Example:**
```swift
// Seal — one blob, simplest
let sealed = try TSCellSeal(key: key)!.encrypt(data)

// Token Protect — ciphertext and token stored separately
let cell = TSCellToken(key: key)!
let result = try cell.encrypt(data, context: context)
store(cipherText: result.cipherText, token: result.token)
let back = try cell.decrypt(result.cipherText, token: result.token, context: context)

// Context Imprint — no integrity guarantee, context is mandatory
let imprint = TSCellContextImprint(key: key)!
let same = try imprint.encrypt(data, context: context)  // same length as `data`
```

**Key Points:**
- Default to Seal unless a storage constraint forces otherwise.
- Token Protect keeps the ciphertext column width unchanged.
- Context Imprint trades integrity for size — never use it with an empty context.

**Tags:** `#security` `#themis` `#encryption`
**Difficulty:** Advanced
**References:**
- [Secure Cell — Cossack Labs](https://docs.cossacklabs.com/themis/crypto-theory/cryptosystems/secure-cell/)

---

## Q: What is the difference between `TSCellSeal(key:)` and `TSCellSeal(passphrase:)`?

**Answer:**
`TSCellSeal(key:)` uses the bytes you supply directly as the symmetric key, while `TSCellSeal(passphrase:)` runs a human-typed string through a deliberately slow key derivation function first. They produce incompatible ciphertexts and are not interchangeable.

Use the key initialiser for machine-generated keys — high entropy, so a fast path is safe. Use the passphrase initialiser only for values a person types, such as a PIN or password, where the KDF's cost is what makes brute-forcing expensive. Passing a user's password to `init(key:)` is a real vulnerability: it makes the low-entropy secret directly guessable.

**Code Example:**
```swift
// Machine-generated key — from TSGenerateSymmetricKey() or the Keychain.
let byKey = TSCellSeal(key: TSGenerateSymmetricKey()!)!

// Human-supplied secret — KDF applied internally, slow by design.
let byPassphrase = TSCellSeal(passphrase: userEnteredPIN)!
let sealed = try byPassphrase.encrypt(secret.data(using: .utf8)!)

// Decrypting with the wrong constructor throws — the formats differ.
```

**Key Points:**
- Never hand a user password to `init(key:)`.
- Passphrase mode is intentionally slow; do not call it in a tight loop or on the main thread.
- Ciphertext from one initialiser cannot be read by the other.

**Tags:** `#security` `#themis` `#encryption` `#kdf`
**Difficulty:** Advanced
**References:**
- [Secure Cell — Cossack Labs](https://docs.cossacklabs.com/themis/crypto-theory/cryptosystems/secure-cell/)

---

## Q: What is Secure Message in Themis?

**Answer:**
Secure Message is a stateless asymmetric primitive that encrypts or signs a single payload using your private key and the peer's public key, making it a natural fit for request/response APIs. Unlike Secure Session it needs no handshake, so each call is independent and works over plain stateless HTTP.

It operates in two distinct modes chosen at construction time. Encrypt mode gives confidentiality plus integrity and is readable only by the named peer. Sign/verify mode gives authenticity and integrity while leaving the payload readable — useful when an intermediary must inspect the body.

**Code Example:**
```swift
import themis

// Encrypt mode — only the holder of the peer's private key can read it.
let crypter = TSMessage(inEncryptModeWithPrivateKey: clientPrivateKey,
                        peerPublicKey: serverPublicKey)!
let encrypted = try crypter.wrap(jsonString.data(using: .utf8))
let decrypted = try crypter.unwrapData(responseData)

// Sign mode — payload stays readable, origin is provable.
let signer = TSMessage(inSignVerifyModeWithPrivateKey: clientPrivateKey,
                       peerPublicKey: nil)!
let signed = try signer.wrap(jsonString.data(using: .utf8))
```

**Key Points:**
- Stateless — no handshake, no session to keep alive.
- Sign mode takes `peerPublicKey: nil` when signing; verification supplies the signer's public key.
- Keys must be an EC/RSA pair generated by `TSKeyGen`, not arbitrary bytes.

**Tags:** `#security` `#themis` `#encryption` `#networking`
**Difficulty:** Intermediate
**References:**
- [Secure Message — Cossack Labs](https://docs.cossacklabs.com/themis/crypto-theory/cryptosystems/secure-message/)

---

## Q: When should you use Secure Message instead of Secure Cell?

**Answer:**
Use Secure Message when two parties with separate key pairs exchange data, and Secure Cell when a single party encrypts data for itself. The deciding question is whether both ends could ever hold the same secret key.

Secure Cell is symmetric, so shipping it to a client for client-server traffic means embedding a key the server also holds — extract it from one device and every user's traffic is readable. Secure Message is asymmetric: the device keeps a private key the server never sees, so compromising the server does not let an attacker forge requests from a device.

**Key Points:**
- Secure Cell → data at rest, one owner, one key.
- Secure Message → data in transit between two identities.
- A symmetric key that must exist on both the client and server is a design smell.

**Tags:** `#security` `#themis` `#cryptography`
**Difficulty:** Intermediate
**References:**
- [Themis documentation — Cossack Labs](https://docs.cossacklabs.com/themis/)

---

## Q: What is the difference between Secure Message's encrypt mode and sign/verify mode?

**Answer:**
Encrypt mode makes the payload unreadable to anyone but the named peer and also proves its origin, while sign/verify mode leaves the payload in the clear and only proves who produced it and that it was not modified. Encrypt mode needs both key pairs; sign mode needs only the signer's private key.

Choose sign mode when something between the client and the recipient legitimately needs to read the body — an API gateway routing on a field, a log pipeline, a load balancer. Choose encrypt mode when nothing in the middle should see the contents.

**Code Example:**
```swift
// Encrypt: confidential + authentic. Requires the peer's public key.
let crypter = TSMessage(inEncryptModeWithPrivateKey: myPrivate, peerPublicKey: peerPublic)!

// Sign: authentic only. Body remains readable to any observer.
let signer = TSMessage(inSignVerifyModeWithPrivateKey: myPrivate, peerPublicKey: nil)!

// Verify on the other side with the signer's public key and no private key.
let verifier = TSMessage(inSignVerifyModeWithPrivateKey: nil, peerPublicKey: signerPublic)!
let original = try verifier.unwrapData(signedBlob)
```

**Key Points:**
- Signing is not encryption — a signed payload is fully readable in transit.
- Encrypt mode fails if the peer public key does not match the private key's algorithm.
- Verification failure throws; never treat a thrown error as "probably fine".

**Tags:** `#security` `#themis` `#signing`
**Difficulty:** Advanced
**References:**
- [Secure Message — Cossack Labs](https://docs.cossacklabs.com/themis/crypto-theory/cryptosystems/secure-message/)

---

## Q: What is Secure Session, and how does it differ from TLS?

**Answer:**
Secure Session is Themis's stateful encrypted channel: peers perform a handshake, derive ephemeral session keys, and then exchange messages with forward secrecy over any transport you supply. Unlike TLS it authenticates peers by pinned public key rather than a certificate authority, so there is no CA to trust and no certificate chain to spoof.

That distinction is why it appears underneath TLS in high-assurance apps. A device with a user-installed root certificate, or an intercepting proxy, can terminate TLS and read the traffic — but Secure Session's keys were never negotiated with that proxy, so the payload stays opaque. You supply the transport via a `TSSessionTransportInterface` subclass that maps a peer ID to its known public key.

**Code Example:**
```swift
final class Transport: TSSessionTransportInterface {
    override func publicKey(for binaryId: Data!) throws -> Data {
        // Look up a *pinned* key. Returning an unknown key defeats the point.
        guard let key = KeyStore.publicKey(forPeer: binaryId) else {
            throw SessionError.unknownPeer
        }
        return key
    }
}

let session = TSSession(transportID: clientID,
                        privateKey: clientPrivateKey,
                        callbacks: Transport())!
let handshakeRequest = try session.connectRequest()   // send to server
// ...feed each server reply back in until session.isSessionEstablished()
let payload = try session.wrap(requestBody)
```

**Key Points:**
- Forward secrecy — compromising a long-term key does not decrypt past sessions.
- No certificate authority; trust comes from keys you pinned yourself.
- Requires a persistent connection, so it suits sockets far better than stateless REST.

**Tags:** `#security` `#themis` `#networking` `#tls`
**Difficulty:** Advanced
**References:**
- [Secure Session — Cossack Labs](https://docs.cossacklabs.com/themis/crypto-theory/cryptosystems/secure-session/)

---

## Q: What is Secure Comparator in Themis?

**Answer:**
Secure Comparator is a zero-knowledge protocol that lets two parties confirm they hold the same secret without either side transmitting it, or leaking anything usable when the secrets differ. It is built on a Socialist Millionaire Problem construction and runs as a multi-step exchange rather than a single call.

The practical benefit over "hash it and compare" is that a hash sent over the wire is still an offline brute-force target for a low-entropy secret like a PIN. Secure Comparator gives an attacker who records the entire exchange nothing to grind against.

**Code Example:**
```swift
let comparator = TSComparator(messageToCompare: sharedSecret.data(using: .utf8)!)!
var data = try comparator.beginCompare()

while comparator.status() == TSComparatorStateType.notReady {
    let reply = try transport.exchange(data)      // send to peer, get its response
    data = try comparator.proceedCompare(reply)
}

switch comparator.status() {
case .match:    proceed()
case .notMatch: reject()
default:        abort()
}
```

**Key Points:**
- Multi-round: loop until the status leaves `.notReady`.
- Reveals a single bit — match or not — and nothing about the secret.
- Never treat `.notReady` as success; check for `.match` explicitly.

**Tags:** `#security` `#themis` `#zero-knowledge` `#authentication`
**Difficulty:** Advanced
**References:**
- [Secure Comparator — Cossack Labs](https://docs.cossacklabs.com/themis/crypto-theory/cryptosystems/secure-comparator/)

---

## Q: How do you generate and store a Themis key pair on iOS?

**Answer:**
Generate the pair with `TSKeyGen`, then persist only the private key in the Keychain with a restrictive accessibility class and hand the public key to the server during enrolment. The private key must never reach `UserDefaults`, a plist, a log line, or an analytics event.

`TSKeyGen(algorithm: .EC)` returns 256-bit elliptic-curve keys, which are the sensible default — smaller and faster than the RSA option, with no practical security tradeoff. Store the raw `Data` rather than a Base64 string where you can; if the API forces Base64, remember the encoding adds no protection.

For a device-bound key you can go further and wrap the Themis private key with a Secure Cell sealed under a Keychain item that requires biometric presence, so the key is only usable after a successful Face ID or Touch ID check.

**Code Example:**
```swift
import themis
import Security

func enrol() throws -> Data {
    guard let pair = TSKeyGen(algorithm: .EC) else { throw CryptoError.keygen }

    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: "client.private.key",
        kSecValueData as String: pair.privateKey as Data,
        // Never syncs to iCloud, unavailable until after first unlock.
        kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
    ]
    SecItemDelete(query as CFDictionary)
    guard SecItemAdd(query as CFDictionary, nil) == errSecSuccess else {
        throw CryptoError.keychain
    }

    return pair.publicKey as Data   // send to the server
}
```

**Key Points:**
- Prefer `.EC` over `.RSA` — smaller keys, faster operations.
- `...ThisDeviceOnly` accessibility keeps the key out of iCloud Keychain and encrypted backups.
- Keychain items survive app deletion; clear them on first launch if you want a fresh key per install.

**Tags:** `#security` `#themis` `#keychain` `#key-management`
**Difficulty:** Advanced
**References:**
- [Keychain Services — Apple Developer](https://developer.apple.com/documentation/security/keychain-services)
- [Themis documentation — Cossack Labs](https://docs.cossacklabs.com/themis/)

---

## Q: Why encrypt API payloads with Themis when the app already uses HTTPS?

**Answer:**
TLS protects the connection, not the message — it ends at the first thing that terminates it, which may be a load balancer, a logging proxy, or an attacker's intercepting certificate on a compromised device. Payload-level crypto keeps the body opaque past that boundary, so breaking TLS yields ciphertext rather than account data.

The concrete iOS threat is mundane: a jailbroken device with a tweak that disables certificate pinning, or a user tricked into trusting a root profile, turns a proxy into a full read/write view of the traffic. With Secure Message on top, the attacker sees only wrapped blobs and cannot forge a request, because forging requires the device's private key.

There is a second benefit beyond confidentiality. Signing each request with a device-bound key gives the server a hard binding between a session and a specific enrolled device, which a stolen bearer token alone cannot provide.

**Key Points:**
- Defence in depth — assume TLS interception is possible, not impossible.
- Ciphertext stays encrypted in server-side logs and crash reports.
- Device-bound signatures resist token replay from a different device.
- The cost is real: key rotation, versioning, and much harder debugging of live traffic.

**Tags:** `#security` `#themis` `#networking` `#threat-model`
**Difficulty:** Advanced
**References:**
- [Preventing Insecure Network Connections — Apple Developer](https://developer.apple.com/documentation/security/preventing-insecure-network-connections)

---

## Q: How do you protect a Themis-signed request payload against replay attacks?

**Answer:**
A signature proves who sent a payload but says nothing about *when*, so an attacker who captures a valid signed request can resend it verbatim and it will still verify. The fix is to put a freshness value inside the signed body — a timestamp or a server-issued nonce — and have the server reject anything stale or already seen.

Sign the JSON *after* injecting the timestamp, never as a separate header. A value outside the signed bytes can be rewritten by anyone in the middle, which defeats the whole mechanism. On the server, reject requests outside a tight clock window and keep a short-lived cache of recently seen nonces so a request inside the window cannot be replayed either.

**Code Example:**
```swift
extension Encodable {
    /// Injects a timestamp into the JSON, then signs the whole body.
    func signedPayload() throws -> String {
        let data = try JSONEncoder().encode(self)
        var dict = try JSONSerialization.jsonObject(with: data) as? [String: Any] ?? [:]
        dict["timestamp"] = Int(Date().timeIntervalSince1970 * 1000)

        let withTimestamp = try JSONSerialization.data(withJSONObject: dict)
        guard let json = String(data: withTimestamp, encoding: .utf8) else {
            throw CryptoError.encoding
        }
        return try CryptoService.sign(message: json)   // TSMessage sign mode
    }
}
```

**Key Points:**
- The freshness value must be inside the signed bytes, not a sibling header.
- Pair a clock-skew window with a seen-nonce cache; neither alone is sufficient.
- Device clocks drift and users change them — never trust the client timestamp as truth, only as a bound.

**Tags:** `#security` `#themis` `#signing` `#replay-attack`
**Difficulty:** Advanced
**References:**
- [Secure Message — Cossack Labs](https://docs.cossacklabs.com/themis/crypto-theory/cryptosystems/secure-message/)

---

## Q: Where do Themis integrations usually go wrong in a production iOS app?

**Answer:**
The library removes cipher-level mistakes but not key-management or operational ones, and those are where real integrations fail. Themis will happily encrypt with a hardcoded key or a key you can never rotate.

The recurring problems:

1. **Force-unwrapping the initialisers.** `TSCellSeal(key:)` and `TSMessage(...)` return optionals and are `nil` for invalid key material. `!` turns a recoverable key-loading bug into a crash on a user's device.
2. **No rotation plan.** Ciphertext with no version marker cannot be re-encrypted under a new key later. Prefix stored blobs with a scheme version from day one.
3. **Forgetting the context.** Secure Cell's context is not stored in the ciphertext; if you cannot reconstruct the exact bytes at decrypt time, the data is gone.
4. **Losing the key on reinstall.** Keychain items outlive app deletion, but a wiped or restored-to-new-device Keychain does not — encrypted caches must be discardable, never the only copy.
5. **Debuggability collapse.** Once every request body is a blob, Charles and Proxyman show you nothing. Build a debug-only unwrap path early or you will pay for it during every incident.
6. **Binary size and build time.** The pod pulls in a full OpenSSL/BoringSSL build.

**Key Points:**
- Treat every Themis initialiser as failable and surface a typed error.
- Version your ciphertext format before you ship it, not after.
- Encrypted local caches must always be safe to delete and refetch.

**Tags:** `#security` `#themis` `#key-management` `#production`
**Difficulty:** Advanced
**References:**
- [Themis — GitHub](https://github.com/cossacklabs/themis)
- [Themis documentation — Cossack Labs](https://docs.cossacklabs.com/themis/)
