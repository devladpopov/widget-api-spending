package com.apispending.widget

import android.content.Context
import androidx.glance.appwidget.updateAll
import androidx.work.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class PollingWorker(
    context: Context,
    params: WorkerParameters,
) : CoroutineWorker(context, params) {

    private val client = OkHttpClient()

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val prefs = applicationContext.getSharedPreferences("api_spending", Context.MODE_PRIVATE)
        val editor = prefs.edit()

        var totalToday = 0f

        // Poll Anthropic
        val anthropicKey = prefs.getString("anthropic_key", null)
        if (!anthropicKey.isNullOrBlank()) {
            try {
                val cost = fetchAnthropicToday(anthropicKey)
                editor.putFloat("anthropic_cost", cost)
                totalToday += cost
            } catch (e: Exception) {
                // Keep previous value
            }
        }

        // Poll OpenAI
        val openaiKey = prefs.getString("openai_key", null)
        if (!openaiKey.isNullOrBlank()) {
            try {
                val cost = fetchOpenAIToday(openaiKey)
                editor.putFloat("openai_cost", cost)
                totalToday += cost
            } catch (e: Exception) {
                // Keep previous value
            }
        }

        editor.putFloat("today_cost", totalToday)
        editor.apply()

        // Refresh all widget instances
        SpendingWidget().updateAll(applicationContext)

        Result.success()
    }

    private fun fetchAnthropicToday(apiKey: String): Float {
        val today = java.time.LocalDate.now()
        val startDate = today.toString()
        val endDate = today.plusDays(1).toString()

        val request = Request.Builder()
            .url("https://api.anthropic.com/v1/organizations/usage_report/messages?start_date=$startDate&end_date=$endDate&group_by=model")
            .addHeader("x-api-key", apiKey)
            .addHeader("anthropic-version", "2023-06-01")
            .build()

        val response = client.newCall(request).execute()
        val body = response.body?.string() ?: return 0f
        val json = JSONObject(body)
        val data = json.getJSONArray("data")

        var totalCost = 0f
        for (i in 0 until data.length()) {
            val item = data.getJSONObject(i)
            val inputTokens = item.optInt("input_tokens", 0)
            val outputTokens = item.optInt("output_tokens", 0)
            // Simplified cost calculation — uses approximate rates
            totalCost += estimateCost(item.optString("model", ""), inputTokens, outputTokens)
        }
        return totalCost
    }

    private fun fetchOpenAIToday(apiKey: String): Float {
        val startTime = java.time.LocalDate.now()
            .atStartOfDay(java.time.ZoneOffset.UTC)
            .toEpochSecond()

        val request = Request.Builder()
            .url("https://api.openai.com/v1/organization/usage/completions?start_time=$startTime&group_by=model")
            .addHeader("Authorization", "Bearer $apiKey")
            .build()

        val response = client.newCall(request).execute()
        val body = response.body?.string() ?: return 0f
        val json = JSONObject(body)
        val data = json.getJSONArray("data")

        var totalCost = 0f
        for (i in 0 until data.length()) {
            val bucket = data.getJSONObject(i)
            val results = bucket.getJSONArray("results")
            for (j in 0 until results.length()) {
                val result = results.getJSONObject(j)
                val model = result.optString("model", "")
                val input = result.optInt("input_tokens", 0)
                val output = result.optInt("output_tokens", 0)
                totalCost += estimateCost(model, input, output)
            }
        }
        return totalCost
    }

    /** Approximate cost estimation matching core pricing table */
    private fun estimateCost(model: String, inputTokens: Int, outputTokens: Int): Float {
        data class Rate(val inputPerM: Float, val outputPerM: Float)

        val rates = mapOf(
            "claude-opus-4" to Rate(15f, 75f),
            "claude-sonnet-4" to Rate(3f, 15f),
            "claude-haiku-3.5" to Rate(0.8f, 4f),
            "gpt-4o" to Rate(2.5f, 10f),
            "gpt-4.1" to Rate(2f, 8f),
            "o3" to Rate(10f, 40f),
            "o4-mini" to Rate(1.1f, 4.4f),
            "gemini-2.5-pro" to Rate(1.25f, 10f),
            "gemini-2.5-flash" to Rate(0.15f, 0.6f),
        )

        val rate = rates.entries.firstOrNull { model.startsWith(it.key) }?.value
            ?: Rate(3f, 15f) // fallback

        return (inputTokens / 1_000_000f * rate.inputPerM) +
               (outputTokens / 1_000_000f * rate.outputPerM)
    }

    companion object {
        fun enqueue(context: Context) {
            val request = PeriodicWorkRequestBuilder<PollingWorker>(15, TimeUnit.MINUTES)
                .setConstraints(
                    Constraints.Builder()
                        .setRequiredNetworkType(NetworkType.CONNECTED)
                        .build()
                )
                .build()

            WorkManager.getInstance(context)
                .enqueueUniquePeriodicWork(
                    "api_spending_poll",
                    ExistingPeriodicWorkPolicy.KEEP,
                    request,
                )
        }
    }
}
