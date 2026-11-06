package uk.co.sangharsh.jsonspy.plugin

import com.intellij.ide.BrowserUtil
import com.intellij.openapi.diagnostic.Logger
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBTextArea
import com.intellij.ui.content.ContentFactory
import javax.swing.JButton
import javax.swing.JPanel
import javax.swing.JScrollPane
import javax.swing.SwingConstants
import javax.swing.BorderFactory
import java.awt.BorderLayout
import java.awt.Color
import java.awt.Font
import java.awt.Insets

class JsonSpyToolWindowFactory : ToolWindowFactory, DumbAware {
    private val LOG = Logger.getInstance(JsonSpyToolWindowFactory::class.java)

    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        LOG.info("Creating JSONSpy ToolWindow content for project '${project.name}'")
        val port = JsonSpyHttpServer.ensureStarted()
        val initialUrl = "http://127.0.0.1:$port/"

        val rootPanel = JPanel(BorderLayout())

        val isAvailable = JcefComponentFactory.isJcefAvailable()
        LOG.info("JCEF availability check: $isAvailable")

        if (isAvailable) {
            try {
                LOG.info("Initializing JCEF browser for ToolWindow on $initialUrl")
                val browser = JcefComponentFactory.createBrowser(project, initialUrl)
                rootPanel.add(browser.component, BorderLayout.CENTER)
                LOG.info("JCEF browser component added to ToolWindow rootPanel successfully")
            } catch (e: Throwable) {
                LOG.error("Failed to create JCEF browser component: ${e.message}", e)
                val err = "${e.javaClass.name}: ${e.message}"
                rootPanel.add(createFallbackPanel(err, port), BorderLayout.CENTER)
            }
        } else {
            LOG.warn("JCEF is not available in current IDE runtime. Displaying fallback panel.")
            rootPanel.add(createFallbackPanel("JCEF is not available in current IDE runtime", port), BorderLayout.CENTER)
        }

        val content = ContentFactory.getInstance().createContent(rootPanel, "", false)
        toolWindow.contentManager.addContent(content)
        LOG.info("JSONSpy ToolWindow content created and attached to contentManager")
    }

    private fun createFallbackPanel(diagnosticText: String, port: Int): JPanel {
        val mainPanel = JPanel(BorderLayout(10, 10))
        mainPanel.border = BorderFactory.createEmptyBorder(16, 16, 16, 16)

        val headerLabel = JBLabel("JSONSpy Enterprise Workbench").apply {
            font = font.deriveFont(Font.BOLD, 16f)
            foreground = Color(12, 141, 233)
            horizontalAlignment = SwingConstants.CENTER
        }
        mainPanel.add(headerLabel, BorderLayout.NORTH)

        val textArea = JBTextArea(diagnosticText).apply {
            isEditable = false
            font = Font(Font.MONOSPACED, Font.PLAIN, 12)
            margin = Insets(10, 10, 10, 10)
            background = Color(30, 30, 30)
            foreground = Color(220, 220, 220)
        }
        val scrollPane = JScrollPane(textArea).apply {
            border = BorderFactory.createTitledBorder("Status Diagnostic")
        }
        mainPanel.add(scrollPane, BorderLayout.CENTER)

        val localUrl = "http://127.0.0.1:$port"
        val buttonPanel = JPanel()
        val openBrowserBtn = JButton("🚀 Open JSONSpy Workspace ($localUrl)").apply {
            font = font.deriveFont(Font.BOLD, 12f)
        }
        openBrowserBtn.addActionListener {
            LOG.info("User clicked Open JSONSpy Workspace button for URL: $localUrl")
            BrowserUtil.browse(localUrl)
        }

        buttonPanel.add(openBrowserBtn)
        mainPanel.add(buttonPanel, BorderLayout.SOUTH)

        return mainPanel
    }
}
