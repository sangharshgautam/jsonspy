# JSONSpy — User Guide & Quick Start

Welcome to **JSONSpy**, the enterprise JSON editing, validation, transformation, and visual schema modeling workbench for IntelliJ Platform IDEs.

---

## 🚀 Getting Started

### Opening the JSONSpy ToolWindow
After installing JSONSpy, open the workbench anytime by clicking the **JSONSpy** icon in the right IDE toolwindow stripe or via **View → Tool Windows → JSONSpy**.

---

## 🛠️ Core Capabilities

### 1. Monaco Code Editor & SmartFix
- **Syntax Highlighting & Folding**: Industry-standard code editor with line numbers and structural folding.
- **SmartFix Recovery**: When editing malformed JSON payloads (e.g. trailing commas, unquoted keys, single quotes, or Python literals like `True`/`None`), an amber alert banner appears. Click **Apply SmartFix Now** to automatically repair syntax errors in one click.

### 2. Schema Validation Engines (Ajv & NetworkNT)
- **Draft 2020-12 & Draft-07 Support**: Validate JSON documents against JSON Schema specifications in real time.
- **Configurable Backend Engines**: Open the sidebar **Document Inspector** panel to switch between:
  - **Ajv**: Fast client-side JavaScript validation.
  - **NetworkNT**: High-compliance Java JVM backend validation.

### 3. Visual React Flow Schema Designer
- Switch to the **Schema Designer** tab to inspect your schema as an interactive node graph.
- Toggle property `Required` status directly on visual nodes.
- Use the **Property Inspector** drawer to configure data types, formats (`email`, `date-time`, `uuid`), minimum/maximum numeric constraints, and field descriptions.
- Click **Infer Schema** to generate a compliant JSON Schema draft directly from raw sample JSON.

### 4. JSONata Query & Transformation Workbench
- Switch to the **Query Workbench** tab to run real-time JSONata expressions.
- Use built-in template presets for array filtering, object mapping, numerical aggregations (`$sum`, `$average`), and category grouping.

### 5. Multi-Format Code Generator
- Click **Code Generator** in the top toolbar to generate type definitions in **TypeScript**, **Kotlin**, **Rust**, **Go**, **Python (Pydantic)**, and **C# DTOs**.
