# Backlog — Incidente de IA de agosto 2026 (modelos decomisionados)

> **Estado:** ✅ Cerrado — T-IA-001 a T-IA-005 completadas.
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
  "status": "up",          // ⚠️ el health mentía, arreglado en T-IA-004
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
| T-IA-003  | Setear las variables en Railway y reiniciar                        | Deploy   | 🔴 Crítica | ✅ Completada (27-ago-2026) |
| T-IA-004  | Que el health no reporte `ok` con la IA caída                      | Backend  | 🟠 Alta    | ✅ Completada (27-ago-2026) |
| T-IA-005  | Acotar la tormenta de reintentos que desborda el techo de tokens   | Backend  | 🟠 Alta    | ✅ Completada (27-ago-2026) |

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

- [x] `TIMEOUT`: 15s → **25s**. El techo NO lo fija el provider sino el axios del frontend,
      que aborta a los 30s (`frontend/src/lib/api/axios-config.ts`): un timeout más largo
      solo consigue que el backend siga generando una lectura que el usuario ya vio fallar
      y que igual se le descontó del límite diario. 25s deja margen sobre los 14–17,6s
      medidos y entra en el presupuesto del cliente.
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

**Estado:** ✅ COMPLETADA.

Se aplicó en dos tiempos, a propósito:

1. **26-ago-2026** — `GROQ_MODEL=openai/gpt-oss-120b`, antes del deploy, para cortar la
   caída cuanto antes. `primary.status` pasó a `"ok"` (179ms) y el backfill de bootstrap
   regeneró los 12 signos del día.
2. **27-ago-2026** — `DEEPSEEK_API_KEY` y `DEEPSEEK_MODEL`, recién **después** de desplegar
   el PR #637. Con el código viejo (timeout de 15s) y `MAX_RETRY_ATTEMPTS = 3`, una key de
   DeepSeek configurada habría quemado 45s antes de caer a Groq — más que los 30s del axios
   del frontend. Habría sido cambiar "tarot roto" por "tarot roto más lento".

```bash
GROQ_MODEL=openai/gpt-oss-120b     # ✅ 26-ago-2026
DEEPSEEK_API_KEY=sk-...            # ✅ 27-ago-2026 (el prefijo sk- ahora lo exige env.validation)
DEEPSEEK_MODEL=deepseek-v4-flash   # ✅ 27-ago-2026
```

### Resultado verificado en producción (27-ago-2026, 00:0x UTC)

```jsonc
"ai": {
  "available": true,
  "primary":  { "provider": "groq",     "status": "ok", "model": "openai/gpt-oss-120b",
                "responseTime": 252, "rateLimits": { "limit": 1000 } },
  "fallback": [{ "provider": "deepseek", "status": "ok", "model": "deepseek-v4-flash",
                "responseTime": 1492 }]
}
```

El backfill de bootstrap generó los 12 signos del día nuevo con la cadencia nueva: los
últimos 4 tardaron 65s, o sea ~16s por signo (15s de delay + ~1s de generación), tal como
fue calculado.

También conviene revisar `GEMINI_API_KEY`, que sigue seteada en producción con
`GEMINI_MODEL=gemini-1.5-flash` a pesar de que el `.env` local documenta a Gemini como
deshabilitado "porque ensuciaba las métricas con errores". Queda en la cadena de fallback
con un modelo que probablemente ya no exista.

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

## Correcciones de la Revisión (segunda vuelta)

Salieron de la revisión del PR #637 y entraron en el mismo PR:

- **Un 404 no era motivo para reintentar.** `groq.provider.ts` mandaba los 404 al `default`
  del catch, que devuelve `NETWORK_ERROR` con `retryable: true`. Durante la caída, cada
  llamada gastó los 3 intentos de `MAX_RETRY_ATTEMPTS` contra un modelo que ya no existía
  antes de pasar al siguiente proveedor. Ahora un 404 / `model_not_found` es
  `PROVIDER_UNAVAILABLE` no reintentable, y falla rápido.
