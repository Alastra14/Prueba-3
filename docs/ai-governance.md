---
title: Mesa de Ayuda Inteligente - Gobierno de IA
version: 0.1
status: Draft
fecha: 2026-07-06
clasificacion: Uso Interno
---

# Gobierno de IA - Mesa de Ayuda Inteligente

## 1. Clasificacion TE-005

**Clasificacion propuesta para MVP:** Flujo Inteligente.

El agente de IA clasifica, recomienda y responde dentro de un conjunto controlado de rutas. Las acciones sensibles y reasignaciones criticas requieren aprobacion humana o reglas explicitas. Si en una fase futura el agente decide y ejecuta autonomamente multiples rutas sin aprobacion, se debe reclasificar como Flujo Agentico.

## 2. Roles

| Rol | Responsabilidad |
|---|---|
| Sponsor | Aprobar iniciativa, presupuesto y beneficios esperados. |
| Lider funcional TI | Validar utilidad, flujos N1/N2 y aceptacion. |
| Arquitecto de IA | Definir tipo de flujo, modelos, prompts, evaluacion y riesgos. |
| Arquitecto Empresarial | Validar integraciones, arquitectura y alineacion PT-ARQ-004. |
| Arquitecto de Datos | Clasificacion, linaje, retencion y calidad de datos. |
| Ciberseguridad | Controles de acceso, privacidad, secretos, auditoria y riesgos. |
| PM/Analista de Requerimientos | Gestionar proyecto, cambios, pruebas, despliegue y cierre. |
| Soporte N1/N2 | Operar, retroalimentar KB, validar escalamiento y transferencia. |

## 3. TDR - Campos iniciales

- **Nombre:** Mesa de Ayuda Inteligente Ternova.
- **Solicitante/Area:** TI.
- **Objetivo:** Reducir tiempos de triage/asignacion y mejorar calidad de registro GLPI usando pool mixto humano + IA.
- **Tipo de solucion:** Flujo Inteligente conversacional con IA asistiva.
- **Datos requeridos:** Mensajes de soporte, usuario, area, ubicacion, activo, categoria, ticket GLPI, KB autorizada.
- **LLM/servicio:** DGX Spark/runtime local como prioridad; LLM externo solo con datos tokenizados y aprobacion.
- **Autenticacion:** Entra ID, OAuth2/JWT, Client Credentials para servicios.
- **Riesgos:** Datos sensibles, respuesta incorrecta, prompt injection, mala asignacion, dependencia GLPI.
- **Entornos:** Dev, QA, Prod.
- **Metricas:** Precision de triage >=85%, FCR >=45% piloto, primera respuesta <60s, CSAT >=4.2/5.

## 4. Registro Inicial de Riesgos IA

| ID | Riesgo | Tipo | Prob. | Impacto | Criticidad | Mitigacion | Responsable | Estado |
|---|---|---|---|---|---|---|---|---|
| AI-001 | Exposicion de datos sensibles en prompts | Regulatorio/seguridad | Media | Alta | Critica | Clasificacion, redaccion/tokenizacion, bloqueo LLM externo, auditoria | Ciberseguridad / Datos | Abierto |
| AI-002 | Respuesta incorrecta que retrasa soporte | Operativo | Media | Media | Alta | Evaluaciones, takeover humano, rating de respuestas, KB curada | Arquitecto IA / N1 | Abierto |
| AI-003 | Prompt injection desde usuario | Tecnico/seguridad | Media | Alta | Alta | Guardrails, aislamiento de herramientas, allowlist de acciones | Ciberseguridad | Abierto |
| AI-004 | Sesgo de asignacion a tecnicos/grupos | Etico/operativo | Baja | Media | Media | Monitorear distribucion, reglas transparentes, revision semanal | Coordinador Mesa | Abierto |
| AI-005 | Falta de explicabilidad en escalamiento | Cumplimiento | Media | Media | Alta | Registrar motivo, evidencia y version del agente | Arquitecto IA | Abierto |

## 5. Politicas de Datos para IA

- Usar minimo contexto necesario.
- No enviar contrasenas, tokens, documentos confidenciales ni datos restringidos a LLM externos.
- Redactar datos personales cuando no sean necesarios para resolver.
- Registrar prompt metadata y hashes; conservar prompt completo solo si la clasificacion/retencion lo permite.
- El resumen enviado a GLPI debe ser util pero no exponer secretos.
- Adjuntos deben pasar por clasificacion antes de indexarse o enviarse a IA.

## 6. Guardrails Operativos

| Caso | Comportamiento permitido |
|---|---|
| Password reset | Guiar autoservicio o crear ticket; ejecucion solo por flujo aprobado con MFA/aprobacion. |
| Accesos/permisos | Crear solicitud y escalar; no conceder permisos autonomamente. |
| Incidente de seguridad | Escalar a Seguridad/N2 y crear GLPI; no dar instrucciones riesgosas. |
| Hardware/telefonia | Diagnosticar, recopilar datos, asignar especialista. |
| Aplicacion critica | Recopilar contexto, revisar KB, escalar si afecta productividad/seguridad. |

## 7. Evaluacion de Bots Nova/Atlas/Cora

Metricas por variant:
- Precision de categoria.
- Resolucion N1.
- Tasa de takeover humano.
- Tiempo hasta siguiente accion.
- CSAT.
- Respuestas descartadas por operador.
- Incidentes/errores por 100 conversaciones.

Cada variant debe tener:
- Version de prompt.
- Cambios registrados.
- Categorias habilitadas.
- Limites de riesgo.
- Fecha de revision.

## 8. Criterios para pasar a piloto

- TDR/Acta aprobada.
- Riesgos AI-001 a AI-005 con mitigacion asignada.
- Evaluacion de datos completada.
- Pruebas de prompt injection y datos sensibles superadas.
- Al menos 50 escenarios de soporte evaluados manualmente.
- GLPI QA validado.
- Runbook de takeover humano.
