package uk.co.sangharsh.jsonspy.plugin

import com.intellij.openapi.options.Configurable
import javax.swing.*
import java.awt.FlowLayout

class JsonSpySettingsConfigurable : Configurable {
    private var validatorCombo: JComboBox<String>? = null
    private val validatorOptions = arrayOf("Ajv (Client-side JavaScript)", "NetworkNT (JVM Java Backend)")

    override fun getDisplayName(): String = "JSONSpy Workbench"

    override fun createComponent(): JComponent {
        val panel = JPanel()
        panel.layout = BoxLayout(panel, BoxLayout.Y_AXIS)

        val row = JPanel(FlowLayout(FlowLayout.LEFT))
        row.add(JLabel("Schema Validator Engine:"))

        validatorCombo = JComboBox(validatorOptions)
        val current = JsonSpySettingsState.getInstance().validatorEngine
        validatorCombo?.selectedIndex = if (current == "networknt") 1 else 0
        row.add(validatorCombo)

        panel.add(row)
        return panel
    }

    override fun isModified(): Boolean {
        val current = JsonSpySettingsState.getInstance().validatorEngine
        val selectedIndex = validatorCombo?.selectedIndex ?: 0
        val selectedKey = if (selectedIndex == 1) "networknt" else "ajv"
        return current != selectedKey
    }

    override fun apply() {
        val selectedIndex = validatorCombo?.selectedIndex ?: 0
        JsonSpySettingsState.getInstance().validatorEngine = if (selectedIndex == 1) "networknt" else "ajv"
    }

    override fun reset() {
        val current = JsonSpySettingsState.getInstance().validatorEngine
        validatorCombo?.selectedIndex = if (current == "networknt") 1 else 0
    }
}
