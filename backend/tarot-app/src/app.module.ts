import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TarotModule } from './tarot/tarot.module';
import { CardsModule } from './cards/cards.module';
import { DecksModule } from './decks/decks.module';
import { SpreadsModule } from './spreads/spreads.module';
import databaseConfig from './config/typeorm';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
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
    TarotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
