const { DmsSyncFields } = require("./types");

class MockDmsAdapter {
  async syncCustomer({ profile, report, followup, archive }) {
    const payload = {
      [DmsSyncFields.customerId]: profile.customerId,
      [DmsSyncFields.customerName]: profile.name,
      [DmsSyncFields.phone]: "138****2608",
      [DmsSyncFields.aiSummary]: archive.dmsArchive.ai_summary,
      [DmsSyncFields.intentTags]: archive.dmsArchive.intent_tags,
      [DmsSyncFields.objectionTags]: archive.dmsArchive.objection_tags,
      [DmsSyncFields.competitorList]: archive.dmsArchive.competitor_list,
      [DmsSyncFields.purchaseProbability]: archive.dmsArchive.purchase_probability,
      [DmsSyncFields.intentLevel]: followup.level,
      [DmsSyncFields.recommendedModel]: report.recommendedModel.name,
      [DmsSyncFields.nextFollowupAt]: followup.timing,
      [DmsSyncFields.followupScript]: followup.script,
      [DmsSyncFields.reportUrl]: archive.dmsArchive.report_pdf_url,
      [DmsSyncFields.syncStatus]: "SYNCED"
    };

    return {
      adapter: "MockDmsAdapter",
      status: "synced",
      externalRecordId: `DMS-${Date.now()}`,
      payload
    };
  }
}

module.exports = { MockDmsAdapter };