- **Timers colgados.** `Promise.race` no cancela al perdedor: cada llamada exitosa dejaba
  vivo un `setTimeout` hasta vencer, reteniendo el event loop y ensuciando el apagado en
  Railway. Los dos providers pasan a cancelarlo en un `finally`.
- **`DEEPSEEK_API_KEY` podía quedar inválida en silencio.** El provider exige el prefijo
  `sk-`, pero la validación de entorno no lo pedía y el `.env.example` traía un placeholder
  con `sk_`. Un typo en el prefijo pasaba el arranque, DeepSeek no se registraba y el tarot
  caía a Groq sin dejar rastro — el mismo modo de falla del incidente. Ahora hay `@Matches`
  y `getOrderedProviders` loguea un `warn` cuando el primario pedido no está configurado.
- **Un default decomisionado sobreviviente.** `ai-health.service.ts` seguía cayendo a
  `llama-3.1-70b-versatile`, y es justo la sonda que usa el runbook de T-IA-003 para
  verificar el fix. Todos los defaults viven ahora en
  `src/modules/ai/domain/constants/ai-models.constants.ts`.
- **`reasoning_effort` viajaba a todos los modelos.** Solo los gpt-oss lo entienden; el
  runbook promete que migrar es cambiar la env var, y eso solo es cierto si el parámetro no
  se le manda a `qwen/*` ni a `groq/compound*`.
- **La sonda de salud de DeepSeek no ejercitaba el modo no pensante**, así que podía tardar
  18–32s y dar un falso negativo justo durante la verificación del despliegue.
- **El horóscopo chino tenía la misma miscalibración**: 10s entre generaciones con
  `maxTokens: 1500` da ~9.000 tokens/min, por encima del techo de 8.000. Pasó a 15s.
- **El health reportaba `limit: 14400`** hardcodeado, el número que este mismo incidente
  probó falso.

---

## T-IA-005: La Tormenta de Reintentos Desborda el Techo de Tokens

**Estado:** ✅ COMPLETADA

### Problema

El cálculo de la cadencia de T-IA-001 (15s entre signos) modela el camino feliz. En el
camino de error se apilaban dos niveles de reintento: `MAX_RETRIES_PER_SIGN = 3` con backoff
`[6s, 12s, 24s]` en el cron, **por encima** de `retryWithBackoff(3)` (2s/4s) dentro de
`AIProviderService`. Un signo que fallaba podía disparar hasta 12 llamadas, la mayoría
dentro del mismo minuto: 12.000–16.000 tokens/min contra un techo de 8.000.

Peor: `AIErrorType.RATE_LIMIT` es `retryable: true` y el reintento no honraba el header
`retry-after`, así que la respuesta a un 429 por tokens era volver a pedir a los 2s — dentro
de la misma ventana del bucket que se acababa de vaciar. **El reintento realimentaba el
429.** El health de T-IA-004 detecta esa caída, pero no evita que la tormenta la provoque.

### Alcance

- [x] **El reintento le pregunta al proveedor cuándo volver.** `AIProviderException` lleva
      `retryAfterMs` y los cuatro providers lo llenan desde las cabeceras del 429 (y del
      503) con `parseRetryAfterMs`: `retry-after-ms` (OpenAI), `retry-after` en segundos o
      fecha HTTP (estándar), y el formato propio de Groq
      `x-ratelimit-reset-tokens` (`"7.66s"`, `"2m59.56s"`). Cuando llegan varias ventanas se
      toma la **más lejana**: el techo que se toca primero es el de tokens, y volver cuando
      se repuso el de requests garantiza otro 429.
- [x] **Un 429 que no dice cuándo volver ya no se reintenta contra el mismo proveedor.** El
      backoff ciego sigue siendo correcto para un 5xx o un timeout, pero contra un bucket
      vacío solo gasta cuota. Quien puede responder ahora es el proveedor siguiente, y el
      error se propaga para que la cadena de fallback llegue a él.
- [x] **Presupuesto de espera** (`MAX_RETRY_WAIT_MS = 20s`): si el proveedor pide más que
      eso, no se duerme adentro. El techo real lo fija el axios del frontend, que aborta a
      los 30s: dormir 45s no salva la request —el usuario ya vio el error— y encima bloquea
      el fallback.
