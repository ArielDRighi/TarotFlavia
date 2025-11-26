import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { CardMeaningService } from './card-meaning.service';
import { TarotCard } from './entities/tarot-card.entity';
import { TarotDeck } from '../decks/entities/tarot-deck.entity';
import { TarotistaCardMeaning } from '../../tarotistas/entities/tarotista-card-meaning.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TarotCard, TarotDeck, TarotistaCardMeaning]),
  ],
  controllers: [CardsController],
  providers: [CardsService, CardMeaningService],
  exports: [CardsService, CardMeaningService, TypeOrmModule],
})
export class CardsModule {}
