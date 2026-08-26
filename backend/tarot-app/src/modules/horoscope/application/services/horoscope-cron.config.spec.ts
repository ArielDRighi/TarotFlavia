import {
  GENERATION_SCHEDULE,
  VERIFICATION_SCHEDULE,
  CLEANUP_SCHEDULE,
  DELAY_BETWEEN_SIGNS_MS,
  HOROSCOPE_CRON_CONFIG,
} from './horoscope-cron.config';
import { GROQ_FREE_TIER_TOKENS_PER_MINUTE } from '../../../ai/domain/constants/ai-models.constants';

/**
 * Tests de guarda para las expresiones cron de horóscopos.
 *
 * El horóscopo se muestra por día calendario LOCAL del visitante (Argentina,
 * UTC-3) y cambia en pantalla a las 00:00 hora local. Para que a esa medianoche
 * el día ya exista (y no se muestre el de ayer como fallback), la generación
 * debe correr ANTES de la medianoche argentina (00:00 ART = 03:00 UTC) y DESPUÉS
 * de las 00:00 UTC (la fecha se estampa con `new Date()` UTC; correr antes del
 * cambio de día UTC generaría el día anterior).
 *
 * Estos tests fijan las horas para que un cambio accidental del huso rompa el
 * build en lugar de degradar silenciosamente la UX en producción.
 */
describe('horoscope-cron.config', () => {
  const HOUR_FIELD_INDEX = 2; // "segundo minuto HORA díaMes mes díaSemana"

  const getCronHour = (expression: string): number =>
    Number(expression.split(' ')[HOUR_FIELD_INDEX]);

  it('genera a las 01:00 UTC (22:00 ART, antes de la medianoche argentina)', () => {
    expect(GENERATION_SCHEDULE).toBe('0 0 1 * * *');
  });

  it('verifica a las 02:00 UTC (23:00 ART, 1h después de la generación)', () => {
    expect(VERIFICATION_SCHEDULE).toBe('0 0 2 * * *');
  });

  it('genera y verifica DENTRO de la ventana válida [00:00, 03:00) UTC', () => {
    // Después de las 00:00 UTC: la fecha ya es el día objetivo.
    // Antes de las 03:00 UTC: termina antes de la medianoche argentina.
    const generationHour = getCronHour(GENERATION_SCHEDULE);
    const verificationHour = getCronHour(VERIFICATION_SCHEDULE);

    expect(generationHour).toBeGreaterThanOrEqual(0);
    expect(verificationHour).toBeLessThan(3);
  });

  it('verifica DESPUÉS de generar (para rellenar huecos, no antes)', () => {
    expect(getCronHour(VERIFICATION_SCHEDULE)).toBeGreaterThan(
      getCronHour(GENERATION_SCHEDULE),
    );
  });

  describe('cadencia de generación (rate limit de Groq)', () => {
    /**
     * Medido el 26-ago-2026 contra `openai/gpt-oss-120b` con el prompt real de
     * horóscopo y `reasoning_effort: 'low'`: ~1.345 tokens por signo
     * (prompt + completion). Se redondea hacia arriba para dejar margen.
     */
    const TOKENS_POR_SIGNO = 1400;

    const GROQ_FREE_TPM = GROQ_FREE_TIER_TOKENS_PER_MINUTE;

    const CANTIDAD_DE_SIGNOS = 12;
    const MS_POR_MINUTO = 60_000;

    it('no supera los 8.000 tokens/minuto del tier gratuito de Groq', () => {
      const requestsPorMinuto = MS_POR_MINUTO / DELAY_BETWEEN_SIGNS_MS;
      const tokensPorMinuto = requestsPorMinuto * TOKENS_POR_SIGNO;

      expect(tokensPorMinuto).toBeLessThanOrEqual(GROQ_FREE_TPM);
    });

    it('termina los 12 signos bastante antes de la verificación de las 02:00 UTC', () => {
      // Hay 11 delays, no 12: el código no espera antes del primer signo.
      const duracionMs = (CANTIDAD_DE_SIGNOS - 1) * DELAY_BETWEEN_SIGNS_MS;

      // La tanda tiene que terminar mucho antes de la pasada de verificación
      // (02:00 UTC, una hora después de la generación), para que esa pasada
      // encuentre huecos reales y no una tanda todavía en curso. Se deja un
      // margen de 4x sobre los ~3 minutos actuales.
      const presupuestoMs = 15 * MS_POR_MINUTO;

      expect(duracionMs).toBeLessThanOrEqual(presupuestoMs);
    });

    it('expone el delay en el objeto agregado de config', () => {
      expect(HOROSCOPE_CRON_CONFIG.DELAY_BETWEEN_SIGNS_MS).toBe(
        DELAY_BETWEEN_SIGNS_MS,
      );
    });
  });

  it('expone los schedules en el objeto agregado de config', () => {
    expect(HOROSCOPE_CRON_CONFIG.GENERATION_SCHEDULE).toBe(GENERATION_SCHEDULE);
    expect(HOROSCOPE_CRON_CONFIG.VERIFICATION_SCHEDULE).toBe(
      VERIFICATION_SCHEDULE,
    );
    expect(HOROSCOPE_CRON_CONFIG.CLEANUP_SCHEDULE).toBe(CLEANUP_SCHEDULE);
  });
});
