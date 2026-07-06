import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "127.0.0.1";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".otf": "font/otf",
  ".ttf": "font/ttf"
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*"
  });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function parseMaybeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function proxyAgent(req, res) {
  try {
    const { apiUrl, apiKey, authHeader = "bearer", body, timeoutMs = 45000 } = await readJson(req);
    if (!apiUrl || !/^https?:\/\//i.test(apiUrl)) {
      sendJson(res, 400, { ok: false, error: "apiUrl debe ser http(s)." });
      return;
    }

    const headers = { "content-type": "application/json" };
    if (apiKey && authHeader === "bearer") headers.authorization = `Bearer ${apiKey}`;
    if (apiKey && authHeader === "x-api-key") headers["x-api-key"] = apiKey;
    if (apiKey && authHeader === "api-key") headers["api-key"] = apiKey;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const upstream = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body || {}),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const text = await upstream.text();
    const data = parseMaybeJson(text);
    sendJson(res, upstream.ok ? 200 : 502, {
      ok: upstream.ok,
      status: upstream.status,
      data,
      text: typeof data === "string" ? data : undefined
    });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: error.name === "AbortError" ? "Timeout llamando al agente IA." : error.message
    });
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const normalized = path.normalize(path.join(__dirname, requested));
  if (!normalized.startsWith(__dirname)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const content = await readFile(normalized);
    const ext = path.extname(normalized);
    res.writeHead(200, { "content-type": contentTypes[ext] || "application/octet-stream" });
    res.end(req.method === "HEAD" ? undefined : content);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type,authorization,x-api-key,api-key"
    });
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/agent") {
    await proxyAgent(req, res);
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    await serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end("Method not allowed");
});

server.listen(port, host, () => {
  console.log(`Mesa de Ayuda mockup: http://${host}:${port}/`);
});
