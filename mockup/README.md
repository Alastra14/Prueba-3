# Mockup - Mesa de Ayuda Inteligente

Abrir en navegador via el servidor local:

```bash
node server.mjs
```

URL:

```text
http://127.0.0.1:5173/
```

Interacciones incluidas:

- Simular solicitud nueva y rotacion entre agentes N1.
- Configurar endpoint de agente IA con API URL, API key, formato y modelo.
- Probar agente IA por proxy local `/api/agent`.
- Cargar casos especificos de soporte.
- Cambiar conversacion desde la cola.
- Tomar conversacion como humano N1.
- Pedir recomendacion DGX Spark.
- Crear/sincronizar ticket GLPI simulado.
- Reasignar a especialista segun categoria/riesgo.

Los assets de marca fueron extraidos de `/Users/alastra/Documents/Ternova Design System 2.zip`.

## Endpoint del agente IA

El mockup soporta tres formatos:

- `Generico`: recibe `task`, `masterPrompt`, `input` y `responseFormat`.
- `OpenAI compatible`: recibe `model`, `temperature` y `messages`.
- `Ollama chat`: recibe `model`, `stream: false` y `messages`.

La respuesta puede venir como JSON directo, OpenAI `choices[0].message.content`, `message.content`, `reply`, `answer`, `response`, `result`, `output_text` o texto plano.

La API key no se guarda en disco; solo queda en memoria del navegador mientras la pagina esta abierta.
