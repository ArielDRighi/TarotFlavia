import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyHoroscope } from './entities/daily-horoscope.entity';
import { ChineseHoroscope } from './entities/chinese-horoscope.entity';
import { AIModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';
import { HoroscopeGenerationService } from './application/services/horoscope-generation.service';
import { HoroscopeCronService } from './application/services/horoscope-cron.service';
import { ChineseHoroscopeService } from './application/services/chinese-horoscope.service';
import { HoroscopeController } from './infrastructure/controllers/horoscope.controller';

/**
 * Módulo de Horóscopo
 *
 * Proporciona funcionalidad para:
 * - Generar horóscopos diarios occidentales usando IA
 * - Generar horóscopos chinos anuales usando IA
 * - Consultar horóscopos por signo/animal y fecha/año
 * - Gestionar el ciclo de vida de los horóscopos
 * - Cron jobs automáticos para generación diaria y limpieza
 *
 * Dependencias:
 * - AIModule: Para generación con modelos de IA (Groq, Gemini, DeepSeek, OpenAI)
 * - TypeORM: Para persistencia de horóscopos en PostgreSQL
 * - ScheduleModule: Para cron jobs (importado en AppModule)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([DailyHoroscope, ChineseHoroscope]),
    AIModule, // Proporciona AIProviderService con fallback automático
    UsersModule, // Para acceder a UsersService en el controller
  ],
  providers: [
    HoroscopeGenerationService,
    HoroscopeCronService,
    ChineseHoroscopeService, // Nuevo: Servicio de horóscopo chino
  ],
  controllers: [HoroscopeController],
  exports: [HoroscopeGenerationService, ChineseHoroscopeService],
})
export class HoroscopeModule {}
