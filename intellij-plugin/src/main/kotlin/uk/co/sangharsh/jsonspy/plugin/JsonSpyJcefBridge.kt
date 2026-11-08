package uk.co.sangharsh.jsonspy.plugin

import com.intellij.openapi.diagnostic.Logger
import com.intellij.openapi.fileChooser.FileChooserDescriptorFactory
import com.intellij.openapi.fileChooser.FileChooserFactory
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.LocalFileSystem
import com.intellij.openapi.vfs.VfsUtil
import com.intellij.ui.jcef.JBCefJSQuery
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import java.io.File

object JsonSpyJcefBridge {
    private val LOG = Logger.getInstance(JsonSpyJcefBridge::class.java)

    fun handleQuery(project: Project, requestJson: String): JBCefJSQuery.Response? {
        LOG.info("Bridge received request JSON: $requestJson")
        try {
            val json = JsonParser.parseString(requestJson).asJsonObject
            val action = json.get("action")?.asString ?: return null

            LOG.info("Bridge handling action: $action")

            when (action) {
                "validateSchema" -> {
                    val content = json.get("content")?.asString ?: "{}"
                    val schema = json.get("schema")?.asString ?: "{}"
                    val engine = json.get("engine")?.asString ?: "ajv"

                    if (engine == "networknt") {
                        val validationResult = NetworkNtValidator.validate(content, schema)
                        return JBCefJSQuery.Response(validationResult)
                    } else {
                        val res = JsonObject()
                        res.addProperty("engine", "ajv")
                        return JBCefJSQuery.Response(res.toString())
                    }
                }

                "log_error" -> {
                    val message = json.get("message")?.asString ?: "Unknown JS error"
                    val stack = json.get("stack")?.asString ?: ""
                    LOG.error("[JSONSpy Frontend Error]: $message\n$stack")
                    return JBCefJSQuery.Response("logged")
                }

                "openFile" -> {
                    val descriptor = FileChooserDescriptorFactory.createSingleFileDescriptor("json")
                    val chooser = FileChooserFactory.getInstance().createFileChooser(descriptor, project, null)
                    val chosenFiles = chooser.choose(project)

                    if (chosenFiles.isNotEmpty()) {
                        val file = chosenFiles[0]
                        val content = VfsUtil.loadText(file)
                        LOG.info("User opened file via native dialog: ${file.path}")
                        val res = JsonObject()
                        res.addProperty("name", file.name)
                        res.addProperty("path", file.path)
                        res.addProperty("content", content)
                        return JBCefJSQuery.Response(res.toString())
                    }
                }

                "saveFile" -> {
                    val content = json.get("content")?.asString ?: ""
                    val pathStr = json.get("path")?.asString

                    if (!pathStr.isNullOrEmpty()) {
                        val file = File(pathStr)
                        file.writeText(content)
                        LocalFileSystem.getInstance().refreshAndFindFileByIoFile(file)
                        LOG.info("User saved file via native bridge: $pathStr (${content.length} chars)")
                        return JBCefJSQuery.Response(pathStr)
                    }
                }
            }
        } catch (e: Exception) {
            LOG.error("Exception handling JS bridge query", e)
            return JBCefJSQuery.Response(null, 500, e.message)
        }
        return JBCefJSQuery.Response(null)
    }
}
