---
title: Mesa de Ayuda Inteligente Ternova - PRD
version: 0.1
status: Draft
fecha: 2026-07-06
owner: TI Ternova
clasificacion: Uso Interno
fuente: Conversacion Andres Lastra / Kevin Castro, 2026-07-06
---

# Mesa de Ayuda Inteligente Ternova - Product Requirements Document

**Document Version:** 0.1  
**Last Updated:** 2026-07-06  
**Status:** Draft  
**Owner:** TI Ternova  
**Clasificacion:** Uso Interno

## Executive Summary

**TL;DR:** La Mesa de Ayuda Inteligente sera un canal de soporte en Microsoft Teams donde un pool mixto de agentes humanos N1 y agentes IA atiende solicitudes de TI, clasifica el caso, resuelve lo repetitivo, reasigna al especialista correcto y sincroniza el expediente con GLPI. El bot DGX Spark no sera el unico primer nivel: funcionara como asesor y agente N1 dentro del pool, con tres configuraciones/personas operativas comparables para aprender cual resuelve mejor.

**Problem Statement:** El soporte N1 recibe solicitudes variadas por canales conversacionales y debe decidir rapido si resuelve, documenta, escala o reasigna. Hoy la urgencia de respuesta puede hacer que se asigne a cualquier tecnico disponible, aunque no sea el mas idoneo, y GLPI puede quedar como actividad posterior en vez de ser el registro vivo del caso.

**Proposed Solution:** Crear una experiencia tipo call center conversacional: el usuario escribe en Teams a un unico punto de contacto, entra a una cola, y el orquestador asigna la conversacion a un humano N1 o a un bot N1. El sistema conserva el mismo hilo para el usuario aunque cambie quien atiende, propone reasignaciones por especialidad, mantiene contexto compartido, crea/actualiza tickets en GLPI y publica eventos de trazabilidad por Service Bus.

**Success Metrics:**
- Reducir el tiempo medio de primera respuesta a menos de 60 segundos.
- Lograr precision de clasificacion/escalamiento >= 85% en el MVP.
- Resolver al menos 45% de solicitudes N1 repetitivas sin escalamiento en fase piloto.
- Sincronizar 99% de casos elegibles con GLPI sin intervencion manual.
- Mantener CSAT >= 4.2/5 en usuarios piloto.

## 1. Product Overview

### 1.1 Vision & Objectives

**Vision:** Convertir la mesa de ayuda de TI en un servicio conversacional, medible y auditable, donde IA y humanos colaboran sin romper la experiencia del usuario ni la gobernanza operativa.

**Primary Objectives:**
- Centralizar la atencion inicial de soporte TI en Teams con una identidad unica de mesa de ayuda.
- Operar un pool N1 mixto con humanos y tres agentes IA configurables, medibles y comparables.
- Crear, enriquecer, comentar, reasignar y cerrar tickets en GLPI desde el flujo conversacional.
- Reducir tiempos muertos de triage y asignar casos a la persona o grupo adecuado segun categoria, activo, ubicacion, criticidad y disponibilidad.
- Cumplir PT-ARQ-004, PT-IA-003, TE-005 y POL-TIC-001 desde el diseno.

### 1.2 Target Audience

**Primary Users:**
- **Colaborador solicitante:** Usuario de Ternova que reporta problemas de acceso, equipo, aplicaciones, telefonia, red o servicios TI desde Teams.
- **Soporte N1 humano:** Tecnicos de primera linea que atienden cola, validan diagnosticos de IA, toman conversaciones, resuelven y escalan.
- **Agente IA N1:** Configuraciones de bot que responden, diagnostican, consultan base de conocimiento y proponen acciones con supervision humana proporcional al riesgo.

**Secondary Users/Stakeholders:**
- Soporte N2 y especialistas por dominio: telefonia, infraestructura, aplicaciones, redes, seguridad, activos.
- Coordinador de Mesa de Ayuda: monitorea SLAs, cola, calidad, rotacion y reasignaciones.
- Arquitectura, Seguridad, Datos e IA: validan cumplimiento, trazabilidad, riesgos y excepciones.
- Usuarios administradores de GLPI: gobiernan categorias, grupos, usuarios, reglas y estados.

### 1.3 Scope

