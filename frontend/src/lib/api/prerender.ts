/**
 * Header con el que el build le avisa a la API que la request es un prerender
 * y no la visita de una persona.
 *
 * El backend lo lee en `common/decorators/is-prerender.decorator.ts`. Express
 * normaliza los nombres a minúsculas, así que la capitalización de acá no
 * importa del otro lado.
 */
export const PRERENDER_HEADER = 'X-Prerender';

/** Fase que Next expone en `NEXT_PHASE` mientras corre `next build`. */
const PHASE_PRODUCTION_BUILD = 'phase-production-build';

/**
 * `true` sólo mientras `npm run build` prerenderiza las páginas.
 *
 * Existe por T-DEPLOY-002: el export estático pide las 78 fichas y los 48
 * artículos a la API, y cada uno contaba como una visita. Eran ~126 vistas
 * falsas por deploy, mezcladas con las reales en la misma columna.
 *
 * **Dos decisiones que no son obvias:**
 *
 * 1. **La guarda de `window` va primero.** Next inlinea en el bundle del
 *    cliente sólo `NODE_ENV` y las `NEXT_PUBLIC_*`, así que `NEXT_PHASE`
 *    debería quedar `undefined` en el navegador — pero si algún día eso
 *    cambiara y el valor quedara horneado, la función devolvería `true` para
 *    siempre en el navegador y **dejaríamos de contar todas las vistas
 *    reales**, en silencio. Un prerender es server-side por definición, así que
 *    la guarda no cuesta nada y tapa ese modo de falla entero.
 *
 * 2. **Lee `process.env` en cada llamada.** Durante el build Next levanta
 *    workers y este módulo puede cargarse antes de que la variable esté puesta.
 *    Cachearla en una `const` de módulo daría `false` para siempre.
 *
 * No cubre la regeneración de ISR (`phase-production-server`) **a propósito**:
 * esa la dispara la visita de alguien, así que es una vista de verdad.
 */
export function isPrerenderBuild(): boolean {
  if (typeof window !== 'undefined') return false;

  return process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
}
