# JSONSpy — Enterprise JSON Workbench & Schema Designer for VS Code

**JSONSpy** is a high-performance visual workbench for JSON editing, schema validation, transformation, and visual schema modeling right inside Visual Studio Code.

---

## 🌟 Key Features

- **Custom Editor for `.json` Files**: Right-click any JSON file and select **"Open With... → JSONSpy Workbench"**.
- **Interactive Tree Grid View**: Navigate deep hierarchical JSON payloads with type badges (`String`, `Number`, `Boolean`, `Object`, `Array`), inline key-value editing, and instant search/filtering.
- **SmartFix Engine**: One-click automatic syntax repair for broken JSON (trailing commas, unquoted keys, single quotes, unclosed literals).
- **Visual Schema Designer**: Interactive React Flow node diagram to visualize Draft 2020-12 / Draft-07 schemas, toggle required fields, and inspect constraints.
- **Live JSONata Workbench**: Fast JSON querying and transformation engine with query templates and sub-millisecond benchmark timers.
- **Multi-Language Code Generator**: Export typed models for TypeScript, Rust, Kotlin, Go, Python (Pydantic), and C# DTOs directly from your JSON payload.
- **Seamless VS Code Integration**: Bidirectional document synchronization with native VS Code Undo/Redo (`Ctrl+Z`), auto-save, and Dark/Light theme switching.
- **100% Offline & Private**: Zero cloud dependency — all validation and queries run locally inside VS Code.

---

## 🚀 How to Use

1. **Open Existing JSON File**:
   - Right-click any `.json`, `.schema.json`, or `.geojson` file in the VS Code File Explorer.
   - Select **Open With...** → **JSONSpy Workbench**.
   - *(Optional: Click "Configure default editor for '*.json'..." to always open with JSONSpy).*

2. **Open from Editor Tab**:
   - While viewing any JSON file, click the JSONSpy icon in the editor tab title bar.

3. **Command Palette**:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) and run:
     - `JSONSpy: Open Workbench (New Scratchpad)`
     - `JSONSpy: Open File with JSONSpy`

---

## 📋 License

Licensed under the [Apache License 2.0](LICENSE).
