const agentRegistry = [
  {
    id: "listener",
    name: "ListenerAgent",
    role: "感知与监听",
    responsibility: "接收对话转写，提取关键词、意图、竞品信号和卡壳信号。",
    input: ["dialogue"],
    output: ["keywords", "intents", "attributes", "signals"]
  },
  {
    id: "profile",
    name: "ProfileAgent",
    role: "客户画像",
    responsibility: "根据监听结果更新客户画像、缺失字段、关注点和购买概率。",
    input: ["listenerResult", "previousProfile"],
    output: ["customerProfile", "missingFields", "purchaseProbability"]
  },
  {
    id: "recommendation",
    name: "RecommendationAgent",
    role: "销售决策增强",
    responsibility: "生成车型推荐、竞品比较、低打扰提示卡和成交助推建议。",
    input: ["customerProfile", "listenerResult"],
    output: ["recommendedModels", "competitorCard", "assistCards", "dealBoosters"]
  },
  {
    id: "followup",
    name: "FollowupAgent",
    role: "离店闭环",
    responsibility: "生成客户专属报告、回访等级、回访时机和话术草稿。",
    input: ["customerProfile", "recommendation"],
    output: ["departureReport", "followupStrategy"]
  },
  {
    id: "archive",
    name: "ArchiveCoordinator",
    role: "数据归档协调",
    responsibility: "把 AI 加工结果写入本地加工层，并协调 DMS 同步状态。",
    input: ["session", "agentOutputs"],
    output: ["localArchive", "syncStatus"]
  }
];

module.exports = { agentRegistry };
