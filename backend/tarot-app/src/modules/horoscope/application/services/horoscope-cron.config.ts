/**
 * Configuración del cron job de horóscopos
 *
 * Define los parámetros configurables del sistema de generación automática
 * de horóscopos diarios.
 */

/**
 * Delay en milisegundos entre la generación de cada signo
 *
 * Valor: 15000ms (15 segundos)
 * Razón: El tier gratuito de Groq limita a 8.000 TOKENS por minuto (leído de los
 *   headers `x-ratelimit-*` de la propia API el 26-ago-2026; el límite que manda
 *   es el de tokens, no el de requests). Cada horóscopo consume ~1.345 tokens
 *   con `openai/gpt-oss-120b` + `reasoning_effort: 'low'`, medido sobre el
 *   prompt real.
 * Cálculo: 60000ms / 15000ms = 4 requests/minuto × 1.400 tokens ≈ 5.600 tokens/min,
 *   bajo el techo de 8.000 con margen para la variabilidad del modelo.
 * Total: 12 signos × 15s = 180s (~3 minutos), holgado dentro de la ventana
 *   [01:00, 03:00) UTC que exige GENERATION_SCHEDULE.
 *
 * ⚠️ El valor anterior (6000ms) daba 10 req/min ≈ 13.450 tokens/min, muy por
 *   encima del techo de 8.000: se comía 429s a mitad de la tanda. (Sin
 *   `reasoning_effort: 'low'` el mismo ritmo llegaba a ~18.700 tokens/min.)
 */
export const DELAY_BETWEEN_SIGNS_MS = 15000;

/**
 * Días de retención de horóscopos en la base de datos
 *
 * Valor: 30 días
 * Razón: Balance entre historial disponible y consumo de almacenamiento
 * Nota: Los horóscopos más antiguos se eliminan semanalmente
 */
export const RETENTION_DAYS = 30;

/**
 * Expresión cron para generación diaria de horóscopos
 *
 * Formato: "segundo minuto hora díaMes mes díaSemana"
 * Valor: "0 0 1 * * *"
 * Significado: Todos los días a las 01:00 UTC (= 22:00 hora Argentina del día anterior)
 * Razón: El horóscopo se muestra por día calendario LOCAL del visitante y cambia
 *   en pantalla a las 00:00 hora local. Para que a esa medianoche el día ya exista
 *   (y NO se muestre el de ayer como fallback), la generación debe terminar ANTES
 *   de la medianoche argentina (00:00 ART = 03:00 UTC). A las 01:00 UTC, en UTC ya
 *   es el día objetivo, así que el registro queda etiquetado con la fecha correcta.
 *   ⚠️ No adelantar a antes de las 00:00 UTC (ej. 21:00 UTC): la fecha del horóscopo
 *   se toma de `new Date()` (UTC), por lo que generaría el día anterior.
 */
export const GENERATION_SCHEDULE = '0 0 1 * * *';

/**
 * Expresión cron para limpieza semanal de horóscopos antiguos
 *
 * Formato: "segundo minuto hora díaMes mes díaSemana"
 * Valor: "0 0 0 * * 0"
 * Significado: Domingos a medianoche UTC
 * Razón: Mantenimiento periódico en horario de bajo uso
 */
export const CLEANUP_SCHEDULE = '0 0 0 * * 0';

/**
 * T-BUG-016-B: Expresión cron para verificar la completitud de la generación diaria
 *
 * Formato: "segundo minuto hora díaMes mes díaSemana"
 * Valor: "0 0 2 * * *"
 * Significado: Todos los días a las 02:00 UTC (1 hora después de la generación)
 * Razón: Detectar y regenerar signos faltantes si la generación de las 01:00 quedó
 *   incompleta. Se corre a las 02:00 UTC (23:00 hora Argentina) para rellenar los
 *   huecos ANTES de la medianoche argentina, cuando el front cambia al día nuevo.
 */
export const VERIFICATION_SCHEDULE = '0 0 2 * * *';

/**
 * T-BUG-016-B: Cantidad máxima de reintentos por signo ante fallo transitorio
 *
 * Valor: 1 reintento (2 intentos totales por signo)
 * Razón: Tolerar errores transitorios (5xx / timeout) de los proveedores de IA
 *   sin volver a apilar reintentos sobre los que ya hace `AIProviderService`.
 *
 * ⚠️ T-IA-005 — por qué bajó de 3 a 1. Este reintento se monta ENCIMA de otros
 *   dos niveles: los MAX_RETRY_ATTEMPTS intentos por proveedor de
 *   `retryWithBackoff` y la cadena de fallback entre proveedores. Con 3
 *   reintentos, un signo que fallaba disparaba hasta 12 llamadas —la mayoría
 *   dentro del mismo minuto—: 12.000–16.000 tokens/min contra un techo de
 *   8.000. La tormenta de reintentos se auto-provocaba el 429 que después el
 *   health reportaba como caída.
 *
 *   Y no es el último recurso: si el signo igual queda sin generar, lo levanta
 *   la pasada de verificación de las 02:00 UTC (VERIFICATION_SCHEDULE) y el
 *   backfill de bootstrap de cada deploy.
 */
export const MAX_RETRIES_PER_SIGN = 1;

/**
 * T-BUG-016-B: Delays (ms) de backoff antes de cada reintento
 *
 * Valor: [60000]
 * Razón: El bucket de tokens de Groq se repone POR MINUTO. Los 6s del valor
 *   anterior caían dentro de la MISMA ventana del 429 que se acababa de
 *   provocar, así que el reintento chocaba seguro y gastaba cuota que no
 *   existía. Una ventana completa es el mínimo que tiene sentido esperar.
 *
 * ⚠️ Tiene que tener exactamente MAX_RETRIES_PER_SIGN elementos: un array más
 *   corto deja `RETRY_DELAYS_MS[i]` en `undefined` y `delay(undefined)`
 *   reintenta al instante. Hay un test de guarda para eso.
 */
export const RETRY_DELAYS_MS = [60000];

/**
 * Configuración completa del cron de horóscopos
 *
 * Objeto agregado para facilitar importación y modificación centralizada
 */
export const HOROSCOPE_CRON_CONFIG = {
  DELAY_BETWEEN_SIGNS_MS,
  RETENTION_DAYS,
  GENERATION_SCHEDULE,
  CLEANUP_SCHEDULE,
  VERIFICATION_SCHEDULE,
  MAX_RETRIES_PER_SIGN,
  RETRY_DELAYS_MS,
} as const;
