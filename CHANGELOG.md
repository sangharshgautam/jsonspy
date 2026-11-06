# Changelog

All notable changes to the JSONSpy project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-05

### Added
- **Multi-Platform Distribution Support**:
  - Tauri v2 Desktop App (Windows, Linux, macOS).
  - Web Single Page Application (SPA).
  - IntelliJ Platform IDE Plugin for IntelliJ IDEA, Android Studio, WebStorm, PyCharm, and CLion.
- **Monaco JSON Editor & SmartFix Engine**:
  - High-performance syntax highlighting, code folding, and line numbers.
  - One-click automatic syntax repair (`smartFixJSON`) for unquoted keys, single quotes, trailing commas, and missing brackets.
- **Ajv Schema Validation & Visual Schema Designer**:
  - Real-time Draft 2020-12 and Draft-07 JSON Schema validation with inline violation highlights.
  - Interactive React Flow node-graph schema editor with type editing, constraint inspection, and automatic schema inference.
- **Interactive Tree Grid**:
  - Hierarchical tree grid view supporting key renaming, value editing, type conversions, and node addition/deletion.
- **JSONata Query & Transformation Workbench**:
  - Integrated JSONata transformation engine with built-in query templates and sub-millisecond benchmark timers.
- **Multi-Language Type Generator**:
  - One-click TypeScript, Rust, Kotlin, Go, Python, and C# type definition generator.
- **IDE Integration & JCEF Bridge**:
  - Native `JBCefBrowser` out-of-process Chromium embedding for IntelliJ 2026.2+ (`262+`).
  - In-process JDK `HttpServer` loopback bridge for zero-latency IDE file operations.
  - Programmatic Registry auto-enable and custom SVG brand icons.
- **React Runtime Diagnostics**:
  - Global `ErrorBoundary` wrapper with on-screen error diagnostic reports and automatic IPC error bridge logging to `idea.log`.
