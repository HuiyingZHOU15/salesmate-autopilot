class FollowupAgent {
  generate(profile, recommendation) {
    const topModel = recommendation.recommendedModels[0];
    const probability = profile.purchaseProbability || 60;

    return {
      agent: "FollowupAgent",
      report: {
        title: `${profile.name}的专属选车报告`,
        summary: [
          `家庭结构：${profile.family}`,
          `预算区间：${profile.budget}`,
          `重点关注：${profile.concerns.slice(0, 4).join("、")}`,
          `已关注竞品：汉兰达、途昂`
        ],
        recommendedModel: topModel,
        benefits: recommendation.dealBoosters,
        nextStep: "建议预约一次深度试驾，重点体验第三排空间、智能语音和市区电驱成本。"
      },
      followup: {
        probability,
        level: probability >= 75 ? "高意向" : probability >= 55 ? "中意向" : "待培育",
        timing: probability >= 75 ? "1-2 天内" : "3-5 天内",
        entryPoint: "试驾体验 + 置换补贴 + 第三排空间",
        script: "张先生，您上次比较关注第三排和用车成本，我帮您把 L8 和汉兰达的核心差异整理好了，也可以顺便帮您测算旧车置换补贴。"
      }
    };
  }
}

module.exports = { FollowupAgent };
