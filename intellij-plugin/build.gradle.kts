import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.intellij.platform.gradle.TestFrameworkType

plugins {
    id("java")
    id("org.jetbrains.kotlin.jvm") version "2.0.21"
    id("org.jetbrains.intellij.platform") version "2.19.0"
}

group = "uk.co.sangharsh.jsonspy.plugin"
version = "1.0.0"

repositories {
    mavenCentral()
    intellijPlatform {
        defaultRepositories()
    }
}

val allureResultsDir = layout.buildDirectory.dir("allure-results")

dependencies {
    intellijPlatform {
        intellijIdeaCommunity("2024.3")
        testFramework(TestFrameworkType.Platform)
    }
    implementation("com.networknt:json-schema-validator:1.4.3")
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.junit.jupiter:junit-jupiter:5.11.4")

    val allureVersion = "2.35.5"
    testImplementation(platform("io.qameta.allure:allure-bom:$allureVersion"))
    testImplementation("io.qameta.allure:allure-jupiter")
}

java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_21)
    }
}

tasks.test {
    useJUnitPlatform()
    systemProperty("allure.results.directory", allureResultsDir.get().asFile.absolutePath)
}

intellijPlatform {
    buildSearchableOptions = false

    pluginConfiguration {
        id.set("uk.co.sangharsh.jsonspy.plugin")
        name = "JSONSpy - Enterprise JSON & Schema Workbench"
        version = "1.0.0"

        ideaVersion {
            sinceBuild.set("233")
            untilBuild.set(provider { null })
        }

        description.set("""
            <h3>JSONSpy - Enterprise JSON &amp; Schema Workbench</h3>
            <p>A high-performance enterprise JSON editing, validation, transformation, and visual schema modeling workbench inspired by Altova XMLSpy.</p>

            <h4>Key Features:</h4>
            <ul>
                <li><b>Monaco JSON Editor &amp; SmartFix</b>: Enterprise syntax highlighting, folding, and one-click automatic syntax repair for corrupted JSON payloads.</li>
                <li><b>Ajv Schema Engine</b>: Real-time Draft 2020-12 and Draft-07 JSON Schema validation with inline violation highlights.</li>
                <li><b>Visual React Flow Schema Designer</b>: Interactive node-graph editor for inspecting, editing, and inferring JSON schema definitions.</li>
                <li><b>JSONata Transformation Engine</b>: Real-time query execution, data mapping, and numeric aggregation.</li>
                <li><b>Multi-Format Code Generator</b>: One-click TypeScript, Rust, Kotlin, Go, Python, and C# type definition generator.</li>
                <li><b>In-Process Local Server &amp; JCEF Bridge</b>: Zero-latency IDE file operations via native loopback bridge.</li>
            </ul>

            <h4>Keyboard Shortcuts:</h4>
            <ul>
                <li><b>Ctrl+O / Cmd+O</b>: Open JSON File</li>
                <li><b>Ctrl+S / Cmd+S</b>: Save File</li>
                <li><b>Ctrl+Shift+F / Cmd+Shift+F</b>: Prettify JSON</li>
                <li><b>Ctrl+Enter / Cmd+Enter</b>: Run JSONata Query</li>
            </ul>
        """.trimIndent())

        changeNotes.set("""
            <h3>JSONSpy v1.0.0 Release Notes</h3>
            <ul>
                <li><b>Multi-Platform Release</b>: Initial release supporting Tauri v2 Desktop, Web SPA, and IntelliJ Platform IDEs.</li>
                <li><b>Out-of-Process JCEF Support</b>: Native Chromium webview embedding for IntelliJ 2026.2+ (`262+`) with automatic module classloader resolution.</li>
                <li><b>SmartFix Syntax Recovery</b>: One-click repair for trailing commas, unquoted keys, and single-quoted strings.</li>
                <li><b>Ajv Validation &amp; Schema Inference</b>: Real-time Draft 2020-12 schema validation and automatic schema inference.</li>
                <li><b>Interactive Tree Grid &amp; React Flow Canvas</b>: Dual-mode interactive JSON manipulation and visual node graph editing.</li>
            </ul>
        """.trimIndent())
    }
}

tasks.named<org.jetbrains.intellij.platform.gradle.tasks.BuildPluginTask>("buildPlugin") {
    archiveBaseName.set("jsonspy-plugin")
    doFirst {
        val patchedFile = file("build/patchedPluginXmlFiles/plugin.xml")
        if (patchedFile.exists()) {
            var text = patchedFile.readText()
            if (!text.contains("com.intellij.modules.jcef")) {
                text = text.replace(
                    "<depends>com.intellij.modules.platform</depends>",
                    "<depends>com.intellij.modules.platform</depends>\n  <depends>com.intellij.modules.jcef</depends>"
                )
                patchedFile.writeText(text)
            }
        }
    }
}
