const { ontology } = require("../data/mockData");

class ListenerAgent {
  analyze(dialogue) {
    const latest = dialogue[dialogue.length - 1] || {};
    const text = latest.text || "";
    const matched = ontology.filter((item) => item.keywords.some((keyword) => text.includes(keyword)));

    return {
      agent: "ListenerAgent",
      latestUtterance: latest,
      keywords: [...new Set(matched.flatMap((item) => item.keywords.filter((keyword) => text.includes(keyword))))],
      intents: [...new Set(matched.map((item) => item.intent))],
      attributes: [...new Set(matched.flatMap((item) => item.attributes))],
      signals: this.detectSignals(text)
    };
  }

  detectSignals(text) {
    const signals = [];
    if (text.includes("[STALL]")) {
      signals.push({ type: "stuck_rescue", label: "销售顾问主动触发卡壳救援" });
    }
    if (text.includes("贵") || text.includes("比")) {
      signals.push({ type: "stuck_rescue", label: "客户提出尖锐对比问题" });
    }
    if (text.includes("预算") || text.includes("费油")) {
      signals.push({ type: "price_sensitive", label: "客户关注预算或用车成本" });
    }
    if (text.includes("汉兰达") || text.includes("途昂")) {
      signals.push({ type: "competitor", label: "客户已接触竞品" });
    }
    return signals;
  }
}

module.exports = { ListenerAgent };
