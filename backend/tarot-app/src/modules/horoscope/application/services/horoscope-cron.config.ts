/**
 * Configuración del cron job de horóscopos
 *
 * Define los parámetros configurables del sistema de generación automática
 * de horóscopos diarios.
 */

/**
 * Delay en milisegundos entre la generación de cada signo
 *
 * Valor: 6000ms (6 segundos)
 * Razón: Permite max 10 requests/minuto, respetando el límite de 15 RPM de Gemini
 * Cálculo: 60000ms / 10 = 6000ms
 */
export const DELAY_BETWEEN_SIGNS_MS = 6000;

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
 * Valor: 3 reintentos (4 intentos totales por signo)
 * Razón: Tolerar errores transitorios (5xx / rate limit / timeout) de los proveedores de IA
 */
export const MAX_RETRIES_PER_SIGN = 3;

/**
 * T-BUG-016-B: Delays (ms) de backoff exponencial antes de cada reintento
 *
 * Valor: [6000, 12000, 24000]
 * Razón: Backoff creciente respetando rate limits sin bloquear el lote completo
 */
export const RETRY_DELAYS_MS = [6000, 12000, 24000];

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
