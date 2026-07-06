const prompts = window.MESA_AYUDA_PROMPTS;
const configStorageKey = "mesaAyudaAgentConfig.v1";

const agents = [
  { id: "nova", name: "Nova", type: "bot", variant: "Resolucion rapida", availability: "available", active: 2, max: 4 },
  { id: "atlas", name: "Atlas", type: "bot", variant: "Seguridad y politicas", availability: "available", active: 1, max: 3 },
  { id: "cora", name: "Cora", type: "bot", variant: "Diagnostico guiado", availability: "busy", active: 3, max: 3 },
  { id: "kevin", name: "Kevin Castro", type: "human", variant: "N1 soporte", availability: "available", active: 1, max: 4 },
  { id: "andrea", name: "Andrea Perez", type: "human", variant: "Telefonia movil", availability: "available", active: 0, max: 3 },
  { id: "marvin", name: "Marvin Lopez", type: "human", variant: "Aplicaciones", availability: "busy", active: 4, max: 4 }
];

const caseCatalog = [
  {
    key: "telefono-no-glpi",
    requester: "M. Rodriguez",
    title: "Celular no aparece en GLPI",
    summary: "Usuario reporta telefono asignado sin modelo ni activo en inventario.",
    initialMessage: "Hola, mi celular corporativo no aparece en GLPI y necesito reportar una falla de pantalla.",
    category: "Telefonia movil",
    impact: "Medio",
    urgency: "Media",
    risk: "medium",
    preferredAgent: "cora",
    expectedSpecialist: "Telefonia Movil",
    advisor: "Recolectar modelo, IMEI, usuario asignado y validar si el activo existe en GLPI antes de reasignar."
  },
  {
    key: "vpn-mfa-bloqueado",
    requester: "A. Molina",
    title: "No puede ingresar a VPN",
    summary: "Error de autenticacion MFA al conectar desde laptop corporativa.",
    initialMessage: "No me deja entrar a la VPN. Dice que mi autenticacion fue bloqueada.",
    category: "Accesos / VPN",
    impact: "Alto",
    urgency: "Alta",
    risk: "high",
    preferredAgent: "atlas",
    expectedSpecialist: "Seguridad / Identidad",
    advisor: "Validar identidad, revisar bloqueo de MFA y escalar a Seguridad si hay intentos anormales."
  },
  {
    key: "impresora-no-responde",
    requester: "D. Herrera",
    title: "Impresora no responde",
    summary: "Impresora de oficinas no aparece disponible para usuarios de turno.",
    initialMessage: "La impresora del area no responde desde hace 15 minutos.",
    category: "Hardware / Impresion",
    impact: "Bajo",
    urgency: "Media",
    risk: "low",
    preferredAgent: "nova",
    expectedSpecialist: "Soporte N1",
    advisor: "Revisar cola de impresion, conectividad local y ultimo cambio de driver."
  },
  {
    key: "correo-externo",
    requester: "R. Campos",
    title: "No recibe correo externo",
    summary: "Correo de cliente no entra a bandeja; posible filtro, cuarentena o regla.",
    initialMessage: "Un cliente dice que ya envio el correo, pero no lo veo en bandeja ni spam.",
    category: "Microsoft 365 / Correo",
    impact: "Medio",
    urgency: "Alta",
    risk: "medium",
    preferredAgent: "nova",
    expectedSpecialist: "M365",
    advisor: "Validar remitente, cuarentena, reglas de bandeja y trazas de mensaje en M365."
  },
  {
    key: "sharepoint-permisos",
    requester: "P. Escobar",
    title: "Solicitud de acceso a carpeta",
    summary: "Usuario requiere permiso en SharePoint de Finanzas para cierre mensual.",
    initialMessage: "Necesito acceso a una carpeta de Finanzas para cerrar un reporte hoy.",
    category: "Accesos / SharePoint",
    impact: "Medio",
    urgency: "Media",
    risk: "high",
    preferredAgent: "atlas",
    expectedSpecialist: "Owner de sitio / Seguridad",
    advisor: "Escalar a owner del sitio. No conceder permiso sin aprobacion del responsable de datos."
  },
  {
    key: "phishing",
    requester: "C. Menendez",
    title: "Correo sospechoso con enlace",
    summary: "Usuario recibio correo con enlace y tono urgente solicitando credenciales.",
    initialMessage: "Me llego un correo raro pidiendo validar mi usuario. No hice clic, pero se ve urgente.",
    category: "Seguridad / Phishing",
    impact: "Alto",
    urgency: "Alta",
    risk: "critical",
    preferredAgent: "atlas",
    expectedSpecialist: "Ciberseguridad",
    advisor: "Indicar no hacer clic, no reenviar adjuntos fuera del flujo, crear incidente y escalar a Seguridad."
  },
  {
    key: "laptop-lenta",
    requester: "L. Ramirez",
    title: "Laptop lenta en arranque",
    summary: "Equipo tarda mas de 10 minutos al iniciar sesion.",
    initialMessage: "Mi laptop tarda demasiado al arrancar y abrir Teams.",
    category: "Hardware / Endpoint",
    impact: "Bajo",
    urgency: "Media",
    risk: "low",
    preferredAgent: "cora",
    expectedSpecialist: "Endpoint",
    advisor: "Pedir hostname, espacio en disco, version de Windows y revisar politicas de inicio."
  },
  {
    key: "epicor-acceso",
    requester: "J. Aguilar",
    title: "Error de acceso en Epicor",
    summary: "Usuario no puede entrar a Epicor Kinetic; posible rol o bloqueo de cuenta.",
    initialMessage: "Epicor me dice que no tengo permisos para entrar al modulo de compras.",
    category: "Aplicaciones / Epicor",
    impact: "Medio",
    urgency: "Alta",
    risk: "high",
    preferredAgent: "atlas",
    expectedSpecialist: "Aplicaciones / Owner Epicor",
    advisor: "Validar rol, aprobacion del responsable del proceso y no otorgar permisos directamente."
  }
];

