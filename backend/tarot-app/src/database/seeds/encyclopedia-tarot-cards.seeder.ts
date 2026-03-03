import { DataSource } from 'typeorm';
import { EncyclopediaTarotCard } from '../../modules/encyclopedia/entities/encyclopedia-tarot-card.entity';
import { ArcanaType } from '../../modules/encyclopedia/enums/tarot.enums';
import {
  ALL_TAROT_CARDS,
  CardSeedData,
  TOTAL_CARDS,
} from '../../modules/encyclopedia/data/cards-seed.data';

/**
 * Seed Enciclopedia de Cartas del Tarot
 * Puebla la base de datos con las 78 cartas del Tarot completas
 *
 * Features:
 * - Idempotente: Se puede ejecutar múltiples veces sin duplicar datos
 * - 22 Arcanos Mayores + 56 Arcanos Menores (14 × 4 palos)
 * - Contenido en español con información esotérica completa
 * - Validación de contenido mínimo por carta
 */
export async function seedEncyclopediaTarotCards(
  dataSource: DataSource,
): Promise<void> {
  console.log('🃏 Iniciando seed de cartas de la Enciclopedia de Tarot...');

  const cardRepository = dataSource.getRepository(EncyclopediaTarotCard);

  // Verificar si ya existen cartas (idempotencia)
  const existingCount = await cardRepository.count();
  if (existingCount > 0) {
    console.log(
      `✅ Cartas de la enciclopedia ya pobladas (${existingCount} cartas encontradas). Saltando...`,
    );
    return;
  }

  console.log(`📦 Insertando ${TOTAL_CARDS} cartas del Tarot...`);

  // Validar contenido y construir entidades para batch insert
  const cards = ALL_TAROT_CARDS.map((cardData) => {
    validateCardContent(cardData);

    return cardRepository.create({
      slug: cardData.slug,
      nameEn: cardData.nameEn,
      nameEs: cardData.nameEs,
      arcanaType: cardData.arcanaType,
      number: cardData.number,
      romanNumeral: cardData.romanNumeral ?? null,
      suit: cardData.suit ?? null,
      courtRank: cardData.courtRank ?? null,
      element: cardData.element ?? null,
      planet: cardData.planet ?? null,
      zodiacSign: cardData.zodiacSign ?? null,
      meaningUpright: cardData.meaningUpright,
      meaningReversed: cardData.meaningReversed,
      description: cardData.description,
      keywords: cardData.keywords,
      imageUrl: cardData.imageUrl,
      thumbnailUrl: null,
      relatedCards: null,
      viewCount: 0,
    });
  });

  await cardRepository.save(cards);
  const insertedCount = cards.length;

  // Estadísticas finales
  const totalCards = await cardRepository.count();
  const majorCount = ALL_TAROT_CARDS.filter(
    (c) => c.arcanaType === ArcanaType.MAJOR,
  ).length;
  const minorCount = ALL_TAROT_CARDS.filter(
    (c) => c.arcanaType === ArcanaType.MINOR,
  ).length;

  console.log(
    '\n✅ Seed de cartas de la enciclopedia completado exitosamente!',
  );
  console.log(`   Total cartas insertadas: ${insertedCount}`);
  console.log(`   Total cartas en BD: ${totalCards}`);
  console.log(`   Arcanos Mayores: ${majorCount}`);
  console.log(`   Arcanos Menores: ${minorCount}`);
}

/**
 * Valida que una carta tenga contenido mínimo requerido
 * Lanza error si falta información crítica
 */
function validateCardContent(cardData: CardSeedData): void {
  const errors: string[] = [];

  if (!cardData.slug || !/^[a-z0-9-]+$/.test(cardData.slug)) {
    errors.push(
      `Slug inválido: debe contener solo letras minúsculas, números y guiones (actual: "${cardData.slug}")`,
    );
  }

  if (!cardData.nameEn || cardData.nameEn.trim().length < 2) {
    errors.push(`Nombre en inglés faltante o muy corto`);
  }

  if (!cardData.nameEs || cardData.nameEs.trim().length < 2) {
    errors.push(`Nombre en español faltante o muy corto`);
  }

  if (!cardData.meaningUpright || cardData.meaningUpright.trim().length < 20) {
    errors.push(
      `Significado derecho faltante o muy corto (mín 20 chars, actual: ${cardData.meaningUpright?.length || 0})`,
    );
  }

  if (
    !cardData.meaningReversed ||
    cardData.meaningReversed.trim().length < 20
  ) {
    errors.push(
      `Significado invertido faltante o muy corto (mín 20 chars, actual: ${cardData.meaningReversed?.length || 0})`,
    );
  }

  if (!cardData.description || cardData.description.trim().length < 30) {
    errors.push(
      `Descripción faltante o muy corta (mín 30 chars, actual: ${cardData.description?.length || 0})`,
    );
  }

  if (
    !cardData.keywords?.upright?.length ||
    !cardData.keywords?.reversed?.length
  ) {
    errors.push(`Palabras clave (upright/reversed) faltantes o vacías`);
  }

  if (!cardData.imageUrl || cardData.imageUrl.trim().length === 0) {
    errors.push(`URL de imagen faltante`);
  }

  if (errors.length > 0) {
    throw new Error(
      `Carta "${cardData.nameEs}" (slug: ${cardData.slug}) tiene contenido incompleto:\n${errors.map((e) => `  - ${e}`).join('\n')}`,
    );
  }
}
