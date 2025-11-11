import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarotistasService } from './tarotistas.service';
import { TarotistaConfig } from './entities/tarotista-config.entity';
import { TarotistaCardMeaning } from './entities/tarotista-card-meaning.entity';
import { Tarotista } from './entities/tarotista.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tarotista,
      TarotistaConfig,
      TarotistaCardMeaning,
    ]),
  ],
  providers: [TarotistasService],
  exports: [TarotistasService, TypeOrmModule],
})
export class TarotistasModule {}
