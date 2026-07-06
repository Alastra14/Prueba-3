---
id: ADR-SOPORTE-001
title: Pool hibrido N1 con humanos y agentes IA
status: Proposed
fecha: 2026-07-06
clasificacion: Uso Interno
---

# ADR-SOPORTE-001: Pool hibrido N1 con humanos y agentes IA

## Contexto

La mesa de ayuda debe atender solicitudes por Teams con una experiencia continua para el usuario, similar a un call center/chat de soporte. La idea original considera que el bot DGX Spark sea primera linea, pero tambien que rote con humanos y que existan varias configuraciones de bot para comparar resultados.

## Decision

La primera linea sera un **pool N1 hibrido**. El pool incluira:

- Agentes humanos N1.
- Tres agentes IA configurables: Nova, Atlas y Cora.
- DGX Spark como asesor IA para humanos y como runtime de bot cuando el caso sea apto.

El usuario final interactuara con una identidad unica de Mesa de Ayuda en Teams. El orquestador podra transferir la conversacion entre bot y humano sin pedir que el usuario repita contexto.

## Alternativas consideradas

1. **Solo bot como N1.**
   - Ventaja: maxima automatizacion y menor carga humana inicial.
   - Desventaja: alto riesgo operativo y de confianza; acciones incorrectas o casos ambiguos pueden atascarse.

2. **Solo humanos con IA como herramienta oculta.**
   - Ventaja: menor riesgo y adopcion mas simple.
   - Desventaja: limita aprendizaje comparativo de bots y no reduce suficiente la cola repetitiva.

3. **Pool hibrido con bots y humanos.**
   - Ventaja: permite medir IA en condiciones reales, preservar takeover humano y distribuir carga.
   - Desventaja: requiere orquestador, reglas de asignacion y auditoria mas robustas.

## Consecuencias

- Se requiere Assignment Service con disponibilidad, capacidades y reglas por riesgo.
- Se debe auditar cada transferencia y cada respuesta de IA.
- Las metricas deben segmentar humano vs bot variant.
- Las acciones sensibles quedan fuera de automatizacion directa hasta aprobacion formal.

## Cumplimiento Ternova

- Alineado con PT-IA-003: supervision humana proporcional al riesgo.
- Alineado con TE-005: MVP clasificado como Flujo Inteligente, no Agentico.
- Alineado con POL-TIC-001: accesos por RBAC y privilegio minimo.
