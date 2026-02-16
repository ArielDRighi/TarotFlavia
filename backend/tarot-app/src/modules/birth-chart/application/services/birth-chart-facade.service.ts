import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsageLimitsService } from '../../../usage-limits/usage-limits.service';
import { AnonymousTrackingService } from '../../../usage-limits/services/anonymous-tracking.service';
import { UsageFeature } from '../../../usage-limits/entities/usage-limit.entity';
import { UserPlan } from '../../../users/entities/user.entity';
import { BirthChart, ChartData } from '../../entities/birth-chart.entity';
import {
  BasicChartResponseDto,
  ChartAspectDto,
  FullChartResponseDto,
  HouseCuspDto,
  PlanetPositionDto,
  PremiumChartResponseDto,
  GenerateChartDto,
} from '../dto';
import {
  AspectType,
  AspectTypeMetadata,
  Planet,
  PlanetMetadata,
  ZodiacSign,
  ZodiacSignMetadata,
} from '../../domain/enums';
import {
  ChartCalculationInput,
  ChartCalculationService,
} from './chart-calculation.service';
import {
  ChartInterpretationService,
  FullChartInterpretation,
} from './chart-interpretation.service';
import { ChartAISynthesisService } from './chart-ai-synthesis.service';
import { ChartCacheService } from './chart-cache.service';
import { ChartPdfService } from './chart-pdf.service';

interface UserContext {
  userId: number;
  email: string;
  plan: UserPlan;
}

@Injectable()
export class BirthChartFacadeService {
  private readonly logger = new Logger(BirthChartFacadeService.name);

  constructor(
    @InjectRepository(BirthChart)
    private readonly chartRepo: Repository<BirthChart>,
    private readonly calculationService: ChartCalculationService,
    private readonly interpretationService: ChartInterpretationService,
    private readonly aiSynthesisService: ChartAISynthesisService,
    private readonly cacheService: ChartCacheService,
    private readonly pdfService: ChartPdfService,
    private readonly usageLimitsService: UsageLimitsService,
    private readonly anonymousTrackingService: AnonymousTrackingService,
  ) {}

  async generateChart(
    dto: GenerateChartDto,
    plan: UserPlan,
    userId: number | null,
    fingerprint?: string,
  ): Promise<
    BasicChartResponseDto | FullChartResponseDto | PremiumChartResponseDto
  > {
    this.logger.log(
      `Generating birth chart for plan ${plan}${fingerprint ? ' with fingerprint' : ''}`,
    );

    const birthDate = new Date(dto.birthDate);
    const cacheKey = this.cacheService.generateChartCacheKey(
      birthDate,
      dto.birthTime,
      dto.latitude,
      dto.longitude,
    );

    const cachedCalculation =
      await this.cacheService.getChartCalculation(cacheKey);

    let chartData: ChartData;
    let calculationTimeMs = 0;

    if (cachedCalculation) {
      chartData = cachedCalculation.chartData;
    } else {
      const input: ChartCalculationInput = {
        birthDate,
        birthTime: dto.birthTime,
        latitude: dto.latitude,
        longitude: dto.longitude,
        timezone: dto.timezone,
      };

      const calculationResult = this.calculationService.calculateChart(input);
      chartData = calculationResult.chartData;
      calculationTimeMs = calculationResult.calculationTimeMs;

      await this.cacheService.setChartCalculation(cacheKey, chartData);
    }

    if (plan === UserPlan.ANONYMOUS) {
      return this.buildAnonymousResponse(chartData, calculationTimeMs);
    }

    const interpretation = await this.getOrBuildInterpretation(
      cacheKey,
      chartData,
    );

    if (plan === UserPlan.FREE) {
      return this.buildFreeResponse(
        chartData,
        interpretation,
        calculationTimeMs,
      );
    }

    return this.buildPremiumResponse(
      chartData,
      interpretation,
      dto,
      userId,
      cacheKey,
      calculationTimeMs,
    );
  }

