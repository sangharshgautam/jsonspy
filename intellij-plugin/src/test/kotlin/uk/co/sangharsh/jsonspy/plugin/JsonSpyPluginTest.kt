package uk.co.sangharsh.jsonspy.plugin

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.assertTrue

class JsonSpyPluginTest {
    @Test
    fun testNetworkNtValidatorValidation() {
        val schema = """
            {
              "type": "object",
              "properties": {
                "name": { "type": "string" }
              },
              "required": ["name"]
            }
        """.trimIndent()

        val jsonValid = """{ "name": "JSONSpy Enterprise" }"""
        val result = NetworkNtValidator.validate(jsonValid, schema)
        assertTrue(result.contains("networknt"))
    }
}
