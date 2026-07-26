import {
  GENERATION_SCHEDULE,
  VERIFICATION_SCHEDULE,
  CLEANUP_SCHEDULE,
  HOROSCOPE_CRON_CONFIG,
} from './horoscope-cron.config';

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

  it('expone los schedules en el objeto agregado de config', () => {
    expect(HOROSCOPE_CRON_CONFIG.GENERATION_SCHEDULE).toBe(GENERATION_SCHEDULE);
    expect(HOROSCOPE_CRON_CONFIG.VERIFICATION_SCHEDULE).toBe(
      VERIFICATION_SCHEDULE,
    );
    expect(HOROSCOPE_CRON_CONFIG.CLEANUP_SCHEDULE).toBe(CLEANUP_SCHEDULE);
  });
});
