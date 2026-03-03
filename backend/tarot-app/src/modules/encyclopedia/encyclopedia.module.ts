import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncyclopediaTarotCard } from './entities/encyclopedia-tarot-card.entity';
import { EncyclopediaService } from './application/services/encyclopedia.service';
import { EncyclopediaController } from './infrastructure/controllers/encyclopedia.controller';

/**
 * Módulo de la Enciclopedia Mística
 *
 * Gestiona las 78 cartas del Tarot con acceso público (sin restricciones de plan).
 * Expone endpoints REST bajo /encyclopedia/cards para explorar el mazo completo.
 */
@Module({
  imports: [TypeOrmModule.forFeature([EncyclopediaTarotCard])],
  providers: [EncyclopediaService],
  controllers: [EncyclopediaController],
  exports: [TypeOrmModule, EncyclopediaService],
})
export class EncyclopediaModule {}
