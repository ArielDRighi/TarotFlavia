# Informe de Costos de IA por Usuario Premium — Auguria

> 📅 **Fecha:** 2026-07-20
> 🎯 **Objetivo:** Cuantificar el costo real en tokens de IA que genera un usuario Premium, para dimensionar el precio de la suscripción ($7.000 ARS/mes).
> 🔎 **Metodología:** todo lo marcado **[código]** está verificado en el repo (`path:línea`). Los tamaños de tokens son **estimaciones [est.]** derivadas de los `max_tokens` configurados y la longitud de los prompts (español ≈ 3,5–4 caracteres/token). Precios: búsqueda web, julio 2026.

> ✏️ **Corrección (2026-07-20, aclarado por el Delta):** las features que **realmente** consumen IA por-usuario son solo **tarot (tirada) + carta del día + carta astral**. La **numerología** tiene interpretación IA en el código pero **está bloqueada en el producto** → no genera costo. **"Regeneración de interpretaciones"** y **"Oráculo"** **NO existen como features**: son constantes muertas en el enum `UsageFeature` (`usage-limits.constants.ts`) que ensucian cualquier análisis del código. Este informe ya refleja la corrección.

---

## 1. Resumen ejecutivo

- **Solo los usuarios Premium consumen IA.** Free y anónimo se sirven de contenido pre-cargado en la base → **$0**.
- **El único proveedor que genera costo real es DeepSeek** (tarot, carta astral, numerología). Los horóscopos corren en **Groq (gratis)** y el péndulo **no usa IA**.
- **Costo por usuario Premium: ~$0,03–0,06 USD/mes** (uso típico); **~$0,50 USD/mes** en el peor caso (abuso de features ilimitadas).
- Frente a **$7.000 ARS ≈ $4,74 USD/mes**, el costo de IA es **menos del 1,5%** del ingreso en uso normal.
- El **freno real de costos** ya existe en el código: un **tope global de DeepSeek de $20 USD/mes** que corta el proveedor y avisa por email.

---

## 2. Proveedores y modelos

**Orden de fallback por defecto** [código] `ai-provider.service.ts:52-57`: `Groq → Gemini → DeepSeek → OpenAI`. Cada feature elige su **proveedor primario** y mantiene el fallback automático.

| Variable (`.env`) | Valor real | Rol |
|---|---|---|
| `DEEPSEEK_MODEL` | `deepseek-v4-flash` | **Primario para todo** salvo horóscopos |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | **Primario para horóscopos** (occ. + chino) |
| `OPENAI_MODEL` | `gpt-4o-mini` (comentado) | Fallback, sin key activa |
| `GEMINI_MODEL` | `gemini-1.5-flash` (comentado) | Fallback, sin key activa |

> ⚠️ El `CLAUDE.md` dice "Groq principal" — **está desactualizado**. En la práctica DeepSeek es el primario para tarot, carta astral y numerología.

**Mapa feature → proveedor** [código]:

| Feature | Proveedor | Fuente |
|---|---|---|
| Tarot (interpretación) | DeepSeek | `interpretations.service.ts:223` |
| Tarot (carta del día) | DeepSeek | `interpretations.service.ts:451` |
| Carta astral / natal | DeepSeek | `chart-ai-synthesis.service.ts:87` |
| Numerología | ~~DeepSeek~~ **bloqueada (sin IA)** | código presente pero deshabilitado en el producto |
| Horóscopo occidental | Groq | `horoscope-generation.service.ts:103` |
| Horóscopo chino | Groq | `chinese-horoscope.service.ts:161` |
| Péndulo | **Ninguno (sin IA)** | `pendulum-interpretation.service.ts:30-39` |

### Configuración objetivo (decisión de negocio)

> Se consolidará en **DeepSeek v4 (versión más económica) como único proveedor fijo**, con **un fallback**.
> **Implicación:** si los horóscopos migran de Groq (gratis) a DeepSeek, dejan de costar $0. El impacto es chico (ver §5), pero deja de ser gratuito. *(Confirmar el modelo v4 exacto y su precio desde el portal de DeepSeek.)*

---

## 3. Features de IA y tamaño de tokens por llamada

**Regla central** [código] `ai-usage.constants.ts:20-42`: **FREE y ANÓNIMO no consumen IA** — se sirven de contenido pre-existente. **La IA es exclusiva de Premium.**

| Feature | Modelo | `max_tokens` | Input [est.] | Output [est.] |
|---|---|---|---|---|
| Tirada de tarot (3 cartas) | deepseek-v4-flash | 3000 | ~1.500 | ~900 |
| Carta del día (1 carta) | deepseek-v4-flash | ~700 | ~550 | ~450 |
| Carta astral | deepseek-v4-flash | 1500 | ~1.300 | ~1.000 |
| Horóscopo occidental (x signo) | llama-3.3-70b | 1000 | ~600 | ~700 |
| Horóscopo chino (x animal) | llama-3.3-70b | 1500 | ~700 | ~1.200 |

**NO consumen IA (o no existen):**
- **Numerología:** interpretación IA bloqueada en el producto → $0. *(El código de IA sigue presente en `src/modules/numerology/` — conviene limpiarlo o confirmar el bloqueo.)*
- **Péndulo:** usa textos pre-cargados → $0.
- **Regeneración de interpretaciones / Oráculo:** **no son features reales**; solo existen como constantes muertas en `usage-limits.constants.ts`.

