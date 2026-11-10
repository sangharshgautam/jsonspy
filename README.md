# JSONSpy — Enterprise JSON & Schema Workbench

JSONSpy is an enterprise multi-platform JSON editing, validation, transformation, and visual schema modeling workbench inspired by Altova XMLSpy.

Live Web App: **[https://jsonspy-25s.pages.dev/](https://jsonspy-25s.pages.dev/)**

Built with **Tauri v2**, **React 18**, **TypeScript**, **Monaco Editor**, **React Flow**, **Ajv**, **NetworkNT**, **JSONata**, **Kotlin/Java JCEF**, and **Tailwind CSS**.

---

## 🌟 Key Features

1. **Text View (Monaco Code Editor & SmartFix)**
   - Full JSON syntax highlighting, line numbers, prettifying, minifying, and code folding.
   - Real-time Ajv (JavaScript) and NetworkNT (JVM Java) schema validation with inline error markers.
   - **SmartFix Engine**: One-click automatic syntax repair for corrupted JSON (trailing commas, unquoted keys, single quotes, unclosed strings, JS/Python keywords).

2. **Interactive Tree Grid View**
   - Hierarchical grid tree view for JSON payloads.
   - Type badges (`String`, `Number`, `Boolean`, `Object`, `Array`, `Null`).
   - Direct inline key-value editing, type casting, node insertion, and deletion.
   - Real-time search/filter across keys and values + Expand All / Collapse All.

3. **Graphical Schema Designer & Visualizer**
   - Interactive node-based diagram using **React Flow** (`@xyflow/react`).
   - Displays root schema, object properties, types, constraints, and format badges.
   - Toggle property `Required` status directly on visual nodes.
   - Side inspector panel for modifying property types, descriptions, min/max limits, formats, and deleting/adding fields.

4. **Query & Transformation Workbench**
   - Live **JSONata** query execution engine with split-pane code editor and result view.
   - Quick-select query templates (filtering arrays, mapping objects, numerical aggregations, grouping).
   - Execution performance timing (in milliseconds) and single-click copy to clipboard.

5. **Multi-Format Code Generator Modal**
   - **Schema Inference**: Generates compliant Draft 2020-12 JSON Schema directly from raw sample JSON.
   - **Multi-Language Type Generator**:
     - **TypeScript**: Typed interfaces / types.
     - **Kotlin**: Data classes.
     - **Rust**: Structs with `#[derive(Serialize, Deserialize)]`.
     - **Go**: Structs with `` `json:"..."` `` tags.
     - **Python**: Pydantic `BaseModel` classes.
     - **C# DTO**: `[JsonPropertyName]` attributes with auto-properties `{ get; set; }`.

6. **IntelliJ Platform IDE Plugin**
   - Native JCEF out-of-process Chromium webview embedding for IntelliJ 2026.2+ (`262+`), Android Studio, WebStorm, PyCharm, and CLion.
   - In-process JDK `HttpServer` loopback bridge for zero-latency IDE file operations.
   - Configurable JVM schema validation engine (NetworkNT).

---

## 📁 Repository Structure

```text
JSONSpy/
├── landing/                    # Standalone Product Landing Page (Light Mode Default + Theme Switcher)
├── intellij-plugin/            # IntelliJ Platform Plugin Module (Gradle 9.0.0 + Java 21)
│   ├── src/main/kotlin/        # Kotlin JCEF bridge, local HttpServer & NetworkNT validator
│   └── src/main/resources/     # Webview bundle, icons, and plugin.xml descriptor
├── src-tauri/                  # Tauri v2 Rust Desktop Shell
│   ├── Cargo.toml              # Rust dependencies & test suite
│   ├── tauri.conf.json         # Tauri v2 config & bundle targets (msi, nsis, msix)
│   └── src/                    # Rust entry point & tests
├── src/                        # React TypeScript Web Workbench
│   ├── components/             # TextView, GridView, SchemaView, QueryWorkbench, ErrorBoundary
│   ├── constants/              # Centralized link constants (links.ts)
│   ├── utils/                  # SmartFix, typeGenerators, schemaInference, platformAdapter
│   └── main.tsx                # React DOM entry point
├── scripts/                    # Webview bundling scripts (build_intellij_plugin.js)
├── .github/workflows/          # CI/CD workflows (build-all.yml & release.yml)
└── CHANGELOG.md                # Release Changelog (Single Source of Truth)
```

---

## 🚀 Running & Developing Locally

### Prerequisites
- **Node.js**: v20+ (npm v10+)
- **Java JDK**: 21+
- **Rust Toolchain**: `cargo` (1.75+) and C++ build tools for desktop compilation.

### Installation

```bash
npm install
```

### 1. Launch Web Workbench (Development Mode)
```bash
npm run dev
```
👉 Open `http://localhost:1420`

### 2. Launch Landing Page
```bash
npm run dev:landing
```
👉 Open `http://localhost:3000`

### 3. Run Web Unit Tests (Vitest)
```bash
npm test
```

### 4. Build IntelliJ Plugin Archive
```bash
npm run build:intellij
cd intellij-plugin && ./gradlew buildPlugin
```
Output: `intellij-plugin/build/distributions/jsonspy-plugin-1.0.0.zip`

### 5. Build Native Desktop App (Tauri v2)
```bash
npm run tauri build
```
Output: `src-tauri/target/release/bundle/msi/JSONSpy_1.0.0_x64_en-US.msi`

---

## ⌨️ Native Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl+O` / `Cmd+O` | Open JSON file from disk |
| `Ctrl+S` / `Cmd+S` | Save current JSON file to disk |
| `Ctrl+Shift+F` / `Cmd+Shift+F` | Prettify / Format JSON payload |
| `Ctrl+Enter` / `Cmd+Enter` | Switch to Query Workbench & execute JSONata query |

---

## 📄 License
Licensed under the Apache License 2.0 / MIT License.

