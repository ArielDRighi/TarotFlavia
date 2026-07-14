/**
 * Imagen de preview social.
 *
 * La genera `app/opengraph-image.tsx` con next/og en build; esta es la definición
 * compartida entre esa ruta y los metadata (`seo.ts`), para que la URL, el tamaño
 * y el alt no puedan divergir. El `og-image.png` anterior nunca existió en `public/`.
 */

/** Ruta que sirve la imagen generada por la convención de archivo de Next. */
export const OG_IMAGE_PATH = '/opengraph-image';

/** Tamaño recomendado por las redes sociales para una card grande. */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export const OG_IMAGE_ALT = 'Auguria — Tu guía espiritual';
