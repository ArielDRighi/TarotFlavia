# Backlog — Incidente de IA de agosto 2026 (modelos decomisionados)

> **Estado:** 🟠 En curso — el código está listo; faltan las variables de entorno en Railway.
> **Fecha del diagnóstico:** 26-ago-2026
> **Rama:** `fix/T-IA-001-modelos-ia-decomisionados`

---

## Qué pasó

Producción quedó **sin IA**: el horóscopo diario dejó de generarse y las tiradas de tarot
fallaban incluso para cuentas premium. Las dos cosas tienen la misma causa.

Groq mandó un mail anunciando la baja de `compound-mini` (decomisión el 21-09-2026). Ese
modelo no se usa en el proyecto, pero el mail era la punta del ovillo: Groq **rotó todo su
catálogo y retiró la familia Llama completa**. El modelo que teníamos configurado,
`llama-3.3-70b-versatile`, dejó de existir en la cuenta.

Diagnóstico, tal cual salió del health de producción:

```jsonc
// GET https://api.auguriatarot.com/api/v1/health
"ai": {
  "status": "up",          // ⚠️ el health miente, ver T-IA-004
  "available": false,
  "primary": {
    "provider": "groq",
    "configured": true,
    "status": "error",
    "model": "llama-3.3-70b-versatile",
    "error": "404 The model `llama-3.3-70b-versatile` does not exist or you do not have access to it."
  },
  "fallback": []           // ⚠️ ningún otro proveedor configurado
}
```

`GET /api/v1/horoscope/today` devolvía **0 signos**.

### Por qué se cayó también el tarot

El reparto por feature ya estaba bien en el código: el tarot pide `AIProviderType.DEEPSEEK`
como primario. Pero en producción **`DEEPSEEK_API_KEY` no estaba seteada**, y
`getOrderedProviders` solo considera proveedores configurados: sin key, DeepSeek no se
registra, el tarot caía a Groq, y Groq estaba roto. De ahí el `fallback: []`.

### Mediciones que fundamentan los cambios

Todo medido el 26-ago-2026 contra las APIs reales, con los prompts reales del proyecto.

**Groq — límites del tier gratuito** (deducidos de los headers `x-ratelimit-*`, **por modelo**):

| Límite   | Lo que decía la doc | Lo que devuelve la API |
| -------- | ------------------- | ---------------------- |
| Requests | 14.400/día          | **1.000/día**          |
| Tokens   | (solo 30 RPM)       | **8.000/minuto**       |

**Groq — `openai/gpt-oss-120b` con el prompt de horóscopo** (es un modelo de razonamiento):

| Config                    | Tokens/req | Razonamiento | Completion máx | JSON parseable |
| ------------------------- | ---------- | ------------ | -------------- | -------------- |
| sin `reasoning_effort`    | 1.874      | 565          | 851 / 1.000    | sí, al borde   |
| `reasoning_effort: 'low'` | **1.345**  | **15**       | **335**        | 3/3            |

**DeepSeek — `deepseek-v4-flash` con el prompt de una tirada de 3 cartas:**

| Config                            | Latencia    | Tokens salida | Razonamiento | Costo off-peak |
| --------------------------------- | ----------- | ------------- | ------------ | -------------- |
| por defecto (modo pensante ON)    | 18–32s      | 1.495–2.859   | 812–1.614    | ~$0,0017       |
| `thinking: { type: 'disabled' }`  | **14–17,6s**| 1.005–1.250   | **0**        | **~$0,0008**   |

Saldo de la cuenta al momento del diagnóstico: **USD 1,91** (`is_available: true`).

---

## Tareas

| ID        | Tarea                                                              | Área     | Prioridad  | Estado                    |
| --------- | ------------------------------------------------------------------ | -------- | ---------- | ------------------------- |
| T-IA-001  | Migrar Groq a `openai/gpt-oss-120b` y ajustar la cadencia del cron | Backend  | 🔴 Crítica | ✅ Completada             |
| T-IA-002  | Dejar DeepSeek operativo para tarot y features premium             | Backend  | 🔴 Crítica | ✅ Completada             |
| T-IA-003  | Setear las variables en Railway y reiniciar                        | Deploy   | 🔴 Crítica | ⬜ Pendiente (manual)     |
| T-IA-004  | Que el health no reporte `ok` con la IA caída                      | Backend  | 🟠 Alta    | ⬜ Pendiente (fuera de alcance de este PR) |

---

## T-IA-001: Migrar Groq a `openai/gpt-oss-120b`

**Estado:** ✅ COMPLETADA