**In Scope (MVP/Phase 1):**
- Canal Teams para solicitudes de soporte TI.
- Consola web/mockup operacional para ver cola, conversaciones, agentes, ticket GLPI y recomendaciones.
- Pool N1 mixto con asignacion a humano o bot.
- Tres variantes de bot N1:
  - **Nova:** resolucion rapida y autoservicio guiado.
  - **Atlas:** cumplimiento, seguridad y politicas.
  - **Cora:** diagnostico paso a paso para hardware, red, telefonia y aplicaciones.
- Triage automatico: categoria, urgencia, impacto, activo afectado, datos faltantes y probabilidad de resolucion N1.
- Reasignacion a persona/grupo adecuado con motivo y evidencia.
- Creacion y actualizacion de ticket GLPI.
- Resumen conversacional para GLPI y para transferencia humana.
- Auditoria de cambios de asignacion, prompts, respuestas, herramientas y eventos.
- Tablero basico de SLA, FCR, cola y precision de escalamiento.

**Out of Scope (Future Phases):**
- Reemplazar GLPI como ITSM.
- Automatizaciones de alto riesgo sin aprobacion humana.
- Control remoto de equipos desde el bot.
- WhatsApp productivo; puede quedar como canal futuro si pasa por los mismos servicios.
- Entrenamiento de modelo propio MLOps; el MVP usa agentes configurados y RAG/control de herramientas.
- Integraciones directas punto a punto entre Teams, GLPI, AD, Azure o DGX Spark.

**Non-Goals:**
- No crear usuarios locales ni credenciales fuera de Entra ID.
- No guardar secretos, tokens o contrasenas en prompts, logs, Obsidian, GLPI ni base conversacional.
- No enviar datos personales/confidenciales a LLM externos sin clasificacion, tokenizacion y aprobacion.

## 2. User Stories & Requirements

### 2.1 Core User Stories

**Epic 1: Solicitud Conversacional**

**User Story 1.1: Crear solicitud por Teams**
- **Story:** Como colaborador, quiero escribir a Mesa de Ayuda en Teams, para recibir soporte sin buscar a la persona correcta.
- **Acceptance Criteria:**
  - Given un usuario autenticado en Entra ID, when escribe al canal/bot de mesa de ayuda, then el sistema crea una conversacion con ID unico.
  - Given una solicitud nueva, when se recibe el primer mensaje, then el sistema captura usuario, area, ubicacion y canal de origen.
  - Given informacion insuficiente, when el agente responde, then solicita solo los datos necesarios para clasificar el caso.
- **Priority:** Must-Have
- **Estimated Effort:** M

**User Story 1.2: Experiencia de continuidad**
- **Story:** Como colaborador, quiero seguir hablando en el mismo hilo aunque cambie quien atiende, para no repetir mi problema.
- **Acceptance Criteria:**
  - Given un cambio de agente, when se reasigna la conversacion, then el hilo muestra continuidad y no exige repetir contexto.
  - Given transferencia a humano, when el humano toma el caso, then recibe resumen, historial y siguiente accion recomendada.
- **Priority:** Must-Have
- **Estimated Effort:** M

**Epic 2: Pool Mixto N1**

**User Story 2.1: Rotacion de agentes**
- **Story:** Como coordinador de soporte, quiero que solicitudes N1 se asignen entre bots y humanos, para medir desempeno y balancear carga.
- **Acceptance Criteria:**
  - Given disponibilidad de agentes, when entra una solicitud, then el orquestador aplica reglas de rotacion y capacidad.
  - Given una categoria sensible, when el caso requiere humano, then el sistema evita asignacion automatica a bot sin aprobacion.
  - Given bots Nova, Atlas y Cora, when se asignan casos, then cada variante queda etiquetada para comparar resultados.
- **Priority:** Must-Have
- **Estimated Effort:** L

**User Story 2.2: Asesor DGX Spark**
- **Story:** Como tecnico N1, quiero que DGX Spark me sugiera diagnostico y respuesta, para resolver mas rapido sin perder control humano.
- **Acceptance Criteria:**
  - Given un caso tomado por humano, when solicita asistencia, then el asesor genera hipotesis, preguntas y pasos recomendados.
  - Given una accion riesgosa, when la IA la sugiere, then queda marcada como requiere aprobacion humana.
  - Given una respuesta generada, when se envia al usuario, then se registra version de agente, prompt metadata y decision del operador.
