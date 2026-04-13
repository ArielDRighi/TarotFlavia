import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { CardMeaningService } from './card-meaning.service';
import { CardFreeInterpretationService } from './card-free-interpretation.service';
import { TarotCard } from './entities/tarot-card.entity';
import { CardFreeInterpretation } from './entities/card-free-interpretation.entity';
import { TarotDeck } from '../decks/entities/tarot-deck.entity';
import { TarotistaCardMeaning } from '../../tarotistas/entities/tarotista-card-meaning.entity';
import { TypeOrmCardFreeInterpretationRepository } from './infrastructure/repositories/typeorm-card-free-interpretation.repository';
import { CARD_FREE_INTERPRETATION_REPOSITORY } from './domain/interfaces/card-free-interpretation-repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TarotCard,
      TarotDeck,
      TarotistaCardMeaning,
      CardFreeInterpretation,
    ]),
  ],
  controllers: [CardsController],
  providers: [
    CardsService,
    CardMeaningService,
    CardFreeInterpretationService,
    {
      provide: CARD_FREE_INTERPRETATION_REPOSITORY,
      useClass: TypeOrmCardFreeInterpretationRepository,
    },
  ],
  exports: [
    CardsService,
    CardMeaningService,
    CardFreeInterpretationService,
    TypeOrmModule,
    CARD_FREE_INTERPRETATION_REPOSITORY,
  ],
})
export class CardsModule {}
