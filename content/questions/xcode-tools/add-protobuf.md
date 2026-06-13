# Adding ProtoBuf to an iOS Project

## Q: How do you add and update a Protobuf (.proto) file in an iOS Xcode project?

Use `protoc` with the Swift plugin to generate Swift files from a `.proto` file provided by the backend team.

**Steps:**

1. **Download** the `.proto` file provided by the backend team.
2. **Rename** the file to something descriptive, e.g. `ws_chat.proto`.
3. **Replace** the existing `.proto` file in the project if one already exists.
4. **Open Terminal** and navigate to the directory containing the `.proto` file.
5. **Run the following command** to generate Swift files:

```bash
protoc --swift_out=./Generated something.proto
```

Example:

```bash
protoc --swift_out=./Generated ws_chat.proto
```

This generates a Swift file inside the `./Generated` folder that you can drag into your Xcode project.

**Rules:**

- **Never modify the `.proto` file manually.** It is owned by the backend team.
- **If changes are required**, ask the backend team to update and upload a new version of the Protobuf file.

> **Tip:** Make sure `protoc` and the Swift plugin (`protoc-gen-swift`) are installed. You can install them via Homebrew:
> ```bash
> brew install protobuf swift-protobuf
> ```

**Tags:** protobuf, networking, xcode, code-generation, backend-integration
**Difficulty:** Intermediate
