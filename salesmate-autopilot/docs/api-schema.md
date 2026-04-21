# API Schema

Base URL:

```text
http://localhost:5177
```

All request and response bodies are JSON.

## GET /api/demo

Returns the demo customer, scripted dialogue, vehicle models, and policy boosters.

Response:

```json
{
  "customer": {},
  "script": [],
  "models": [],
  "policies": []
}
```

## POST /api/asr/transcribe

Mock ASR endpoint. Reserved for browser or backend speech recognition.

Request:

```json
{
  "audioChunkId": "demo-chunk-001",
  "cursor": 0,
  "mode": "mock"
}
```

Response:

```json
{
  "provider": "MockAsrService",
  "mode": "mock",
  "audioChunkId": "demo-chunk-001",
  "cursor": 0,
  "confidence": 0.94,
  "isFinal": true,
  "transcript": "家里两个小孩，周末还要带老人出去，所以想看 6 座或者 7 座 SUV。",
  "speaker": "customer",
  "event": "profile",
  "nextCursor": 1,
  "receivedAt": "2026-04-17T00:00:00.000Z"
}
```

## GET /api/llm/status

Returns the optional local LLM status. The app remains runnable when this reports fallback mode.

Response when disabled:

```json
{
  "enabled": false,
  "provider": "fallback",
  "mode": "rule-fallback",
  "message": "LLM provider is disabled. Rule-based agents are active."
}
```

Response when Ollama is enabled and available:

```json
{
  "enabled": true,
  "provider": "ollama",
  "mode": "local-llm",
  "baseUrl": "http://localhost:11434",
  "model": "qwen2.5:7b",
  "availableModels": ["qwen2.5:7b"]
}
```

## POST /api/session/start

Starts a new customer reception session.

Response:

```json
{
  "id": "session-...",
  "customer": {},
  "dialogue": [],
  "profile": {},
  "recommendation": null,
  "followup": null,
  "dms": null,
  "createdAt": "2026-04-17T00:00:00.000Z"
}
```

## POST /api/agents/coordination

Returns the multi-agent registry, execution plan, shared memory keys, and latest run log.

Request:

```json
{
  "sessionId": "session-..."
}
```

Response:

```json
{
  "pattern": "Sequential orchestration with shared session memory",
  "registry": [
    {
      "id": "listener",
      "name": "ListenerAgent",
      "role": "感知与监听",
      "responsibility": "接收对话转写，提取关键词、意图、竞品信号和卡壳信号。"
    }
  ],
  "plan": [],
  "sharedMemory": ["dialogue", "profile", "recommendation", "followup", "archive"],
  "runLog": [
    {
      "agent": "ListenerAgent",
      "status": "completed",
      "summary": "识别 1 个意图、1 个信号",
      "outputPreview": {}
    }
  ]
}
```

## POST /api/dialogue/ingest

Adds one utterance and triggers the multi-agent pipeline.

Request:

```json
{
  "sessionId": "session-...",
  "utterance": {
    "speaker": "customer",
    "text": "汉兰达我也看过，感觉还行，就是第三排一般。",
    "event": "competitor"
  }
}
```

Response includes the full session snapshot:

```json
{
  "id": "session-...",
  "dialogue": [],
  "profile": {},
  "recommendation": {
    "recommendedModels": [],
    "competitorCard": {},
    "assistCards": [],
    "nextBestActions": [],
    "dealBoosters": [],
    "talkTrack": "..."
  },
  "followup": {},
  "report": {},
  "archive": {
    "syncStatus": "PENDING"
  },
  "agentTrace": []
}
```

## POST /api/report/generate

Generates the customer departure report.

Request:

```json
{
  "sessionId": "session-..."
}
```

Response:

```json
{
  "title": "张先生的专属选车报告",
  "summary": [],
  "recommendedModel": {},
  "benefits": [],
  "nextStep": "建议预约一次深度试驾..."
}
```

## POST /api/dms/sync

Writes the AI archive payload to the DMS adapter.

Request:

```json
{
  "sessionId": "session-..."
}
```

Response:

```json
{
  "adapter": "MockDmsAdapter",
  "status": "synced",
  "externalRecordId": "DMS-...",
  "payload": {
    "customer_id": "cust-zhang-001",
    "customer_name": "张先生",
    "mobile_masked": "138****2608",
    "ai_summary": "...",
    "intent_tags": [],
    "objection_tags": [],
    "competitor_list": [],
    "purchase_probability": 78,
    "intent_level": "高意向",
    "recommended_model": "理想 L8 Pro",
    "next_followup_time": "1-2 天内",
    "followup_script_draft": "...",
    "report_pdf_url": "/reports/session-....html",
    "sync_status": "SYNCED"
  }
}
```

## GET /api/storage/pending

Lists local processing archives that are not synced.

Response:

```json
{
  "count": 1,
  "records": []
}
```

## POST /api/dms/retry-pending

Retries DMS sync for pending local archives.

Response:

```json
{
  "attempted": 1,
  "results": [],
  "pendingCount": 0
}
```

## POST /api/storage/status

Returns the data storage strategy and current archive state.

Request:

```json
{
  "sessionId": "session-..."
}
```

Response:

```json
{
  "principle": "DMS 为主存储，SalesMate 只保存加工数据与同步状态，不截留客户主数据。",
  "layers": [],
  "archive": {},
  "pendingCount": 0,
  "persistence": {
    "mode": "file-backed-json",
    "path": "backend/runtime/processing-store.json",
    "sqliteReady": true
  }
}
```
