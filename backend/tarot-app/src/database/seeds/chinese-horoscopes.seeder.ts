/**
 * TASK-131: Seeder para Horóscopos Chinos (Opcional - Desarrollo)
 *
 * Este seeder NO genera horóscopos con IA (muy lento y costoso).
 * En su lugar, ofrece 2 opciones:
 *
 * 1. Generar horóscopos reales con IA (~10 minutos):
 *    ts-node scripts/generate-chinese-horoscopes.ts 2025
 *
 * 2. Usar este seeder para crear datos de prueba rápidos (mock)
 *
 * IMPORTANTE: Este seeder es solo para desarrollo/testing.
 * En producción, SIEMPRE usar generación real con IA.
 */

import { Repository } from 'typeorm';
import { ChineseHoroscope } from '../../modules/horoscope/entities/chinese-horoscope.entity';
import {
  ChineseZodiacAnimal,
  ChineseElement,
  getChineseZodiacInfo,
} from '../../common/utils/chinese-zodiac.utils';

/**
 * Seed básico de horóscopos chinos para desarrollo
 *
 * SOLO PARA TESTING - NO USAR EN PRODUCCIÓN
 *
 * Genera 60 horóscopos mock (sin IA) para pruebas rápidas
 */
export async function seedChineseHoroscopesMock(
  repository: Repository<ChineseHoroscope>,
  year: number = new Date().getFullYear(),
): Promise<void> {
  console.log(`[Seed] Verificando horóscopos chinos mock para año ${year}...`);

  // Verificar si ya existen horóscopos para este año
  const existingCount = await repository.count({ where: { year } });

  if (existingCount > 0) {
    console.log(
      `[Seed] ⚠️  Ya existen ${existingCount} horóscopos para ${year}. Saltando...`,
    );
    return;
  }

  console.log(`[Seed] Generando 60 horóscopos mock para ${year}...`);

  const animals = Object.values(ChineseZodiacAnimal);
  const elements: ChineseElement[] = [
    'metal',
    'water',
    'wood',
    'fire',
    'earth',
  ];
  const horoscopes: ChineseHoroscope[] = [];

  for (const animal of animals) {
    for (const element of elements) {
      const animalInfo = getChineseZodiacInfo(animal);

      const horoscope = repository.create({
        animal,
        element,
        year,
        generalOverview: `[MOCK DATA] Horóscopo general para ${animalInfo.nameEs} de ${element}. Este es un horóscopo de prueba generado automáticamente para desarrollo. Para contenido real, usa 'ts-node scripts/generate-chinese-horoscopes.ts ${year}'.`,
        areas: {
          love: {
            content: `[MOCK] Predicción de amor para ${animalInfo.nameEs} de ${element}.`,
            score: Math.floor(Math.random() * 5) + 5, // 5-10
          },
          career: {
            content: `[MOCK] Predicción de carrera para ${animalInfo.nameEs} de ${element}.`,
            score: Math.floor(Math.random() * 5) + 5,
          },
          wellness: {
            content: `[MOCK] Predicción de bienestar para ${animalInfo.nameEs} de ${element}.`,
            score: Math.floor(Math.random() * 5) + 5,
          },
          finance: {
            content: `[MOCK] Predicción de finanzas para ${animalInfo.nameEs} de ${element}.`,
            score: Math.floor(Math.random() * 5) + 5,
          },
        },
        luckyElements: {
          numbers: [3, 7, 9],
          colors: ['Rojo', 'Dorado'],
          directions: ['Sur', 'Este'],
          months: [3, 6, 9],
        },
        compatibility: {
          best: animalInfo.compatibleWith.slice(0, 2),
          good: animalInfo.compatibleWith.slice(2),
          challenging: animalInfo.incompatibleWith,
        },
        monthlyHighlights: `[MOCK] Destacados mensuales para ${animalInfo.nameEs} de ${element}.`,
        aiProvider: 'mock',
        aiModel: 'test-seeder',
        tokensUsed: 0,
        generationTimeMs: 0,
        viewCount: 0,
      });

      horoscopes.push(horoscope);
    }
  }

  await repository.save(horoscopes);

  console.log(`[Seed] ✓ 60 horóscopos mock creados para ${year}`);
  console.log(`[Seed] ⚠️  Recuerda: Estos son datos de prueba (MOCK)`);
  console.log(
    `[Seed] Para horóscopos reales: ts-node scripts/generate-chinese-horoscopes.ts ${year}`,
  );
}