  async generatePdf(
    dto: GenerateChartDto,
    user: UserContext,
    isPremium: boolean,
  ): Promise<{ buffer: Buffer; filename: string }> {
    this.logger.log(`Generating birth chart PDF for user ${user.userId}`);

    const input: ChartCalculationInput = {
      birthDate: new Date(dto.birthDate),
      birthTime: dto.birthTime,
      latitude: dto.latitude,
      longitude: dto.longitude,
      timezone: dto.timezone,
    };

    const { chartData } = this.calculationService.calculateChart(input);
    const interpretation =
      await this.interpretationService.generateFullInterpretation(chartData);

    let aiSynthesis: string | undefined;
    if (isPremium) {
      const synthesisResult = await this.aiSynthesisService.generateSynthesis(
        {
          chartData,
          interpretation,
          userName: dto.name,
          birthDate: new Date(dto.birthDate),
        },
        user.userId,
      );
      aiSynthesis = synthesisResult.synthesis;
    }

    const pdfResult = await this.pdfService.generatePDF({
      chartData,
      interpretation,
      aiSynthesis,
      userName: dto.name,
      birthDate: new Date(dto.birthDate),
      birthTime: dto.birthTime,
      birthPlace: dto.birthPlace,
      generatedAt: new Date(),
      isPremium,
    });

    return {
      buffer: pdfResult.buffer,
      filename: pdfResult.filename,
    };
  }

