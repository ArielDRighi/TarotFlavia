import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TarotModule } from './modules/tarot/tarot.module';
import { CardsModule } from './modules/tarot/cards/cards.module';
import { DecksModule } from './modules/tarot/decks/decks.module';
import { SpreadsModule } from './modules/tarot/spreads/spreads.module';
import { ReadingsModule } from './modules/tarot/readings/readings.module';
import { InterpretationsModule } from './modules/tarot/interpretations/interpretations.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PredefinedQuestionsModule } from './modules/predefined-questions/predefined-questions.module';
import { HealthModule } from './modules/health/health.module';
import { UsageLimitsModule } from './modules/usage-limits/usage-limits.module';
import { EmailModule } from './modules/email/email.module';
import { TarotistasModule } from './modules/tarotistas/tarotistas.module';
import { CacheModule as InterpretationCacheModule } from './modules/cache/cache.module';
import { AIModule } from './modules/ai/ai.module';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import { ThrottlerExceptionFilter } from './common/filters/throttler-exception.filter';
import databaseConfig from './config/typeorm';
import { validate } from './config/env-validator';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validate,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<Record<string, unknown>>('database');
        if (!dbConfig) {
          throw new Error('Database configuration not found');
        }
        if (process.env.NODE_ENV !== 'test') {
          console.log('Usando configuración de base de datos:', {
            ...dbConfig,
            password: '****', // Ocultar contraseña en los logs
          });
        }
        return dbConfig;
      },
    }),
    EventEmitterModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      ttl: 3600000, // 1 hora en milisegundos
      max: 200, // máximo 200 items en caché
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 segundos = 1 minuto
        limit: 100, // 100 requests por minuto (global)
      },
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    TarotistasModule,
    InterpretationCacheModule,
    AIModule,
    CardsModule,
    DecksModule,
    SpreadsModule,
    ReadingsModule,
    InterpretationsModule,
    CategoriesModule,
    PredefinedQuestionsModule,
    TarotModule,
    HealthModule,
    UsageLimitsModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
  ],
})
export class AppModule {}
