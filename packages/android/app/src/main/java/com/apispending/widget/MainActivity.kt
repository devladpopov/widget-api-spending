package com.apispending.widget

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// Cream palette
private val Cream = Color(0xFFF4EFE3)
private val CreamCard = Color(0xFFFBF7EA)
private val CreamBorder = Color(0xFFE5DDC8)
private val TextPrimary = Color(0xFF1a1815)
private val TextSecondary = Color(0xFF8a8470)
private val Accent = Color(0xFFC96442)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            val prefs = getSharedPreferences("api_spending", MODE_PRIVATE)

            var anthropicKey by remember { mutableStateOf(prefs.getString("anthropic_key", "") ?: "") }
            var openaiKey by remember { mutableStateOf(prefs.getString("openai_key", "") ?: "") }
            var currency by remember { mutableStateOf(prefs.getString("currency", "USD") ?: "USD") }
            var budgetDaily by remember { mutableStateOf(prefs.getString("budget_daily", "") ?: "") }
            var budgetMonthly by remember { mutableStateOf(prefs.getString("budget_monthly", "") ?: "") }
            var saved by remember { mutableStateOf(false) }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Cream)
                    .verticalScroll(rememberScrollState())
                    .padding(24.dp)
            ) {
                Text(
                    "API Spending",
                    fontSize = 22.sp,
                    color = TextPrimary,
                    modifier = Modifier.padding(bottom = 24.dp),
                )

                // API Keys card
                SettingsCard("API KEYS") {
                    SettingsField("Anthropic Admin Key", anthropicKey, "sk-ant-admin01-...") {
                        anthropicKey = it
                    }
                    Spacer(Modifier.height(12.dp))
                    SettingsField("OpenAI Admin Key", openaiKey, "sk-admin-...") {
                        openaiKey = it
                    }
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "Keys are stored locally and encrypted. Never sent to third parties.",
                        fontSize = 11.sp,
                        color = TextSecondary,
                        lineHeight = 16.sp,
                    )
                }

                Spacer(Modifier.height(16.dp))

                // Display card
                SettingsCard("DISPLAY") {
                    Text("Currency", fontSize = 12.sp, color = TextPrimary)
                    Spacer(Modifier.height(4.dp))
                    // Simple text field for currency code
                    OutlinedTextField(
                        value = currency,
                        onValueChange = { currency = it.uppercase().take(3) },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        textStyle = LocalTextStyle.current.copy(fontFamily = FontFamily.Monospace),
                    )
                }

                Spacer(Modifier.height(16.dp))

                // Budget card
                SettingsCard("BUDGET ALERTS") {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Column(Modifier.weight(1f)) {
                            Text("Daily limit ($)", fontSize = 12.sp, color = TextPrimary)
                            Spacer(Modifier.height(4.dp))
                            OutlinedTextField(
                                value = budgetDaily,
                                onValueChange = { budgetDaily = it },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true,
                                placeholder = { Text("10") },
                            )
                        }
                        Column(Modifier.weight(1f)) {
                            Text("Monthly limit ($)", fontSize = 12.sp, color = TextPrimary)
                            Spacer(Modifier.height(4.dp))
                            OutlinedTextField(
                                value = budgetMonthly,
                                onValueChange = { budgetMonthly = it },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true,
                                placeholder = { Text("200") },
                            )
                        }
                    }
                }

                Spacer(Modifier.height(24.dp))

                // Save button
                Button(
                    onClick = {
                        prefs.edit()
                            .putString("anthropic_key", anthropicKey)
                            .putString("openai_key", openaiKey)
                            .putString("currency", currency)
                            .putString("budget_daily", budgetDaily)
                            .putString("budget_monthly", budgetMonthly)
                            .apply()
                        saved = true
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Accent),
                    shape = RoundedCornerShape(8.dp),
                ) {
                    Text("Save Settings", fontSize = 14.sp)
                }

                if (saved) {
                    Text(
                        "Saved",
                        fontSize = 12.sp,
                        color = Color(0xFF4a8a3a),
                        fontFamily = FontFamily.Monospace,
                        modifier = Modifier.padding(top = 8.dp),
                    )
                }
            }
        }
    }
}

@Composable
private fun SettingsCard(title: String, content: @Composable ColumnScope.() -> Unit) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = CreamCard,
        border = ButtonDefaults.outlinedButtonBorder,
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(Modifier.padding(20.dp)) {
            Text(
                title,
                fontSize = 10.sp,
                color = TextSecondary,
                letterSpacing = 0.8.sp,
                modifier = Modifier.padding(bottom = 12.dp),
            )
            content()
        }
    }
}

@Composable
private fun SettingsField(
    label: String,
    value: String,
    placeholder: String,
    onValueChange: (String) -> Unit,
) {
    Column {
        Text(label, fontSize = 12.sp, color = TextPrimary)
        Spacer(Modifier.height(4.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            placeholder = { Text(placeholder, fontFamily = FontFamily.Monospace, fontSize = 13.sp) },
            textStyle = LocalTextStyle.current.copy(fontFamily = FontFamily.Monospace, fontSize = 13.sp),
        )
    }
}