  async getUsageStatus(
    user: UserContext | null,
    fingerprint: string,
  ): Promise<{
    plan: UserPlan;
    used: number;
    limit: number;
    remaining: number;
    resetsAt: string | null;
    canGenerate: boolean;
  }> {
    if (!user) {
      const canAccess = fingerprint
        ? await this.anonymousTrackingService.canAccessLifetime(
            fingerprint,
            UsageFeature.BIRTH_CHART,
          )
        : true;

      return {
        plan: UserPlan.ANONYMOUS,
        used: canAccess ? 0 : 1,
        limit: 1,
        remaining: canAccess ? 1 : 0,
        resetsAt: null,
        canGenerate: canAccess,
      };
    }

    const planLimit =
      user.plan === UserPlan.PREMIUM ? 5 : user.plan === UserPlan.FREE ? 3 : 1;

    try {
      const monthlyUsage = await this.usageLimitsService.getUsageByPeriod(
        user.userId,
        UsageFeature.BIRTH_CHART,
        'monthly',
      );

      const remaining = Math.max(0, planLimit - monthlyUsage);
      const resetsAt = this.getNextMonthStartIso();

      return {
        plan: user.plan,
        used: monthlyUsage,
        limit: planLimit,
        remaining,
        resetsAt,
        canGenerate: remaining > 0,
      };
    } catch (error) {
      // Fallback en caso de error al obtener uso (ej: enum value no existe en DB)
      // Retornar como si el usuario tiene el límite completo disponible
      // El backend rechazará la generación si realmente excede el límite en el interceptor
      this.logger.error(
        `Error getting usage for user ${user.userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      const resetsAt = this.getNextMonthStartIso();

      return {
        plan: user.plan,
        used: 0,
        limit: planLimit,
        remaining: planLimit,
        resetsAt,
        canGenerate: true,
      };
    }
  }

  async generateSynthesisOnly(
    dto: GenerateChartDto,
    userId: number,
  ): Promise<{ synthesis: string; generatedAt: string; provider: string }> {
    this.logger.log(`Generating synthesis only for user ${userId}`);

    const input: ChartCalculationInput = {
      birthDate: new Date(dto.birthDate),
      birthTime: dto.birthTime,
      latitude: dto.latitude,
      longitude: dto.longitude,
      timezone: dto.timezone,
    };

    const { chartData } = this.calculationService.calculateChart(input);
    const interpretation =
      await this.interpretationService.generateFullInterpretation(chartData);

    const synthesisResult = await this.aiSynthesisService.generateSynthesis(
      {
        chartData,
        interpretation,
        userName: dto.name,
        birthDate: new Date(dto.birthDate),
      },
      userId,
    );

    return {
      synthesis: synthesisResult.synthesis,
      generatedAt: new Date().toISOString(),
      provider: synthesisResult.provider,
    };
  }

  private async getOrBuildInterpretation(
    cacheKey: string,
    chartData: ChartData,
  ): Promise<FullChartInterpretation> {
    const cachedInterpretation =
      await this.cacheService.getInterpretation(cacheKey);

    if (cachedInterpretation) {
      return cachedInterpretation;
    }

    const interpretation =
      await this.interpretationService.generateFullInterpretation(chartData);
    await this.cacheService.setInterpretation(cacheKey, interpretation);
    return interpretation;
  }

  private async buildPremiumResponse(
    chartData: ChartData,
    interpretation: FullChartInterpretation,
    dto: GenerateChartDto,
    userId: number | null,
    cacheKey: string,
    calculationTimeMs: number,
  ): Promise<PremiumChartResponseDto> {
    const freeResponse = this.buildFreeResponse(
      chartData,
      interpretation,
      calculationTimeMs,
    );

    const cachedSynthesis = await this.cacheService.getSynthesis(cacheKey);

    const synthesisResult = cachedSynthesis
      ? {
          synthesis: cachedSynthesis.synthesis,
          provider: cachedSynthesis.provider,
          model: cachedSynthesis.model,
        }
      : await this.aiSynthesisService.generateSynthesis(
          {
            chartData,
            interpretation,
            userName: dto.name,
            birthDate: new Date(dto.birthDate),
          },
          userId ?? undefined,
        );

    if (!cachedSynthesis) {
      await this.cacheService.setSynthesis(
        cacheKey,
        synthesisResult.synthesis,
        synthesisResult.provider,
        synthesisResult.model,
      );
    }

    const savedChart =
      userId !== null
        ? await this.saveChart(
            userId,
            dto,
            chartData,
            synthesisResult.synthesis,
          )
        : null;

    return {
      ...freeResponse,
      savedChartId: savedChart?.id,
      aiSynthesis: {
        content: synthesisResult.synthesis,
        generatedAt: new Date().toISOString(),
        provider: synthesisResult.provider,
      },
      canAccessHistory: true,
    };
  }

  private async buildAnonymousResponse(
    chartData: ChartData,
    calculationTimeMs: number,
  ): Promise<BasicChartResponseDto> {
    const sunSign = this.findPlanetSign(chartData, Planet.SUN);
    const moonSign = this.findPlanetSign(chartData, Planet.MOON);
    const ascendantSign = chartData.ascendant.sign as ZodiacSign;

    const bigThree =
      await this.interpretationService.generateBigThreeInterpretation(
        sunSign,
        moonSign,
        ascendantSign,
      );

    return this.buildBaseResponse(chartData, calculationTimeMs, bigThree);
  }

  private buildFreeResponse(
    chartData: ChartData,
    interpretation: FullChartInterpretation,
    calculationTimeMs: number,
  ): FullChartResponseDto {
    const base = this.buildBaseResponse(
      chartData,
      calculationTimeMs,
      interpretation.bigThree,
    );

    const planetInterpretations = interpretation.planets.map((planet) => ({
      planet: planet.planet,
      planetName: planet.planetName,
      intro: planet.intro ?? '',
      inSign: planet.inSign ?? '',
      inHouse: planet.inHouse ?? '',
      aspects: (planet.aspects ?? []).map((aspect) => {
        const relatedPlanet =
          String(aspect.planet1) === String(planet.planet)
            ? aspect.planet2
            : aspect.planet1;

        return {
          withPlanet: relatedPlanet,
          withPlanetName:
            PlanetMetadata[relatedPlanet as Planet]?.name ?? relatedPlanet,
          aspectType: aspect.aspectType,
          aspectName: aspect.aspectName,
          interpretation: aspect.interpretation ?? '',
        };
      }),
    }));

    return {
      ...base,
      bigThree: interpretation.bigThree,
      distribution: interpretation.distribution,
      interpretations: {
        planets: planetInterpretations,
      },
      canDownloadPdf: true,
    };
  }

  private buildBaseResponse(
    chartData: ChartData,
    calculationTimeMs: number,
    bigThree: BasicChartResponseDto['bigThree'],
  ): BasicChartResponseDto {
    return {
      success: true,
      chartSvgData: {
        planets: this.formatPlanetsForResponse(chartData.planets).map(
          (planet) => ({
            planet: planet.planet,
            sign: planet.sign,
            signName: planet.signName,
            signDegree: planet.signDegree,
            formattedPosition: planet.formattedPosition,
            house: planet.house,
            isRetrograde: planet.isRetrograde,
          }),
        ),
        houses: this.formatHousesForResponse(chartData.houses).map((house) => ({
          house: house.house,
          sign: house.sign,
          signName: house.signName,
          signDegree: house.signDegree,
          formattedPosition: house.formattedPosition,
        })),
        aspects: this.formatAspectsForResponse(chartData.aspects).map(
          (aspect) => ({
            planet1: aspect.planet1,
            planet1Name: aspect.planet1Name,
            planet2: aspect.planet2,
            planet2Name: aspect.planet2Name,
            aspectType: aspect.aspectType,
            aspectName: aspect.aspectName,
            aspectSymbol: aspect.aspectSymbol,
            orb: aspect.orb,
            isApplying: aspect.isApplying,
          }),
        ),
      },
      planets: this.formatPlanetsForResponse(chartData.planets),
      houses: this.formatHousesForResponse(chartData.houses),
      aspects: this.formatAspectsForResponse(chartData.aspects),
      bigThree,
      calculationTimeMs,
    };
  }

  private async saveChart(
    userId: number,
    dto: GenerateChartDto,
    chartData: ChartData,
    aiSynthesis?: string,
  ): Promise<BirthChart> {
    const chart = this.chartRepo.create({
      userId,
      name: dto.name,
      birthDate: new Date(dto.birthDate),
      birthTime: this.normalizeBirthTime(dto.birthTime),
      birthPlace: dto.birthPlace,
      latitude: dto.latitude,
      longitude: dto.longitude,
      timezone: dto.timezone,
      chartData: {
        ...chartData,
        aiSynthesis,
      },
      sunSign: this.findPlanetSign(chartData, Planet.SUN),
      moonSign: this.findPlanetSign(chartData, Planet.MOON),
      ascendantSign: chartData.ascendant.sign,
    });

    return this.chartRepo.save(chart);
  }

  private findPlanetSign(chartData: ChartData, planet: Planet): ZodiacSign {
    const sign = chartData.planets.find(
      (item) => String(item.planet) === String(planet),
    )?.sign;
    return (sign as ZodiacSign | undefined) ?? ZodiacSign.ARIES;
  }

  private formatPlanetsForResponse(
    planets: ChartData['planets'],
  ): PlanetPositionDto[] {
    return planets.map((planet) => ({
      planet: planet.planet,
      sign: planet.sign,
      signName:
        ZodiacSignMetadata[planet.sign as ZodiacSign]?.name ?? planet.sign,
      signDegree: Number(planet.signDegree.toFixed(2)),
      formattedPosition: this.formatPosition(planet.signDegree, planet.sign),
      house: planet.house,
      isRetrograde: planet.isRetrograde,
    }));
  }

  private formatHousesForResponse(houses: ChartData['houses']): HouseCuspDto[] {
    return houses.map((house) => ({
      house: house.house,
      sign: house.sign,
      signName:
        ZodiacSignMetadata[house.sign as ZodiacSign]?.name ?? house.sign,
      signDegree: Number(house.signDegree.toFixed(2)),
      formattedPosition: this.formatPosition(house.signDegree, house.sign),
    }));
  }

  private formatAspectsForResponse(
    aspects: ChartData['aspects'],
  ): ChartAspectDto[] {
    return aspects.map((aspect) => ({
      planet1: aspect.planet1,
      planet1Name:
        PlanetMetadata[aspect.planet1 as Planet]?.name ?? aspect.planet1,
      planet2: aspect.planet2,
      planet2Name:
        PlanetMetadata[aspect.planet2 as Planet]?.name ?? aspect.planet2,
      aspectType: aspect.aspectType,
      aspectName:
        AspectTypeMetadata[aspect.aspectType as AspectType]?.name ??
        aspect.aspectType,
      aspectSymbol:
        AspectTypeMetadata[aspect.aspectType as AspectType]?.symbol ?? '',
      orb: Number(aspect.orb.toFixed(2)),
      isApplying: aspect.isApplying,
    }));
  }

  private formatPosition(signDegree: number, sign: string): string {
    const wholeDegrees = Math.floor(signDegree);
    const minutes = Math.round((signDegree - wholeDegrees) * 60);
    const signName = ZodiacSignMetadata[sign as ZodiacSign]?.name ?? sign;
    return `${wholeDegrees}° ${minutes}' ${signName}`;
  }

  private normalizeBirthTime(time: string): string {
    return time.length === 5 ? `${time}:00` : time;
  }

  private getNextMonthStartIso(): string {
    const now = new Date();
    const nextMonthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0),
    );
    return nextMonthStart.toISOString();
  }
}