- **Priority:** Must-Have
- **Estimated Effort:** L

**Epic 3: Ticketing GLPI**

**User Story 3.1: Crear ticket desde conversacion**
- **Story:** Como agente N1, quiero crear ticket GLPI con el resumen de la conversacion, para que el expediente oficial este completo.
- **Acceptance Criteria:**
  - Given una solicitud clasificada, when se decide registrar ticket, then se crea ticket GLPI con categoria, solicitante, descripcion, urgencia e impacto.
  - Given error de GLPI, when falla la creacion, then el caso queda en cola de reintento y se alerta al operador.
  - Given ticket creado, when continua la conversacion, then comentarios relevantes se sincronizan como seguimiento.
- **Priority:** Must-Have
- **Estimated Effort:** M

**User Story 3.2: Reasignacion al especialista adecuado**
- **Story:** Como N1, quiero reasignar un caso a la persona/grupo correcto, para reducir vueltas y tiempos de espera.
- **Acceptance Criteria:**
  - Given categoria telefonia, activo especifico o aplicacion, when el sistema detecta especialidad, then propone grupo/persona con justificacion.
  - Given aprobacion del operador, when se reasigna, then se actualiza GLPI y se publica evento de asignacion.
  - Given falta de especialista disponible, when nadie puede tomarlo, then queda en cola del grupo con SLA visible.
- **Priority:** Must-Have
- **Estimated Effort:** M

**Epic 4: Gobierno, Seguridad y Trazabilidad**

**User Story 4.1: Auditoria integral**
- **Story:** Como Seguridad/Arquitectura, quiero trazabilidad completa de decisiones, prompts y herramientas, para auditar el flujo de IA.
- **Acceptance Criteria:**
  - Given una respuesta de IA, when se genera, then se registra agente, version, parametros, clasificacion de datos, resultado y aprobador si aplica.
  - Given datos sensibles detectados, when se envia a IA, then el sistema bloquea o tokeniza segun politica aprobada.
  - Given incidente, when se identifica comportamiento anomalo, then se crea registro GLPI y alerta en monitoreo.
- **Priority:** Must-Have
- **Estimated Effort:** L

### 2.2 Functional Requirements

**Feature 1: Canal conversacional Teams**
- FR-1.1: El sistema debe autenticar usuarios con Entra ID.
- FR-1.2: El sistema debe mantener una conversacion persistente por solicitud.
- FR-1.3: El sistema debe permitir transferencia transparente entre bot y humano.
- FR-1.4: El sistema debe publicar eventos de mensajes recibidos y enviados.

**Feature 2: Orquestador de asignacion**
- FR-2.1: El sistema debe asignar solicitudes segun reglas de capacidad, especialidad, horario, categoria y nivel de riesgo.
- FR-2.2: El sistema debe soportar agentes humanos y agentes IA como miembros del pool N1.
- FR-2.3: El sistema debe registrar toda reasignacion con motivo, origen, destino y actor.
- FR-2.4: El sistema debe permitir takeover humano inmediato.

**Feature 3: Motor de IA / DGX Spark**
- FR-3.1: El sistema debe soportar tres configuraciones de bot con prompts/versiones separadas.
- FR-3.2: El sistema debe consultar conocimiento autorizado antes de responder cuando aplique.
- FR-3.3: El sistema debe bloquear ejecucion automatica de acciones sensibles sin aprobacion.
- FR-3.4: El sistema debe registrar trazabilidad de prompt y respuesta con redaccion de datos sensibles.

**Feature 4: Integracion GLPI**
- FR-4.1: El sistema debe crear tickets GLPI por API versionada expuesta via APIM.
- FR-4.2: El sistema debe actualizar comentarios, asignaciones, categorias y estados.
- FR-4.3: El sistema debe reintentar errores temporales y enviar fallos persistentes a Dead Letter Queue.
- FR-4.4: El sistema debe evitar exponer tokens GLPI fuera de Key Vault/sidecar seguro en prototipo.

**Feature 5: Consola de operador**
- FR-5.1: El operador debe ver cola, SLA, solicitante, agente asignado, bot variant, categoria y estado GLPI.
- FR-5.2: El operador debe enviar mensajes, tomar conversacion, reasignar y sincronizar GLPI.
- FR-5.3: El operador debe ver recomendaciones DGX Spark y aprobar/descartar acciones.
- FR-5.4: El operador debe ver un resumen listo para escalamiento.