- [x] **`MAX_RETRY_ATTEMPTS`: 3 → 2**, y mudado a
      `ai/domain/constants/ai-retry.constants.ts`. Con 3, la ráfaga era de 3 llamadas en
      ~6s; sumadas a los signos que la cadencia de 15s mete en el resto del minuto daban 6
      llamadas ≈ 8.400 tokens/min, por encima del techo. Con 2, la peor ventana queda en 5
      llamadas ≈ 7.000.
- [x] **El cron deja de reintentar fallos definitivos.** `AIProviderService` ya no tira un
      `Error` pelado: tira `AllProvidersFailedException`, que lleva el detalle por proveedor
      y un `retryable` (true solo si alguno falló por algo transitorio). El cron lo consulta
      antes de reintentar. Durante el incidente reintentaba cuatro veces por signo contra un
      404 que no iba a cambiar.
- [x] **`MAX_RETRIES_PER_SIGN`: 3 → 1** y **`RETRY_DELAYS_MS`: `[6s, 12s, 24s]` → `[60s]`**.
      El bucket de Groq se repone por minuto: los 6s caían dentro de la misma ventana del
      429 que se acababa de provocar. Y el reintento del cron no es el último recurso —
      arriba están la pasada de verificación de las 02:00 UTC y el backfill de bootstrap.
- [x] **El horóscopo chino tenía la misma miscalibración**, con sus propios valores locales
      (3 reintentos con `[10s, 20s, 40s]`; los 10s, otra vez dentro del mismo minuto).
      Ahora importa la política compartida: las dos generaciones pelean por el mismo bucket,
      así que el presupuesto tiene que ser uno solo.

### El presupuesto, en números

| Nivel                          | Antes                       | Ahora                    |
| ------------------------------ | --------------------------- | ------------------------ |
| Intentos por proveedor         | 3 (2s, 4s)                  | **2** (2s)               |
| Reintentos del cron por signo  | 3 (6s, 12s, 24s)            | **1** (60s)              |
| Llamadas máx. por signo (2 proveedores) | 24                 | **8**                    |
| Peor ventana de 60s vs. Groq   | 6 llamadas ≈ 8.400 tokens   | **5 llamadas ≈ 7.000**   |

### Criterios de aceptación

- [x] Test que verifica que un 429 sin `retry-after` NO se reintenta contra el mismo
      proveedor (una sola llamada, y se cae al siguiente).
- [x] Test que verifica que con `retry-after` se espera esa ventana y no los 2s del backoff.
- [x] Test que verifica que un `retry-after` por encima del presupuesto corta en vez de
      dormir.
- [x] Tests de `parseRetryAfterMs` para los tres formatos de cabecera, incluida la fecha
      HTTP, la cabecera vacía, y el criterio de quedarse con la ventana **más lejana** —
      incluso cuando el `retry-after` es más corto que el reset de tokens.
- [x] Test de que `parseRetryAfterMs` **ignora** los `x-ratelimit-reset-*`, para que un 5xx
      no quede sin reintento por el estado del bucket.
- [x] Tests de que `AllProvidersFailedException` es reintentable solo si algún proveedor
      falló por algo transitorio, y no lo es sin proveedores configurados ni con el circuit
      breaker abierto.
- [x] Test de que el cron NO reintenta ante un fallo definitivo y SÍ ante uno transitorio.
- [x] Test de guarda que falla si la ráfaga de reintentos supera los 8.000 tokens/minuto.
- [x] Test de guarda que falla si un backoff del cron cae dentro de la misma ventana del
      bucket (< 60s), o si `RETRY_DELAYS_MS` se desincroniza de `MAX_RETRIES_PER_SIGN`.
- [x] Test de guarda que falla si la tanda con los 12 signos agotando reintentos se pisa con
      la pasada de verificación de las 02:00 UTC.

### Correcciones de la revisión

Salieron del revisor local sobre el PR #639 y entraron en el mismo PR:

