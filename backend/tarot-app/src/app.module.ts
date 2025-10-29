import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
        console.log('Usando configuración de base de datos:', {
          ...dbConfig,
          password: '****', // Ocultar contraseña en los logs
        });
        return dbConfig;
      },
    }),
    AuthModule,
    UsersModule,
    CardsModule,
    DecksModule,
    SpreadsModule,
    ReadingsModule,
    InterpretationsModule,
    CategoriesModule,
    TarotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
