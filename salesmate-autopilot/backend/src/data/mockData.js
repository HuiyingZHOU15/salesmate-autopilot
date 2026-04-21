const customer = {
  id: "cust-zhang-001",
  name: "张先生",
  phone: "138****2608",
  source: "到店自然客",
  currentVehicle: "2018 款日产轩逸",
  budget: "25-30 万",
  family: "两个小孩，周末会带老人出行",
  stage: "首次到店接待",
  interestedModels: ["理想 L8 Pro", "汉兰达", "途昂"],
  concerns: ["第三排空间", "用车成本", "智能座舱", "置换补贴"]
};

const script = [
  {
    speaker: "customer",
    text: "家里两个小孩，周末还要带老人出去，所以想看 6 座或者 7 座 SUV。",
    event: "profile"
  },
  {
    speaker: "sales",
    text: "您更看重空间、舒适性，还是后期用车成本？",
    event: "need-gap"
  },
  {
    speaker: "customer",
    text: "预算大概 25 到 30 万吧，主要别太费油。",
    event: "budget"
  },
  {
    speaker: "customer",
    text: "汉兰达我也看过，感觉还行，就是第三排一般。",
    event: "competitor"
  },
  {
    speaker: "customer",
    text: "那理想 L8 比汉兰达贵在哪？",
    event: "stuck-rescue"
  }
];

const models = [
  {
    id: "li-l8-pro",
    name: "理想 L8 Pro",
    type: "6 座增程 SUV",
    price: "32.18 万起",
    fitScore: 92,
    sellPoints: ["6 座布局适合家庭出行", "第三排乘坐体验优于传统 7 座 SUV", "市区通勤用电成本低", "智能座舱适合儿童和老人"],
    concerns: ["价格高于部分燃油竞品", "客户可能担心增程技术"],
    talkTrack: "您家里有老人和小孩，L8 的 6 座布局上下车更方便，市区用电也能明显降低通勤成本。"
  },
  {
    id: "highlander",
    name: "丰田汉兰达",
    type: "7 座混动 SUV",
    price: "26.88 万起",
    fitScore: 78,
    sellPoints: ["品牌认知强", "保值率稳定", "混动油耗较低"],
    concerns: ["第三排空间一般", "智能化体验弱于新势力"],
    talkTrack: "汉兰达胜在品牌和保值，但如果您更看重第三排舒适和智能座舱，L8 会更贴近家庭场景。"
  },
  {
    id: "teramont",
    name: "大众途昂",
    type: "7 座燃油 SUV",
    price: "24.90 万起",
    fitScore: 74,
    sellPoints: ["车身尺寸大", "终端优惠明显", "传统燃油车使用习惯低门槛"],
    concerns: ["市区油耗较高", "座舱智能化弱"],
    talkTrack: "途昂空间大，但如果您每天市区通勤较多，用车成本会比增程方案更敏感。"
  }
];

const competitorCards = [
  {
    trigger: "汉兰达",
    name: "汉兰达",
    title: "理想 L8 vs 汉兰达",
    bullets: [
      "第三排上下车和乘坐体验更适合老人小孩",
      "市区通勤优先用电，每公里成本更低",
      "智能座舱和语音交互能降低家庭出行负担",
      "适合强调长期使用体验，而不是只比较裸车价"
    ]
  },
  {
    trigger: "途昂",
    name: "途昂",
    title: "理想 L8 vs 途昂",
    bullets: [
      "途昂车身尺寸大，但市区油耗和停车压力更明显",
      "L8 的 6 座布局更适合老人小孩上下车",
      "智能座舱、语音控制和家庭娱乐体验更完整",
      "适合把讨论从裸车优惠转向长期家庭使用体验"
    ]
  }
];

const policies = [
  {
    id: "scrap-subsidy",
    title: "国家报废补贴",
    amount: "¥20,000",
    reason: "客户有 2018 款旧车，可引导评估报废/置换权益。"
  },
  {
    id: "brand-trade-in",
    title: "本品置换补贴",
    amount: "¥5,000",
    reason: "叠加门店置换礼包，提升报价阶段吸引力。"
  },
  {
    id: "finance-zero",
    title: "3 年 0 息金融方案",
    amount: "月供约 ¥3,200",
    reason: "客户预算敏感，适合用月供视角降低决策压力。"
  },
  {
    id: "service-pack",
    title: "基础保养礼包",
    amount: "6 次基础保养",
    reason: "回应客户对长期用车成本的关注。"
  }
];

const ontology = [
  { keywords: ["小孩", "老人", "周末"], intent: "家庭出行", attributes: ["6/7 座", "安全", "舒适"] },
  { keywords: ["预算", "25", "30"], intent: "预算约束", attributes: ["价格敏感", "金融方案"] },
  { keywords: ["汉兰达", "途昂"], intent: "竞品对比", attributes: ["空间", "油耗", "保值率"] },
  { keywords: ["费油", "用车成本"], intent: "成本关注", attributes: ["能耗", "保养", "补贴"] }
];

module.exports = {
  customer,
  script,
  models,
  competitorCards,
  policies,
  ontology
};
