import { cache } from 'react';
import type { Metadata } from 'next';

import { CardDetailPageContent } from '@/components/features/encyclopedia/CardDetailPageContent';
import { getCardBySlug, getCards, getCombinationCardNames } from '@/lib/api/encyclopedia-api';
import { getCardDetailMetadata } from '@/lib/metadata/page-metadata';
import {
  resolveListingData,
  resolveRouteResource,
  safeStaticParams,
} from '@/lib/metadata/route-data';

/**
 * Ficha de una carta del tarot.
 *
 * Route: /enciclopedia/tarot/[slug]
 *
 * Era un client component: las 78 fichas servían el MISMO HTML (el skeleton) y
 * el MISMO `<title>` heredado del root layout, así que Google las agrupaba como
 * duplicadas y elegía una sola canónica (T-PROD-020). Ahora la ruta resuelve la
 * carta en el servidor: `title`/`description` propios y contenido real en el HTML.
 */

/**
 * La enciclopedia es contenido estático; un día de ISR alcanza y sobra.
 *
 * ⚠️ **Esto acopla el deploy al contenido de la base.** Las 78 fichas se
 * prerenderizan en el `npm run build` contra la API: el HTML que ve Google es
 * una foto de los datos que había en ese instante, y esa foto dura 24 h. Si el
 * frontend se construye antes de que el backend tenga el contenido, sirve
 * fichas vacías durante un día entero.
 *
 * Pasó el 26-ago-2026 con T-SEO-009/013 y costó una hora de diagnóstico. El
 * orden del deploy no es opcional:
 *
 *   1. backend (las migraciones corren solas al arrancar)
 *   2. `npm run db:seed:encyclopedia` — los seeders NO corren en el deploy, y
 *      el contenido extendido de las fichas vive en un seeder, no en una
 *      migración
 *   3. recién ahí, el build del frontend
 *
 * Y el paso 3 tiene su propia trampa: `railway redeploy`, incluso con
 * `--from-source`, reusa la capa de Docker del build si el commit es el mismo
 * —el `Dockerfile` hace `COPY frontend/` y después `RUN npm run build`—, así
 * que devuelve el MISMO HTML byte a byte. Para reconstruir de verdad hace falta
 * que cambie algo dentro de `frontend/`.
 *
 * El runbook completo está en `docs/BACKLOG_SEO_CONTENIDO_2026_08.md`.
 */
export const revalidate = 86400;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * `generateMetadata` y la página piden la misma carta. Next solo dedupea
 * `fetch()`, y acá abajo hay axios — sin `cache()` serían 156 requests por
 * build en vez de 78.
 */
const getCard = cache((slug: string) => resolveRouteResource(() => getCardBySlug(slug)));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  return getCardDetailMetadata(await getCard(slug));
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return safeStaticParams(getCards, (card) => ({ slug: card.slug }));
}

export default async function CardDetailRoute({ params }: PageProps) {
  const { slug } = await params;
  const card = await getCard(slug);

  // Los cross-links de las combinaciones (T-SEO-010) traen solo el slug: el
  // nombre se resuelve acá para que el texto del enlace esté en el HTML. Si el
  // listado falla, `CardCombinations` cae al slug legible y la ficha sale igual.
  const combinationCardNames =
    (await resolveListingData(() => getCombinationCardNames(card.combinations))) ?? {};

  return (
    <CardDetailPageContent
      slug={slug}
      initialCard={card}
      combinationCardNames={combinationCardNames}
    />
  );
}
