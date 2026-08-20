import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { AnimalHoroscopeRoute } from '@/components/features/chinese-horoscope/AnimalHoroscopeRoute';
import { getChineseZodiacMetadata } from '@/lib/metadata/page-metadata';
import { getAllChineseZodiacAnimals, isChineseZodiacAnimal } from '@/lib/utils/chinese-zodiac';

/**
 * Ficha de horóscopo chino por animal.
 *
 * Route: /horoscopo-chino/[animal]
 *
 * Server component (T-SEO-002): la ficha del animal sale de constantes locales y
 * se prerenderiza. La predicción del año queda tras un `<Suspense>` dentro de
 * `AnimalHoroscopeRoute`, porque depende de la query string y de la sesión.
 */

interface PageProps {
  params: Promise<{ animal: string }>;
}

// Sin `revalidate`: el HTML sale entero de constantes del repo, así que solo
// cambia con un deploy —que ya regenera las páginas—. Un ISR diario regeneraría
// 12 URLs por día para producir el mismo byte.

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { animal } = await params;

  // Ídem `/horoscopo/[sign]`: una URL inventada responde 404, no un 200 con
  // metadata `noindex` (T-SEO-006).
  if (!isChineseZodiacAnimal(animal)) {
    notFound();
  }

  return getChineseZodiacMetadata(animal);
}

export function generateStaticParams(): { animal: string }[] {
  return getAllChineseZodiacAnimals().map((animal) => ({ animal }));
}

export default async function Page({ params }: PageProps) {
  const { animal } = await params;

  return <AnimalHoroscopeRoute animal={animal} />;
}
