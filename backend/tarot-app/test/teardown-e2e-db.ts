import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

/**
 * Jest Global Teardown - Ejecutado una vez después de todas las suites de tests E2E
 * Limpia recursos y cierra conexiones
 */
export default async function globalTeardown() {
  console.log('\n🧹 [Global Teardown E2E] Iniciando limpieza...');

  const dbHelper = new E2EDatabaseHelper();

  try {
    // Limpiar SOLO datos de usuario, mantener seeders base para la próxima ejecución
    console.log(
      '[Global Teardown E2E] Limpiando datos de usuario, manteniendo seeders base...',
    );
    await dbHelper.cleanUserData();

    // Nota: No cerramos el contenedor Docker aquí - eso se maneja manualmente
    // El contenedor puede quedar corriendo para acelerar siguientes ejecuciones

    console.log('✅ [Global Teardown E2E] Limpieza completada\n');
  } catch (error) {
    console.error('❌ [Global Teardown E2E] Error durante teardown:', error);
    // No lanzamos error aquí para no fallar el proceso de tests
  } finally {
    // Cerrar conexión
    await dbHelper.close();
  }
}
