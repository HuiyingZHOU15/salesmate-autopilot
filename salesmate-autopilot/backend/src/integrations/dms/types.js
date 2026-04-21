/**
 * DMS payload contract reserved for future OEM/dealer integrations.
 * The current demo uses MockDmsAdapter. Replace it with a REST, SOAP,
 * message queue, or database adapter without changing agent outputs.
 */
const DmsSyncFields = {
  customerId: "customer_id",
  customerName: "customer_name",
  phone: "mobile_masked",
  aiSummary: "ai_summary",
  intentTags: "intent_tags",
  objectionTags: "objection_tags",
  competitorList: "competitor_list",
  purchaseProbability: "purchase_probability",
  intentLevel: "intent_level",
  recommendedModel: "recommended_model",
  nextFollowupAt: "next_followup_time",
  followupScript: "followup_script_draft",
  reportUrl: "report_pdf_url",
  syncStatus: "sync_status"
};

module.exports = { DmsSyncFields };