let conversations = [
  createConversationFromCase(caseCatalog[0], "HD-1042", "cora"),
  createConversationFromCase(caseCatalog[1], "HD-1041", "atlas", "GLPI-88321"),
  createConversationFromCase(caseCatalog[2], "HD-1040", "kevin", "GLPI-88318")
];

let activeId = conversations[0].id;
let requestIndex = 3;
let agentRotation = 0;
let aiConfig = {
  apiUrl: "",
  apiKey: "",
  apiFormat: "auto",
  authHeader: "bearer",
  model: "",
  agentId: "nova"
};

const queueList = document.getElementById("queueList");
const messages = document.getElementById("messages");
const conversationTitle = document.getElementById("conversationTitle");
const conversationEyebrow = document.getElementById("conversationEyebrow");
const agentChip = document.getElementById("agentChip");
const classificationText = document.getElementById("classificationText");
const classificationMeta = document.getElementById("classificationMeta");
const advisorText = document.getElementById("advisorText");
const ticketPill = document.getElementById("ticketPill");
const agentRoster = document.getElementById("agentRoster");
const timeline = document.getElementById("timeline");
const metricQueue = document.getElementById("metricQueue");
const replyInput = document.getElementById("replyInput");
const apiUrlInput = document.getElementById("apiUrlInput");
const apiKeyInput = document.getElementById("apiKeyInput");
const apiFormatSelect = document.getElementById("apiFormatSelect");
const authHeaderSelect = document.getElementById("authHeaderSelect");
const modelInput = document.getElementById("modelInput");
const agentSelect = document.getElementById("agentSelect");
const caseSelect = document.getElementById("caseSelect");
const casePreview = document.getElementById("casePreview");
const connectionStatus = document.getElementById("connectionStatus");

function createConversationFromCase(template, id, agentId = template.preferredAgent, glpi = null) {
  return {
    id,
    caseKey: template.key,
    requester: template.requester,
    title: template.title,
    summary: template.summary,
    category: template.category,
    impact: template.impact,
    urgency: template.urgency,
    risk: template.risk,
    sla: template.risk === "critical" ? 5 : template.risk === "high" ? 9 : template.risk === "medium" ? 18 : 34,
    agentId,
    glpi,
    expectedSpecialist: template.expectedSpecialist,
    advisor: template.advisor,
    messages: [
      { author: template.requester, type: "user", text: template.initialMessage },
      { author: getAgent(agentId).name, type: "agent", text: "Recibido. Voy a clasificar el caso y mantenerte actualizado en este mismo hilo." }
    ],
    timeline: ["Mensaje recibido por Teams", `${getAgent(agentId).name} asignado por rotacion N1`]
  };
}

