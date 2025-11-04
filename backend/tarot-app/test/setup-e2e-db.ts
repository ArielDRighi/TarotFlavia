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

    // Ejecutar seeders base (opcional, cada test puede cargar sus propios datos)
    // Aquí se pueden ejecutar seeders comunes a todos los tests
    console.log('[Global Setup E2E] Ejecutando seeders base...');
    // await dbHelper.seedData([commonSeeder]);
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