### 2.3 Non-Functional Requirements

**Performance:**
- Primera respuesta automatica: p95 < 60 segundos.
- Triage inicial: p95 < 2 minutos desde primer mensaje.
- API interna: p95 < 800 ms para operaciones no-LLM.
- Sincronizacion GLPI: p95 < 10 segundos cuando GLPI responde normalmente.

**Security:**
- Identidad centralizada en Entra ID, OAuth2/JWT y RBAC.
- Secretos exclusivamente en Key Vault para Azure; sidecar protegido solo permitido en prototipo controlado.
- TLS 1.2+; mTLS para integraciones internas criticas si aplica.
- Cifrado en reposo para bases de datos y logs.
- Rate limiting en APIM.
- Sanitizacion de entrada/salida para prevenir prompt injection, inyecciones y filtracion.

**Scalability:**
- MVP piloto: 4 agentes N1 humanos, 3 bots, 100 usuarios piloto.
- Fase 2: 25 agentes, 2,000 usuarios internos, multiples ubicaciones.
- Arquitectura desacoplada por eventos para crecer canales y dominios.

**Reliability:**
- Uptime objetivo MVP: 99.5%; produccion: 99.9%.
- DLQ obligatoria para eventos fallidos.
- RPO 15 minutos para datos operativos; RTO 4 horas MVP, 1 hora produccion.
- Modo degradado: si IA no responde, cola pasa a humano; si GLPI falla, se conserva expediente temporal y reintentos.

**Accessibility:**
- Consola web WCAG 2.1 AA.
- Navegacion por teclado.
- Contraste AA en todos los estados criticos.
- Mensajes claros sin depender solo de color.

## 3. Technical Specifications

### 3.1 Recommended Tech Stack

**Frontend:**
- React + TypeScript para consola operacional.
- CSS/Tailwind o design tokens Ternova segun repositorio final.
- Microsoft Teams Toolkit para canal Teams/Bot si se implementa app Teams.
- Rationale: stack ya familiar en proyectos Ternova y compatible con UI operacional.

**Backend:**
- .NET 8 o Node.js/NestJS para servicios BFF/orquestador.
- REST APIs versionadas `/api/v1/` con OpenAPI.
- Workers para eventos en Azure Functions/Container Apps.
- Rationale: servicios desacoplados, contenedorizables y gobernables por APIM.

**Database:**
- PostgreSQL o Azure SQL por servicio.
- Redis para presencia/capacidad/locks de asignacion.
- Blob Storage/Data Lake para adjuntos permitidos y auditoria inmutable.
- Rationale: database-per-service, consistencia operativa y separacion de dominios.

**AI Runtime:**
- DGX Spark / runtime local autorizado para inferencia privada donde aplique.
- Azure OpenAI solo si los datos estan clasificados y aprobados; datos sensibles tokenizados.
- RAG sobre base de conocimiento aprobada.
- Rationale: minimizar exposicion de datos y permitir comparacion de agentes.

**Infrastructure:**
- Azure APIM, Azure Service Bus Topics + Queues + DLQ, Key Vault, Entra ID, Application Insights, Azure Monitor, Log Analytics, Sentinel.
- Contenedores en AKS o Azure Container Apps.
- IaC con Terraform/Bicep y despliegue por CI/CD.

### 3.2 Data Models

