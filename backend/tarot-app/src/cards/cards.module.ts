import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { TarotCard } from './entities/tarot-card.entity';
import { TarotDeck } from '../decks/entities/tarot-deck.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TarotCard, TarotDeck])],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService, TypeOrmModule],
})
export class CardsModule {}
