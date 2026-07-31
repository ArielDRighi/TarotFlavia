import { cache } from 'react';
import type { Metadata } from 'next';

import { CardDetailPageContent } from '@/components/features/encyclopedia/CardDetailPageContent';
import { getCardBySlug, getCards } from '@/lib/api/encyclopedia-api';
import { getCardDetailMetadata } from '@/lib/metadata/page-metadata';
import { resolveRouteResource, safeStaticParams } from '@/lib/metadata/route-data';

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

/** La enciclopedia es contenido estático; un día de ISR alcanza y sobra. */
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

  return <CardDetailPageContent slug={slug} initialCard={await getCard(slug)} />;
}
