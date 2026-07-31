import type { Metadata } from 'next';

import { RitualDetailPage } from '@/components/features/rituals';
import { getRitualBySlug, getRituals } from '@/lib/api/rituals-api';
import { getRitualDetailMetadata } from '@/lib/metadata/page-metadata';
import { resolveRouteResource, safeStaticParams } from '@/lib/metadata/route-data';

/**
 * Ficha de un ritual.
 *
 * Route: /rituales/[slug]
 */

/** Sin esto la metadata quedaría congelada al build: los rituales se editan. */
export const revalidate = 86400;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  return getRitualDetailMetadata(await resolveRouteResource(() => getRitualBySlug(slug)));
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return safeStaticParams(getRituals, (ritual) => ({ slug: ritual.slug }));
}

export default function Page() {
  return <RitualDetailPage />;
}
