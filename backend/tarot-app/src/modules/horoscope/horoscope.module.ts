import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyHoroscope } from './entities/daily-horoscope.entity';
import { AIModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';
import { HoroscopeGenerationService } from './application/services/horoscope-generation.service';
import { HoroscopeController } from './infrastructure/controllers/horoscope.controller';

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
    UsersModule, // Para acceder a UsersService en el controller
  ],
  providers: [HoroscopeGenerationService],
  controllers: [HoroscopeController],
  exports: [HoroscopeGenerationService], // Exportar para uso en cron jobs (TASK-106)
})
export class HoroscopeModule {}
