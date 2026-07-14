import type { MetadataRoute } from 'next';
import { buildSitemap } from '@/lib/metadata/sitemap';

/**
 * El sitemap se regenera en el contenedor que corre, no en el build.
 *
 * El build del frontend (Docker, en Railway) **no alcanza a la API**: si el
 * sitemap se prerenderizara solo en build, se publicaría con las estáticas y
 * nada más — sin la enciclopedia ni los servicios, que son justamente el
 * contenido que queremos que Google indexe. Con ISR se regenera cada hora ya
 * desplegado, donde la API sí responde, y acota las llamadas a 1 barrido/hora.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap();
}
