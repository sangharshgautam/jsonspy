import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.intellij.platform.gradle.TestFrameworkType

plugins {
    id("java")
    id("org.jetbrains.kotlin.jvm") version "2.0.21"
    id("org.jetbrains.intellij.platform") version "2.19.0"
}

group = "uk.co.sangharsh.jsonspy.plugin"
version = "1.0.1"

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

fun getLatestChangelogHtml(): String {
    val changelog = file("../CHANGELOG.md")
    if (!changelog.exists()) return "<li>Initial JSONSpy release.</li>"

    val latestSection = changelog.readText().split("## [").getOrNull(1) ?: return ""
    val markdown = latestSection.substringAfter("]\n").substringBefore("\n## [").trim()

    return markdown
        .replace(Regex("^### (.*)$", RegexOption.MULTILINE), "<h4>$1</h4>")
        .replace(Regex("^\\- (.*)$", RegexOption.MULTILINE), "<li>$1</li>")
        .replace(Regex("\\*\\*([^*]+)\\*\\*"), "<b>$1</b>")
        .replace(Regex("`([^`]+)`"), "<code>$1</code>")
}

intellijPlatform {
    buildSearchableOptions = false

    publishing {
        token.set(providers.gradleProperty("publishToken"))
    }

    pluginConfiguration {
        id.set("uk.co.sangharsh.jsonspy.plugin")
        name = "JSONSpy - Enterprise JSON & Schema Workbench"
        version = "1.0.1"

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
                <li><b>Ajv &amp; NetworkNT Schema Engines</b>: Choose between client-side Ajv (JavaScript) or high-compliance NetworkNT (JVM Java) schema validation.</li>
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
            <h3>JSONSpy v1.0.1 Release Notes</h3>
            <ul>
            ${getLatestChangelogHtml()}
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
