import type { Metadata } from 'next';

import { AnimalHoroscopePage } from '@/components/features/chinese-horoscope/AnimalHoroscopePage';
import { getChineseZodiacMetadata } from '@/lib/metadata/page-metadata';
import { getAllChineseZodiacAnimals } from '@/lib/utils/chinese-zodiac';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

/**
 * Ficha de horóscopo chino por animal.
 *
 * Route: /horoscopo-chino/[animal]
 */

interface PageProps {
  params: Promise<{ animal: string }>;
}

function parseAnimal(value: string): ChineseZodiacAnimal | null {
  const animals: string[] = getAllChineseZodiacAnimals();

  return animals.includes(value) ? (value as ChineseZodiacAnimal) : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { animal } = await params;
  const parsed = parseAnimal(animal);

  // Una URL inventada (`/horoscopo-chino/unicornio`) no debe heredar el título
  // del hub: sin metadata propia Next usa la del layout padre, que es lo correcto.
  return parsed ? getChineseZodiacMetadata(parsed) : {};
}

export function generateStaticParams(): { animal: string }[] {
  return getAllChineseZodiacAnimals().map((animal) => ({ animal }));
}

export default function Page() {
  return <AnimalHoroscopePage />;
}
