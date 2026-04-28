package com.apispending.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.*
import androidx.glance.appwidget.*
import androidx.glance.layout.*
import androidx.glance.text.*
import androidx.glance.unit.ColorProvider
import androidx.glance.color.ColorProviders
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.serialization.json.Json

// Cream color palette
private val CreamBg = ColorProvider(day = android.graphics.Color.parseColor("#F4EFE3"))
private val TextPrimary = ColorProvider(day = android.graphics.Color.parseColor("#1a1815"))
private val TextSecondary = ColorProvider(day = android.graphics.Color.parseColor("#8a8470"))
private val Accent = ColorProvider(day = android.graphics.Color.parseColor("#C96442"))
private val OpenAIColor = ColorProvider(day = android.graphics.Color.parseColor("#7d8775"))
private val GeminiColor = ColorProvider(day = android.graphics.Color.parseColor("#b8995c"))

class SpendingWidget : GlanceAppWidget() {

    override val sizeMode = SizeMode.Responsive(
        setOf(
            DpSize(120.dp, 80.dp),   // small
            DpSize(250.dp, 80.dp),   // medium
        )
    )

    @Composable
    override fun Content() {
        val context = LocalContext.current
        val size = LocalSize.current
        val prefs = context.getSharedPreferences("api_spending", Context.MODE_PRIVATE)

        val todayCost = prefs.getFloat("today_cost", 0f)
        val currency = prefs.getString("currency", "USD") ?: "USD"
        val anthropicCost = prefs.getFloat("anthropic_cost", 0f)
        val openaiCost = prefs.getFloat("openai_cost", 0f)
        val geminiCost = prefs.getFloat("gemini_cost", 0f)

        GlanceTheme {
            if (size.width < 200.dp) {
                SmallWidget(todayCost, currency)
            } else {
                MediumWidget(todayCost, currency, anthropicCost, openaiCost, geminiCost)
            }
        }
    }
}

@Composable
private fun SmallWidget(todayCost: Float, currency: String) {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .padding(14.dp)
            .background(CreamBg),
        verticalAlignment = Alignment.Top,
    ) {
        Text(
            text = "API SPENDING",
            style = TextStyle(
                color = TextSecondary,
                fontSize = 9.sp,
                fontWeight = FontWeight.Medium,
            ),
        )
        Spacer(modifier = GlanceModifier.height(4.dp))
        Text(
            text = "$${String.format("%.2f", todayCost)}",
            style = TextStyle(
                color = TextPrimary,
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
            ),
        )
        Text(
            text = "today",
            style = TextStyle(
                color = TextSecondary,
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
            ),
        )
    }
}

@Composable
private fun MediumWidget(
    todayCost: Float,
    currency: String,
    anthropicCost: Float,
    openaiCost: Float,
    geminiCost: Float,
) {
    Row(
        modifier = GlanceModifier
            .fillMaxSize()
            .padding(16.dp)
            .background(CreamBg),
    ) {
        // Left: total
        Column(
            modifier = GlanceModifier.defaultWeight(),
            verticalAlignment = Alignment.Top,
        ) {
            Text(
                text = "API SPENDING",
                style = TextStyle(
                    color = TextSecondary,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Medium,
                ),
            )
            Spacer(modifier = GlanceModifier.height(4.dp))
            Text(
                text = "$${String.format("%.2f", todayCost)}",
                style = TextStyle(
                    color = TextPrimary,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                ),
            )
            Text(
                text = "today",
                style = TextStyle(
                    color = TextSecondary,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                ),
            )
        }

        // Right: breakdown
        Column(
            modifier = GlanceModifier.defaultWeight(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            ProviderLine("Anthropic", anthropicCost, Accent)
            Spacer(modifier = GlanceModifier.height(4.dp))
            ProviderLine("OpenAI", openaiCost, OpenAIColor)
            Spacer(modifier = GlanceModifier.height(4.dp))
            ProviderLine("Gemini", geminiCost, GeminiColor)
        }
    }
}

@Composable
private fun ProviderLine(name: String, cost: Float, color: ColorProvider) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = GlanceModifier
                .size(6.dp)
                .background(color)
                .cornerRadius(3.dp),
        ) {}
        Spacer(modifier = GlanceModifier.width(6.dp))
        Text(
            text = name,
            style = TextStyle(color = TextPrimary, fontSize = 11.sp),
            modifier = GlanceModifier.defaultWeight(),
        )
        Text(
            text = "$${String.format("%.2f", cost)}",
            style = TextStyle(
                color = TextPrimary,
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
            ),
        )
    }
}

class SpendingWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = SpendingWidget()
}
