import { describe, it, expect } from 'vitest';

import { parseNumericRouteId } from './route-params';

describe('parseNumericRouteId', () => {
  it('devuelve el id cuando el segmento es un entero positivo', () => {
    expect(parseNumericRouteId('1')).toBe(1);
    expect(parseNumericRouteId('42')).toBe(42);
  });

  it('⚠️ T-SEO-006: rechaza lo que no es un id para que la ruta pueda 404', () => {
    // Sin esto, `Number('abc')` daba `NaN` y el request salía a la API con
    // `/tarotistas/NaN`: la ruta respondía 200 con el esqueleto (soft-404).
    expect(parseNumericRouteId('abc')).toBeNull();
    expect(parseNumericRouteId('')).toBeNull();
    expect(parseNumericRouteId('1.5')).toBeNull();
    expect(parseNumericRouteId('1e3')).toBeNull();
    expect(parseNumericRouteId('+1')).toBeNull();
    expect(parseNumericRouteId(' 1 ')).toBeNull();
  });

  it('rechaza el 0 y los negativos: los IDs del proyecto arrancan en 1', () => {
    expect(parseNumericRouteId('0')).toBeNull();
    expect(parseNumericRouteId('-1')).toBeNull();
  });

  it('rechaza un entero fuera del rango seguro', () => {
    expect(parseNumericRouteId('9007199254740993')).toBeNull();
  });
});
