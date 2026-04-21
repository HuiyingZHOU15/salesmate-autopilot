class OllamaClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    this.model = options.model || process.env.OLLAMA_MODEL || "qwen2.5:7b";
    this.timeoutMs = Number(options.timeoutMs || process.env.OLLAMA_TIMEOUT_MS || 2500);
  }

  async health() {
    try {
      const data = await this.request("/api/tags", {
        method: "GET"
      });
      return {
        ok: true,
        provider: "ollama",
        baseUrl: this.baseUrl,
        model: this.model,
        availableModels: (data.models || []).map((model) => model.name)
      };
    } catch (error) {
      return {
        ok: false,
        provider: "ollama",
        baseUrl: this.baseUrl,
        model: this.model,
        error: error.message
      };
    }
  }

  async generateJson(prompt, schemaHint) {
    const response = await this.request("/api/generate", {
      method: "POST",
      body: {
        model: this.model,
        prompt: `${prompt}\n\nReturn compact JSON only. Schema hint:\n${JSON.stringify(schemaHint)}`,
        stream: false,
        options: {
          temperature: 0.2
        }
      }
    });

    return this.parseJson(response.response);
  }

  async request(path, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: options.method || "POST",
        headers: { "Content-Type": "application/json" },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error(`Ollama HTTP ${response.status}`);
      }
      return response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  parseJson(text) {
    const trimmed = String(text || "").trim();
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Ollama response did not contain JSON");
    }
    return JSON.parse(match[0]);
  }
}

module.exports = { OllamaClient };