### Alcance

- [x] `DEFAULT_MODEL` del provider de Groq → `openai/gpt-oss-120b` (estaba en
      `llama-3.1-70b-versatile`, decomisionado desde antes que el 3.3).
- [x] Default de `GROQ_MODEL` en `env.validation.ts` → `openai/gpt-oss-120b`.
- [x] El provider manda `reasoning_effort: 'low'`.
- [x] `DELAY_BETWEEN_SIGNS_MS`: 6.000ms → **15.000ms**.
- [x] Comentarios del cron actualizados (ya no hablan de los 15 RPM de Gemini).

### Por qué 15 segundos

El límite que manda es el de **tokens**, no el de requests. Con 6s de delay son 10
requests/minuto × ~1.345 tokens ≈ 13.450 tokens/min, contra un techo de 8.000: se comía
429s a mitad de la tanda. Con 15s son 4 requests/minuto ≈ 5.600 tokens/min. Los 12 signos
pasan a tardar ~3 minutos, holgados dentro de la ventana `[01:00, 03:00)` UTC.

### Criterios de aceptación

- [x] Ningún default del código apunta a un modelo de la familia Llama.
- [x] Test de guarda que falla si la cadencia supera los 8.000 tokens/minuto.
- [x] Test de guarda que falla si los 12 signos no entran en la ventana UTC.

---

## T-IA-002: Dejar DeepSeek Operativo

**Estado:** ✅ COMPLETADA

### Problema

Aun con la key seteada, el tarot habría seguido fallando: el provider cortaba a los **15
segundos** y una interpretación real tarda 14–17,6s con el modo pensante apagado, 18–32s
con él encendido. Todas las tiradas habrían muerto por timeout.

Además, según la [doc de DeepSeek](https://api-docs.deepseek.com/guides/thinking_mode), en
modo pensante el modelo **ignora `temperature`** — justo el parámetro que cada tarotista
configura para variar su voz.

### Alcance

- [x] `TIMEOUT`: 15s → **45s** (con margen contra el axios de 30s del frontend, que no se
      alcanza porque la generación real termina en 14–17s).
- [x] El provider manda `thinking: { type: 'disabled' }`, tipado sin `any` ni `@ts-ignore`
      mediante `DeepSeekChatCompletionParams`.
- [x] Mensaje de timeout coherente con la constante (decía `>15s`).

### Criterios de aceptación

- [x] Test que verifica que a los 20s la promesa sigue viva.
- [x] Test que verifica que a los 45s corta con `AIErrorType.TIMEOUT` reintentable.
- [x] Test que verifica que se manda el modo no pensante y que `temperature` sobrevive.

### Fuera de alcance

El reparto por feature **ya estaba bien** en el código (tarot, numerología y carta astral
piden DeepSeek como primario). No se tocó.

---

## T-IA-003: Variables en Railway

**Estado:** ⬜ PENDIENTE — acción manual, no se puede hacer desde el repo.

```bash
GROQ_MODEL=openai/gpt-oss-120b
DEEPSEEK_API_KEY=sk_...            # la que hoy tiene USD 1,91 de saldo
DEEPSEEK_MODEL=deepseek-v4-flash
```

Al reiniciar, el backfill de `onApplicationBootstrap` regenera los horóscopos del día en
curso: no hay que esperar al cron de las 01:00 UTC.

### Verificación

```bash
curl -s https://api.auguriatarot.com/api/v1/health | jq .info.ai
# primary.status debe ser "ok" y fallback debe incluir deepseek

curl -s https://api.auguriatarot.com/api/v1/horoscope/today | jq 'length'
# debe devolver 12
```

---

## T-IA-004: El Health Miente

**Estado:** ⬜ PENDIENTE — fuera del alcance de este PR, se deja anotado.

`/health` devolvió `"status": "ok"` y `ai.status: "up"` con la IA completamente caída,
porque `available` se calcula sobre `configured` (¿hay API key?) en lugar de sobre
`status === 'ok'`. Un monitor externo apuntado al health nunca se iba a enterar del
incidente: lo detectó un usuario.

Ver `health.controller.ts:90`, `:133` y `:200`.

---

## Puerta de Salida

- [x] Ningún modelo decomisionado en defaults del código ni en runbooks de deploy.
- [x] Los límites reales del tier gratuito están documentados y cubiertos por tests.
- [ ] Producción con `primary.status: "ok"` y 12 horóscopos del día (depende de T-IA-003).
- [ ] Una tirada de tarot premium generada end-to-end contra DeepSeek (depende de T-IA-003).
