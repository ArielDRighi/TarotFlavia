import type { Metadata } from 'next';

import { AnimalHoroscopeRoute } from '@/components/features/chinese-horoscope/AnimalHoroscopeRoute';
import {
  INVALID_ROUTE_PARAM_METADATA,
  getChineseZodiacMetadata,
} from '@/lib/metadata/page-metadata';
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

  // Ídem `/horoscopo/[sign]`: una URL inventada no debe declararse duplicada
  // del hub heredando su canonical.
  return isChineseZodiacAnimal(animal)
    ? getChineseZodiacMetadata(animal)
    : INVALID_ROUTE_PARAM_METADATA;
}

export function generateStaticParams(): { animal: string }[] {
  return getAllChineseZodiacAnimals().map((animal) => ({ animal }));
}

export default async function Page({ params }: PageProps) {
  const { animal } = await params;

  return <AnimalHoroscopeRoute animal={animal} />;
}
