/**
 * Modelos y límites de los proveedores de IA.
 *
 * Fuente única de verdad: antes el default de Groq estaba escrito en tres
 * lugares (el provider, el validador de env y la sonda de salud) y quedaron
 * desincronizados — la sonda siguió apuntando a un modelo decomisionado incluso
 * después de migrar el provider.
 *
 * ⚠️ Los catálogos de los proveedores cambian sin aviso. Antes de tocar estos
 * valores, verificá contra la API que el modelo siga existiendo en la cuenta:
 *   curl -H "Authorization: Bearer $GROQ_API_KEY" https://api.groq.com/openai/v1/models
 *   curl -H "Authorization: Bearer $DEEPSEEK_API_KEY" https://api.deepseek.com/models
 */

/**
 * Modelo por defecto de Groq.
 *
 * Groq decomisionó la familia Llama completa (26-ago-2026): el anterior
 * `llama-3.3-70b-versatile` devuelve 404 `model_not_found`.
 */
export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';

/**
 * Prefijo de los modelos de Groq que aceptan `reasoning_effort`.
 *
 * Los demás del catálogo (`qwen/*`, `groq/compound*`) no lo entienden, así que
 * el parámetro solo debe viajar cuando el modelo es de esta familia.
 */
export const GROQ_REASONING_MODEL_PREFIX = 'openai/gpt-oss';

/**
 * Esfuerzo de razonamiento para los modelos gpt-oss.
 *
 * Medido el 26-ago-2026 con el prompt real de horóscopo: sin el parámetro, el
 * modelo gasta ~565 tokens de razonamiento por llamada (851 de completion sobre
 * un tope de 1.000, al borde de truncar el JSON). Con `'low'` baja a 15 tokens
 * de razonamiento y 335 de completion.
 */
export const GROQ_REASONING_EFFORT = 'low' as const;

/**
 * Límites del tier gratuito de Groq, POR MODELO.
 *
 * Leídos de los headers `x-ratelimit-*` de la propia API el 26-ago-2026. La
 * documentación de Groq seguía diciendo 14.400 requests/día y 30 RPM, que ya no
 * aplica: el límite que manda en la generación de horóscopos es el de tokens.
 */
export const GROQ_FREE_TIER_REQUESTS_PER_DAY = 1000;
export const GROQ_FREE_TIER_TOKENS_PER_MINUTE = 8000;

/** Modelo por defecto de DeepSeek. */
export const DEFAULT_DEEPSEEK_MODEL = 'deepseek-v4-flash';

/**
 * Modo de razonamiento de DeepSeek v4.
 *
 * Viene ENCENDIDO por defecto. Medido el 26-ago-2026 sobre el prompt real de
 * una tirada: agrega ~1.400 tokens de razonamiento facturables y lleva la
 * respuesta de 14–17s a 18–32s. Además, en modo pensante DeepSeek IGNORA
 * `temperature`, que es justo lo que cada tarotista configura para su voz.
 * Doc: https://api-docs.deepseek.com/guides/thinking_mode
 */
export const DEEPSEEK_THINKING_DISABLED = { type: 'disabled' } as const;
