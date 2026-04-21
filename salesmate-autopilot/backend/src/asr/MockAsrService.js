class MockAsrService {
  constructor(script = []) {
    this.script = script;
  }

  transcribe({ audioChunkId, cursor = 0, mode = "mock" }) {
    const utterance = this.script[cursor] || {
      speaker: "customer",
      text: "我想再了解一下第三排空间和用车成本。",
      event: "fallback"
    };

    return {
      provider: "MockAsrService",
      mode,
      audioChunkId: audioChunkId || `mock-audio-${Date.now()}`,
      cursor,
      confidence: 0.94,
      isFinal: true,
      transcript: utterance.text,
      speaker: utterance.speaker,
      event: utterance.event,
      nextCursor: cursor + 1,
      receivedAt: new Date().toISOString()
    };
  }
}

module.exports = { MockAsrService };
