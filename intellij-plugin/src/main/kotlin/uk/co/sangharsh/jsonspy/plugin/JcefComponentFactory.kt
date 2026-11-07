package uk.co.sangharsh.jsonspy.plugin

import com.intellij.openapi.diagnostic.Logger
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.registry.Registry
import com.intellij.ui.jcef.JBCefApp
import com.intellij.ui.jcef.JBCefBrowser
import com.intellij.ui.jcef.JBCefBrowserBase
import com.intellij.ui.jcef.JBCefJSQuery
import org.cef.browser.CefBrowser
import org.cef.browser.CefFrame
import org.cef.handler.CefLoadHandlerAdapter

object JcefComponentFactory {
    private val LOG = Logger.getInstance(JcefComponentFactory::class.java)

    fun isJcefAvailable(): Boolean {
        try {
            val key = Registry.get("ide.browser.jcef.enabled")
            if (!key.asBoolean()) {
                LOG.info("Auto-enabling Registry key ide.browser.jcef.enabled")
                key.setValue(true)
            }
        } catch (e: Throwable) {
            LOG.warn("Failed to set Registry key ide.browser.jcef.enabled: ${e.message}")
        }

        try {
            val gpuKey = Registry.get("ide.browser.jcef.gpu.disable")
            if (!gpuKey.asBoolean()) {
                LOG.info("Auto-disabling JCEF GPU acceleration (ide.browser.jcef.gpu.disable = true) to prevent black screen rendering issues")
                gpuKey.setValue(true)
            }
        } catch (e: Throwable) {
            LOG.warn("Failed to set Registry key ide.browser.jcef.gpu.disable: ${e.message}")
        }

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

        val injectionScript = """
            window.cefQuery = function(obj) { ${jsQuery.inject("obj.request")} };
            window.addEventListener('error', function(e) {
                console.error('[JSONSpy JS Global Error]', e.message, e.filename, e.lineno, e.colno, e.error);
                try {
                    window.cefQuery({ request: JSON.stringify({ action: 'log_error', message: e.message, stack: e.error ? e.error.stack : '' }) });
                } catch(ex) {}
            });
            window.addEventListener('unhandledrejection', function(e) {
                console.error('[JSONSpy JS Unhandled Rejection]', e.reason);
                try {
                    window.cefQuery({ request: JSON.stringify({ action: 'log_error', message: 'Unhandled Rejection: ' + e.reason, stack: '' }) });
                } catch(ex) {}
            });
            console.log('[JSONSpy JCEF Bridge Initialized]');
        """.trimIndent()

        browser.jbCefClient.addLoadHandler(object : CefLoadHandlerAdapter() {
            override fun onLoadEnd(browser: CefBrowser?, frame: CefFrame?, httpStatusCode: Int) {
                LOG.info("JCEF onLoadEnd: url=${frame?.url}, httpStatus=$httpStatusCode")
                frame?.executeJavaScript(injectionScript, frame.url, 0)
            }
        }, browser.cefBrowser)

        return browser
    }
}
