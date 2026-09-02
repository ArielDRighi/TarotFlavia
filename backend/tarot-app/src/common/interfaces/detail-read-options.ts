/**
 * Opciones de lectura del detalle de una ficha o un artículo.
 *
 * `countView` existe por T-DEPLOY-002: el `npm run build` del frontend
 * prerenderiza las 78 fichas, los 48 artículos y los 4 rituales pegándole a esta API, y esos
 * prerenders no son visitas de nadie. Antes cada deploy sumaba 130 vistas
 * falsas, mezcladas con las reales en la misma columna.
 *
 * El default es **contar**: ante la duda, se cuenta. Sólo el header que manda
 * el build lo apaga (ver `common/decorators/is-prerender.decorator.ts`).
 *
 * Vive en `common/` porque lo usan dos módulos —enciclopedia y rituales—, que
 * son los que tienen páginas de detalle prerenderizadas con un contador
 * atrás. Empezó dentro del módulo de enciclopedia y se movió cuando la revisión
 * encontró que a rituales le faltaba.
 */
export interface DetailReadOptions {
  countView?: boolean;
}
