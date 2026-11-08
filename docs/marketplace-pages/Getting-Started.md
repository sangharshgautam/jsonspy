# Getting Started with JSONSpy

JSONSpy is an enterprise JSON editing, validation, transformation, and visual schema modeling workbench. Follow the steps below to install, configure, and use JSONSpy inside your JetBrains IDE.

---

## 1. Installation

1. Launch any compatible JetBrains IDE (IntelliJ IDEA, Android Studio, WebStorm, PyCharm, CLion, GoLand, Rider, PhpStorm, or RustRover).
2. Open **Settings / Preferences** (`Ctrl+Alt+S` on Windows/Linux or `Cmd+,` on macOS).
3. Select **Plugins** from the left sidebar and navigate to the **Marketplace** tab.
4. Search for **`JSONSpy - Enterprise JSON & Schema Workbench`**.
5. Click **Install** and restart your IDE if prompted.

---

## 2. First-Time Configuration & Usage

- **Open JSONSpy Tool Window**: Click the **JSONSpy** tab in the right toolwindow stripe, or select **View → Tool Windows → JSONSpy**.
- **Automatic JCEF Enabling**: JSONSpy uses native JCEF (Chromium) webviews. If JCEF is disabled in your IDE, JSONSpy will automatically enable the required registry setting.
- **Selecting Schema Validator Engine**: Expand the **Document Inspector** sidebar panel inside the JSONSpy window to choose between **Ajv** (client-side JavaScript) or **NetworkNT** (high-compliance JVM Java backend) schema validation.

---

## 3. Complementary & Conflicting Plugins

- **Complementary Plugins**:
  - **Git Integration**: Works seamlessly alongside native version control for tracking JSON schema changes and payload diffs.
  - **HTTP Client / REST Tools**: Excellent companion for inspecting REST API JSON responses directly inside JSONSpy.
- **Conflicting Plugins**: **None**. JSONSpy operates in its own dedicated tool window and does not conflict with native IDE file syntax colorizers or formatters.
