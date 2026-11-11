# Changelog

All notable changes to the JSONSpy project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.3] - 2026-11-06

### Added
- **Dynamic Git Tag Versioning**:
  - Automatically syncs IntelliJ plugin and desktop build versions with GitHub release tags (`v1.0.3`).
- **Sidebar Validator Engine Selector**:
  - Choose between Ajv (Client-side JS) and NetworkNT (JVM Java) directly in the workbench sidebar.
- **Playwright E2E Testing & Allure3 Integration**:
  - Integrated Playwright E2E browser test suite with automated JUnit report aggregation for Allure reporting.
- **JCEF Stability & Theme Synchronization**:
  - Auto-disabled JCEF GPU acceleration to prevent black screens and synchronized dark/light mode with IntelliJ LaF.

## [1.0.2] - 2026-11-06

### Added
- **Multi-Platform Release & Marketplace Automation**:
  - Modular GitHub Actions release workflows for Desktop (`release-desktop.yml`) and IntelliJ Plugin (`release-intellij.yml`).
  - Automated JetBrains Marketplace publishing via `./gradlew publishPlugin`.
  - Microsoft Store direct installation link and Privacy Policy modal on landing page.
- **NetworkNT JVM Schema Validator**:
  - Added user settings configuration to toggle between client-side Ajv and JVM backend NetworkNT validation engine.
- **SmartFix String Quote Recovery**:
  - Enhanced SmartFix engine to automatically repair unclosed string literals, missing opening quotes, and unquoted string values.

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
- **JSONata Transformation Engine**:
  - Integrated JSONata transformation engine with built-in query templates and sub-millisecond benchmark timers.
- **Multi-Language Type Generator**:
  - One-click TypeScript, Rust, Kotlin, Go, Python, and C# type definition generator.
- **IDE Integration & JCEF Bridge**:
  - Native `JBCefBrowser` out-of-process Chromium embedding for IntelliJ 2026.2+ (`262+`).
  - In-process JDK `HttpServer` loopback bridge for zero-latency IDE file operations.
  - Programmatic Registry auto-enable and custom SVG brand icons.
- **React Runtime Diagnostics**:
  - Global `ErrorBoundary` wrapper with on-screen error diagnostic reports and automatic IPC error bridge logging to `idea.log`.