- **El `retry-after` tapaba la ventana de tokens.** El docblock prometía quedarse con la
  ventana más lejana, pero la implementación retornaba en la primera cabecera que parseaba.
  Un 429 de Groq manda las tres juntas (`retry-after: 2`, `reset-requests: 1s`,
  `reset-tokens: 45s`): se reintentaba a los 2,5s con el bucket de tokens todavía vacío — el
  mismo lazo de realimentación que la tarea vino a cortar. Ahora se juntan todos los
  candidatos y gana el máximo.
- **Las cabeceras de bucket se leían también en el 5xx.** `x-ratelimit-reset-*` es *estado*
  del bucket y viaja en respuestas normales, no solo en los 429. Un 503 con
  `reset-tokens: 2m59s` se interpretaba como "esperá 3 minutos" y, por el presupuesto de
  `MAX_RETRY_WAIT_MS`, quedaba **sin ningún reintento**: lo contrario de lo buscado. Hay dos
  lectores ahora: `parseRetryAfterMs` (solo `retry-after` / `retry-after-ms`) y
  `parseRateLimitRetryAfterMs` (agrega los resets), y el segundo se usa solo ante un 429.
- **Un `retry-after` vacío valía 0.** `Number('')` es `0`, así que un proxy que mandara la
  cabecera en blanco convertía un "429 sin ventana" —que la política nueva manda **no**
  reintentar— en un "429 con ventana 0", que sí se reintentaba. Desactivaba la regla entera
  por una cabecera vacía.
- **El presupuesto no acotaba la espera final.** `maxWaitMs` se comparaba solo contra el
  `retryAfterMs` declarado, nunca contra el backoff. Inocuo hoy (con 2 intentos el backoff
  máximo es ~2,4s), pero el nombre de la opción prometía un techo que no cumplía.
- **`AIProviderFailure.provider` era `string`** habiendo un enum (`AIProviderType`) que el
  servicio ya empuja.
- **El log del cron mentía en el último intento.** `isWorthRetrying` se evaluaba antes de
  saber si quedaban reintentos, así que un fallo definitivo en el intento final decía "sin
  reintentos: el fallo no es transitorio" en vez de "sin más reintentos".
- **Tres tests no mordían lo que decían morder**: el de backoff creciente era vacuo con un
  solo reintento configurado; el de la espera del reintento no podía distinguirla de la
  cadencia entre signos; y el del circuit breaker abría los breakers con un error que ya era
  no reintentable, así que la aserción no aislaba el aporte del breaker.

### Lo que NO se tocó, a propósito

- **El circuit breaker.** Ya cumple su función (5 fallos consecutivos → 5 minutos abierto).
      Lo único que cambió es que un breaker abierto cuenta como fallo **no** reintentable:
      contarlo como transitorio haría que el cron vuelva a apilar llamadas sobre un
      proveedor que se declaró caído.
- **Los timeouts de los providers.** El presupuesto lo fija el axios del frontend (30s) y
      eso ya se resolvió en T-IA-002.
- **Un límite de tiempo total para la tanda de generación.** Hay un test de guarda que
      verifica que el peor caso entra antes de la verificación de las 02:00; si algún día
      deja de entrar, el build lo dice antes que producción.

---

## T-IA-004: El Health Miente

**Estado:** ✅ COMPLETADA

### Problema

`/health` devolvió `"status": "ok"` y `ai.status: "up"` con la IA completamente caída,
porque el `status` del indicador se calculaba sobre `configured` (¿hay API key?) en lugar
de sobre si algún proveedor respondía. Un monitor externo apuntado al health nunca se iba
a enterar del incidente: lo detectó un usuario.

El cálculo estaba duplicado en tres endpoints de `health.controller.ts` (`:90`, `:133` y
`:200`), así que la misma mentira había que arreglarla tres veces.

### Alcance

- [x] `AIHealthCheckResult` expone `configured` (hay credenciales) y `available` (alguien
      respondió la sonda) como **dos señales separadas**, calculadas una sola vez en
      `checkAllProviders()`. Antes cada endpoint las re-derivaba por su cuenta.
