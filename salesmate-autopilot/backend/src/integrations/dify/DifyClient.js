class DifyClient {
  constructor(options = {}) {
    this.apiBase = (options.apiBase || process.env.DIFY_API_BASE || "http://localhost:8080/v1").replace(/\/$/, "");
    this.apiKey = options.apiKey || process.env.DIFY_API_KEY || "";
    this.enabled = (options.enabled ?? process.env.DIFY_ENABLED ?? "true") !== "false" && Boolean(this.apiKey);
    this.timeoutMs = Number(options.timeoutMs || process.env.DIFY_TIMEOUT_MS || 30000);
  }

  status() {
    return {
      enabled: this.enabled,
      apiBase: this.apiBase,
      mode: this.enabled ? "dify-workflow" : "local-fallback",
      reason: this.enabled ? "DIFY_API_KEY is configured" : "DIFY_API_KEY is not configured"
    };
  }

  async sendChatMessage({ query, inputs, user, conversationId }) {
    if (!this.enabled) {
      return {
        provider: "local-fallback",
        skipped: true,
        reason: "Dify is not configured"
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.apiBase}/chat-messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs,
          query,
          response_mode: "blocking",
          conversation_id: conversationId || undefined,
          user
        }),
        signal: controller.signal
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = payload.message || payload.error || `Dify request failed with ${response.status}`;
        throw Object.assign(new Error(message), { status: response.status, payload });
      }

      return {
        provider: "dify",
        answer: payload.answer || "",
        conversationId: payload.conversation_id || conversationId || null,
        messageId: payload.message_id || null,
        taskId: payload.task_id || null,
        metadata: payload.metadata || null,
        raw: payload
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

module.exports = { DifyClient };
