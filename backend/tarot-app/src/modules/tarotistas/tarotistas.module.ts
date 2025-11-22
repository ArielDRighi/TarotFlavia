import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarotistasService } from './tarotistas.service';
import { TarotistasAdminService } from './services/tarotistas-admin.service';
import { TarotistasPublicService } from './services/tarotistas-public.service';
import { RevenueCalculationService } from './services/revenue-calculation.service';
import { MetricsService } from './services/metrics.service';
import { ReportsService } from './services/reports.service';
import { TarotistasAdminController } from './controllers/tarotistas-admin.controller';
import { TarotistasPublicController } from './controllers/tarotistas-public.controller';
import { MetricsController } from './controllers/metrics.controller';
import { ReportsController } from './controllers/reports.controller';
import { TarotistaConfig } from './entities/tarotista-config.entity';
import { TarotistaCardMeaning } from './entities/tarotista-card-meaning.entity';
import { TarotistaApplication } from './entities/tarotista-application.entity';
import { Tarotista } from './entities/tarotista.entity';
import { TarotistaRevenueMetrics } from './entities/tarotista-revenue-metrics.entity';
import { UserTarotistaSubscription } from './entities/user-tarotista-subscription.entity';
import { User } from '../users/entities/user.entity';
import { TarotReading } from '../tarot/readings/entities/tarot-reading.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tarotista,
      TarotistaConfig,
      TarotistaCardMeaning,
      TarotistaApplication,
      TarotistaRevenueMetrics,
      UserTarotistaSubscription,
      User,
      TarotReading,
    ]),
  ],
  controllers: [
    TarotistasAdminController,
    TarotistasPublicController,
    MetricsController,
    ReportsController,
  ],
  providers: [
    TarotistasService,
    TarotistasAdminService,
    TarotistasPublicService,
    RevenueCalculationService,
    MetricsService,
    ReportsService,
  ],
  exports: [
    TarotistasService,
    TarotistasAdminService,
    TarotistasPublicService,
    RevenueCalculationService,
    MetricsService,
    ReportsService,
    TypeOrmModule,
  ],
})
export class TarotistasModule {}
