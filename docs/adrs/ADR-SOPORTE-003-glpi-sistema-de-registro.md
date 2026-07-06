---
id: ADR-SOPORTE-003
title: GLPI permanece como sistema oficial de registro
status: Proposed
fecha: 2026-07-06
clasificacion: Uso Interno
---

# ADR-SOPORTE-003: GLPI permanece como sistema oficial de registro

## Contexto

La conversacion de soporte ocurre en Teams y puede pasar por bots/humanos. Sin embargo, TI ya usa GLPI para tickets, seguimiento, categorias e inventario. La conversacion no debe convertirse en un registro paralelo informal.

## Decision

GLPI sera el **sistema oficial de registro** para tickets de soporte. La mesa de ayuda conversacional mantendra estado operativo temporal, pero todo caso que requiera seguimiento formal se creara/actualizara en GLPI.

La integracion con GLPI se encapsula en un GLPI Adapter. El canal Teams y los agentes no llaman GLPI directamente.

## Alternativas consideradas

1. **Crear ticketing propio.**
   - Ventaja: maxima flexibilidad UX.
   - Desventaja: duplica ITSM, rompe gobierno y complica reporting.

2. **Usar solo Teams como registro.**
   - Ventaja: simple para usuarios.
   - Desventaja: sin taxonomia, SLA ni auditoria ITSM robusta.

3. **GLPI como system of record + conversacion como front door.**
   - Ventaja: conserva gobierno ITSM y mejora experiencia.
   - Desventaja: exige buena sincronizacion y manejo de errores.

## Consecuencias

- La taxonomia GLPI debe revisarse antes del piloto.
- El resumen conversacional debe mapear categoria, impacto, urgencia, solicitante y activo.
- El sistema debe soportar reintentos y DLQ ante fallos GLPI.
- La consola muestra estado GLPI, pero no reemplaza sus flujos formales.

## Cumplimiento Ternova

- Alineado con TE-005: incidentes y soporte se registran en GLPI.
- Alineado con politica de seguridad: bitacora, trazabilidad y control de accesos.
