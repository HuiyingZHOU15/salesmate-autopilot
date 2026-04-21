const fs = require("fs");
const path = require("path");

const SyncStatus = {
  PENDING: "PENDING",
  SYNCED: "SYNCED",
  FAILED: "FAILED"
};

class ProcessingStore {
  constructor(filePath = path.resolve(__dirname, "../../runtime/processing-store.json")) {
    this.filePath = filePath;
    this.records = new Map();
    this.load();
  }

  upsertArchive(session) {
    const profile = session.profile || {};
    const recommendation = session.recommendation || {};
    const report = session.followup?.report || {};
    const followup = session.followup?.followup || {};
    const existing = this.records.get(session.id);

    const record = {
      sessionId: session.id,
      customerRef: profile.customerId,
      // Local processing storage deliberately avoids storing raw name or phone.
      aiProfile: {
        intentTags: profile.intents || [],
        preferenceTags: profile.attributes || [],
        objectionTags: this.objectionTags(profile, recommendation),
        competitorList: this.competitorList(session.dialogue),
        purchaseProbability: profile.purchaseProbability || 0
      },
      localOnly: {
        transcriptText: session.dialogue.map((item) => `${item.speaker}: ${item.text}`).join("\n"),
        ontologyCache: profile.concerns || [],
        cardRescueEvents: this.cardRescueEvents(recommendation),
        salesActionLog: session.agentTrace || session.lastAgentTrace || [],
        vectorStatus: "mocked-for-demo"
      },
      dmsArchive: {
        ai_summary: report.summary?.join("；") || "",
        intent_tags: profile.intents || [],
        objection_tags: this.objectionTags(profile, recommendation),
        competitor_list: this.competitorList(session.dialogue),
        purchase_probability: profile.purchaseProbability || 0,
        next_followup_time: followup.timing || "",
        followup_script_draft: followup.script || "",
        report_pdf_url: `/reports/${session.id}.html`
      },
      syncStatus: existing?.syncStatus || SyncStatus.PENDING,
      lastError: existing?.lastError || null,
      updatedAt: new Date().toISOString()
    };

    this.records.set(session.id, record);
    this.persist();
    return record;
  }

  markSynced(sessionId, externalRecordId) {
    const record = this.records.get(sessionId);
    if (!record) return null;
    record.syncStatus = SyncStatus.SYNCED;
    record.externalRecordId = externalRecordId;
    record.syncedAt = new Date().toISOString();
    record.lastError = null;
    this.persist();
    return record;
  }

  markFailed(sessionId, error) {
    const record = this.records.get(sessionId);
    if (!record) return null;
    record.syncStatus = SyncStatus.FAILED;
    record.lastError = error.message || String(error);
    record.updatedAt = new Date().toISOString();
    this.persist();
    return record;
  }

  get(sessionId) {
    return this.records.get(sessionId) || null;
  }

  pending() {
    return [...this.records.values()].filter((record) => record.syncStatus !== SyncStatus.SYNCED);
  }

  all() {
    return [...this.records.values()];
  }

  load() {
    try {
      if (!fs.existsSync(this.filePath)) return;
      const raw = fs.readFileSync(this.filePath, "utf8");
      if (!raw.trim()) return;
      const records = JSON.parse(raw);
      this.records = new Map(records.map((record) => [record.sessionId, record]));
    } catch (error) {
      this.records = new Map();
      this.loadError = error.message;
    }
  }

  persist() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(this.all(), null, 2), "utf8");
  }

  objectionTags(profile, recommendation) {
    const tags = [];
    if ((profile.concerns || []).some((item) => item.includes("价格") || item.includes("金融"))) {
      tags.push("价格敏感");
    }
    if (recommendation?.competitorCard) {
      tags.push("竞品比较");
    }
    if ((profile.concerns || []).some((item) => item.includes("用车成本"))) {
      tags.push("用车成本顾虑");
    }
    return [...new Set(tags)];
  }

  competitorList(dialogue) {
    const text = dialogue.map((item) => item.text).join(" ");
    return ["汉兰达", "途昂"].filter((model) => text.includes(model));
  }

  cardRescueEvents(recommendation) {
    if (!recommendation?.competitorCard) return [];
    return [
      {
        type: "competitor_response",
        title: recommendation.competitorCard.title,
        at: new Date().toISOString()
      }
    ];
  }
}

module.exports = { ProcessingStore, SyncStatus };
