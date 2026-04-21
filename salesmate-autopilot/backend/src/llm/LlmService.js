const { OllamaClient } = require("./OllamaClient");

class LlmService {
  constructor(options = {}) {
    this.provider = options.provider || process.env.LLM_PROVIDER || "fallback";
    this.ollama = new OllamaClient(options.ollama || {});
  }

  async status() {
    if (this.provider !== "ollama") {
      return {
        enabled: false,
        provider: this.provider,
        mode: "rule-fallback",
        message: "LLM provider is disabled. Rule-based agents are active."
      };
    }
    const health = await this.ollama.health();
    return {
      enabled: health.ok,
      provider: "ollama",
      mode: health.ok ? "local-llm" : "rule-fallback",
      ...health
    };
  }

  async enhanceSalesAssist(context) {
    if (this.provider !== "ollama") return this.fallbackAssist(context);

    try {
      const result = await this.ollama.generateJson(this.assistPrompt(context), {
        talkTrack: "string",
        risk: "string",
        nextAction: "string"
      });
      return {
        provider: "ollama",
        fallback: false,
        talkTrack: result.talkTrack,
        risk: result.risk,
        nextAction: result.nextAction
      };
    } catch (error) {
      return {
        ...this.fallbackAssist(context),
        error: error.message
      };
    }
  }

  fallbackAssist(context) {
    const latest = context.latestUtterance || "";
    const isPrice = latest.includes("贵") || latest.includes("价格");
    return {
      provider: "rule-fallback",
      fallback: true,
      talkTrack: isPrice
        ? "贵不是贵在配置堆叠，而是贵在一家人长期使用时更舒服、更省心、通勤成本更低。"
        : "可以先确认家庭成员、预算区间和第三排使用频率，再引导客户体验空间。",
      risk: isPrice ? "客户正在进入价格异议，需要避免直接硬刚裸车价。" : "客户需求还未完全展开。",
      nextAction: isPrice ? "打开权益包和竞品比较卡。" : "继续补齐预算、旧车和竞品信息。"
    };
  }

  assistPrompt(context) {
    return [
      "You are SalesMate, an automotive sales copilot.",
      "Generate a concise Chinese sales assist response for a showroom consultant.",
      "Do not invent policy amounts.",
      `Customer profile: ${JSON.stringify(context.profile || {})}`,
      `Latest utterance: ${context.latestUtterance || ""}`,
      `Recommendation: ${JSON.stringify(context.recommendationSummary || {})}`
    ].join("\n");
  }
}

module.exports = { LlmService };
