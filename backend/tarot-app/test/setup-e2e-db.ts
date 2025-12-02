import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

/**
 * Jest Global Setup - Ejecutado una vez antes de todas las suites de tests E2E
 * Inicializa la base de datos E2E con un estado limpio
 */
export default async function globalSetup() {
  console.log('\n🚀 [Global Setup E2E] Iniciando configuración...');

  const dbHelper = new E2EDatabaseHelper();

  try {
    // Verificar salud de la base de datos E2E
    console.log('[Global Setup E2E] Verificando conexión E2E...');
    const healthy = await dbHelper.isHealthy();

    if (!healthy) {
      throw new Error(
        'La base de datos E2E no está disponible. Asegúrate de que el contenedor Docker esté ejecutándose con: docker-compose --profile e2e up -d tarot-postgres-e2e',
      );
    }

    console.log('[Global Setup E2E] Conexión E2E verificada ✓');

    // Resetear base de datos a estado limpio
    console.log('[Global Setup E2E] Reseteando base de datos E2E...');
    await dbHelper.resetDatabase();
    console.log('[Global Setup E2E] Base de datos E2E reseteada ✓');

    // Ejecutar seeders base para todos los tests
    console.log('[Global Setup E2E] Ejecutando seeders base...');
    await dbHelper.initialize(); // Re-conectar después del reset
    const dataSource = dbHelper.getDataSource();

    // Import seeders
    const { seedReadingCategories } = await import(
      '../src/database/seeds/reading-categories.seeder'
    );
    const { seedTarotDecks } = await import(
      '../src/database/seeds/tarot-decks.seeder'
    );
    const { seedTarotCards } = await import(
      '../src/database/seeds/tarot-cards.seeder'
    );
    const { seedTarotSpreads } = await import(
      '../src/database/seeds/tarot-spreads.seeder'
    );
    const { seedPredefinedQuestions } = await import(
      '../src/database/seeds/predefined-questions.seeder'
    );
    const { seedUsers } = await import('../src/database/seeds/users.seeder');
    const { seedFlaviaUser } = await import(
      '../src/database/seeds/flavia-user.seeder'
    );
    const { seedFlaviaTarotista } = await import(
      '../src/database/seeds/flavia-tarotista.seeder'
    );
    const { seedFlaviaIAConfig } = await import(
      '../src/database/seeds/flavia-ia-config.seeder'
    );
    const { seedPlans } = await import('../src/database/seeds/plans.seeder');

    const { ReadingCategory } = await import(
      '../src/modules/categories/entities/reading-category.entity'
    );
    const { TarotDeck } = await import(
      '../src/modules/tarot/decks/entities/tarot-deck.entity'
    );
    const { TarotCard } = await import(
      '../src/modules/tarot/cards/entities/tarot-card.entity'
    );
    const { PredefinedQuestion } = await import(
      '../src/modules/predefined-questions/entities/predefined-question.entity'
    );
    const { User } = await import('../src/modules/users/entities/user.entity');
    const { Tarotista } = await import(
      '../src/modules/tarotistas/entities/tarotista.entity'
    );
    const { TarotistaConfig } = await import(
      '../src/modules/tarotistas/entities/tarotista-config.entity'
    );
    const { Plan } = await import(
      '../src/modules/plan-config/entities/plan.entity'
    );

    // Execute seeders
    await seedPlans(dataSource.getRepository(Plan)); // Plans first - needed by usage limits
    await seedReadingCategories(dataSource.getRepository(ReadingCategory));
    await seedTarotDecks(dataSource.getRepository(TarotDeck));
    await seedTarotCards(
      dataSource.getRepository(TarotCard),
      dataSource.getRepository(TarotDeck),
    );
    await seedTarotSpreads(dataSource);
    await seedPredefinedQuestions(
      dataSource.getRepository(PredefinedQuestion),
      dataSource.getRepository(ReadingCategory),
    );
    await seedUsers(dataSource.getRepository(User));

    // Seed Flavia (tarotista por defecto)
    const flaviaUserId = await seedFlaviaUser(dataSource.getRepository(User));
    const flaviaTarotistaId = await seedFlaviaTarotista(
      flaviaUserId,
      dataSource.getRepository(Tarotista),
      dataSource.getRepository(User),
    );
    await seedFlaviaIAConfig(
      flaviaTarotistaId,
      dataSource.getRepository(TarotistaConfig),
      dataSource.getRepository(Tarotista),
    );

    console.log('[Global Setup E2E] Seeders base ejecutados ✓');

    console.log('✅ [Global Setup E2E] Configuración completada\n');
  } catch (error) {
    console.error('❌ [Global Setup E2E] Error durante setup:', error);
    throw error;
  } finally {
    // Cerrar conexión después del setup
    await dbHelper.close();
  }
}