function getActiveConversation() {
  return conversations.find((item) => item.id === activeId) || conversations[0];
}

function getAgent(id) {
  return agents.find((agent) => agent.id === id) || agents[0];
}

function getCase(key) {
  return caseCatalog.find((item) => item.key === key) || caseCatalog[0];
}

function setConnectionStatus(text, state = "") {
  connectionStatus.textContent = text;
  connectionStatus.className = `connection-status ${state}`;
}

function loadSavedConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(configStorageKey) || "{}");
    aiConfig = { ...aiConfig, ...saved, apiKey: "" };
  } catch {
    localStorage.removeItem(configStorageKey);
  }

  apiUrlInput.value = aiConfig.apiUrl || "";
  apiFormatSelect.value = aiConfig.apiFormat || "auto";
  authHeaderSelect.value = aiConfig.authHeader || "bearer";
  modelInput.value = aiConfig.model || "";
  agentSelect.value = aiConfig.agentId || "nova";
  setConnectionStatus(aiConfig.apiUrl ? "Endpoint listo, falta API key si aplica" : "Modo simulado", aiConfig.apiUrl ? "ok" : "");
}

function saveConfigFromForm() {
  aiConfig = {
    apiUrl: apiUrlInput.value.trim(),
    apiKey: apiKeyInput.value.trim(),
    apiFormat: apiFormatSelect.value,
    authHeader: authHeaderSelect.value,
    model: modelInput.value.trim(),
    agentId: agentSelect.value
  };
  localStorage.setItem(configStorageKey, JSON.stringify({
    apiUrl: aiConfig.apiUrl,
    apiFormat: aiConfig.apiFormat,
    authHeader: aiConfig.authHeader,
    model: aiConfig.model,
    agentId: aiConfig.agentId
  }));
  setConnectionStatus(aiConfig.apiUrl ? "Endpoint configurado" : "Modo simulado", aiConfig.apiUrl ? "ok" : "");
}

function resolveApiFormat(apiUrl, selected) {
  if (selected && selected !== "auto") return selected;
  if (/\/v1\/chat\/completions/i.test(apiUrl)) return "openai";
  if (/\/api\/chat/i.test(apiUrl)) return "ollama";
  return "generic";
}

function getMasterPrompt(agentId) {
  return prompts?.build ? prompts.build(agentId) : "Eres un agente de mesa de ayuda TI. Responde en JSON.";
}

function compactConversation(conversation) {
  return {
    id: conversation.id,
    requester: conversation.requester,
    title: conversation.title,
    summary: conversation.summary,
    category: conversation.category,
    impact: conversation.impact,
    urgency: conversation.urgency,
    risk: conversation.risk,
    glpi: conversation.glpi,
    expectedSpecialist: conversation.expectedSpecialist,
    messages: conversation.messages.slice(-6).map((message) => ({
      author: message.author,
      type: message.type,
      text: message.text
    }))
  };
}

function buildAgentBody(action, conversation, operatorInput = "") {
  const agent = getAgent(aiConfig.agentId || conversation.agentId);
  const caseTemplate = getCase(conversation.caseKey);
  const masterPrompt = getMasterPrompt(agent.id);
  const input = {
    action,
    operatorInput,
    locale: "es-SV",
    channel: "teams",
    now: new Date().toISOString(),
    agent: {
      id: agent.id,
      name: agent.name,
      variant: agent.variant
    },
    conversation: compactConversation(conversation),
    caseTemplate,
    responseContract: prompts?.responseContract
  };
  const userContent = `Analiza este caso de mesa de ayuda y devuelve solo JSON valido.\n${JSON.stringify(input, null, 2)}`;
  const format = resolveApiFormat(aiConfig.apiUrl, aiConfig.apiFormat);

  if (format === "openai") {
    return {
      model: aiConfig.model || "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: masterPrompt },
        { role: "user", content: userContent }
      ]
    };
  }

  if (format === "ollama") {
    return {
      model: aiConfig.model || "llama3.1",
      stream: false,
      messages: [
        { role: "system", content: masterPrompt },
        { role: "user", content: userContent }
      ]
    };
  }

  return {
    task: "ternova_helpdesk_agent",
    version: prompts?.version || "local",
    mode: action,
    masterPrompt,
    input,
    responseFormat: "json_object"
  };
}

