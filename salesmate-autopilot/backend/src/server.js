const http = require("http");
const fs = require("fs");
const path = require("path");
const { loadProjectEnv } = require("./config/loadEnv");
const { SalesOrchestrator } = require("./orchestrator/SalesOrchestrator");
const { customer, script, models, policies } = require("./data/mockData");
const { MockAsrService } = require("./asr/MockAsrService");

const root = path.resolve(__dirname, "../..");
loadProjectEnv(root);
const frontendRoot = path.resolve(root, "frontend");
const orchestrator = new SalesOrchestrator();
const asrService = new MockAsrService(script);
const isCheck = process.argv.includes("--check");

if (isCheck) {
  (async () => {
    const session = orchestrator.startSession(customer);
    await orchestrator.ingestDialogue(session.id, script[0]);
    console.log(JSON.stringify({ ok: true, sessionId: session.id }, null, 2));
    process.exit(0);
  })();
}

const server = isCheck ? null : http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }

    serveStatic(url.pathname, res);
  } catch (error) {
    sendJson(res, error.status || 500, {
      error: error.message || "Internal server error"
    });
  }
});

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/demo") {
    sendJson(res, 200, { customer, script, models, policies });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/asr/transcribe") {
    const body = await readJson(req);
    sendJson(res, 200, asrService.transcribe(body));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/session/start") {
    const session = orchestrator.startSession(customer);
    sendJson(res, 200, session);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/dialogue/ingest") {
    const body = await readJson(req);
    sendJson(res, 200, await orchestrator.ingestDialogue(body.sessionId, body.utterance));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/llm/status") {
    sendJson(res, 200, await orchestrator.llmStatus());
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/agent/analyze") {
    const body = await readJson(req);
    sendJson(res, 200, orchestrator.analyze(body.sessionId));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/recommendations") {
    const body = await readJson(req);
    const snapshot = orchestrator.analyze(body.sessionId);
    sendJson(res, 200, snapshot.recommendation);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/report/generate") {
    const body = await readJson(req);
    sendJson(res, 200, orchestrator.generateReport(body.sessionId));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/dms/sync") {
    const body = await readJson(req);
    sendJson(res, 200, await orchestrator.syncDms(body.sessionId));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/followup/strategy") {
    const body = await readJson(req);
    sendJson(res, 200, orchestrator.followupStrategy(body.sessionId));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/storage/status") {
    const body = await readJson(req);
    sendJson(res, 200, orchestrator.storageStatus(body.sessionId));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/agents/coordination") {
    const body = await readJson(req);
    sendJson(res, 200, orchestrator.coordination(body.sessionId));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/storage/pending") {
    sendJson(res, 200, orchestrator.pendingArchives());
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/dms/retry-pending") {
    sendJson(res, 200, await orchestrator.retryPendingSync());
    return;
  }

  sendJson(res, 404, { error: "API route not found" });
}

function serveStatic(requestPath, res) {
  const safePath = requestPath === "/" ? "/index.html" : requestPath;
  const filePath = path.normalize(path.join(frontendRoot, safePath));

  if (!filePath.startsWith(frontendRoot)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      fs.readFile(path.join(frontendRoot, "index.html"), (fallbackError, fallbackContent) => {
        if (fallbackError) sendText(res, 404, "Not found");
        else sendContent(res, 200, fallbackContent, "text/html; charset=utf-8");
      });
      return;
    }
    sendContent(res, 200, content, contentType(filePath));
  });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(Object.assign(new Error("Invalid JSON body"), { status: 400 }));
      }
    });
  });
}

function sendJson(res, status, payload) {
  sendContent(res, status, JSON.stringify(payload, null, 2), "application/json; charset=utf-8");
}

function sendText(res, status, text) {
  sendContent(res, status, text, "text/plain; charset=utf-8");
}

function sendContent(res, status, content, type) {
  res.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(content);
}

function contentType(filePath) {
  const ext = path.extname(filePath);
  return {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml"
  }[ext] || "application/octet-stream";
}

const port = process.env.PORT || 5177;
if (server) {
  server.listen(port, () => {
    console.log(`SalesMate AutoPilot running at http://localhost:${port}`);
  });
}
