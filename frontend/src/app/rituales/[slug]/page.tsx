import type { Metadata } from 'next';

import { RitualDetailPage } from '@/components/features/rituals';
import { getRitualBySlug, getRituals } from '@/lib/api/rituals-api';
import { getRitualDetailMetadata } from '@/lib/metadata/page-metadata';

/**
 * Ficha de un ritual.
 *
 * Route: /rituales/[slug]
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const ritual = await getRitualBySlug(slug);
    return getRitualDetailMetadata(ritual);
  } catch {
    // Si la API no responde en build/request, la página cae a la metadata
    // heredada en vez de tirar abajo el render (mismo criterio que `sitemap.ts`).
    return {};
  }
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const rituals = await getRituals();
    return rituals.map((ritual) => ({ slug: ritual.slug }));
  } catch {
    return [];
  }
}

export default function Page() {
  return <RitualDetailPage />;
}
