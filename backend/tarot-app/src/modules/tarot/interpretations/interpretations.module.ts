import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { InterpretationsService } from './interpretations.service';
import { InterpretationsController } from './interpretations.controller';
import { TarotInterpretation } from './entities/tarot-interpretation.entity';
import { TarotistaConfig } from '../../tarotistas/entities/tarotista-config.entity';
import { TarotistaCardMeaning } from '../../tarotistas/entities/tarotista-card-meaning.entity';
import { Tarotista } from '../../tarotistas/entities/tarotista.entity';
import { TarotCard } from '../cards/entities/tarot-card.entity';
import { CacheModule } from '../../cache/cache.module';
import { AIModule } from '../../ai/ai.module';
import { AIUsageModule } from '../../ai-usage/ai-usage.module';
import { OutputSanitizerService } from '../../../common/services/output-sanitizer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TarotInterpretation,
      TarotistaConfig,
      TarotistaCardMeaning,
      Tarotista,
      TarotCard,
    ]),
    HttpModule,
    ConfigModule,
    forwardRef(() => CacheModule),
    AIModule,
    AIUsageModule,
  ],
  controllers: [InterpretationsController],
  providers: [InterpretationsService, OutputSanitizerService],
  exports: [InterpretationsService],
})
export class InterpretationsModule {}
