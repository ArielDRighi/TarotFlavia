import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecksController } from './decks.controller';
import { DecksService } from './decks.service';
import { TarotDeck } from './entities/tarot-deck.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TarotDeck])],
  controllers: [DecksController],
  providers: [DecksService],
  exports: [DecksService, TypeOrmModule],
})
export class DecksModule {}