**Entity: Conversation**
```json
{
  "id": "uuid",
  "channel": "teams",
  "externalThreadId": "string",
  "requesterEntraId": "uuid",
  "requesterDisplayName": "string",
  "status": "new | triage | active | waiting_user | assigned | resolved | closed",
  "currentAgentId": "uuid",
  "currentAgentType": "human | bot",
  "riskLevel": "low | medium | high | critical",
  "classification": {
    "category": "string",
    "subcategory": "string",
    "impact": "low | medium | high",
    "urgency": "low | medium | high"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Entity: Agent**
```json
{
  "id": "uuid",
  "name": "Nova | Atlas | Cora | human name",
  "type": "bot | human",
  "version": "string",
  "skills": ["password", "hardware", "telephony", "security", "applications"],
  "availability": "available | busy | offline",
  "maxConcurrentConversations": 3,
  "riskAllowed": ["low", "medium"],
  "entraObjectId": "uuid optional"
}
```

**Entity: TicketLink**
```json
{
  "id": "uuid",
  "conversationId": "uuid",
  "glpiTicketId": "string",
  "glpiStatus": "new | assigned | pending | solved | closed",
  "lastSyncAt": "timestamp",
  "syncStatus": "ok | pending | failed",
  "lastError": "string optional"
}
```

**Entity: PromptAudit**
```json
{
  "id": "uuid",
  "conversationId": "uuid",
  "agentId": "uuid",
  "agentVersion": "string",
  "dataClassification": "publica | uso_interno | confidencial | restringido",
  "promptHash": "sha256",
  "responseHash": "sha256",
  "toolCalls": ["glpi_search_kb", "glpi_create_ticket"],
  "humanApproved": true,
  "createdAt": "timestamp"
}
```

### 3.3 API Specifications

Contratos iniciales en [helpdesk-bff.openapi.yaml](api/helpdesk-bff.openapi.yaml).

Key endpoints:
- `POST /api/v1/conversations`
- `POST /api/v1/conversations/{conversationId}/messages`
- `POST /api/v1/conversations/{conversationId}/assignments`
- `POST /api/v1/conversations/{conversationId}/glpi-ticket`
- `POST /api/v1/ai/triage`
- `GET /api/v1/agents`
- `GET /api/v1/queue`

### 3.4 Third-Party Integrations

**Microsoft Teams / Bot Framework**
- **Purpose:** Canal principal de solicitudes.
- **Authentication:** Entra ID/OAuth.
- **Data Flow:** Teams envia mensajes al Channel Adapter via APIM/BFF; eventos internos a Service Bus.
- **Cost:** Depende de licenciamiento Microsoft 365 existente y consumo Azure.

**GLPI**
- **Purpose:** Sistema oficial de registro ITSM.
- **Authentication:** Token/API protegido en Key Vault; no expuesto al cliente.
- **Data Flow:** Helpdesk Orchestrator publica comando; GLPI Adapter consume y llama GLPI via APIM/servicio gobernado.
- **Rate Limits:** Confirmar configuracion GLPI productiva.
- **Cost:** Infraestructura y mantenimiento interno.

**Entra ID / Microsoft Graph**
- **Purpose:** Identidad, perfiles, grupos, posible autoservicio de acciones de bajo riesgo.
- **Authentication:** Client Credentials con App Registration por componente.
- **Data Flow:** Consultas de perfil/grupos y acciones aprobadas.
- **Risk:** Operaciones sensibles requieren step-up MFA y aprobacion humana segun politica.

**DGX Spark / AI Runtime**
- **Purpose:** Inferencia local/privada, asesor N1 y variantes de bot.
- **Authentication:** Servicio interno protegido; sin exposicion publica.
- **Data Flow:** Orquestador envia contexto minimo clasificado; runtime responde con recomendacion o mensaje.
- **Risk:** Debe registrar versiones, prompts, parametros, costos/uso e indicadores de calidad.

### 3.5 System Architecture

La arquitectura objetivo se documenta en [ADD.md](ADD.md). Resumen:

1. Teams recibe solicitud y autentica al usuario.
2. Channel Adapter normaliza el mensaje y publica `support.request.received`.
3. Conversation Orchestrator clasifica, asigna y crea contexto.
4. AI Orchestrator consulta DGX Spark o KB autorizada si el caso lo permite.
5. Assignment Service rota entre bots y humanos.
6. GLPI Adapter crea/actualiza ticket por API gobernada.
7. Audit/Observability registra trazas, prompts, tool calls y SLAs.

## 4. User Experience & Design

### 4.1 Design Principles

- **Continuidad visible:** el usuario siempre habla con Mesa de Ayuda, aunque cambie el operador detras.
- **Control humano proporcional:** IA resuelve bajo riesgo y asiste en riesgo medio; riesgo alto escala.
- **Menos friccion, mas evidencia:** pedir solo datos faltantes y registrar decisiones automaticamente.
- **Operabilidad antes que marketing:** consola densa, clara, escaneable y enfocada en accion.
- **Identidad Ternova:** usar design tokens, tipografia, indigo/papel/naranja y tono corporativo.

### 4.2 Key User Flows

**Flow 1: Solicitud general N1**
1. Usuario escribe a Mesa de Ayuda en Teams.
2. Sistema registra conversacion y responde primera confirmacion.
3. Triage pregunta datos faltantes.
4. Orquestador asigna a bot o humano N1.
5. Agente resuelve o crea ticket GLPI.
6. Usuario recibe estado y siguiente paso.

**Flow 2: Reasignacion especializada**
1. Caso entra como "telefono celular no registrado en GLPI".
2. Bot/humano identifica categoria telefonia + activo no inventariado.
3. Sistema propone especialista Telefonia Movil.
4. Operador aprueba reasignacion.
5. GLPI se actualiza con grupo/persona y resumen.
6. Usuario recibe notificacion: "Se asigno al tecnico X".

**Flow 3: Asesor DGX para humano**
1. Humano toma conversacion.
2. Solicita recomendacion DGX Spark.
3. Sistema genera diagnostico, preguntas y posibles pasos.
4. Humano aprueba mensaje o accion.
5. Auditoria registra aprobacion y version del agente.

### 4.3 UI/UX Requirements

- Consola con tres zonas: cola, conversacion, contexto/ticket.
- Indicador claro de operador actual: humano o bot variant.
- Botones de accion rapida con iconos: tomar, reasignar, crear ticket, sincronizar GLPI, pedir asesor.
- Estados de riesgo y SLA no solo por color; tambien texto.
- Comparador de bots por version, categoria y resultado.
- No mostrar prompts crudos al usuario final; solo resumen operacional autorizado.

### 4.4 Design Assets

- Design System: `/Users/alastra/Documents/Ternova Design System 2.zip`.
- Mockup: `../mockup/index.html`.
- Logos y fuentes extraidos localmente en `../mockup/assets/`.

## 5. Implementation Plan

### 5.1 Development Phases

**Phase 0: Gobierno y factibilidad (1-2 semanas)**
- Acta de Constitucion/TDR.
- Clasificacion de datos y matriz de riesgos IA.
- Validacion Arquitectura, Seguridad, Datos e IA.
- Confirmar GLPI API/token de servicio y permisos.
- Deliverables: TDR, matriz de factibilidad, riesgos, ADD/ADR aprobados.

**Phase 1: Prototype funcional (2-4 semanas)**
- Mockup clickable y pruebas con usuarios N1.
- Simulador de pool/rotacion y GLPI fake.
- Definicion de categorias y reglas iniciales.
- Deliverables: prototipo, flujo validado, backlog MVP.

**Phase 2: MVP integrado (6-8 semanas)**
- Teams channel adapter.
- Orquestador de conversaciones/asignacion.
- GLPI Adapter.
- AI Orchestrator con tres bot variants.
- Observabilidad y auditoria.
- Deliverables: MVP en Dev/QA, OpenAPI, runbooks, pruebas.

**Phase 3: Piloto controlado (4 semanas)**
- Piloto con N1 y grupo de usuarios internos.
- Medicion de precision, FCR, CSAT y tiempos.
- Ajuste de prompts/reglas.
- Deliverables: informe piloto, plan de produccion, aprobaciones.

**Phase 4: Produccion gradual (4-6 semanas)**
- Despliegue por gestion de cambios.
- Entrenamiento N1/N2.
- Monitoreo SLO y costos.
- Deliverables: release productivo, dashboard, transferencia operativa.

### 5.2 Task Dependencies

```text
Gobierno/TDR -> ADD/ADR -> Contratos API -> Prototype UX
       |              |           |
       v              v           v
 Seguridad     Infra/IaC     GLPI/Teams adapters
       \              |           /
        -> MVP integrado -> Piloto -> Produccion
