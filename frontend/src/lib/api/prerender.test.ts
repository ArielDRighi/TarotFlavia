import { describe, it, expect, afterEach, vi } from 'vitest';

import { PRERENDER_HEADER, isPrerenderBuild } from './prerender';

const original = process.env.NEXT_PHASE;

/**
 * Un prerender es server-side por definición, así que la rama que importa sólo
 * se ejercita sin `window`. No se puede cambiar el entorno del archivo a node:
 * el setup de vitest (`src/test/setup.ts`) toca `window` y revienta. Sacarlo a
 * mano es la salida.
 *
 * ⚠️ Y ojo con nombrar esa directiva de vitest aunque sea en un comentario: la
 * levanta igual, de cualquier parte del archivo, y manda todo el suite a node.
 */
function enElServidor(): void {
  vi.stubGlobal('window', undefined);
}

afterEach(() => {
  vi.unstubAllGlobals();
  if (original === undefined) {
    delete process.env.NEXT_PHASE;
  } else {
    process.env.NEXT_PHASE = original;
  }
});

describe('isPrerenderBuild (T-DEPLOY-002)', () => {
  it('es true durante el build de producción', () => {
    enElServidor();
    process.env.NEXT_PHASE = 'phase-production-build';

    expect(isPrerenderBuild()).toBe(true);
  });

  /**
   * Los dos casos server-side que NO son el build y donde la vista sí tiene que
   * contarse: el `next dev` y la regeneración de ISR — que la dispara la visita
   * de alguien, así que es una vista real.
   */
  it.each([
    ['sin NEXT_PHASE', undefined],
    ['en phase-development-server', 'phase-development-server'],
    ['en phase-production-server (ISR)', 'phase-production-server'],
  ])('es false %s', (_caso, phase) => {
    enElServidor();
    if (phase === undefined) {
      delete process.env.NEXT_PHASE;
    } else {
      process.env.NEXT_PHASE = phase;
    }

    expect(isPrerenderBuild()).toBe(false);
  });

  /**
   * La guarda que tapa el peor modo de falla. Si `NEXT_PHASE` quedara horneado
   * en el bundle del cliente, sin esto la función daría `true` para siempre en
   * el navegador y **dejaríamos de contar todas las vistas reales**, en
   * silencio y sin que ningún test se entere.
   */
  it('es false en el navegador aunque NEXT_PHASE diga que es el build', () => {
    process.env.NEXT_PHASE = 'phase-production-build';

    // sin `enElServidor()`: jsdom tiene window, que es el navegador
    expect(isPrerenderBuild()).toBe(false);
  });

  /**
   * Lee `process.env` en cada llamada y no al importar el módulo: durante el
   * build Next levanta workers y este módulo puede cargarse antes de que la
   * variable esté puesta. Cachearla daría `false` para siempre y el fix no
   * haría nada.
   */
  it('lee la variable en cada llamada, no la cachea al importar', () => {
    enElServidor();

    delete process.env.NEXT_PHASE;
    expect(isPrerenderBuild()).toBe(false);

    process.env.NEXT_PHASE = 'phase-production-build';
    expect(isPrerenderBuild()).toBe(true);
  });

  it('usa el mismo nombre de header que espera el backend', () => {
    expect(PRERENDER_HEADER).toBe('X-Prerender');
  });
});
