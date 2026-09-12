import { describe, it, expect } from 'vitest';
import { CONTENT_DISCLAIMER } from './legal';

/**
 * T-SEO-018: el aviso legal tiene un texto acordado en el backlog y va idéntico
 * en el footer, al pie de fichas y lecturas, y en `/terminos`. Fijarlo acá evita
 * que alguna copia se desvíe con el tiempo.
 */
describe('CONTENT_DISCLAIMER (T-SEO-018)', () => {
  it('es el texto acordado en el backlog, letra por letra', () => {
    expect(CONTENT_DISCLAIMER).toBe(
      'Los contenidos, lecturas y análisis de Auguria tienen fines culturales, de entretenimiento y de autoconocimiento. No sustituyen asesoramiento médico, psicológico, legal ni financiero.'
    );
  });

  it('nombra las cuatro áreas YMYL que no sustituye', () => {
    expect(CONTENT_DISCLAIMER).toMatch(/médico/);
    expect(CONTENT_DISCLAIMER).toMatch(/psicológico/);
    expect(CONTENT_DISCLAIMER).toMatch(/legal/);
    expect(CONTENT_DISCLAIMER).toMatch(/financiero/);
    expect(CONTENT_DISCLAIMER).toMatch(/No sustituyen/);
  });
});
