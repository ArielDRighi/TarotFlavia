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
 * Valor: "0 0 6 * * *"
 * Significado: Todos los días a las 06:00 UTC
 * Razón: Horario temprano UTC para que esté listo en todas las zonas horarias
 */
export const GENERATION_SCHEDULE = '0 0 6 * * *';

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
 * Configuración completa del cron de horóscopos
 *
 * Objeto agregado para facilitar importación y modificación centralizada
 */
export const HOROSCOPE_CRON_CONFIG = {
  DELAY_BETWEEN_SIGNS_MS,
  RETENTION_DAYS,
  GENERATION_SCHEDULE,
  CLEANUP_SCHEDULE,
} as const;
