package uk.co.sangharsh.jsonspy.plugin

import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.PersistentStateComponent
import com.intellij.openapi.components.State
import com.intellij.openapi.components.Storage
import com.intellij.util.xmlb.XmlSerializerUtil

@State(
    name = "uk.co.sangharsh.jsonspy.plugin.JsonSpySettingsState",
    storages = [Storage("jsonspy_settings.xml")]
)
class JsonSpySettingsState : PersistentStateComponent<JsonSpySettingsState> {
    var validatorEngine: String = "ajv" // "ajv" or "networknt"

    override fun getState(): JsonSpySettingsState {
        return this
    }

    override fun loadState(state: JsonSpySettingsState) {
        XmlSerializerUtil.copyBean(state, this)
    }

    companion object {
        fun getInstance(): JsonSpySettingsState {
            return ApplicationManager.getApplication().getService(JsonSpySettingsState::class.java)
        }
    }
}
