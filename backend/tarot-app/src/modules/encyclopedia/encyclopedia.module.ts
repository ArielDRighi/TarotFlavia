import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncyclopediaTarotCard } from './entities/encyclopedia-tarot-card.entity';
import { EncyclopediaArticle } from './entities/encyclopedia-article.entity';
import { EncyclopediaService } from './application/services/encyclopedia.service';
import { EncyclopediaController } from './infrastructure/controllers/encyclopedia.controller';

/**
 * Módulo de la Enciclopedia Mística
 *
 * Gestiona las 78 cartas del Tarot y los artículos de contenido (signos zodiacales,
 * planetas, casas astrales, elementos, modalidades y guías) con acceso público
 * (sin restricciones de plan).
 * Expone endpoints REST bajo /encyclopedia para explorar todo el contenido.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([EncyclopediaTarotCard, EncyclopediaArticle]),
  ],
  providers: [EncyclopediaService],
  controllers: [EncyclopediaController],
  exports: [TypeOrmModule, EncyclopediaService],
})
export class EncyclopediaModule {}
