import { E2EDatabaseHelper } from '../test/helpers/e2e-database.helper';
import { TarotDeck } from './modules/tarot/decks/entities/tarot-deck.entity';
import { TarotCard } from './modules/tarot/cards/entities/tarot-card.entity';
import { ReadingCategory } from './modules/categories/entities/reading-category.entity';
import { PredefinedQuestion } from './modules/predefined-questions/entities/predefined-question.entity';
import { User, UserPlan } from './modules/users/entities/user.entity';
import { TarotSpread } from './modules/tarot/spreads/entities/tarot-spread.entity';
import { seedTarotDecks } from './database/seeds/tarot-decks.seeder';
import { seedTarotCards } from './database/seeds/tarot-cards.seeder';
import { seedTarotSpreads } from './database/seeds/tarot-spreads.seeder';
import { seedReadingCategories } from './database/seeds/reading-categories.seeder';
import { seedPredefinedQuestions } from './database/seeds/predefined-questions.seeder';
import { seedUsers } from './database/seeds/users.seeder';

/**
 * Script para validar seeders con la base de datos E2E
 * Ejecutar con: npx ts-node src/validate-seeders-e2e.ts
 */
async function validateSeedersE2E() {
  console.log('🧪 [Validate Seeders E2E] Iniciando validación...\n');

  const dbHelper = new E2EDatabaseHelper();

  try {
    // Inicializar conexión
    await dbHelper.initialize();
    console.log('✅ Conexión E2E establecida\n');

    // Resetear base de datos
    console.log('🔄 Reseteando base de datos E2E...');
    await dbHelper.resetDatabase();
    console.log('✅ Base de datos reseteada\n');

    const dataSource = dbHelper.getDataSource();

    // Obtener repositorios
    const deckRepository = dataSource.getRepository(TarotDeck);
    const cardRepository = dataSource.getRepository(TarotCard);
    const categoryRepository = dataSource.getRepository(ReadingCategory);
    const questionRepository = dataSource.getRepository(PredefinedQuestion);
    const userRepository = dataSource.getRepository(User);

    // Ejecutar seeders en orden
    console.log('🌱 Ejecutando seeders...\n');

    console.log('1️⃣ Seeding Reading Categories...');
    await seedReadingCategories(categoryRepository);
    const categoryCount = await categoryRepository.count();
    console.log(`   ✅ ${categoryCount} categorías creadas\n`);

    console.log('2️⃣ Seeding Tarot Decks...');
    await seedTarotDecks(deckRepository);
    const deckCount = await deckRepository.count();
    console.log(`   ✅ ${deckCount} mazos creados\n`);

    console.log('3️⃣ Seeding Tarot Cards...');
    await seedTarotCards(cardRepository, deckRepository);
    const cardCount = await cardRepository.count();
    console.log(`   ✅ ${cardCount} cartas creadas\n`);

    console.log('4️⃣ Seeding Tarot Spreads...');
    await seedTarotSpreads(dataSource);
    const spreadRepository = dataSource.getRepository(TarotSpread);
    const spreadCount = await spreadRepository.count();
    console.log(`   ✅ ${spreadCount} tiradas creadas\n`);

    console.log('5️⃣ Seeding Predefined Questions...');
    await seedPredefinedQuestions(questionRepository, categoryRepository);
    const questionCount = await questionRepository.count();
    console.log(`   ✅ ${questionCount} preguntas predefinidas creadas\n`);

    console.log('6️⃣ Seeding Users...');
    await seedUsers(userRepository);
    const userCount = await userRepository.count();
    console.log(`   ✅ ${userCount} usuarios creados\n`);

    // Validación de integridad
    console.log('🔍 Validando integridad de datos...\n');

    // Verificar que todas las cartas tienen un deck
    const cardsWithoutDeck = await cardRepository
      .createQueryBuilder('card')
      .leftJoinAndSelect('card.deck', 'deck')
      .where('deck.id IS NULL')
      .getCount();

    if (cardsWithoutDeck > 0) {
      throw new Error(
        `❌ ${cardsWithoutDeck} cartas sin mazo asignado detectadas`,
      );
    }
    console.log('   ✅ Todas las cartas tienen un mazo asignado');

    // Verificar que todas las preguntas tienen categoría
    const questionsWithoutCategory = await questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.category', 'category')
      .where('category.id IS NULL')
      .getCount();

    if (questionsWithoutCategory > 0) {
      throw new Error(
        `❌ ${questionsWithoutCategory} preguntas sin categoría detectadas`,
      );
    }
    console.log('   ✅ Todas las preguntas tienen categoría asignada');

    // Verificar que hay al menos un deck por defecto
    const defaultDeck = await deckRepository.findOne({
      where: { isDefault: true },
    });
    if (!defaultDeck) {
      throw new Error('❌ No se encontró un deck por defecto');
    }
    console.log(`   ✅ Deck por defecto encontrado: "${defaultDeck.name}"`);

    // Verificar que hay usuarios de diferentes planes
    const allUsers = await userRepository.find();
    const premiumCount = allUsers.filter(
      (u) => u.plan === UserPlan.PREMIUM,
    ).length;
    const freeCount = allUsers.filter((u) => u.plan === UserPlan.FREE).length;

    console.log(`   ✅ ${premiumCount} usuarios premium`);
    console.log(`   ✅ ${freeCount} usuarios free\n`);

    console.log('✨ ¡Validación de seeders completada exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   • ${categoryCount} categorías`);
    console.log(`   • ${deckCount} mazos`);
    console.log(`   • ${cardCount} cartas`);
    console.log(`   • ${spreadCount} tiradas`);
    console.log(`   • ${questionCount} preguntas predefinidas`);
    console.log(`   • ${userCount} usuarios de prueba`);
  } catch (error) {
    console.error('\n❌ Error durante validación de seeders:', error);
    process.exit(1);
  } finally {
    await dbHelper.close();
    console.log('\n🔒 Conexión E2E cerrada');
  }
}

// Ejecutar validación
validateSeedersE2E().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