function extractAgentText(data) {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (typeof data.text === "string") return data.text;
  if (typeof data.reply === "string") return data.reply;
  if (typeof data.answer === "string") return data.answer;
  if (typeof data.response === "string") return data.response;
  if (typeof data.result === "string") return data.result;
  if (typeof data.output_text === "string") return data.output_text;
  if (typeof data.message === "string") return data.message;
  if (data.message?.content) return data.message.content;
  if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
  if (data.choices?.[0]?.text) return data.choices[0].text;
  if (data.data) return extractAgentText(data.data);
  return JSON.stringify(data, null, 2);
}

function parseAgentJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function localFallback(action, conversation) {
  const caseTemplate = getCase(conversation.caseKey);
  const agent = getAgent(aiConfig.agentId || conversation.agentId);
  const reply = action === "advisor"
    ? `Recomendacion ${agent.name}: ${caseTemplate.advisor}`
    : `Recibido. Para avanzar necesito validar: ${caseTemplate.advisor}`;
  return {
    reply,
    recommendation: `${caseTemplate.advisor} Especialista sugerido: ${caseTemplate.expectedSpecialist}.`,
    classification: {
      category: caseTemplate.category,
      impact: caseTemplate.impact,
      urgency: caseTemplate.urgency,
      risk: caseTemplate.risk
    },
    assignment: {
      target: caseTemplate.risk === "low" ? "bot" : "specialist",
      group: caseTemplate.expectedSpecialist,
      reason: "Regla local de caso especifico"
    },
    glpi: {
      title: caseTemplate.title,
      description: caseTemplate.summary,
      followup: caseTemplate.advisor
    },
    nextActions: [caseTemplate.advisor],
    missingInformation: []
  };
}

async function callAgent(action, operatorInput = "") {
  saveConfigFromForm();
  const conversation = getActiveConversation();
  if (!aiConfig.apiUrl) {
    return localFallback(action, conversation);
  }

  setConnectionStatus("Llamando agente IA...", "");
  const response = await fetch("/api/agent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      apiUrl: aiConfig.apiUrl,
      apiKey: aiConfig.apiKey,
      authHeader: aiConfig.authHeader,
      body: buildAgentBody(action, conversation, operatorInput)
    })
  });
  const proxied = await response.json();
  if (!response.ok || !proxied.ok) {
    throw new Error(proxied.error || `Agente respondio estado ${proxied.status || response.status}`);
  }
  setConnectionStatus("Agente IA conectado", "ok");
  const text = extractAgentText(proxied.data ?? proxied.text);
  return parseAgentJson(text) || { reply: text, recommendation: text };
}

function applyAgentResult(result, action) {
  const conversation = getActiveConversation();
  const agent = getAgent(aiConfig.agentId || conversation.agentId);
  conversation.agentId = agent.id;

  if (result.classification) {
    conversation.category = result.classification.category || conversation.category;
    conversation.impact = result.classification.impact || conversation.impact;
    conversation.urgency = result.classification.urgency || conversation.urgency;
    conversation.risk = result.classification.risk || conversation.risk;
  }

  if (result.recommendation) conversation.advisor = result.recommendation;
  if (result.assignment?.group) conversation.expectedSpecialist = result.assignment.group;

  const reply = result.reply || result.message || result.recommendation || "El agente genero respuesta sin contenido visible.";
  if (action === "advisor") {
    conversation.messages.push({ author: "DGX Spark", type: "system", text: `Asesor: ${result.recommendation || reply}` });
  } else {
    conversation.messages.push({ author: agent.name, type: "agent", text: reply });
  }

  if (result.glpi?.title) {
    conversation.timeline.push(`GLPI sugerido: ${result.glpi.title}`);
  }
  if (result.nextActions?.length) {
    conversation.timeline.push(`Siguiente accion IA: ${result.nextActions[0]}`);
  }
  conversation.timeline.push(`Respuesta IA aplicada con prompt ${prompts?.version || "local"}`);
  replyInput.value = reply;
  render();
}

