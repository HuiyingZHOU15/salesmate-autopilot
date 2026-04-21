const { customer } = require("../data/mockData");

class ProfileAgent {
  build(listenerResult, previousProfile = {}) {
    const attributes = new Set([...(previousProfile.attributes || []), ...listenerResult.attributes]);
    const intents = new Set([...(previousProfile.intents || []), ...listenerResult.intents]);

    return {
      agent: "ProfileAgent",
      customerId: customer.id,
      name: customer.name,
      budget: listenerResult.latestUtterance.text?.includes("25") ? "25-30 万" : previousProfile.budget || "待确认",
      family: listenerResult.latestUtterance.text?.includes("小孩") ? customer.family : previousProfile.family || "待确认",
      currentVehicle: customer.currentVehicle,
      intents: [...intents],
      attributes: [...attributes],
      concerns: [...new Set([...customer.concerns, ...attributes])],
      purchaseProbability: this.score([...intents], [...attributes]),
      missingFields: this.missingFields(previousProfile, listenerResult)
    };
  }

  score(intents, attributes) {
    let score = 48;
    if (intents.includes("家庭出行")) score += 12;
    if (intents.includes("预算约束")) score += 8;
    if (intents.includes("竞品对比")) score += 10;
    if (attributes.includes("金融方案")) score += 6;
    return Math.min(score, 86);
  }

  missingFields(previousProfile, listenerResult) {
    const missing = [];
    const text = listenerResult.latestUtterance.text || "";
    if (!previousProfile.budget && !text.includes("预算") && !text.includes("万")) {
      missing.push("预算区间");
    }
    if (!text.includes("旧车") && !previousProfile.currentVehicle) {
      missing.push("是否有旧车置换");
    }
    return missing;
  }
}

module.exports = { ProfileAgent };
