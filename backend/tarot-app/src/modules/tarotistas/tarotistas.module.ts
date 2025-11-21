import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarotistasService } from './tarotistas.service';
import { TarotistasAdminService } from './services/tarotistas-admin.service';
import { TarotistasAdminController } from './controllers/tarotistas-admin.controller';
import { TarotistaConfig } from './entities/tarotista-config.entity';
import { TarotistaCardMeaning } from './entities/tarotista-card-meaning.entity';
import { TarotistaApplication } from './entities/tarotista-application.entity';
import { Tarotista } from './entities/tarotista.entity';
import { UserTarotistaSubscription } from './entities/user-tarotista-subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tarotista,
      TarotistaConfig,
      TarotistaCardMeaning,
      TarotistaApplication,
      UserTarotistaSubscription,
    ]),
  ],
  controllers: [TarotistasAdminController],
  providers: [TarotistasService, TarotistasAdminService],
  exports: [TarotistasService, TarotistasAdminService, TypeOrmModule],
})
export class TarotistasModule {}
