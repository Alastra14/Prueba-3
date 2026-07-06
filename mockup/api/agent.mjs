function parseMaybeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
    res.setHeader("access-control-allow-headers", "content-type,authorization,x-api-key,api-key");
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const { apiUrl, apiKey, authHeader = "bearer", body, timeoutMs = 45000 } = req.body || {};
    if (!apiUrl || !/^https?:\/\//i.test(apiUrl)) {
      res.status(400).json({ ok: false, error: "apiUrl debe ser http(s)." });
      return;
    }

    const headers = { "content-type": "application/json" };
    if (apiKey && authHeader === "bearer") headers.authorization = `Bearer ${apiKey}`;
    if (apiKey && authHeader === "x-api-key") headers["x-api-key"] = apiKey;
    if (apiKey && authHeader === "api-key") headers["api-key"] = apiKey;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Math.min(timeoutMs, 55000));
    const upstream = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body || {}),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const text = await upstream.text();
    const data = parseMaybeJson(text);
    res.setHeader("access-control-allow-origin", "*");
    res.status(upstream.ok ? 200 : 502).json({
      ok: upstream.ok,
      status: upstream.status,
      data,
      text: typeof data === "string" ? data : undefined
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.name === "AbortError" ? "Timeout llamando al agente IA." : error.message
    });
  }
}
