/**
 * Opciones de lectura del detalle de una ficha o un artículo.
 *
 * `countView` existe por T-DEPLOY-002: el `npm run build` del frontend
 * prerenderiza las 78 fichas y los 48 artículos pegándole a esta API, y esos
 * prerenders no son visitas de nadie. Antes cada deploy sumaba ~126 vistas
 * falsas, mezcladas con las reales en la misma columna.
 *
 * El default es **contar**: ante la duda, se cuenta. Sólo el header que manda
 * el build lo apaga (ver `common/decorators/is-prerender.decorator.ts`).
 *
 * Vive en su propio archivo y no dentro de `encyclopedia.service.ts` porque ese
 * servicio ya importa `ArticlesService`: declararlo ahí y usarlo acá cerraría
 * un ciclo de imports.
 */
export interface DetailReadOptions {
  countView?: boolean;
}
