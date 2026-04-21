const { models, competitorCards, policies } = require("../data/mockData");

class RecommendationAgent {
  recommend(profile, listenerResult) {
    const recommendedModels = models
      .map((model) => ({
        ...model,
        reason: this.reasonFor(model, profile)
      }))
      .sort((a, b) => b.fitScore - a.fitScore);

    const competitorCard = competitorCards.find((card) =>
      listenerResult.latestUtterance.text?.includes(card.trigger)
    );

    return {
      agent: "RecommendationAgent",
      recommendedModels,
      competitorCard: competitorCard || null,
      assistCards: this.assistCards(profile, listenerResult, competitorCard),
      nextBestActions: this.nextBestActions(profile, listenerResult),
      dealBoosters: policies,
      talkTrack: this.talkTrack(listenerResult)
    };
  }

  reasonFor(model, profile) {
    if (model.id === "li-l8-pro") {
      return `匹配 ${profile.name} 的家庭出行、第三排空间和用车成本关注点。`;
    }
    return "作为竞品参照，帮助销售解释不同方案的取舍。";
  }

  nextBestActions(profile, listenerResult) {
    const actions = [];
    if (profile.missingFields.includes("预算区间")) {
      actions.push("确认客户预算区间和更关心总价还是月供。");
    }
    if (listenerResult.signals.some((signal) => signal.type === "competitor")) {
      actions.push("打开竞品对比卡，用空间、能耗、智能座舱回应客户。");
    }
    if (listenerResult.signals.some((signal) => signal.type === "price_sensitive")) {
      actions.push("切换到金融方案和置换补贴视角。");
    }
    return actions.length ? actions : ["继续引导客户体验第二排和第三排空间。"];
  }

  talkTrack(listenerResult) {
    const text = listenerResult.latestUtterance.text || "";
    if (text.includes("贵")) {
      return "可以这样回应：贵不是贵在配置堆叠，而是贵在一家人长期使用时更舒服、更省心、更低通勤成本。";
    }
    if (text.includes("费油")) {
      return "可以这样追问：您日常市区通勤多吗？如果通勤多，增程方案的电驱成本会更有优势。";
    }
    return "可以先确认家庭出行人数，再邀请客户重点体验第三排和后备箱。";
  }

  assistCards(profile, listenerResult, competitorCard) {
    const cards = [];
    if (profile.missingFields.includes("预算区间")) {
      cards.push({
        type: "need_gap",
        title: "需求缺口",
        priority: "中",
        body: "客户已经说明家庭场景，但预算区间还未确认。建议顺势询问总价或月供偏好。",
        action: "确认预算区间"
      });
    }
    if (listenerResult.signals.some((signal) => signal.type === "competitor")) {
      cards.push({
        type: "competitor",
        title: "竞品对比",
        priority: "高",
        body: competitorCard?.title ? `客户提到${competitorCard.name}，可以打开空间、能耗、智能座舱对比卡。` : "客户提到竞品，建议打开空间、能耗、智能座舱对比卡。",
        action: "打开竞品卡"
      });
    }
    if (listenerResult.signals.some((signal) => signal.type === "stuck_rescue")) {
      cards.push({
        type: "rescue",
        title: "卡壳救援",
        priority: "高",
        body: "客户正在追问价格差异。建议用“长期家庭体验 + 市区用车成本”回应，而不是只解释配置。",
        action: "使用一句话回应"
      });
    }
    if (listenerResult.signals.some((signal) => signal.type === "price_sensitive")) {
      cards.push({
        type: "deal",
        title: "成交助推",
        priority: "中",
        body: "客户关注预算或用车成本，可以切换到置换补贴、金融方案和保养礼包。",
        action: "查看权益包"
      });
    }
    if (!cards.length) {
      cards.push({
        type: "guide",
        title: "接待引导",
        priority: "低",
        body: "继续围绕家庭人数、日常通勤、第三排使用频率收集需求。",
        action: "继续提问"
      });
    }
    return cards;
  }
}

module.exports = { RecommendationAgent };
