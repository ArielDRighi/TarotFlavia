import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AIModule } from '../ai/ai.module';
import { CacheModule } from '../cache/cache.module';
import { UsageLimitsModule } from '../usage-limits/usage-limits.module';
import { BirthChart } from './entities/birth-chart.entity';
import { BirthChartInterpretation } from './entities/birth-chart-interpretation.entity';
import {
  BirthChartController,
  BirthChartHistoryController,
} from './infrastructure/controllers';
import { BirthChartInterpretationRepository } from './infrastructure/repositories/birth-chart-interpretation.repository';
import { BIRTH_CHART_INTERPRETATION_REPOSITORY } from './domain/interfaces';
import { ephemerisConfig, EphemerisWrapper } from './infrastructure/ephemeris';
import {
  AspectCalculationService,
  BirthChartFacadeService,
  BirthChartHistoryService,
  ChartAISynthesisService,
  ChartCacheService,
  ChartCalculationService,
  ChartInterpretationService,
  ChartPdfService,
  GeocodeService,
  HouseCuspService,
  PlanetPositionService,
} from './application/services';
import { BirthChartInterpretationsSeeder } from './infrastructure/seeders/birth-chart-interpretations.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([BirthChart, BirthChartInterpretation]),
    ConfigModule.forFeature(ephemerisConfig),
    HttpModule,
    forwardRef(() => AIModule),
    CacheModule,
    UsageLimitsModule,
  ],
  controllers: [BirthChartController, BirthChartHistoryController],
  providers: [
    EphemerisWrapper,
    {
      provide: BIRTH_CHART_INTERPRETATION_REPOSITORY,
      useClass: BirthChartInterpretationRepository,
    },
    PlanetPositionService,
    HouseCuspService,
    AspectCalculationService,
    ChartCalculationService,
    ChartInterpretationService,
    ChartAISynthesisService,
    ChartCacheService,
    ChartPdfService,
    BirthChartFacadeService,
    BirthChartHistoryService,
    GeocodeService,
    BirthChartInterpretationsSeeder,
    {
      provide: 'BirthChartFacadeService',
      useExisting: BirthChartFacadeService,
    },
    {
      provide: 'BirthChartHistoryService',
      useExisting: BirthChartHistoryService,
    },
    {
      provide: 'GeocodeService',
      useExisting: GeocodeService,
    },
  ],
  exports: [
    BirthChartFacadeService,
    BirthChartHistoryService,
    ChartCalculationService,
    BirthChartInterpretationsSeeder,
  ],
})
export class BirthChartModule {}
