/**
 * TASK-131: Script para generar horóscopos chinos (60 por año)
 *
 * Este script facilita la generación manual de los 60 horóscopos chinos
 * (12 animales × 5 elementos) después de ejecutar la migración TASK-131.
 *
 * Uso:
 *   ts-node -r tsconfig-paths/register scripts/generate-chinese-horoscopes.ts 2025
 *   ts-node -r tsconfig-paths/register scripts/generate-chinese-horoscopes.ts 2025 --force
 *
 * Opciones:
 *   year    - Año para generar horóscopos (ej: 2025, 2026)
 *   --force - Regenerar incluso si ya existen
 *
 * IMPORTANTE:
 * - Tiempo estimado: ~10 minutos (60 horóscopos con delay de 10s)
 * - Requiere conexión a base de datos y proveedores de IA configurados
 * - No ejecutar en producción sin autorización (consume tokens de IA)
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ChineseHoroscopeService } from '../src/modules/horoscope/application/services/chinese-horoscope.service';

async function generateChineseHoroscopes() {
  // 1. Parsear argumentos
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Uso: ts-node scripts/generate-chinese-horoscopes.ts <year> [--force]

Argumentos:
  year    - Año para generar horóscopos (ej: 2025, 2026)
  --force - Regenerar incluso si ya existen

Ejemplos:
  ts-node scripts/generate-chinese-horoscopes.ts 2025
  ts-node scripts/generate-chinese-horoscopes.ts 2025 --force
    `);
    process.exit(0);
  }

  const year = parseInt(args[0], 10);
  const force = args.includes('--force');

  if (isNaN(year) || year < 2020 || year > 2050) {
    console.error('❌ Error: Año inválido. Debe estar entre 2020 y 2050');
    process.exit(1);
  }

  // 2. Inicializar aplicación NestJS
  console.log('[Script] Inicializando aplicación NestJS...');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    // 3. Obtener servicio de horóscopos chinos
    const chineseService = app.get(ChineseHoroscopeService);

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  Generación de Horóscopos Chinos - Año ${year}                 ║
╚══════════════════════════════════════════════════════════════╝

📋 Total a generar: 60 horóscopos (12 animales × 5 elementos)
⏱️  Tiempo estimado: ~10 minutos
🤖 Proveedores IA: Groq → Gemini → DeepSeek → OpenAI (fallback)
${force ? '⚠️  Modo FORCE: Se regenerarán horóscopos existentes' : '✓ Se saltarán horóscopos existentes'}

Iniciando generación...
    `);

    const startTime = Date.now();

    // 4. Generar horóscopos
    const result = await chineseService.generateAllForYear(year);

    const elapsedMs = Date.now() - startTime;
    const elapsedMin = Math.floor(elapsedMs / 60000);
    const elapsedSec = Math.floor((elapsedMs % 60000) / 1000);

    // 5. Mostrar resumen
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  RESUMEN DE GENERACIÓN                                        ║
╚══════════════════════════════════════════════════════════════╝

✅ Exitosos:  ${result.successful}
❌ Fallidos:   ${result.failed}
⏱️  Tiempo:    ${elapsedMin}m ${elapsedSec}s

    `);

    // 6. Mostrar detalles de fallidos (si los hay)
    if (result.failed > 0) {
      console.log('❌ Horóscopos fallidos:');
      result.results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`  - ${r.animal}/${r.element}: ${r.error}`);
        });
      console.log('');
    }

    // 7. Mostrar próximos pasos
    if (result.successful === 60) {
      console.log('🎉 ¡Generación completada exitosamente!');
      console.log(
        `Los 60 horóscopos de ${year} están listos para ser consultados.`,
      );
    } else if (result.successful > 0) {
      console.log(`⚠️  Generación parcial: ${result.successful}/60`);
      console.log('Puedes reintentar con --force para regenerar los fallidos');
    } else {
      console.log('❌ Generación fallida. Revisa la configuración de IA');
    }

    process.exit(result.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Error fatal durante generación:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Ejecutar script
generateChineseHoroscopes().catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
});
