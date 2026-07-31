import type { Metadata } from 'next';

import { AnimalHoroscopePage } from '@/components/features/chinese-horoscope/AnimalHoroscopePage';
import {
  INVALID_ROUTE_PARAM_METADATA,
  getChineseZodiacMetadata,
} from '@/lib/metadata/page-metadata';
import { getAllChineseZodiacAnimals, isChineseZodiacAnimal } from '@/lib/utils/chinese-zodiac';

/**
 * Ficha de horóscopo chino por animal.
 *
 * Route: /horoscopo-chino/[animal]
 */

interface PageProps {
  params: Promise<{ animal: string }>;
}

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

export default function Page() {
  return <AnimalHoroscopePage />;
}
