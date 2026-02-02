/**
 * Tipos de eventos sagrados del calendario
 */
export enum SacredEventType {
  SABBAT = 'sabbat', // Solsticios/Equinoccios (Rueda del Año)
  LUNAR_PHASE = 'lunar_phase', // Fases lunares
  PORTAL = 'portal', // Portales numéricos (11/11, 08/08)
  CULTURAL = 'cultural', // Día de Muertos, San Valentín, etc.
  ECLIPSE = 'eclipse', // Eclipses solares/lunares
}
