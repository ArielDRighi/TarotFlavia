import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { parseBirthDate, formatBirthDate } from '../../domain/utils/date-utils';
import { Repository } from 'typeorm';
import {
  ChartHistoryResponseDto,
  CreateBirthChartDto,
  PremiumChartResponseDto,
  SavedChartSummaryDto,
} from '../dto';
import {
  AspectType,
  AspectTypeMetadata,
  Planet,
  PlanetMetadata,
  ZodiacSign,
  ZodiacSignMetadata,
} from '../../domain/enums';
import { BirthChart, ChartData } from '../../entities/birth-chart.entity';
import { ChartPdfService } from './chart-pdf.service';
import { ChartInterpretationService } from './chart-interpretation.service';
import {
  ChartCalculationInput,
  ChartCalculationService,
} from './chart-calculation.service';
import { ChartAISynthesisService } from './chart-ai-synthesis.service';

@Injectable()
export class BirthChartHistoryService {
  constructor(
    @InjectRepository(BirthChart)
    private readonly chartRepo: Repository<BirthChart>,
    private readonly pdfService: ChartPdfService,
    private readonly interpretationService: ChartInterpretationService,
    private readonly calculationService: ChartCalculationService,
    private readonly aiSynthesisService: ChartAISynthesisService,
  ) {}

