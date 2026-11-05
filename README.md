# JSONSpy — Enterprise JSON & Schema Workbench

JSONSpy is a modern, cross-platform desktop developer IDE built for JSON editing, validation, schema modeling, code generation, and query transformations inspired by Altova XMLSpy.

Built with **Tauri v2**, **React 18**, **TypeScript**, **Monaco Editor**, **React Flow**, **Ajv**, **JSONata**, and **Tailwind CSS**.

---

## 🌟 Key Features

1. **Text View (Monaco Code Editor)**
   - Full JSON syntax highlighting, line numbers, prettifying, minifying, and code folding.
   - Real-time Ajv schema validation (Draft 2020-12 and Draft-07) with inline error markers.
   - **SmartFix Engine**: One-click automatic repair for broken JSON (trailing commas, unquoted keys, single quotes, stripped comments, JS/Python keywords).

2. **Grid / Tree View**
   - Interactive hierarchical grid representation of JSON payloads.
   - Type badges (`String`, `Number`, `Boolean`, `Object`, `Array`, `Null`).
   - Direct inline key-value editing, type casting, node insertion, and deletion.
   - Search/filter across keys and values + Expand All / Collapse All.

3. **Graphical Schema Designer & Visualizer**
   - Interactive node-based diagram using **React Flow** (`@xyflow/react`).
   - Displays root schema, object properties, types, constraints, and format badges.
   - Toggle property `Required` status directly on visual nodes.
   - Side inspector panel for modifying property types, descriptions, min/max limits, formats, and deleting/adding fields.

4. **Query & Transformation Workbench**
   - Live **JSONata** query execution engine with split-pane code editor and result view.
   - Quick-select query templates (filtering arrays, mapping objects, numerical aggregations, grouping).
   - Execution performance timing (in milliseconds) and single-click copy to clipboard.

5. **Enterprise Code & Schema Generator Modal**
   - **Schema Inference**: Generates compliant Draft 2020-12 JSON Schema directly from raw sample JSON.
   - **Multi-Language Type Generator**:
     - **TypeScript**: Typed interfaces / types.
     - **Java POJO**: Jackson `@JsonProperty` annotations, getters/setters.
     - **C# DTO**: `[JsonPropertyName]` attributes with auto-properties `{ get; set; }`.
     - **Go**: Structs with `` `json:"..."` `` tags.
     - **Rust**: Structs with `#[derive(Serialize, Deserialize)]`.
     - **Python**: Pydantic `BaseModel` classes.

---

## 📁 Repository Structure

```
JSONSpy/
├── src-tauri/                  # Tauri v2 Rust Desktop Shell
│   ├── Cargo.toml              # Rust manifest & dependencies
│   ├── tauri.conf.json         # Tauri v2 app configuration & window settings
│   ├── capabilities/           # Tauri permission capabilities (fs, dialog)
│   └── src/
│       ├── main.rs             # Application entry point
│       └── lib.rs              # Tauri builder initialization
├── src/                        # React TypeScript Frontend
│   ├── components/
│   │   ├── TextView.tsx        # Monaco Editor + Ajv validation + SmartFix
│   │   ├── GridView.tsx        # Interactive Tree Grid editor
│   │   ├── SchemaView.tsx      # React Flow Visual Schema Designer
│   │   ├── QueryWorkbench.tsx  # JSONata query & transformation workbench
│   │   ├── GeneratorModal.tsx  # Code & Schema Generator Modal
│   │   ├── Header.tsx          # App bar, workspace tabs & global actions
│   │   ├── Sidebar.tsx         # Document statistics & schema validator
│   │   └── StatusBar.tsx       # Bottom status bar
│   ├── utils/
│   │   ├── smartFix.ts         # SmartFix regex & parser repair engine
│   │   ├── typeGenerators.ts   # Multi-language AST code generator
│   │   ├── schemaInference.ts  # JSON Schema inference utility
│   │   ├── fileSystem.ts       # Native Tauri FS/Dialog wrappers + Web fallback
│   │   └── sampleData.ts       # Built-in sample datasets
│   ├── types/
│   │   └── jsonspy.ts          # Core TypeScript interfaces
│   ├── App.tsx                 # Main application workspace layout
│   └── main.tsx                # React root entry point
├── package.json                # Node dependencies & scripts
├── vite.config.ts              # Vite configuration
└── tailwind.config.js          # Tailwind CSS styling setup
```

---

## 🚀 Running Locally

### Prerequisites
- **Node.js**: v18+ (npm v9+)
- **Rust Toolchain**: `cargo` (1.75+) and C++ build tools for desktop compilation.

### Installation

```bash
npm install
```

### 1. Launch in Web Development Mode (Vite Server)
Runs JSONSpy inside the browser for rapid UI debugging:

```bash
npm run dev
```

### 2. Launch in Native Tauri Desktop Shell
Runs JSONSpy as a native desktop application with full native filesystem access:

```bash
npm run tauri dev
```

---

## 📦 Building Platform Installers

To package native installers (`.msi` / `.exe` on Windows, `.app` / `.dmg` on macOS, `.AppImage` / `.deb` on Linux):

```bash
npm run tauri build
```

The output installers will be placed in `src-tauri/target/release/bundle/`.

---

## ⌨️ Native Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl+O` / `Cmd+O` | Open JSON file from disk |
| `Ctrl+S` / `Cmd+S` | Save current JSON file to disk |
| `Ctrl+Shift+F` / `Cmd+Shift+F` | Prettify / Format JSON payload |
| `Ctrl+Enter` / `Cmd+Enter` | Switch to Query Workbench & execute JSONata query |
