# Mesa de Ayuda Inteligente Ternova

Paquete inicial de producto, arquitectura y mockup para una mesa de ayuda conversacional en Teams con pool N1 hibrido: humanos + agentes IA, DGX Spark como asesor/runtime y GLPI como sistema oficial de tickets.

## Artefactos

- `docs/PRD.md`: PRD del producto.
- `docs/ADD.md`: Architecture Definition Document.
- `docs/ai-governance.md`: gobierno de IA, riesgos y TDR inicial.
- `docs/master-prompts.md`: master prompts y contrato de salida del agente IA.
- `docs/adrs/`: decisiones arquitectonicas.
- `docs/api/helpdesk-bff.openapi.yaml`: contrato API inicial.
- `mockup/index.html`: mockup navegable.

## Decisiones base

- El bot no reemplaza al N1 humano: opera dentro de un pool hibrido.
- El usuario ve una identidad unica de Mesa de Ayuda en Teams aunque cambie el operador.
- GLPI permanece como sistema oficial de registro.
- Integraciones sincronas por Azure API Management.
- Integraciones asincronas por Azure Service Bus con DLQ.
- MVP clasificado como Flujo Inteligente bajo TE-005.

## Abrir mockup

Ejecutar servidor local del mockup:

```bash
cd "/Users/alastra/Documents/GIT/ternova/Mesa de ayuda /mockup"
node server.mjs
```

Abrir:

```text
http://127.0.0.1:5173/
```

El servidor incluye proxy `/api/agent` para conectar un endpoint local de agente IA sin depender de CORS.
