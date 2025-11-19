#!/usr/bin/env ts-node
/**
 * Script para mostrar estadísticas de caché
 * Muestra hit rate y las interpretaciones más cacheadas
 *
 * Uso: npm run stats:cache
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    console.log('📊 Cache statistics feature is not fully implemented yet.\n');
    console.log('🗄️  Basic Information:\n');
    console.log('━'.repeat(80));

    console.log('\n💡 Note:');
    console.log(
      '   The current cache implementation (in-memory) does not expose detailed metrics.',
    );
    console.log(
      '   Consider implementing Redis with metrics support for production.',
    );

    console.log('\n📋 Available cache-related commands:');
    console.log('   npm run cli cache:clear  - Clear all cache');

    console.log('\n' + '━'.repeat(80));

    console.log('\n✨ Done!');
  } catch (error) {
    console.error('❌ Error fetching cache stats:', error);
    console.error('\n💡 Note: Cache statistics may not be available if:');
    console.error('   - Cache service is not properly configured');
    console.error('   - No cache hits/misses have been recorded yet');
    console.error("   - In-memory cache doesn't support detailed stats");
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();