  async getUserCharts(
    userId: number,
    page: number,
    limit: number,
  ): Promise<ChartHistoryResponseDto> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(limit, 100));

    const [charts, totalItems] = await this.chartRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / safeLimit);

    return {
      data: charts.map((chart) => this.toSavedChartSummary(chart)),
      meta: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages,
        hasNextPage: safePage * safeLimit < totalItems,
        hasPreviousPage: safePage > 1,
      },
    };
  }

  async getChartById(
    chartId: number,
    userId: number,
  ): Promise<PremiumChartResponseDto | null> {
    const chart = await this.chartRepo.findOne({
      where: { id: chartId, userId },
    });

    if (!chart) {
      return null;
    }

    const interpretation =
      await this.interpretationService.generateFullInterpretation(
        chart.chartData,
      );

    return {
      success: true,
      chartSvgData: {
        planets: this.formatPlanetsForResponse(chart.chartData.planets).map(
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
        houses: this.formatHousesForResponse(chart.chartData.houses).map(
          (house) => ({
            house: house.house,
            sign: house.sign,
            signName: house.signName,
            signDegree: house.signDegree,
            formattedPosition: house.formattedPosition,
          }),
        ),
        aspects: this.formatAspectsForResponse(chart.chartData.aspects).map(
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
      planets: this.formatPlanetsForResponse(chart.chartData.planets),
      houses: this.formatHousesForResponse(chart.chartData.houses),
      aspects: this.formatAspectsForResponse(chart.chartData.aspects),
      bigThree: interpretation.bigThree,
      calculationTimeMs: 0,
      distribution: interpretation.distribution,
      interpretations: {
        planets: interpretation.planets.map((planet) => ({
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
        })),
      },
      canDownloadPdf: true,
      savedChartId: chart.id,
      name: chart.name,
      createdAt:
        typeof chart.createdAt === 'string'
          ? chart.createdAt
          : chart.createdAt.toISOString(),
      birthDate:
        typeof chart.birthDate === 'string'
          ? chart.birthDate
          : formatBirthDate(chart.birthDate),
      birthTime: chart.birthTime.substring(0, 5),
      birthPlace: chart.birthPlace,
      aiSynthesis: {
        content: chart.chartData.aiSynthesis ?? '',
        generatedAt: chart.chartData.aiSynthesis
          ? typeof chart.updatedAt === 'string'
            ? chart.updatedAt
            : chart.updatedAt.toISOString()
          : null,
        provider: chart.chartData.aiSynthesis ? 'cached' : 'none',
      },
      canAccessHistory: true,
    };
  }

  async checkDuplicate(
    userId: number,
    birthDate: string,
    birthTime: string,
    latitude: number,
    longitude: number,
  ): Promise<boolean> {
    const existing = await this.findDuplicate(
      userId,
      birthDate,
      birthTime,
      latitude,
      longitude,
    );
    return !!existing;
  }

  async findDuplicate(
    userId: number,
    birthDate: string,
    birthTime: string,
    latitude: number,
    longitude: number,
  ): Promise<BirthChart | null> {
    return this.chartRepo.findOne({
      where: {
        userId,
        birthDate: parseBirthDate(birthDate),
        birthTime: this.normalizeBirthTime(birthTime),
        latitude,
        longitude,
      },
    });
  }

  async saveChart(
    userId: number,
    dto: CreateBirthChartDto,
  ): Promise<SavedChartSummaryDto> {
    const input: ChartCalculationInput = {
      birthDate: parseBirthDate(dto.birthDate),
      birthTime: dto.birthTime,
      latitude: dto.latitude,
      longitude: dto.longitude,
      timezone: dto.timezone,
    };

    const { chartData } = this.calculationService.calculateChart(input);

    const synthesis = await this.aiSynthesisService.generateSynthesis(
      {
        chartData,
        interpretation:
          await this.interpretationService.generateFullInterpretation(
            chartData,
          ),
        userName: dto.name,
        birthDate: parseBirthDate(dto.birthDate),
      },
      userId,
    );

    const chart = this.chartRepo.create({
      userId,
      name: dto.chartName ?? dto.name,
      birthDate: parseBirthDate(dto.birthDate),
      birthTime: this.normalizeBirthTime(dto.birthTime),
      birthPlace: dto.birthPlace,
      latitude: dto.latitude,
      longitude: dto.longitude,
      timezone: dto.timezone,
      chartData: {
        ...chartData,
        aiSynthesis: synthesis.synthesis,
      },
      sunSign: this.findPlanetSign(chartData, Planet.SUN),
      moonSign: this.findPlanetSign(chartData, Planet.MOON),
      ascendantSign: chartData.ascendant.sign,
    });

    const saved = await this.chartRepo.save(chart);
    return this.toSavedChartSummary(saved);
  }

  async renameChart(
    chartId: number,
    userId: number,
    newName: string,
  ): Promise<boolean> {
    const result = await this.chartRepo.update(
      { id: chartId, userId },
      { name: newName },
    );
    return (result.affected ?? 0) > 0;
  }

  async deleteChart(chartId: number, userId: number): Promise<boolean> {
    const result = await this.chartRepo.delete({ id: chartId, userId });
    return (result.affected ?? 0) > 0;
  }

  async generatePdfFromSaved(
    chartId: number,
    userId: number,
  ): Promise<{ buffer: Buffer; filename: string } | null> {
    const chart = await this.chartRepo.findOne({
      where: { id: chartId, userId },
    });

    if (!chart) {
      return null;
    }

    const interpretation =
      await this.interpretationService.generateFullInterpretation(
        chart.chartData,
      );

    const pdfResult = await this.pdfService.generatePDF({
      chartData: chart.chartData,
      interpretation,
      aiSynthesis: chart.chartData.aiSynthesis,
      userName: chart.name,
      birthDate: new Date(chart.birthDate),
      birthTime: chart.birthTime,
      birthPlace: chart.birthPlace,
      generatedAt: new Date(),
      isPremium: true,
    });

    return {
      buffer: pdfResult.buffer,
      filename: pdfResult.filename,
    };
  }

  private toSavedChartSummary(chart: BirthChart): SavedChartSummaryDto {
    const birthDateStr =
      typeof chart.birthDate === 'string'
        ? chart.birthDate
        : formatBirthDate(chart.birthDate);

    return {
      id: chart.id,
      name: chart.name,
      birthDate: birthDateStr,
      sunSign:
        ZodiacSignMetadata[chart.sunSign as ZodiacSign]?.name ?? chart.sunSign,
      moonSign:
        ZodiacSignMetadata[chart.moonSign as ZodiacSign]?.name ??
        chart.moonSign,
      ascendantSign:
        ZodiacSignMetadata[chart.ascendantSign as ZodiacSign]?.name ??
        chart.ascendantSign,
      createdAt:
        typeof chart.createdAt === 'string'
          ? chart.createdAt
          : chart.createdAt.toISOString(),
    };
  }

  private normalizeBirthTime(time: string): string {
    return time.length === 5 ? `${time}:00` : time;
  }

  private findPlanetSign(chartData: ChartData, planet: Planet): string {
    return (
      chartData.planets.find((item) => String(item.planet) === String(planet))
        ?.sign ?? ZodiacSign.ARIES
    );
  }

  private formatPlanetsForResponse(
    planets: ChartData['planets'],
  ): PremiumChartResponseDto['planets'] {
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

  private formatHousesForResponse(
    houses: ChartData['houses'],
  ): PremiumChartResponseDto['houses'] {
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
  ): PremiumChartResponseDto['aspects'] {
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
}
