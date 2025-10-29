import { DataSource } from 'typeorm';
import { TarotSpread } from '../../spreads/entities/tarot-spread.entity';
import { TAROT_SPREADS_DATA } from './data/tarot-spreads.data';

export async function seedTarotSpreads(dataSource: DataSource): Promise<void> {
  const spreadsRepository = dataSource.getRepository(TarotSpread);

  // Verificar si ya existen spreads
  const existingSpreadsCount = await spreadsRepository.count();

  if (existingSpreadsCount > 0) {
    console.log(
      `✓ Spreads already seeded (${existingSpreadsCount} spreads found). Skipping...`,
    );
    return;
  }

  // Preparar spreads para insertar
  const spreadsToInsert = TAROT_SPREADS_DATA.map((spreadData) => {
    // Validar que cardCount coincida con la longitud de positions
    if (spreadData.cardCount !== spreadData.positions.length) {
      throw new Error(
        `Invalid spread data: ${spreadData.name} has cardCount=${spreadData.cardCount} but ${spreadData.positions.length} positions`,
      );
    }

    return spreadsRepository.create({
      name: spreadData.name,
      description: spreadData.description,
      cardCount: spreadData.cardCount,
      positions: spreadData.positions,
      imageUrl: spreadData.imageUrl,
      difficulty: spreadData.difficulty,
      isBeginnerFriendly: spreadData.is_beginner_friendly,
      whenToUse: spreadData.when_to_use,
    });
  });

  // Guardar los spreads
  await spreadsRepository.save(spreadsToInsert);

  // Log de éxito con distribución
  const spreadsByCardCount = spreadsToInsert.reduce(
    (acc, spread) => {
      acc[spread.cardCount] = (acc[spread.cardCount] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>,
  );

  console.log('✓ Tarot spreads seeded successfully!');
  console.log(`  Total spreads: ${spreadsToInsert.length}`);
  console.log('  Distribution:');
  Object.entries(spreadsByCardCount)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([cardCount, count]) => {
      console.log(`    - ${cardCount} card(s): ${count} spread(s)`);
    });
}