function renderCaseOptions() {
  caseSelect.innerHTML = "";
  caseCatalog.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.key;
    option.textContent = `${item.title} / ${item.category}`;
    caseSelect.appendChild(option);
  });
  updateCasePreview();
}

function updateCasePreview() {
  const item = getCase(caseSelect.value);
  casePreview.innerHTML = `
    <strong>${item.requester}</strong>
    <p>${item.summary}</p>
    <small>${item.category} / ${item.expectedSpecialist}</small>
  `;
}

function renderQueue() {
  queueList.innerHTML = "";
  conversations.forEach((conversation) => {
    const agent = getAgent(conversation.agentId);
    const item = document.createElement("button");
    item.type = "button";
    item.className = `queue-item ${conversation.id === activeId ? "active" : ""}`;
    item.innerHTML = `
      <div class="queue-top">
        <strong>${conversation.id}</strong>
        <span class="badge ${agent.type === "bot" ? "bot" : "human"}">${agent.name}</span>
      </div>
      <p class="queue-summary">${conversation.summary}</p>
      <div class="queue-meta">
        <span class="badge ${conversation.risk === "critical" || conversation.risk === "high" ? "critical" : "risk"}">${conversation.urgency}</span>
        <span>${conversation.sla} min SLA</span>
      </div>
    `;
    item.addEventListener("click", () => {
      activeId = conversation.id;
      render();
    });
    queueList.appendChild(item);
  });
  metricQueue.textContent = conversations.length.toString();
}

function renderMessages(conversation) {
  messages.innerHTML = "";
  conversation.messages.forEach((message) => {
    const row = document.createElement("div");
    row.className = `message ${message.type}`;
    row.innerHTML = `
      <span class="author">${message.author}</span>
      <div class="bubble">${message.text}</div>
    `;
    messages.appendChild(row);
  });
  messages.scrollTop = messages.scrollHeight;
}

function renderContext(conversation) {
  const agent = getAgent(conversation.agentId);
  conversationTitle.textContent = conversation.title;
  conversationEyebrow.textContent = `${conversation.requester} / Teams`;
  agentChip.innerHTML = `<i data-lucide="${agent.type === "bot" ? "bot" : "user-round"}"></i><span>${agent.name}</span>`;
  classificationText.textContent = conversation.category;
  classificationMeta.textContent = `Impacto ${conversation.impact.toLowerCase()}, urgencia ${conversation.urgency.toLowerCase()}`;
  advisorText.textContent = conversation.advisor;
  ticketPill.textContent = conversation.glpi ? conversation.glpi : "GLPI pendiente";
  ticketPill.className = `ticket-pill ${conversation.glpi ? "ok" : ""}`;
}

function renderAgents() {
  agentRoster.innerHTML = "";
  agents.forEach((agent) => {
    const row = document.createElement("div");
    row.className = "agent-row";
    const initials = agent.type === "bot" ? agent.name.slice(0, 1) : agent.name.split(" ").map((part) => part[0]).join("").slice(0, 2);
    row.innerHTML = `
      <div class="agent-avatar">${initials}</div>
      <div>
        <strong>${agent.name}</strong>
        <small>${agent.variant} / ${agent.active} de ${agent.max}</small>
      </div>
      <span class="availability ${agent.availability === "busy" ? "busy" : ""}">${agent.availability === "busy" ? "Ocupado" : "Disponible"}</span>
    `;
    agentRoster.appendChild(row);
  });
}

function renderTimeline(conversation) {
  timeline.innerHTML = "";
  conversation.timeline.slice(-5).forEach((event) => {
    const item = document.createElement("li");
    item.innerHTML = `${event}<small>Trace ID activo</small>`;
    timeline.appendChild(item);
  });
}

