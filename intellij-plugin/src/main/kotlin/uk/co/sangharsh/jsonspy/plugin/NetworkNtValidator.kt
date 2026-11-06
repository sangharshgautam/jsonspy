package uk.co.sangharsh.jsonspy.plugin

import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.openapi.diagnostic.Logger
import com.networknt.schema.JsonSchemaFactory
import com.networknt.schema.SpecVersion
import com.networknt.schema.ValidationMessage
import com.google.gson.JsonArray
import com.google.gson.JsonObject

object NetworkNtValidator {
    private val LOG = Logger.getInstance(NetworkNtValidator::class.java)
    private val objectMapper = ObjectMapper()

    fun validate(jsonStr: String, schemaStr: String): String {
        LOG.info("Executing NetworkNT schema validation on JVM backend...")
        try {
            val factory = JsonSchemaFactory.getInstance(SpecVersion.VersionFlag.V202012)
            val schema = factory.getSchema(schemaStr)
            val jsonNode = objectMapper.readTree(jsonStr)

            val errors: Set<ValidationMessage> = schema.validate(jsonNode)
            LOG.info("NetworkNT validation completed. Found ${errors.size} violations.")

            val jsonArray = JsonArray()
            for (err in errors) {
                val obj = JsonObject()
                obj.addProperty("path", err.instanceLocation.toString())
                obj.addProperty("message", err.message ?: "Validation violation")
                obj.addProperty("keyword", err.type ?: "networknt_schema")
                obj.addProperty("schemaPath", err.evaluationPath.toString())
                jsonArray.add(obj)
            }

            val response = JsonObject()
            response.addProperty("engine", "networknt")
            response.add("errors", jsonArray)
            return response.toString()
        } catch (e: Exception) {
            LOG.error("Exception during NetworkNT schema validation", e)
            val response = JsonObject()
            response.addProperty("engine", "networknt")
            val arr = JsonArray()
            val errObj = JsonObject()
            errObj.addProperty("path", "/schema")
            errObj.addProperty("message", "NetworkNT Schema Error: ${e.message}")
            errObj.addProperty("keyword", "networknt_exception")
            arr.add(errObj)
            response.add("errors", arr)
            return response.toString()
        }
    }
}
