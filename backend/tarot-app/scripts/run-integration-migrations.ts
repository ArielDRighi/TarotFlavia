import { IntegrationDataSource } from '../src/config/integration-data-source';

async function runMigrations() {
  try {
    console.log('[Run Migrations] Inicializando DataSource...');
    await IntegrationDataSource.initialize();
    console.log('[Run Migrations] DataSource inicializado ✓');

    console.log('[Run Migrations] Ejecutando migraciones...');
    const migrations = await IntegrationDataSource.runMigrations();

    if (migrations.length === 0) {
      console.log('[Run Migrations] ✓ No hay migraciones pendientes');
    } else {
      console.log(
        `[Run Migrations] ✓ Ejecutadas ${migrations.length} migraciones:`,
      );
      migrations.forEach((migration) => {
        console.log(`  - ${migration.name}`);
      });
    }

    await IntegrationDataSource.destroy();
    console.log('[Run Migrations] Proceso completado ✓');
    process.exit(0);
  } catch (error) {
    console.error('[Run Migrations] ❌ Error:', error);
    process.exit(1);
  }
}

runMigrations();
