/**
 * Assets de marca compartidos.
 *
 * El logo se referencia desde la home, desde `/sobre-nosotros` y desde el
 * `Organization` del JSON-LD. Con la ruta repetida en tres lugares, un renombre
 * del archivo dejaba el logo visible y el declarado a Google apuntando a cosas
 * distintas sin que ningún test se enterara.
 */

/** Logo de Auguria. Las dimensiones son las reales del archivo (apaisado). */
export const LOGO = {
  path: '/images/logo-auguria.webp',
  width: 655,
  height: 386,
} as const;