- [x] `/health` y `/health/details` derivan `ai.status` de `available`: con la IA caída
      devuelven **503** con `ai.status: "down"`.
- [x] Las tres copias del cálculo colapsan en `buildAIIndicator()`.
- [x] El indicador caído incluye un `message` con el error crudo de cada proveedor
      (`groq (llama-3.3-70b-versatile): 404 The model ... does not exist`), para que la
      alerta llegue con la causa y no solo con un 503.
- [x] `/health/ai` expone `configured` y `available` en el payload y en el schema Swagger.
      De paso, el ejemplo del schema apuntaba a `llama-3.1-70b-versatile`, decomisionado.
- [x] `@ApiResponse({ status: 503 })` documentado en `/health` y `/health/details`.

### La readiness NUNCA se cae con la IA — decisión deliberada

`/health/ready` sigue devolviendo `up` con la IA caída, y no es la mentira vieja: la
readiness gobierna el **ruteo de tráfico**. Sacar la instancia de rotación porque un
proveedor externo se cayó convierte una degradación (tarot sin interpretación) en una
caída total del sitio, y reiniciar el contenedor no revive un modelo decomisionado.

Lo que cambia es que deja de esconderlo: el bloque expone `available: false`,
`degraded: true` y el `message` con la causa.

**Tampoco cae sin credenciales**, y esto sí es un cambio respecto de `develop`. La primera
versión de este PR mantenía la ausencia total de keys como bloqueante ("es un despliegue
mal configurado, no una caída transitoria"), pero ese es un razonamiento de *deploy-time*
aplicado a un check que se evalúa **continuamente**: si alguien rota o borra
`GROQ_API_KEY` en Railway con la app corriendo, la readiness pasaba a `down` y **el sitio
entero se apagaba** —auth, historial, horóscopos ya generados— por una dependencia sin la
que la app degrada. El blast radius es idéntico al del caso "caída", así que la respuesta
tiene que ser la misma. La alarma en ambos casos la levanta `/health`.

Reparto de responsabilidades resultante:

| Endpoint          | Pregunta que responde         | ¿La IA caída lo tumba?              |
| ----------------- | ----------------------------- | ----------------------------------- |
| `/health/live`    | ¿El proceso está vivo?        | No                                  |
| `/health/ready`   | ¿Esta instancia puede servir? | Nunca (`degraded: true`)            |
| `/health`         | ¿Está sano todo el sistema?   | **Sí: 503 con `ai.status: "down"`** |
| `/health/details` | Igual + circuit breakers      | **Sí**                              |
| `/health/ai`      | Estado crudo por proveedor    | No (siempre 200, es diagnóstico)    |

### Sondear el health costaba cuota de Groq

Efecto secundario que aparecía justo al recomendar un monitor sobre `/health`: cada
llamada a cualquiera de esos endpoints dispara **sondas reales** contra los tres
proveedores, y `/health` es público y sin auth. Con 1.000 requests/día de Groq, un monitor
a 1/min gastaba 1.440 sondas diarias: el health se comía la cuota entera y se
auto-provocaba el 429 que después reportaba como caída. Y cualquiera podía quemar el
día entero golpeando el endpoint anónimamente.

Las sondas ahora se cachean **30 segundos** (`PROBE_CACHE_TTL_MS`). Se cachea la promesa,
no el resultado, así dos requests concurrentes comparten una sola tanda. El `timestamp` de
la respuesta es el de la sonda, no el del request, así que la antigüedad del dato siempre
está a la vista.

### Una key mal escrita se volvía invisible

`checkGroqHealth()` y `checkOpenAIHealth()` devolvían `configured: false` cuando la key
existía pero tenía el prefijo equivocado, así que el proveedor **no entraba en `fallback`**
y su error no aparecía en ninguna respuesta. Con una sola key mal tipeada, `/health`
contestaba `"No AI provider is configured"` habiendo una credencial presente — el mismo
modo de falla del incidente, con otro disfraz. Ahora una key presente y malformada es un
proveedor **configurado y roto**, y el health dice exactamente eso.

### Criterios de aceptación

- [x] Test que verifica que con todos los proveedores configurados pero en `error`,
      `/health` reporta `status: error` y `ai.status: down` — el estado exacto del
      incidente del 26-ago-2026.
- [x] Test que verifica que con el primario caído y un fallback `ok`, `/health` sigue `up`.
- [x] Test que verifica que `/health/ready` sigue sirviendo tráfico con la IA caída, pero
      con `degraded: true` — y que tampoco cae sin credenciales.
- [x] Test que verifica que el `message` del indicador caído nombra al proveedor y al modelo.
- [x] Tests del cache de sondas: una sola tanda dentro del TTL, compartida entre requests
      concurrentes, re-sondeo al vencer, y `timestamp` que declara la antigüedad.
- [x] Test que verifica que un proveedor con la key malformada aparece en el reporte.
- [x] El mock de `HealthCheckService` en `health.controller.spec.ts` ejecuta de verdad los
      indicadores (replica el `HealthCheckExecutor` de terminus, `Promise.allSettled`
      incluido) **y lanza `ServiceUnavailableException` cuando alguno cae**, igual que el
      servicio real. El mock anterior devolvía un resultado fijo, así que **el indicador
      `ai` —el que mintió— nunca se ejercitaba desde los tests**: por eso el bug pasó la
      suite entera. Y devolver el resultado en vez de lanzarlo dejaba sin aserción
      justamente el 503 que hace que el monitor se entere.

### ⚠️ Antes de desplegar: revisar el healthcheck de Railway

`/health` ahora puede devolver 503. El `HEALTHCHECK` del `Dockerfile` apunta a
`/health/live` y está bien, pero **si el healthcheck configurado en el dashboard de
Railway apunta a `/health`, un incidente de IA marcaría el deploy como fallido**. Tiene
que apuntar a `/health/live` o `/health/ready`.

Los runbooks versionados sí apuntaban mal y se corrigieron en este PR: el
`healthCheckPath` del `render.yaml` de ejemplo y la sección de health checks de
`backend/tarot-app/docs/DEPLOYMENT.md`, y el `HEALTHCHECK` del Dockerfile y las
`liveness`/`readinessProbe` de K8s en `docs/modules/birth-chart/DEPLOYMENT.md`. Con la
semántica nueva, un `curl -f .../health` en un `HEALTHCHECK` producía un **restart loop**
del contenedor y las probes de K8s **evictaban los pods** ante una caída de proveedor:
exactamente la degradación-convertida-en-caída-total que la decisión de readiness dice
querer evitar.

Y el corolario del incidente: hay que **apuntar un monitor externo a `/health`**. Sin eso
el arreglo no cambia nada — el health puede decir la verdad, pero si nadie la escucha la
próxima caída también la reporta un usuario.

---

## Puerta de Salida

- [x] Ningún modelo decomisionado en defaults del código ni en runbooks de deploy
      (incluida la sonda de `ai-health.service.ts`, que se había pasado por alto en la
      primera vuelta).
- [x] Los límites reales del tier gratuito están documentados y cubiertos por tests.
- [x] Producción con `primary.status: "ok"` y 12 horóscopos del día.
- [x] DeepSeek registrado y respondiendo desde producción (`fallback[0].status: "ok"`).
- [x] El camino de error acotado: ninguna combinación de reintentos puede volver a superar
      los 8.000 tokens/minuto, y hay tests de guarda que lo verifican (T-IA-005).
- [x] Una tirada de tarot premium generada end-to-end contra DeepSeek (27-ago-2026, 00:29 UTC,
      `reading 40`). Traza en los logs de Railway:

      ```
      Attempting completion with deepseek
      Success with deepseek (8573ms, 2231 tokens)
      Interpretation generated successfully with deepseek in 8616ms for tarotista 1
      ```

      Fue al primer intento, sin fallback a Groq ni reintentos. 8,6s desde la red de Railway
      contra los 14–17,6s medidos en desarrollo: entra holgado en el timeout de 25s y en los
      30s del axios del frontend. Costo ~$0,0014 off-peak.
