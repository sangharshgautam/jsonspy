package uk.co.sangharsh.jsonspy.plugin

import com.intellij.openapi.diagnostic.Logger
import com.intellij.openapi.project.Project
import com.intellij.ui.ColorUtil
import com.intellij.ui.jcef.JBCefApp
import com.intellij.ui.jcef.JBCefBrowser
import com.intellij.ui.jcef.JBCefBrowserBase
import com.intellij.ui.jcef.JBCefJSQuery
import com.intellij.util.ui.UIUtil
import org.cef.browser.CefBrowser
import org.cef.browser.CefFrame
import org.cef.handler.CefLoadHandlerAdapter

object JcefComponentFactory {
    private val LOG = Logger.getInstance(JcefComponentFactory::class.java)

    fun isJcefAvailable(): Boolean {
        val supported = try {
            JBCefApp.isSupported()
        } catch (e: Throwable) {
            LOG.error("JBCefApp.isSupported() threw exception: ${e.message}", e)
            false
        }
        LOG.info("JBCefApp.isSupported() result: $supported")
        return supported
    }

    fun createBrowser(project: Project, initialUrl: String): JBCefBrowser {
        LOG.info("Creating JBCefBrowser pointing to initialUrl: $initialUrl")
        val browser = JBCefBrowser(initialUrl)
        val jsQuery = JBCefJSQuery.create(browser as JBCefBrowserBase)

        jsQuery.addHandler { request ->
            LOG.info("JCEF JS Query received: $request")
            if (!request.isNullOrBlank()) {
                JsonSpyJcefBridge.handleQuery(project, request)
            }
            null
        }

        val isDarkTheme = try {
            ColorUtil.isDark(UIUtil.getPanelBackground())
        } catch (e: Throwable) {
            true
        }

        val injectionScript = "window.cefQuery = function(obj) { " + jsQuery.inject("obj.request") + " };\n" +
                "document.documentElement.classList.toggle('dark', " + isDarkTheme + ");\n" +
                "window.addEventListener('error', function(e) {\n" +
                "    console.error('[JSONSpy JS Global Error]', e.message);\n" +
                "});\n" +
                "console.log('[JSONSpy JCEF Bridge Initialized - Theme Dark: " + isDarkTheme + "');"

        browser.jbCefClient.addLoadHandler(object : CefLoadHandlerAdapter() {
            override fun onLoadEnd(browser: CefBrowser?, frame: CefFrame?, httpStatusCode: Int) {
                LOG.info("JCEF onLoadEnd: url=${frame?.url}, httpStatus=$httpStatusCode")
                frame?.executeJavaScript(injectionScript, frame.url, 0)
            }
        }, browser.cefBrowser)

        return browser
    }
}
