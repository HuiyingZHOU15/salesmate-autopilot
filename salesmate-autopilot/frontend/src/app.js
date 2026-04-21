const state = {
  session: null,
  demo: null,
  currentPage: "dashboard",
  currentScriptIndex: 0,
  manualCompetitor: "",
  llm: null,
  asr: {
    mode: "Mock",
    status: "standby",
    lastTranscript: "",
    permission: "demo-mode",
    speaker: "customer",
    supported: Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  },
  salesAssistant: {
    enabled: false,
    status: "standby",
    lastTip: "",
    source: "not-started",
    latencyMs: null
  }
};

const pages = [
  { id: "dashboard", label: "销售工作台" },
  { id: "reception", label: "实时接待" },
  { id: "recommendations", label: "推荐与竞品" },
  { id: "agents", label: "Agent 协调" },
  { id: "report", label: "离店报告" },
  { id: "followup", label: "归档回访" }
];

const api = {
  getDemo: () => request("/api/demo"),
  startSession: () => request("/api/session/start", { method: "POST", body: {} }),
  ingest: (utterance) => request("/api/dialogue/ingest", {
    method: "POST",
    body: { sessionId: state.session.id, utterance }
  }),
  transcribe: (cursor) => request("/api/asr/transcribe", {
    method: "POST",
    body: { audioChunkId: `demo-chunk-${Date.now()}`, cursor, mode: state.asr.mode.toLowerCase() }
  }),
  generateReport: () => request("/api/report/generate", {
    method: "POST",
    body: { sessionId: state.session.id }
  }),
  syncDms: () => request("/api/dms/sync", {
    method: "POST",
    body: { sessionId: state.session.id }
  }),
  followupStrategy: () => request("/api/followup/strategy", {
    method: "POST",
    body: { sessionId: state.session.id }
  }),
  storageStatus: () => request("/api/storage/status", {
    method: "POST",
    body: { sessionId: state.session.id }
  }),
  coordination: () => request("/api/agents/coordination", {
    method: "POST",
    body: { sessionId: state.session.id }
  }),
  llmStatus: () => request("/api/llm/status")
};

