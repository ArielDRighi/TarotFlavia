import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyHoroscope } from './entities/daily-horoscope.entity';
import { AIModule } from '../ai/ai.module';
import { HoroscopeGenerationService } from './application/services/horoscope-generation.service';

/**
 * Módulo de Horóscopo
 *
 * Proporciona funcionalidad para:
 * - Generar horóscopos diarios usando IA
 * - Consultar horóscopos por signo y fecha
 * - Gestionar el ciclo de vida de los horóscopos
 *
 * Dependencias:
 * - AIModule: Para generación con modelos de IA (Groq, Gemini, DeepSeek, OpenAI)
 * - TypeORM: Para persistencia de horóscopos en PostgreSQL
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([DailyHoroscope]),
    AIModule, // Proporciona AIProviderService con fallback automático
  ],
  providers: [HoroscopeGenerationService],
  controllers: [], // Los controllers se agregarán en TASK-105
  exports: [HoroscopeGenerationService], // Exportar para uso en cron jobs (TASK-106)
})
export class HoroscopeModule {}