---

## 4. Límites de un usuario Premium

| Feature | Límite Premium | ¿IA? | Fuente |
|---|---|---|---|
| Carta del día | 1/día | Sí | `usage-limits.constants.ts:33` |
| Tirada de tarot | 3/día | Sí | `usage-limits.constants.ts:34` |
| Carta astral | **Ilimitada** | Sí | `usage-limits.constants.ts:38` |
| Péndulo | 3/día | No | `usage-limits.constants.ts:37` |
| Numerología | — | **No (bloqueada)** | interpretación IA deshabilitada en producto |
| Cuota mensual IA global | Ilimitada (-1) | — | `plans.seeder.ts:78` |

> ⚠️ `INTERPRETATION_REGENERATION` y `ORACLE_QUERY` figuran en el enum `UsageFeature` con límites, pero **no corresponden a features reales** (no hay endpoint que los use). Son código muerto → **recomendación: eliminarlos** para que dejen de aparecer en los análisis.

---

## 5. Costos "de sistema" (no por usuario)

| Proceso | Frecuencia | Llamadas | Modelo | Costo |
|---|---|---|---|---|
| Horóscopo occidental | Diario 06:00 UTC | 12 signos/día (360/mes) | Groq | **$0** (free) |
| Horóscopo chino | Anual (15-dic) | 12 animales/año | Groq | **$0** (free) |

Si migraran a DeepSeek v4: occidental ≈ **$0,05–0,10/mes**, chino ≈ despreciable. En cualquier caso, marginal.

---

## 6. Precios de los modelos (julio 2026)

| Modelo | Input /1M | Output /1M |
|---|---|---|
| DeepSeek `deepseek-v4-flash` | $0,14 (cache-miss) | $0,28 |
| OpenAI `gpt-4o-mini` | $0,15 | $0,60 |
| Groq `llama-3.3-70b` | $0,59 (free tier disp.) | $0,79 |

> A confirmar con el portal de DeepSeek el modelo v4 más económico y su precio vigente.

---

## 7. Síntesis de costos

### Costo por generación (fórmula: `input × $0,14/1M + output × $0,28/1M`)

| Generación | Costo USD |
|---|---|
| Tirada de tarot (3 cartas) | ~$0,00046 |
| Carta del día | ~$0,00020 |
| Carta astral | ~$0,00046 |
| Horóscopos / Péndulo / Numerología | $0 |

**Cada llamada a DeepSeek ≈ $0,0005 (medio milésimo de dólar).**

### Costo diario de un usuario Premium

Solo 3 features consumen IA: **carta del día (1/día), tirada de tarot (3/día) y carta astral (ilimitada).**

| Escenario | Actividad | Costo/día |
|---|---|---|
| Típico | 1 carta día + 1 tirada | ~$0,0007 |
| Máximo de límites diarios | 1 carta día + 3 tiradas | ~$0,0016 |
| Heavy (abusa de carta astral ilimitada) | + 10 cartas astrales | ~$0,006 |

### Costo mensual de un usuario Premium

| Escenario | Costo/mes USD | % de $7.000 ARS (~$4,74) |
|---|---|---|
| Típico | ~$0,02 | ~0,4% |
| Uso alto | ~$0,05 | ~1,0% |
| Heavy / abuso (carta astral) | ~$0,18 | ~3,8% |

---

## 8. Conclusiones para el pricing

1. **El costo de IA es despreciable frente al precio.** Un Premium típico cuesta ~$0,02–0,05 USD/mes; incluso un abusador de la carta astral queda en ~$0,18/mes (~3,8% del ingreso).
2. **Por qué es tan barato:** DeepSeek v4 es muy económico, los horóscopos (lo más voluminoso) corren gratis en Groq, y el péndulo, la numerología y todo el plan Free no tocan IA. Solo 3 features generan costo.
3. **Salvaguarda ya implementada:** tope global de DeepSeek de **$20 USD/mes** [código] `ai-provider-cost.service.ts:185` (`DEEPSEEK_MAX_MONTHLY_COST_USD`), con aviso por email al 80%/100%. A $0,0005/llamada, cubre **~40.000 interpretaciones/mes** en toda la plataforma.
4. **Único punto a vigilar:** la **carta astral es ilimitada**. Por el precio unitario ínfimo + el cap de $20 el riesgo es bajo, pero si escala la base conviene ponerle un límite diario suave y monitorear el cap.

---

## 9. Cosas a confirmar / limitaciones

- **Tokens exactos:** las cifras input/output son estimaciones desde `max_tokens`. La tabla `ai_usage_log` en producción guarda `promptTokens`/`completionTokens` **reales** — se puede consultar para números exactos.
- **Modelo DeepSeek v4 definitivo:** confirmar desde el portal cuál es la versión más económica y su precio.
- **Config objetivo:** al consolidar en DeepSeek + 1 fallback, actualizar `.env` (quitar Groq como primario de horóscopos) y recalcular el costo de sistema (los horóscopos dejarían de ser $0).
- **Groq free tier:** se asume que la operación entra en el tier gratuito (~30 RPM). Si se excede, el impacto total sigue siendo <$0,40/mes.