async function request(url, options = {}) {
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

async function init() {
  state.demo = await api.getDemo();
  state.session = await api.startSession();
  state.llm = await api.llmStatus();
  render();
}

function render() {
  document.querySelector("#app").innerHTML = `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">SM</div>
        <div><strong>SalesMate</strong><span>AutoPilot</span></div>
      </div>
      <nav>
        ${pages.map((page) => `
          <button class="nav-item ${state.currentPage === page.id ? "active" : ""}" data-page="${page.id}">
            ${page.label}
          </button>
        `).join("")}
      </nav>
      <div class="sidebar-note">汽车销售智能副驾 · Dify 多 Agent 工作流 Demo</div>
    </aside>
    <main class="main">
      ${header()}
      ${pageContent()}
    </main>
  `;
  bindNavigation();
  bindActions();
}

function header() {
  const label = pages.find((page) => page.id === state.currentPage)?.label || "SalesMate";
  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">汽车销售智能副驾</p>
        <h1>${label}</h1>
      </div>
      <div class="top-actions">
        <button class="ghost" data-action="reset">重置演示</button>
        <button class="ghost" data-action="auto-demo">一键跑完整流程</button>
        <button class="primary" data-page="reception">开始接待</button>
      </div>
    </header>
  `;
}

function pageContent() {
  if (state.currentPage === "dashboard") return dashboardPage();
  if (state.currentPage === "reception") return receptionPage();
  if (state.currentPage === "recommendations") return recommendationsPage();
  if (state.currentPage === "agents") return agentsPage();
  if (state.currentPage === "report") return reportPage();
  if (state.currentPage === "followup") return followupPage();
  return dashboardPage();
}

function dashboardPage() {
  const customer = state.demo.customer;
  return `
    <section class="showcase">
      <div class="showcase-copy">
        <p class="eyebrow">SalesMate AutoPilot</p>
        <h2>把接待、推荐、成交助推和 DMS 归档串成一个闭环</h2>
        <p>前端负责语音入口和销售工作台，后端负责本地 Agent 与 Dify 工作流桥接。Dify 配置完成后，每一句客户话术都会进入主工作流。</p>
        <div class="showcase-actions">
          <button class="primary" data-page="reception">进入实时接待</button>
          <button class="ghost" data-action="auto-demo">一键跑完整流程</button>
        </div>
      </div>
      <div class="showcase-visual">
        <div class="car-scene">
          <div class="windshield"></div>
          <div class="car-body"><span></span><span></span></div>
          <div class="wheel left"></div>
          <div class="wheel right"></div>
        </div>
        <div class="floating-card one">客户画像更新</div>
        <div class="floating-card two">Dify 工作流</div>
        <div class="floating-card three">DMS 归档</div>
      </div>
    </section>
    <section class="grid three">
      ${metricCard("今日接待", "8", "2 位高意向客户待跟进")}
      ${metricCard("AI 提示采纳率", "64%", "低打扰侧边建议")}
      ${metricCard("待回访", "12", "3 位建议今日联系")}
    </section>
    <section class="panel split">
      <div>
        <p class="eyebrow">下一位到店客户</p>
        <h2>${customer.name}</h2>
        <p class="muted">${customer.source} · ${customer.stage}</p>
        <div class="tags">${customer.concerns.map(tag).join("")}</div>
        <button class="primary" data-page="reception">进入接待驾驶舱</button>
      </div>
      <div class="timeline">
        ${step("1", "接待", "真实麦克风或 Mock ASR 输入", true)}
        ${step("2", "分析", "监听 Agent 提取意图、预算、竞品", Boolean(state.session.profile?.purchaseProbability))}
        ${step("3", "推荐", "车型推荐与竞品对比", Boolean(state.session.recommendation))}
        ${step("4", "归档", "离店报告与 DMS 回写", Boolean(state.session.dms))}
      </div>
    </section>
  `;
}

function receptionPage() {
  const profile = state.session.profile || {};
  const recommendation = state.session.recommendation || {};
  const progress = Math.round((state.currentScriptIndex / state.demo.script.length) * 100);
  return `
    <section class="demo-strip">
      <div><strong>演示进度</strong><span>${state.currentScriptIndex}/${state.demo.script.length} 句对话</span></div>
      <div class="progress"><span style="width:${progress}%"></span></div>
      <div class="demo-actions">
        <button class="ghost" data-action="trigger-rescue">触发卡壳场景</button>
        <button class="primary" data-action="next-line">${state.currentScriptIndex >= state.demo.script.length ? "对话完成" : "播放下一句"}</button>
      </div>
    </section>

    <section class="asr-panel">
      <div>
        <p class="eyebrow">语音识别</p>
        <h2>麦克风接待入口</h2>
      </div>
      <div class="asr-status">
        <span>模式：${state.asr.mode}</span>
        <span>状态：${asrStatusLabel()}</span>
        <span>当前说话人：${speakerLabel(state.asr.speaker)}</span>
        <span>浏览器支持：${state.asr.supported ? "支持" : "不支持"}</span>
      </div>
      <div class="speaker-switch">
        <button class="${state.asr.speaker === "customer" ? "active" : ""}" data-action="set-speaker-customer">客户说话</button>
        <button class="${state.asr.speaker === "sales" ? "active" : ""}" data-action="set-speaker-sales">销售说话</button>
      </div>
      <div class="asr-actions">
        <button class="primary" data-action="browser-mic">麦克风识别</button>
        <button class="ghost" data-action="mock-asr">模拟麦克风</button>
        <button class="ghost danger" data-action="stall-signal">销售卡壳</button>
        <button class="ghost assistant-toggle ${state.salesAssistant.enabled ? "active" : ""}" data-action="start-sales-assistant">
          ${state.salesAssistant.enabled ? "销售助手已开启" : "开启销售助手"}
        </button>
      </div>
      <div class="asr-live-grid">
        <div class="asr-transcript">
          <strong>语音识别文本</strong>
          <p>${state.asr.lastTranscript || "先选择“客户说话”或“销售说话”，再点击“麦克风识别”。如果销售不知道怎么接话，点击“销售卡壳”。"}</p>
        </div>
        <aside class="sales-assistant-tip ${state.salesAssistant.enabled ? "active" : ""}">
          <div>
            <strong>销售助手提示</strong>
            <span>${assistantStatusLabel()}</span>
          </div>
          <p>${salesAssistantTip()}</p>
          <small>${assistantSourceLabel()}</small>
        </aside>
      </div>
    </section>

    <section class="workspace">
      <div class="customer-card">
        <p class="eyebrow">客户画像</p>
        <h2>${profile.name || state.demo.customer.name}</h2>
        <div class="intent-meter">
          <span>购买概率</span>
          <strong>${profile.purchaseProbability || 48}%</strong>
          <div><i style="width:${profile.purchaseProbability || 48}%"></i></div>
        </div>
        <dl>
          <dt>预算</dt><dd>${profile.budget || "待确认"}</dd>
          <dt>家庭</dt><dd>${profile.family || "待确认"}</dd>
          <dt>旧车</dt><dd>${profile.currentVehicle || state.demo.customer.currentVehicle}</dd>
          <dt>阶段</dt><dd>${state.session.stage || "init"}</dd>
        </dl>
        <div class="tags">${(profile.concerns || state.demo.customer.concerns).map(tag).join("")}</div>
      </div>

      <div class="dialogue-panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">实时转写</p>
            <h2>接待对话</h2>
          </div>
          <button class="ghost" data-action="reset-dialogue">重播对话</button>
        </div>
        <div class="dialogue-list">
          ${state.session.dialogue.length ? state.session.dialogue.map(dialogueItem).join("") : empty("点击“麦克风识别”或“播放下一句”开始演示")}
        </div>
      </div>

      <aside class="agent-panel">
        <p class="eyebrow">AI 侧边栏</p>
        <h2>低打扰建议</h2>
        ${rescueBox(recommendation.assistCards)}
        ${assistCards(recommendation.assistCards)}
        ${difyBox()}
        ${agentTrace()}
        <div class="assist-card">
          <strong>推荐话术</strong>
          <p>${recommendation.talkTrack || "先自然确认家庭用车场景，再引导客户体验空间、能耗和智能座舱。"}</p>
        </div>
      </aside>
    </section>
  `;
}

function recommendationsPage() {
  const recommendation = state.session.recommendation;
  const models = recommendation?.recommendedModels || state.demo.models;
  const competitor = state.manualCompetitor || recommendation?.competitorCard?.name || "汉兰达";
  return `
    <section class="flow-band">
      ${flowItem("1", "客户原话", "提到预算、家庭、竞品或顾虑")}
      ${flowItem("2", "画像抽取", "监听 Agent 识别意图与卡壳信号")}
      ${flowItem("3", "知识检索", "车型库、政策库、竞品库")}
      ${flowItem("4", "推荐生成", "话术、车型和比较卡片")}
    </section>
    <section class="grid two">
      <div class="panel">
        <p class="eyebrow">车型推荐</p>
        <h2>基于客户画像的 Top 推荐</h2>
        <div class="model-list">${models.map(modelCard).join("")}</div>
      </div>
      <div class="panel">
        <p class="eyebrow">潜在竞品比较</p>
        <h2>理想 L8 vs ${competitor}</h2>
        <div class="competitor-tools">
          <input id="competitorInput" placeholder="输入潜在竞品，如 问界 M7" value="${state.manualCompetitor}" />
          <button class="primary" data-action="add-competitor">加入比较</button>
        </div>
        <div class="comparison-table">
          ${comparisonRow("空间", "6 座布局，二三排进出方便", "需要现场确认第三排体验")}
          ${comparisonRow("能耗", "市区用电，适合日常通勤", "按通勤里程测算")}
          ${comparisonRow("智能化", "语音、座舱、家庭娱乐完整", "看客户关注维度")}
          ${comparisonRow("销售切入", "长期家庭体验与省心成本", "先尊重选择，再做场景比较")}
        </div>
      </div>
    </section>
  `;
}

function agentsPage() {
  const coordination = state.session.coordination || {
    pattern: "Sequential orchestration with shared session memory",
    registry: [],
    plan: [],
    sharedMemory: [],
    runLog: []
  };
  return `
    <section class="panel">
      <div class="panel-title">
        <div>
          <p class="eyebrow">Multi-Agent Orchestration</p>
          <h2>多 Agent 协调台</h2>
        </div>
        <button class="primary" data-action="refresh-agents">刷新状态</button>
      </div>
      <div class="orchestration-summary">
        <div><span>编排模式</span><strong>${coordination.pattern}</strong></div>
        <div><span>模型/工作流</span><strong>${llmLabel()}</strong></div>
      </div>
    </section>
    <section class="grid two">
      <div class="panel">
        <p class="eyebrow">Agent Registry</p>
        <h2>角色与职责</h2>
        <div class="agent-registry">${coordination.registry.map(agentRegistryCard).join("") || empty("暂无 Agent 注册信息")}</div>
      </div>
      <div class="panel">
        <p class="eyebrow">Run Log</p>
        <h2>本轮协作日志</h2>
        <div class="run-log">${coordination.runLog.map(runLogItem).join("") || empty("先在实时接待页输入一句客户对话")}</div>
      </div>
    </section>
  `;
}

function reportPage() {
  const report = state.session.report;
  return `
    <section class="panel report">
      <div class="panel-title">
        <div>
          <p class="eyebrow">客户离店资产</p>
          <h2>${report?.title || "张先生的专属选车报告"}</h2>
        </div>
        <button class="primary" data-action="generate-report">生成离店报告</button>
      </div>
      <div class="report-sheet">
        <h3>一、需求总结</h3>
        ${(report?.summary || ["家庭出行，需要 6/7 座 SUV", "预算 25-30 万，关注用车成本", "已看过汉兰达、途昂"]).map((item) => `<p>· ${item}</p>`).join("")}
        <h3>二、推荐车型</h3>
        <p><strong>${report?.recommendedModel?.name || "理想 L8 Pro"}</strong>：${report?.recommendedModel?.talkTrack || "6 座布局适合家庭出行，市区通勤成本更低。"}</p>
        <h3>三、下一步建议</h3>
        <p>${report?.nextStep || "建议预约一次深度试驾，重点体验第三排空间和智能座舱。"}</p>
      </div>
    </section>
  `;
}

function followupPage() {
  const followup = state.session.followup;
  const dms = state.session.dms;
  return `
    <section class="grid two">
      <div class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">DMS Adapter</p>
            <h2>客户档案同步</h2>
          </div>
          <button class="primary" data-action="sync-dms">同步 DMS</button>
        </div>
        <div class="sync-box ${dms ? "done" : ""}">
          <strong>${dms ? "同步成功" : `本地加工归档：${state.session.archive?.syncStatus || "PENDING"}`}</strong>
          <p>${dms ? `外部记录号：${dms.externalRecordId}` : "DMS 接口未就绪时，本地加工层暂存 AI 标签、评分、摘要和同步状态。"}</p>
        </div>
        <pre>${JSON.stringify(dms?.payload || state.session.archive || { sync_status: "PENDING" }, null, 2)}</pre>
      </div>
      <div class="panel">
        <p class="eyebrow">FollowupAgent</p>
        <h2>分级回访策略</h2>
        <div class="score">${followup?.probability || 78}%</div>
        <div class="list-row">意向等级：${followup?.level || "高意向"}</div>
        <div class="list-row">建议时机：${followup?.timing || "1-2 天内"}</div>
        <div class="assist-card strong">
          <strong>回访话术</strong>
          <p>${followup?.script || "张先生，我帮您把 L8 和竞品的核心差异整理好了，也可以顺便帮您测算旧车置换补贴。"}</p>
        </div>
      </div>
    </section>
  `;
}

function metricCard(label, value, note) {
  return `<div class="metric"><span>${label}</span><strong>${value}</strong><p>${note}</p></div>`;
}

function tag(text) {
  return `<span class="tag">${text}</span>`;
}

function step(number, title, text, active) {
  return `<div class="step ${active ? "active" : ""}"><b>${number}</b><div><strong>${title}</strong><p>${text}</p></div></div>`;
}

function dialogueItem(item) {
  return `<div class="bubble ${item.speaker}"><span>${item.speaker === "customer" ? "客户" : "销售"}</span><p>${item.text}</p></div>`;
}

function empty(text) {
  return `<div class="empty">${text}</div>`;
}

function asrStatusLabel() {
  return {
    standby: "待命",
    listening: "监听中",
    transcribed: "已转写",
    failed: "失败"
  }[state.asr.status] || state.asr.status;
}

function speakerLabel(speaker) {
  return speaker === "sales" ? "销售顾问" : "客户";
}

function assistantStatusLabel() {
  if (!state.salesAssistant.enabled) return "未开启";
  if (state.salesAssistant.status === "calling") return "调用中";
  return "运行中";
}

function assistantSourceLabel() {
  if (!state.salesAssistant.enabled) return "未连接工作流";
  const latency = state.salesAssistant.latencyMs ? ` · ${state.salesAssistant.latencyMs}ms` : "";
  if (state.salesAssistant.source === "dify") return `来源：Dify 主工作流${latency}`;
  if (state.salesAssistant.source === "dify-failed") return `来源：Dify 调用失败，已回落本地规则${latency}`;
  if (state.llm?.dify?.enabled) return `来源：等待 Dify 输入${latency}`;
  return `来源：本地规则兜底，未配置 Dify API Key${latency}`;
}

function rescueBox(cards = []) {
  const rescue = cards.find((card) => card.type === "rescue");
  return `
    <section class="rescue-box ${rescue ? "active" : ""}">
      <div>
        <span>${rescue ? "卡壳救援已触发" : "卡壳救援待命"}</span>
        <strong>${rescue?.title || "尖锐问题实时救场"}</strong>
      </div>
      <p>${rescue?.body || "当客户提出价格、竞品或品牌顾虑时，这里会给销售一条可直接说出口的话术。"}</p>
      <button class="mini rescue-trigger" data-action="stall-signal">
        ${rescue ? "重新生成救场提示" : "一键触发救场"}
      </button>
    </section>
  `;
}

function assistCards(cards = []) {
  const fallback = [{
    type: "guide",
    title: "接待引导",
    priority: "低",
    body: "等待客户表达需求后，系统会生成低打扰提示卡。",
    action: "继续接待"
  }];
  return (cards.length ? cards : fallback).map((card) => `
    <article class="ai-card ${card.type}">
      <div><strong>${card.title}</strong><span>${card.priority}优先级</span></div>
      <p>${card.body}</p>
      <button class="mini">${card.action}</button>
    </article>
  `).join("");
}

function difyBox() {
  if (!state.session.dify) return "";
  return `
    <div class="assist-card strong">
      <strong>Dify 主工作流</strong>
      <p>${state.session.dify.answer || state.session.dify.error || "已调用，等待返回内容。"}</p>
    </div>
  `;
}

function salesAssistantTip() {
  if (!state.salesAssistant.enabled) {
    return "点击“开启销售助手”后，系统会开始监听接待上下文，并在这里给销售顾问一条下一步建议。";
  }
  return state.salesAssistant.lastTip || buildStageTip();
}

function buildStageTip() {
  const stage = state.session.stage || "init";
  const profile = state.session.profile || {};
  const recommendation = state.session.recommendation || {};
  const cards = recommendation.assistCards || [];
  const hasRescue = cards.some((card) => card.type === "rescue");
  const hasCompetitor = cards.some((card) => card.type === "competitor");
  const probability = profile.purchaseProbability || 0;

  if (hasRescue) {
    return "当前重点：先稳住客户问题，确认他最在意价格、竞品还是品牌，再引导到长期用车成本。";
  }

  if (stage === "init") {
    if (!profile.budget || String(profile.budget).includes("待")) {
      return "当前阶段：需求收集。下一步先确认预算区间和月供偏好，不急着推荐车型。";
    }
    if (!profile.family || String(profile.family).includes("待")) {
      return "当前阶段：需求收集。下一步确认家庭成员、第三排使用频率和主要出行场景。";
    }
    if (hasCompetitor) {
      return "当前阶段：需求收集。客户已提竞品，先问他看中竞品哪一点，再进入对比。";
    }
    return "当前阶段：需求收集。围绕预算、家庭人数、旧车和试驾意向补齐画像。";
  }

  if (stage === "profiling") {
    return "当前阶段：画像确认。用一句话复述客户需求，让客户确认是否准确，再进入车型推荐。";
  }

  if (stage === "recommend") {
    return "当前阶段：车型推荐。先给一个主推车型和两个理由，再让客户选择想先体验空间还是智能座舱。";
  }

  if (stage === "closing") {
    return "当前阶段：成交助推。把价格讨论转成置换、金融、保养权益组合，降低客户决策压力。";
  }

  if (stage === "departure") {
    return "当前阶段：离店归档。确认下次回访时间，生成摘要、购买概率和回访重点。";
  }

  if (probability >= 75) {
    return "当前判断：客户意向较高。下一步推动试驾、报价或置换测算。";
  }
  return "当前判断：信息还不够完整。继续补齐预算、用车场景和竞品关注点。";
}

function agentTrace() {
  const trace = state.session.agentTrace || [];
  if (!trace.length) return `<div class="assist-card"><strong>Agent Trace</strong><p>等待对话输入后开始编排。</p></div>`;
  return trace.map((item) => `<div class="trace"><b>${item.agent}</b><span>${item.summary}</span></div>`).join("");
}

function modelCard(model) {
  return `
    <article class="model-card">
      <div><strong>${model.name}</strong><span>${model.type} · ${model.price}</span></div>
      <div class="fit">${model.fitScore}</div>
      <p>${model.reason || model.talkTrack}</p>
      <div class="tags">${model.sellPoints.slice(0, 3).map(tag).join("")}</div>
    </article>
  `;
}

function comparisonRow(label, left, right) {
  return `<div class="comparison-row"><strong>${label}</strong><span>${left}</span><span>${right}</span></div>`;
}

function flowItem(number, title, text) {
  return `<article class="flow-item"><b>${number}</b><strong>${title}</strong><span>${text}</span></article>`;
}

function agentRegistryCard(agent) {
  return `
    <article class="agent-card">
      <div><strong>${agent.name}</strong><span>${agent.role}</span></div>
      <p>${agent.responsibility}</p>
      <small>Input: ${agent.input.join(", ")} · Output: ${agent.output.join(", ")}</small>
    </article>
  `;
}

function runLogItem(item) {
  return `
    <article class="run-item">
      <div><strong>${item.agent}</strong><span>${item.status} · ${item.role}</span></div>
      <p>${item.summary}</p>
      <pre>${JSON.stringify(item.outputPreview, null, 2)}</pre>
    </article>
  `;
}

function llmLabel() {
  if (!state.llm) return "检测中";
  if (state.llm.dify?.enabled) return `Dify · ${state.llm.dify.mode}`;
  const local = state.llm.local || state.llm;
  return `${local.mode || "rule-fallback"} · ${local.provider}`;
}

function bindNavigation() {
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      state.currentPage = button.dataset.page;
      render();
    });
  });
}

function bindActions() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const action = button.dataset.action;
      try {
        if (action === "reset") await resetDemo("dashboard");
        if (action === "reset-dialogue") await resetDemo("reception");
        if (action === "next-line") await playNextLine();
        if (action === "trigger-rescue") await triggerRescue();
        if (action === "mock-asr") await runMockAsr();
        if (action === "browser-mic") await startBrowserSpeech();
        if (action === "set-speaker-customer") state.asr.speaker = "customer";
        if (action === "set-speaker-sales") state.asr.speaker = "sales";
        if (action === "stall-signal") await sendStallSignal();
        if (action === "start-sales-assistant") await startSalesAssistant();
        if (action === "refresh-agents") {
          state.session.coordination = await api.coordination();
          state.llm = await api.llmStatus();
        }
        if (action === "auto-demo") {
          await runAutoDemo();
          return;
        }
        if (action === "add-competitor") {
          state.manualCompetitor = document.querySelector("#competitorInput")?.value?.trim() || "问界 M7";
        }
        if (action === "generate-report") {
          state.session.report = await api.generateReport();
        }
        if (action === "sync-dms") {
          if (!state.session.report) state.session.report = await api.generateReport();
          state.session.dms = await api.syncDms();
          state.session.followup = await api.followupStrategy();
          state.session.storage = await api.storageStatus();
          state.session.archive = state.session.storage.archive;
        }
      } catch (error) {
        state.asr.status = "failed";
        state.asr.lastTranscript = error.message;
      }
      render();
    });
  });
}

async function resetDemo(page) {
  state.session = await api.startSession();
  state.currentScriptIndex = 0;
  state.currentPage = page;
  state.manualCompetitor = "";
  state.asr.status = "standby";
  state.asr.lastTranscript = "";
  state.asr.speaker = "customer";
  state.salesAssistant.enabled = false;
  state.salesAssistant.status = "standby";
  state.salesAssistant.lastTip = "";
  state.salesAssistant.source = "not-started";
  state.salesAssistant.latencyMs = null;
}

async function playNextLine() {
  const utterance = state.demo.script[state.currentScriptIndex];
  if (!utterance) return;
  state.session = await ingestWithAssistant(utterance);
  updateSalesAssistantTip();
  state.currentScriptIndex += 1;
}

async function triggerRescue() {
  while (state.currentScriptIndex < state.demo.script.length) {
    const utterance = state.demo.script[state.currentScriptIndex];
    state.session = await ingestWithAssistant(utterance);
    updateSalesAssistantTip();
    state.currentScriptIndex += 1;
    if (utterance.event === "stuck-rescue") break;
  }
}

async function runMockAsr() {
  state.asr.mode = "Mock";
  state.asr.status = "listening";
  render();
  const asr = await api.transcribe(state.currentScriptIndex);
  state.asr.status = "transcribed";
  state.asr.lastTranscript = asr.transcript;
  state.session = await ingestWithAssistant({
    speaker: asr.speaker,
    text: asr.transcript,
    event: asr.event
  });
  updateSalesAssistantTip();
  state.currentScriptIndex = asr.nextCursor;
}

async function sendStallSignal() {
  state.asr.mode = "Manual";
  state.asr.status = "transcribed";
  state.asr.speaker = "sales";
  state.salesAssistant.enabled = true;
  state.salesAssistant.status = "running";
  state.asr.lastTranscript = "[STALL] 销售顾问卡壳，需要一句救场提示";
  state.session = await ingestWithAssistant({
    speaker: "sales",
    text: state.asr.lastTranscript,
    event: "stall"
  });
  state.salesAssistant.lastTip = buildStageTip();
}

async function startSalesAssistant() {
  state.salesAssistant.enabled = true;
  state.salesAssistant.status = "running";
  state.salesAssistant.source = state.llm?.dify?.enabled ? "waiting-dify" : "local";
  state.salesAssistant.latencyMs = null;
  state.salesAssistant.lastTip = buildStageTip();
}

async function startBrowserSpeech() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    state.asr.status = "failed";
    state.asr.lastTranscript = "当前浏览器不支持 Web Speech API。请使用 Chrome 或 Edge，或点击“模拟麦克风”。";
    return;
  }

  state.asr.mode = "Browser";
  state.asr.status = "listening";
  state.asr.permission = "requesting";
  state.asr.lastTranscript = "正在监听，请直接说一句客户需求，例如：家里两个小孩，预算三十万左右。";
  render();

  await new Promise((resolve) => {
    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.interimResults = true;
    recognition.continuous = false;

    let finalTranscript = "";

    recognition.onresult = async (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      state.asr.lastTranscript = transcript;
      render();

      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        finalTranscript = transcript.trim();
        recognition.stop();
      }
    };

    recognition.onerror = () => {
      state.asr.status = "failed";
      state.asr.permission = "denied-or-unavailable";
      state.asr.lastTranscript = "麦克风识别失败。请确认浏览器麦克风权限，或使用“模拟麦克风”。";
      render();
      resolve();
    };

    recognition.onend = async () => {
      if (finalTranscript) {
        state.asr.status = "transcribed";
        state.asr.permission = "granted";
        state.asr.lastTranscript = finalTranscript;
        state.session = await ingestWithAssistant({
          speaker: state.asr.speaker,
          text: finalTranscript,
          event: "browser-speech"
        });
        updateSalesAssistantTip();
      }
      resolve();
    };

    recognition.start();
  });
}

async function ingestWithAssistant(utterance) {
  const startedAt = performance.now();
  if (state.salesAssistant.enabled) {
    state.salesAssistant.status = "calling";
    state.salesAssistant.lastTip = "正在分析当前对话，请稍等。";
    render();
  }
  const result = await api.ingest(utterance);
  if (state.salesAssistant.enabled) {
    state.salesAssistant.status = "running";
    state.salesAssistant.latencyMs = Math.round(performance.now() - startedAt);
    if (result.dify?.provider === "dify" && result.dify?.answer) {
      state.salesAssistant.source = "dify";
    } else if (result.dify?.status === "failed") {
      state.salesAssistant.source = "dify-failed";
    } else {
      state.salesAssistant.source = "local";
    }
  }
  return result;
}

function updateSalesAssistantTip() {
  if (!state.salesAssistant.enabled) return;
  state.salesAssistant.lastTip = buildStageTip();
}

async function runAutoDemo() {
  await resetDemo("reception");
  render();
  for (const utterance of state.demo.script) {
    await sleep(350);
    state.session = await api.ingest(utterance);
    state.currentScriptIndex += 1;
    render();
  }
  await sleep(350);
  state.currentPage = "report";
  state.session.report = await api.generateReport();
  render();
  await sleep(350);
  state.currentPage = "followup";
  state.session.dms = await api.syncDms();
  state.session.followup = await api.followupStrategy();
  state.session.storage = await api.storageStatus();
  state.session.archive = state.session.storage.archive;
  render();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

init().catch((error) => {
  document.querySelector("#app").innerHTML = `<pre class="fatal">${error.stack || error.message}</pre>`;
});
