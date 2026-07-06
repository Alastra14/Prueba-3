---
id: ADR-SOPORTE-002
title: Integracion exclusiva por APIM y Service Bus
status: Proposed
fecha: 2026-07-06
clasificacion: Uso Interno
---

# ADR-SOPORTE-002: Integracion exclusiva por APIM y Service Bus

## Contexto

La mesa de ayuda debe integrar Teams, GLPI, Entra ID, DGX Spark, base de conocimiento, consola y servicios internos. La politica PT-ARQ-004 prohibe integraciones punto a punto entre aplicaciones.

## Decision

Toda comunicacion sincrona se expondra por **Azure API Management**. Toda comunicacion asincrona se realizara por **Azure Service Bus** con topics, queues y Dead Letter Queue.

No se permite que Teams, la consola, bots o DGX Spark llamen directamente a GLPI, Entra ID o bases de datos de otros servicios.

## Alternativas consideradas

1. **Integracion directa por rapidez de prototipo.**
   - Ventaja: implementacion inicial mas rapida.
   - Desventaja: incumple PT-ARQ-004, dificulta auditoria y genera dependencias fragiles.

2. **ESB/Logic Apps como unica capa.**
   - Ventaja: orquestacion low-code util para algunos flujos.
   - Desventaja: no sustituye la necesidad de APIs versionadas ni eventos por dominio.

3. **APIM + Service Bus.**
   - Ventaja: cumple estandar Ternova, desacopla dominios y mejora resiliencia.
   - Desventaja: mayor esfuerzo inicial.

## Consecuencias

- Se requiere OpenAPI por servicio.
- GLPI Adapter consume comandos/eventos y maneja idempotencia.
- Eventos fallidos van a DLQ con monitoreo.
- Cualquier acceso directo temporal necesita waiver tecnico con expiracion.

## Cumplimiento Ternova

- Cumple regla de oro PT-ARQ-004.
- Facilita observabilidad y trazabilidad distribuida.
- Reduce riesgo de secretos expuestos en clientes/canales.
