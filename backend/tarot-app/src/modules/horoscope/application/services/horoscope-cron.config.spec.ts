import {
  GENERATION_SCHEDULE,
  VERIFICATION_SCHEDULE,
  CLEANUP_SCHEDULE,
  DELAY_BETWEEN_SIGNS_MS,
  MAX_RETRIES_PER_SIGN,
  RETRY_DELAYS_MS,
  HOROSCOPE_CRON_CONFIG,
} from './horoscope-cron.config';
import { GROQ_FREE_TIER_TOKENS_PER_MINUTE } from '../../../ai/domain/constants/ai-models.constants';
import {
  MAX_RETRY_ATTEMPTS,
  RETRY_BASE_DELAY_MS,
} from '../../../ai/domain/constants/ai-retry.constants';

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

  /**
   * T-IA-005: la cadencia de 15s modela el CAMINO FELIZ. En el camino de error
   * se apilan dos niveles de reintento —el del cron sobre el de
   * `AIProviderService`— y la ráfaga resultante desborda el mismo techo de
   * 8.000 tokens/minuto que la cadencia estaba cuidando.
   *
   * Estos tests fijan el presupuesto del PEOR caso para que subir un reintento
   * o acortar un backoff rompa el build en lugar de auto-provocar el 429 que
   * el health después reporta como caída.
   */
  describe('presupuesto del camino de error (T-IA-005)', () => {
    const TOKENS_POR_SIGNO = 1400;
    const MS_POR_MINUTO = 60_000;
    const CANTIDAD_DE_SIGNOS = 12;

    /**
     * Ventana del bucket de tokens de Groq: el límite es POR MINUTO, así que
     * un reintento dentro del mismo minuto del 429 vuelve a chocar seguro.
     */
    const VENTANA_DEL_BUCKET_MS = MS_POR_MINUTO;

    it('sincroniza la cantidad de backoffs con la de reintentos', () => {
      // Un array más corto que los reintentos dejaba `RETRY_DELAYS_MS[i]`
      // en undefined y `delay(undefined)` reintenta al instante.
      expect(RETRY_DELAYS_MS).toHaveLength(MAX_RETRIES_PER_SIGN);
    });

    it('espera al menos una ventana completa del bucket antes de reintentar', () => {
      // Los 6s del valor anterior caían dentro del mismo minuto del 429.
      RETRY_DELAYS_MS.forEach((delay) => {
        expect(delay).toBeGreaterThanOrEqual(VENTANA_DEL_BUCKET_MS);
      });
    });

    it('usa backoff no decreciente entre reintentos', () => {
      // Con un solo reintento configurado la comparación no tiene con qué
      // comparar; la aserción de longitud deja explícito que hoy este test
      // solo protege el día que el array crezca.
      expect(RETRY_DELAYS_MS.length).toBeGreaterThan(0);

      RETRY_DELAYS_MS.slice(1).forEach((delay, i) => {
        expect(delay).toBeGreaterThanOrEqual(RETRY_DELAYS_MS[i]);
      });
    });

    it('la ráfaga de reintentos no desborda los 8.000 tokens/minuto', () => {
      // Peor caso dentro de un minuto contra el MISMO proveedor: la ráfaga
      // completa de reintentos internos de `AIProviderService` (que ocurre en
      // unos pocos segundos) más los signos que la cadencia normal alcanza a
      // meter en lo que queda del minuto.
      const backoffsInternosMs = Array.from(
        { length: MAX_RETRY_ATTEMPTS - 1 },
        (_, i) => Math.pow(2, i + 1) * RETRY_BASE_DELAY_MS,
      ).reduce((total, delay) => total + delay, 0);

      const restoDelMinutoMs = MS_POR_MINUTO - backoffsInternosMs;
      const signosSiguientes = Math.floor(
        restoDelMinutoMs / DELAY_BETWEEN_SIGNS_MS,
      );

      const llamadasEnElMinuto = MAX_RETRY_ATTEMPTS + signosSiguientes;
      const tokensEnElMinuto = llamadasEnElMinuto * TOKENS_POR_SIGNO;

      expect(tokensEnElMinuto).toBeLessThanOrEqual(
        GROQ_FREE_TIER_TOKENS_PER_MINUTE,
      );
    });

    it('la tanda con TODOS los signos agotando reintentos termina antes de la verificación', () => {
      // Si la tanda de las 01:00 sigue corriendo a las 02:00, la pasada de
      // verificación arranca en paralelo y duplica las llamadas: dos tandas
      // compitiendo por el mismo bucket de 8.000 tokens/minuto.

      // Presupuesto por llamada al proveedor: medido en producción el
      // 27-ago-2026 (Groq ~1s, DeepSeek 8,6s). Se toma 10s con margen.
      const MS_POR_LLAMADA = 10_000;
      // Groq (horóscopos) + DeepSeek como fallback.
      const PROVEEDORES_CONFIGURADOS = 2;

      const backoffsInternosMs = Array.from(
        { length: MAX_RETRY_ATTEMPTS - 1 },
        (_, i) => Math.pow(2, i + 1) * RETRY_BASE_DELAY_MS,
      ).reduce((total, delay) => total + delay, 0);

      const msPorIntento =
        PROVEEDORES_CONFIGURADOS *
        (MAX_RETRY_ATTEMPTS * MS_POR_LLAMADA + backoffsInternosMs);

      const esperasDeReintentoMs = RETRY_DELAYS_MS.reduce(
        (total, delay) => total + delay,
        0,
      );
      const msPorSigno =
        (MAX_RETRIES_PER_SIGN + 1) * msPorIntento + esperasDeReintentoMs;

      const cadenciaMs = (CANTIDAD_DE_SIGNOS - 1) * DELAY_BETWEEN_SIGNS_MS;
      const peorCasoMs = CANTIDAD_DE_SIGNOS * msPorSigno + cadenciaMs;

      // La verificación corre 1 hora después de la generación; se deja un
      // colchón de 5 minutos para que no se pisen.
      const presupuestoMs = 55 * MS_POR_MINUTO;

      expect(peorCasoMs).toBeLessThanOrEqual(presupuestoMs);
    });

    it('expone la política de reintentos en el objeto agregado de config', () => {
      expect(HOROSCOPE_CRON_CONFIG.MAX_RETRIES_PER_SIGN).toBe(
        MAX_RETRIES_PER_SIGN,
      );
      expect(HOROSCOPE_CRON_CONFIG.RETRY_DELAYS_MS).toBe(RETRY_DELAYS_MS);
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
