import { IntegrationDataSource } from './integration.config';

/**
 * Jest Global Setup - Ejecutado una vez antes de todas las suites de tests de Integración
 * Ejecuta migraciones pendientes en la base de datos de integración
 */
export default async function globalSetup() {
  console.log('\n🚀 [Global Setup Integration] Iniciando configuración...');

  try {
    // Inicializar conexión
    console.log('[Global Setup Integration] Conectando a base de datos...');
    await IntegrationDataSource.initialize();
    console.log('[Global Setup Integration] Conexión establecida ✓');

    // Ejecutar migraciones pendientes
    console.log('[Global Setup Integration] Ejecutando migraciones...');
    await IntegrationDataSource.runMigrations({ transaction: 'all' });
    console.log('[Global Setup Integration] Migraciones ejecutadas ✓');

    // Cerrar conexión
    await IntegrationDataSource.destroy();
    console.log('[Global Setup Integration] Setup completado ✓\n');
  } catch (error) {
    console.error('[Global Setup Integration] Error durante setup:', error);
    throw error;
  }
}