function render() {
  const conversation = getActiveConversation();
  renderQueue();
  renderMessages(conversation);
  renderContext(conversation);
  renderAgents();
  renderTimeline(conversation);
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function addSystemEvent(conversation, event) {
  conversation.timeline.push(event);
  conversation.messages.push({ author: "Sistema", type: "system", text: event });
}

async function runAgentAction(action, operatorInput = "") {
  try {
    const result = await callAgent(action, operatorInput);
    applyAgentResult(result, action);
  } catch (error) {
    setConnectionStatus("Error IA", "error");
    const conversation = getActiveConversation();
    addSystemEvent(conversation, `No se pudo llamar al agente IA: ${error.message}. Se conserva modo manual.`);
    render();
  }
}

document.getElementById("sendBtn").addEventListener("click", () => {
  const conversation = getActiveConversation();
  const agent = getAgent(conversation.agentId);
  const value = replyInput.value.trim();
  if (!value) return;
  conversation.messages.push({ author: agent.name, type: "agent", text: value });
  conversation.timeline.push(`Respuesta enviada por ${agent.name}`);
  render();
});

document.getElementById("takeBtn").addEventListener("click", () => {
  const conversation = getActiveConversation();
  conversation.agentId = "kevin";
  addSystemEvent(conversation, "Kevin Castro tomo la conversacion con resumen de contexto.");
  render();
});

document.getElementById("advisorBtn").addEventListener("click", () => {
  runAgentAction("advisor");
});

document.getElementById("testAgentBtn").addEventListener("click", () => {
  runAgentAction("advisor", "Prueba de conexion desde el mockup local.");
});

document.getElementById("saveConfigBtn").addEventListener("click", () => {
  saveConfigFromForm();
});

document.getElementById("createTicketBtn").addEventListener("click", () => {
  const conversation = getActiveConversation();
  if (!conversation.glpi) {
    conversation.glpi = `GLPI-${Math.floor(88400 + Math.random() * 90)}`;
    addSystemEvent(conversation, `${conversation.glpi} creado con resumen, categoria e impacto.`);
  } else {
    addSystemEvent(conversation, `${conversation.glpi} ya estaba creado; se agrego seguimiento.`);
  }
  render();
});

document.getElementById("syncBtn").addEventListener("click", () => {
  const conversation = getActiveConversation();
  addSystemEvent(conversation, conversation.glpi ? `${conversation.glpi} sincronizado via GLPI Adapter.` : "Sync pendiente: se requiere crear ticket GLPI.");
  render();
});

document.getElementById("reassignBtn").addEventListener("click", () => {
  const conversation = getActiveConversation();
  const target = conversation.category.includes("Telefonia") ? "andrea" : conversation.risk === "high" || conversation.risk === "critical" ? "atlas" : "kevin";
  conversation.agentId = target;
  const agent = getAgent(target);
  addSystemEvent(conversation, `Reasignado a ${agent.name} por especialidad: ${agent.variant}.`);
  render();
});

document.getElementById("simulateBtn").addEventListener("click", () => {
  const template = caseCatalog[requestIndex % caseCatalog.length];
  const rotation = ["nova", "atlas", "cora", "kevin"];
  const assignedAgent = template.risk === "critical" ? "atlas" : rotation[agentRotation % rotation.length];
  const nextNumber = 1043 + conversations.length;
  const newConversation = createConversationFromCase(template, `HD-${nextNumber}`, assignedAgent);
  conversations = [newConversation, ...conversations];
  activeId = newConversation.id;
  requestIndex += 1;
  agentRotation += 1;
  render();
});

document.getElementById("loadCaseBtn").addEventListener("click", () => {
  const template = getCase(caseSelect.value);
  const nextNumber = 1043 + conversations.length;
  const newConversation = createConversationFromCase(template, `HD-${nextNumber}`, template.preferredAgent);
  conversations = [newConversation, ...conversations];
  activeId = newConversation.id;
  agentSelect.value = template.preferredAgent;
  aiConfig.agentId = template.preferredAgent;
  addSystemEvent(newConversation, `Caso especifico cargado: ${template.key}.`);
  render();
});

caseSelect.addEventListener("change", updateCasePreview);
agentSelect.addEventListener("change", saveConfigFromForm);
apiFormatSelect.addEventListener("change", saveConfigFromForm);
authHeaderSelect.addEventListener("change", saveConfigFromForm);
modelInput.addEventListener("change", saveConfigFromForm);
apiUrlInput.addEventListener("change", saveConfigFromForm);

loadSavedConfig();
renderCaseOptions();
render();
