const { ListenerAgent } = require("../agents/ListenerAgent");
const { ProfileAgent } = require("../agents/ProfileAgent");
const { RecommendationAgent } = require("../agents/RecommendationAgent");
const { FollowupAgent } = require("../agents/FollowupAgent");
const { MockDmsAdapter } = require("../integrations/dms/MockDmsAdapter");
const { ProcessingStore } = require("../storage/ProcessingStore");
const { agentRegistry } = require("./AgentRegistry");
const { LlmService } = require("../llm/LlmService");
const { DifyClient } = require("../integrations/dify/DifyClient");

class SalesOrchestrator {
  constructor() {
    this.listenerAgent = new ListenerAgent();
    this.profileAgent = new ProfileAgent();
    this.recommendationAgent = new RecommendationAgent();
    this.followupAgent = new FollowupAgent();
    this.dmsAdapter = new MockDmsAdapter();
    this.processingStore = new ProcessingStore();
    this.llmService = new LlmService();
    this.difyClient = new DifyClient();
    this.sessions = new Map();
  }

  startSession(customer) {
    const sessionId = `session-${Date.now()}`;
    const session = {
      id: sessionId,
      customer,
      dialogue: [],
      profile: {},
      recommendation: null,
      followup: null,
      dms: null,
      dify: null,
      difyConversationId: null,
      stage: "init",
      createdAt: new Date().toISOString()
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  async ingestDialogue(sessionId, utterance) {
    const session = this.assertSession(sessionId);
    session.dialogue.push({
      id: `utt-${session.dialogue.length + 1}`,
      speaker: utterance.speaker || "customer",
      text: utterance.text || "",
      at: new Date().toISOString()
    });

    const listener = this.listenerAgent.analyze(session.dialogue);
    const runLog = [];
    runLog.push(this.logStep("listener", listener));
    const profile = this.profileAgent.build(listener, session.profile);
    runLog.push(this.logStep("profile", profile));
    const recommendation = this.recommendationAgent.recommend(profile, listener);
    recommendation.llmAssist = await this.llmService.enhanceSalesAssist({
      profile,
      latestUtterance: listener.latestUtterance?.text,
      recommendationSummary: {
        topModel: recommendation.recommendedModels?.[0]?.name,
        nextBestActions: recommendation.nextBestActions
      }
    });
    runLog.push(this.logStep("recommendation", recommendation));
    const followup = this.followupAgent.generate(profile, recommendation);
    runLog.push(this.logStep("followup", followup));

    session.profile = profile;
    session.recommendation = recommendation;
    session.followup = followup;
    session.lastAgentTrace = [listener, profile, recommendation, followup].map((result) => ({
      agent: result.agent,
      summary: this.traceSummary(result)
    }));
    session.archive = this.processingStore.upsertArchive(session);
    runLog.push(this.logStep("archive", session.archive));
    const dify = await this.runDifyWorkflow(session, utterance);
    if (dify) {
      session.dify = dify;
      runLog.push(this.logStep("dify", dify));
      if (dify.answer) {
        session.recommendation = {
          ...session.recommendation,
          difyAnswer: dify.answer,
          talkTrack: dify.answer
        };
      }
    }
    session.coordination = this.coordinationSnapshot(runLog);

    return this.snapshot(session);
  }

  async runDifyWorkflow(session, utterance) {
    if (!this.difyClient.enabled) return null;

    const query = utterance.text || "";
    const stage = this.resolveStage(query, session.stage);
    session.stage = stage;

    try {
      const result = await this.difyClient.sendChatMessage({
        query,
        user: session.customer?.id || session.id,
        conversationId: session.difyConversationId,
        inputs: {
          query,
          stage,
          dialogue_history: session.dialogue.map((item) => `${item.speaker}: ${item.text}`).join("\n"),
          summary: session.followup?.report?.summary?.join("\n") || "",
          full_profile: JSON.stringify(session.profile || {}),
          customer_id: session.customer?.id || "",
          sales_stage: stage,
          session_id: session.id,
          trigger: this.resolveTrigger(query),
          current_utterance_speaker: utterance.speaker || "customer",
          manual_competitor: "",
          selected_model: session.recommendation?.recommendedModels?.[0]?.name || "",
          purchase_probability: session.profile?.purchaseProbability || 0,
          followup_script: session.followup?.followup?.script || "",
          report_url: session.followup?.report?.reportPdfUrl || "",
          asr_mode: "mock",
          llm_provider: "dify",
          dms_sync_mode: "mock",
          ontology_schema: JSON.stringify({
            intent: ["家庭出行", "预算敏感", "竞品对比", "试驾意向", "成交推进"],
            stall_hint: ["price_objection", "competitor_objection", "charging_objection", "brand_objection", "delivery_objection", "none"]
          }),
          known_models: JSON.stringify(["理想 L7", "理想 L8", "理想 L9"]),
          known_competitors: JSON.stringify(["汉兰达", "途昂", "问界 M7", "理想 L8", "理想 L7"]),
          search_scope: JSON.stringify(["车型库", "政策库", "竞品库"]),
          scoring_rules: JSON.stringify({
            budget_clear: 15,
            family_usage: 15,
            competitor_mentioned: 10,
            test_drive_interest: 20
          })
        }
      });
      session.difyConversationId = result.conversationId || session.difyConversationId;
      return result;
    } catch (error) {
      return {
        provider: "dify",
        status: "failed",
        error: error.message,
        fallback: "local-agent-result-used"
      };
    }
  }

  resolveStage(query, currentStage) {
    const normalized = (query || "").toUpperCase();
    if (normalized.includes("[STAGE:PROFILING]")) return "profiling";
    if (normalized.includes("[STAGE:RECOMMEND]")) return "recommend";
    if (normalized.includes("[STAGE:CLOSING]")) return "closing";
    if (normalized.includes("[STAGE:DEPARTURE]")) return "departure";
    return currentStage || "init";
  }

  resolveTrigger(query) {
    const normalized = (query || "").toUpperCase();
    if (normalized.includes("[STALL]")) return "stall";
    if (normalized.includes("[ASSISTANT_ON]")) return "assistant";
    if (normalized.includes("[QUERY]")) return "query";
    if (normalized.includes("[STAGE:")) return "stage";
    return "realtime";
  }

  analyze(sessionId) {
    return this.snapshot(this.assertSession(sessionId));
  }

  generateReport(sessionId) {
    const session = this.assertSession(sessionId);
    if (!session.followup) {
      const listener = this.listenerAgent.analyze(session.dialogue);
      const profile = this.profileAgent.build(listener, session.profile);
      const recommendation = this.recommendationAgent.recommend(profile, listener);
      session.profile = profile;
      session.recommendation = recommendation;
      session.followup = this.followupAgent.generate(profile, recommendation);
    }
    session.archive = this.processingStore.upsertArchive(session);
    session.coordination = this.coordinationSnapshot([
      this.logStep("followup", session.followup),
      this.logStep("archive", session.archive)
    ]);
    return session.followup.report;
  }

  async syncDms(sessionId) {
    const session = this.assertSession(sessionId);
    const report = this.generateReport(sessionId);
    try {
      session.archive = this.processingStore.upsertArchive(session);
      session.dms = await this.dmsAdapter.syncCustomer({
        profile: session.profile,
        report,
        followup: session.followup.followup,
        archive: session.archive
      });
      session.archive = this.processingStore.markSynced(session.id, session.dms.externalRecordId);
    } catch (error) {
      session.archive = this.processingStore.markFailed(session.id, error);
      throw error;
    }
    return session.dms;
  }

  async retryPendingSync() {
    const results = [];
    for (const archive of this.processingStore.pending()) {
      const session = this.sessions.get(archive.sessionId);
      if (!session) {
        results.push({
          sessionId: archive.sessionId,
          status: "skipped",
          reason: "Session is not active in memory. In production this would reload from SQLite."
        });
        continue;
      }
      try {
        const dms = await this.syncDms(archive.sessionId);
        results.push({
          sessionId: archive.sessionId,
          status: "synced",
          externalRecordId: dms.externalRecordId
        });
      } catch (error) {
        results.push({
          sessionId: archive.sessionId,
          status: "failed",
          reason: error.message
        });
      }
    }
    return {
      attempted: results.length,
      results,
      pendingCount: this.processingStore.pending().length
    };
  }

  followupStrategy(sessionId) {
    const session = this.assertSession(sessionId);
    if (!session.followup) {
      this.generateReport(sessionId);
    }
    return session.followup.followup;
  }

  storageStatus(sessionId) {
    const session = this.assertSession(sessionId);
    session.archive = this.processingStore.upsertArchive(session);
    return {
      principle: "DMS 为主存储，SalesMate 只保存加工数据与同步状态，不截留客户主数据。",
      layers: [
        {
          name: "DMS 主存储层",
          ownership: "车企 / 4S 店",
          content: ["客户基本信息", "订单与金融信息", "历史跟进记录", "AI 摘要与标签回写"]
        },
        {
          name: "SalesMate 加工存储层",
          ownership: "本地加工缓存",
          content: ["意图标签", "购买概率", "对话摘要向量", "回访策略草稿", "同步状态"]
        },
        {
          name: "数据中台 / BI 分析层",
          ownership: "车企管理层",
          content: ["脱敏关注点趋势", "竞品对比趋势", "战败原因分析", "话术有效性"]
        }
      ],
      archive: session.archive,
      pendingCount: this.processingStore.pending().length,
      persistence: {
        mode: "file-backed-json",
        path: this.processingStore.filePath,
        sqliteReady: true,
        note: "The file-backed store simulates the future SQLite processing layer for this demo."
      }
    };
  }

  pendingArchives() {
    return {
      count: this.processingStore.pending().length,
      records: this.processingStore.pending()
    };
  }

  async llmStatus() {
    const local = await this.llmService.status();
    const dify = this.difyClient.status();
    const enabled = dify.enabled || local.enabled;
    const provider = dify.enabled ? "dify" : local.provider;
    const mode = dify.enabled ? dify.mode : local.mode;

    return {
      ...local,
      mode,
      provider,
      enabled,
      message: this.llmStatusMessage({ enabled, provider, local, dify }),
      local,
      dify
    };
  }

  llmStatusMessage({ enabled, provider, local, dify }) {
    if (provider === "dify" && dify.enabled) {
      return `Dify workflow is active at ${dify.apiBase}.`;
    }

    if (enabled && local.message) {
      return local.message;
    }

    return "LLM providers are disabled. Rule-based agents are active.";
  }

  coordination(sessionId) {
    const session = this.assertSession(sessionId);
    return session.coordination || this.coordinationSnapshot([]);
  }

  snapshot(session) {
    return {
      id: session.id,
      customer: session.customer,
      dialogue: session.dialogue,
      profile: session.profile,
      recommendation: session.recommendation,
      followup: session.followup?.followup || null,
      report: session.followup?.report || null,
      dms: session.dms,
      dify: session.dify,
      stage: session.stage,
      archive: session.archive || null,
      coordination: session.coordination || this.coordinationSnapshot([]),
      agentTrace: session.lastAgentTrace || []
    };
  }

  coordinationSnapshot(runLog) {
    return {
      pattern: "Sequential orchestration with shared session memory",
      registry: agentRegistry,
      plan: agentRegistry.map((agent, index) => ({
        order: index + 1,
        agent: agent.name,
        role: agent.role,
        responsibility: agent.responsibility
      })),
      sharedMemory: [
        "dialogue",
        "profile",
        "recommendation",
        "followup",
        "archive"
      ],
      runLog
    };
  }

  logStep(agentId, output) {
    const meta = agentRegistry.find((agent) => agent.id === agentId);
    return {
      id: `${agentId}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      agentId,
      agent: meta?.name || agentId,
      role: meta?.role || "unknown",
      status: "completed",
      summary: this.outputSummary(agentId, output),
      outputPreview: this.outputPreview(agentId, output),
      completedAt: new Date().toISOString()
    };
  }

  outputSummary(agentId, output) {
    if (agentId === "dify") return output.status === "failed" ? `Dify 调用失败：${output.error}` : "Dify 主工作流已返回";
    if (agentId === "listener") return `识别 ${output.intents.length} 个意图、${output.signals.length} 个信号`;
    if (agentId === "profile") return `客户画像更新，购买概率 ${output.purchaseProbability}%`;
    if (agentId === "recommendation") return `生成 ${output.recommendedModels.length} 个车型推荐、${output.assistCards.length} 张提示卡，LLM=${output.llmAssist?.provider || "none"}`;
    if (agentId === "followup") return `生成 ${output.followup.level} 回访策略`;
    if (agentId === "archive") return `本地归档状态 ${output.syncStatus}`;
    return "完成";
  }

  outputPreview(agentId, output) {
    if (agentId === "dify") {
      return {
        provider: output.provider,
        conversationId: output.conversationId,
        answer: output.answer || output.error
      };
    }
    if (agentId === "listener") {
      return {
        intents: output.intents,
        signals: output.signals.map((signal) => signal.type)
      };
    }
    if (agentId === "profile") {
      return {
        budget: output.budget,
        concerns: output.concerns?.slice(0, 4),
        purchaseProbability: output.purchaseProbability
      };
    }
    if (agentId === "recommendation") {
      return {
        topModel: output.recommendedModels?.[0]?.name,
        assistCards: output.assistCards?.map((card) => card.type),
        llmAssist: output.llmAssist
      };
    }
    if (agentId === "followup") {
      return {
        level: output.followup?.level,
        timing: output.followup?.timing
      };
    }
    if (agentId === "archive") {
      return {
        syncStatus: output.syncStatus,
        dmsFields: Object.keys(output.dmsArchive || {})
      };
    }
    return {};
  }

  traceSummary(result) {
    if (result.agent === "ListenerAgent") return `识别意图：${result.intents.join("、") || "待观察"}`;
    if (result.agent === "ProfileAgent") return `画像更新：${result.name}，购买概率 ${result.purchaseProbability}%`;
    if (result.agent === "RecommendationAgent") return `推荐 ${result.recommendedModels[0]?.name || "待定"}`;
    if (result.agent === "FollowupAgent") return `生成 ${result.followup.level} 回访策略`;
    return "完成";
  }

  assertSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      const error = new Error(`Session not found: ${sessionId}`);
      error.status = 404;
      throw error;
    }
    return session;
  }
}

module.exports = { SalesOrchestrator };
