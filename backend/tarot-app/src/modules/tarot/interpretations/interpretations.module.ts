import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterpretationsService } from './interpretations.service';
import { InterpretationsController } from './interpretations.controller';
import { TarotInterpretation } from './entities/tarot-interpretation.entity';
import { TarotistaConfig } from '../../tarotistas/entities/tarotista-config.entity';
import { TarotistaCardMeaning } from '../../tarotistas/entities/tarotista-card-meaning.entity';
import { Tarotista } from '../../tarotistas/entities/tarotista.entity';
import { TarotCard } from '../cards/entities/tarot-card.entity';
import { CacheModule } from '../../cache/cache.module';
import { AIModule } from '../../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TarotInterpretation,
      TarotistaConfig,
      TarotistaCardMeaning,
      Tarotista,
      TarotCard,
    ]),
    CacheModule,
    AIModule,
  ],
  controllers: [InterpretationsController],
  providers: [InterpretationsService],
  exports: [InterpretationsService],
})
export class InterpretationsModule {}