```

### 5.3 Resource Requirements

**Development Team:**
- Product Owner TI: priorizacion y aceptacion.
- Arquitecto Empresarial: arquitectura, integraciones y cumplimiento PT-ARQ-004.
- Arquitecto IA/Datos/Seguridad: gobierno IA, datos, riesgos, privacidad.
- 1-2 Backend Engineers: orquestador, adapters, eventos, APIs.
- 1 Frontend Engineer: consola y Teams app.
- 1 QA/Automation: pruebas funcionales, integracion, seguridad basica.
- Soporte N1/N2: pruebas de flujo, KB y transferencia.

**Tools & Services:**
- Azure APIM, Service Bus, Key Vault, App Insights, Log Analytics.
- GLPI API.
- Microsoft Teams/Bot Framework.
- DGX Spark/runtime IA.
- ACR + Container Apps/AKS.

**Cost Notes:** Pendiente estimacion formal en evaluacion economica TE-005. Debe incluir infraestructura Azure, runtime IA, almacenamiento de logs, soporte operativo y horas equipo.

## 6. Testing Strategy

### 6.1 Testing Types

**Unit Testing:**
- Coverage target: >=70%.
- Reglas de routing, sanitizacion, mapeo GLPI, evaluacion de riesgos.

**Integration Testing:**
- APIM + orquestador.
- Service Bus topics/queues/DLQ.
- GLPI Adapter contra ambiente QA.
- Teams/Bot Framework.
- Entra ID auth/RBAC.

**End-to-End Testing:**
- Nueva solicitud, bot responde, ticket GLPI creado.
- Humano toma conversacion y reasigna.
- Fallo GLPI con reintento y DLQ.
- Riesgo alto bloquea respuesta automatica.

**AI Evaluation:**
- Precision de clasificacion.
- Calidad de resumen para transferencia.
- Deteccion de datos sensibles.
- Resistencia a prompt injection.
- Comparacion Nova/Atlas/Cora por categoria.

**Performance Testing:**
- 100 conversaciones concurrentes piloto.
- Carga de cola y asignacion.
- Tiempos de respuesta sin IA y con IA.

### 6.2 Test Scenarios

**Scenario 1: Password reset bajo riesgo**
- **Given:** usuario autenticado y validado por Entra ID.
- **When:** solicita ayuda de contrasena.
- **Then:** bot guia autoservicio o crea ticket, sin ejecutar acciones privilegiadas sin aprobacion/flujo autorizado.

**Scenario 2: Equipo fisico con especialista**
- **Given:** usuario reporta problema de laptop.
- **When:** triage detecta hardware y ubicacion.
- **Then:** sistema propone tecnico/grupo correcto y genera ticket con activo si existe.

**Scenario 3: Telefono no inventariado**
- **Given:** usuario reporta celular no registrado en GLPI.
- **When:** triage detecta telefonia y falta de activo.
- **Then:** se asigna a especialista de telefonia y GLPI recibe resumen con dato faltante.

## 7. Success Metrics & Analytics

### 7.1 Key Performance Indicators

**Adoption Metrics:**
- Usuarios piloto activos por semana.
- Porcentaje de solicitudes creadas via Teams vs canales alternos.
- Porcentaje de agentes N1 usando consola.

**Engagement Metrics:**
- Conversaciones atendidas por bot/humano.
- Tasa de takeover humano.
- Tiempo medio hasta primer mensaje util.

**Business Metrics:**
- First Contact Resolution (FCR).
- Precision de escalamiento.
- Tiempo medio de asignacion a especialista.
- SLA compliance por categoria.
- CSAT.
- Reduccion de tickets mal categorizados.

**AI Governance Metrics:**
- Respuestas bloqueadas por politica.
- Prompts con datos sensibles detectados.
- Acciones IA aprobadas/descartadas por humanos.
- Incidentes IA registrados en GLPI.

### 7.2 Analytics Implementation

**Events to Track:**
- `support.request.received`
- `conversation.triage.completed`
- `assignment.changed`
- `ai.response.generated`
- `ai.response.approved`
- `glpi.ticket.created`
- `glpi.sync.failed`
- `sla.warning`
- `case.resolved`

**Analytics Tools:**
- Application Insights.
- Log Analytics.
- Power BI para dashboard operativo.
- GLPI para metricas ITSM oficiales.

## 8. Risk Assessment

### 8.1 Technical Risks

**Risk 1: Integracion directa no gobernada con GLPI/Teams**
- **Probability:** Medium
- **Impact:** High
- **Mitigation:** APIM para sync APIs, Service Bus para eventos, ADR obligatorio y waiver solo si hay prototipo temporal controlado.

**Risk 2: IA entrega respuesta incorrecta o riesgosa**
- **Probability:** Medium
- **Impact:** High
- **Mitigation:** Guardrails, acciones sensibles con aprobacion humana, evaluaciones, versionado de prompts, rollback de bot variant.

**Risk 3: Datos sensibles en prompts**
- **Probability:** Medium
- **Impact:** Critical
- **Mitigation:** Clasificacion, minimizacion, redaccion/tokenizacion, runtime local cuando aplique, bloqueo de LLM externo.

**Risk 4: GLPI API/token no disponible**
- **Probability:** Medium
- **Impact:** Medium
- **Mitigation:** Resolver token servicio, smoke tests, ambiente QA, cola de reintento, DLQ.

### 8.2 Business Risks

**Risk 1: Resistencia de soporte por percepcion de sustitucion**
- **Probability:** Medium
- **Impact:** Medium
- **Mitigation:** Posicionar DGX como asesor y miembro del pool, no reemplazo; medir carga reducida y calidad.

**Risk 2: Usuarios confunden cambio de agente**
- **Probability:** Medium
- **Impact:** Medium
- **Mitigation:** Mensajes de continuidad, nombre Mesa de Ayuda como identidad primaria y resumen automatico.

**Risk 3: Categorias GLPI insuficientes**
- **Probability:** High
- **Impact:** Medium
- **Mitigation:** Sprint de taxonomia GLPI antes del piloto; reglas de fallback y "datos faltantes".

## 9. Launch Plan

### 9.1 Go-Live Checklist

- [ ] TDR/Acta de Constitucion aprobada.
- [ ] ADD/ADR revisados por Architecture Board.
- [ ] Matriz de riesgos IA aprobada.
- [ ] Seguridad valida Entra ID, RBAC, Key Vault, TLS, rate limiting y logging.
- [ ] OpenAPI publicado.
- [ ] Infraestructura como codigo y pipeline CI/CD.
- [ ] Pruebas E2E y evaluaciones IA superadas.
- [ ] GLPI QA/productivo validado.
- [ ] Runbook, rollback y transferencia N1/N2 listos.
- [ ] Dashboard SLO activo.

### 9.2 Rollout Strategy

- **Beta:** Equipo TI + usuarios internos controlados.
- **Soft Launch:** 1-2 areas con volumen moderado.
- **Full Launch:** Toda Ternova, luego expansion a otros canales si se aprueba.

### 9.3 Post-Launch Activities

- Revision semanal de precision de clasificacion y casos fallidos.
- Reentrenamiento/configuracion de prompts segun evidencias.
- Ajuste de reglas de routing y disponibilidad.
- Reporte mensual de costos/ROI y metricas TE-005 durante los primeros tres meses.

## 10. Future Roadmap

### 10.1 Phase 2 Features (3-6 months)

- Integracion controlada con Microsoft Graph para acciones aprobadas.
- Knowledge base curada en GLPI/RAG.
- Adjuntos y evidencias con clasificacion automatica.
- Reglas avanzadas de workforce management.
- Aprendizaje de categorias basado en resoluciones GLPI.

### 10.2 Long-term Vision (6-12 months)

- Omnicanal gobernado: Teams, portal, email y WhatsApp si cumple politica.
- Recomendaciones predictivas de problemas recurrentes.
- Catalogo de servicios TI autoservicio.
- Integracion con inventario/activos y CMDB madura.
- Benchmark continuo entre agentes IA y humanos por tipo de caso.

## 11. Appendix

### 11.1 Glossary

- **DGX Spark:** Runtime/local appliance propuesto para inferencia o asistencia IA privada.
- **GLPI:** Sistema ITSM usado para tickets, inventario y seguimiento.
- **N1/N2:** Niveles de soporte tecnico.
- **FCR:** First Contact Resolution.
- **APIM:** Azure API Management, gateway obligatorio para APIs sincronas.
- **Service Bus:** Event Bus obligatorio para comunicacion asincrona.
- **DLQ:** Dead Letter Queue para eventos fallidos.

### 11.2 References

- PT-ARQ-004 Arquitectura Tecnologica Ternova.
- PT-IA-003 Politica de IA Ternova.
- TE-005 Gobernanza IA Ternova.
- POL-TIC-001 Seguridad de la Informacion.
- Nota Obsidian: `Agente DGX — integracion GLPI (2026-07-03)`.

### 11.3 Change Log

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | 2026-07-06 | Codex | Initial draft from conversation and Ternova policies. |
