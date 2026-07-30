import type { Metadata } from 'next';

import { CardDetailPageContent } from '@/components/features/encyclopedia/CardDetailPageContent';
import { getCardBySlug, getCards } from '@/lib/api/encyclopedia-api';
import { getCardDetailMetadata } from '@/lib/metadata/page-metadata';
import type { CardDetail } from '@/types/encyclopedia.types';

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
 * La API puede no responder durante el build. Preferimos degradar (metadata
 * heredada + fetch desde el cliente) antes que romper el render de la ruta,
 * mismo criterio que `sitemap.ts`.
 */
async function safeGetCard(slug: string): Promise<CardDetail | null> {
  try {
    return await getCardBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const card = await safeGetCard(slug);

  return card ? getCardDetailMetadata(card) : {};
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const cards = await getCards();
    return cards.map((card) => ({ slug: card.slug }));
  } catch {
    return [];
  }
}

export default async function CardDetailRoute({ params }: PageProps) {
  const { slug } = await params;
  const card = await safeGetCard(slug);

  return <CardDetailPageContent slug={slug} initialCard={card} />;
}
