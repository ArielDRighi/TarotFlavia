/**
 * Google AdSense Types
 *
 * El loader oficial (`adsbygoogle.js`) expone una cola global en `window`.
 * Cada elemento empujado en la cola le pide a AdSense que rellene un `<ins>`
 * pendiente; el objeto vacío `{}` es la forma estándar de reclamar el
 * siguiente slot del DOM.
 */

/** Configuración que acepta cada push a la cola de AdSense */
export type AdsByGoogleConfig = Record<string, unknown>;

/** Cola global creada por el loader de AdSense */
export type AdsByGoogleQueue = AdsByGoogleConfig[];

declare global {
  interface Window {
    adsbygoogle?: AdsByGoogleQueue;
  }
}
