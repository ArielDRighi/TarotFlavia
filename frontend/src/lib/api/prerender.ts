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
 * 1. **La guarda de `window` va primero, y hace más de lo que parece.** El
 *    riesgo que tapa es que `NEXT_PHASE` quedara horneado en el bundle del
 *    cliente: la función devolvería `true` para siempre en el navegador y
 *    **dejaríamos de contar todas las vistas reales**, en silencio.
 *
 *    Pero además de ser un cinturón de runtime, es lo que **borra este código
 *    del bundle del navegador**. SWC constant-foldea `typeof window !==
 *    'undefined'` a `true` en el build de cliente, así que `isPrerenderBuild()`
 *    colapsa a `return false` y el bloque que agrega el header muere por
 *    dead-code elimination. Verificado sobre `.next/static/`: cero apariciones
 *    de `phase-production-build`, `NEXT_PHASE` y `X-Prerender` en los 119
 *    chunks, y el interceptor compilado no tiene el bloque.
 *
 *    Ojo con esto al testear: en jsdom la condición se evalúa en runtime, así
 *    que el test verifica el comportamiento pero no puede ver la eliminación.
 *    La garantía real es más fuerte que la que el test prueba.
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
