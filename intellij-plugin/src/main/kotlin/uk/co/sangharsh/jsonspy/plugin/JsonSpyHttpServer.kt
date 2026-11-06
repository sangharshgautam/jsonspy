package uk.co.sangharsh.jsonspy.plugin

import com.intellij.openapi.diagnostic.Logger
import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpHandler
import com.sun.net.httpserver.HttpServer
import java.net.InetSocketAddress
import java.io.OutputStream
import java.io.InputStream

object JsonSpyHttpServer {
    private val LOG = Logger.getInstance(JsonSpyHttpServer::class.java)
    private var server: HttpServer? = null
    private var boundPort: Int = 0

    @Synchronized
    fun ensureStarted(): Int {
        if (server != null) return boundPort

        try {
            val localServer = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
            localServer.createContext("/", SpaHandler())
            localServer.executor = null
            localServer.start()

            server = localServer
            boundPort = localServer.address.port
            LOG.info("JSONSpy local HTTP server started on http://127.0.0.1:$boundPort")
        } catch (e: Exception) {
            LOG.error("Failed to start JSONSpy local HTTP server", e)
            boundPort = 1420
        }
        return boundPort
    }

    private class SpaHandler : HttpHandler {
        override fun handle(exchange: HttpExchange) {
            val path = exchange.requestURI.path
            val targetPath = if (path == "/" || path.isEmpty()) "webview/single_index.html" else "webview$path"

            LOG.info("HTTP Request: method=${exchange.requestMethod}, path=$path, targetResource=$targetPath")

            var stream = fetchStream(targetPath)
            var servedFallback = false
            if (stream == null) {
                servedFallback = true
                stream = fetchStream("webview/single_index.html")
            }

            if (stream != null) {
                val bytes = stream.readBytes()
                val mime = when {
                    path.endsWith(".css") -> "text/css; charset=utf-8"
                    path.endsWith(".js") -> "application/javascript; charset=utf-8"
                    path.endsWith(".json") -> "application/json; charset=utf-8"
                    path.endsWith(".png") -> "image/png"
                    path.endsWith(".svg") -> "image/svg+xml"
                    else -> "text/html; charset=utf-8"
                }

                LOG.info("HTTP 200 OK: path=$path, servedFallback=$servedFallback, size=${bytes.size} bytes, mime=$mime")

                exchange.responseHeaders.set("Content-Type", mime)
                exchange.responseHeaders.set("Access-Control-Allow-Origin", "*")
                exchange.sendResponseHeaders(200, bytes.size.toLong())

                val os: OutputStream = exchange.responseBody
                os.write(bytes)
                os.close()
            } else {
                LOG.error("HTTP 404 Not Found: path=$path, targetPath=$targetPath")
                val notFound = "<html><body><h3>JSONSpy Webview Asset Not Found</h3></body></html>".toByteArray()
                exchange.responseHeaders.set("Content-Type", "text/html; charset=utf-8")
                exchange.sendResponseHeaders(404, notFound.size.toLong())
                val os: OutputStream = exchange.responseBody
                os.write(notFound)
                os.close()
            }
        }

        private fun fetchStream(resPath: String): InputStream? {
            val clean = resPath.removePrefix("/")
            return JsonSpyHttpServer::class.java.classLoader?.getResourceAsStream(clean)
                ?: JsonSpyHttpServer::class.java.getResourceAsStream("/$clean")
                ?: JsonSpyHttpServer::class.java.getResourceAsStream(clean)
        }
    }
}
