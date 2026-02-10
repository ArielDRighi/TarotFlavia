import { Injectable, Logger, Inject } from '@nestjs/common';
import { BirthChartInterpretation } from '../../entities/birth-chart-interpretation.entity';
import {
  ChartData,
  PlanetPosition,
  ChartAspect,
} from '../../entities/birth-chart.entity';
import {
  Planet,
  ZodiacSign,
  AspectType,
  PlanetMetadata,
  ZodiacSignMetadata,
  AspectTypeMetadata,
  InterpretationCategory,
} from '../../domain/enums';
import { IBirthChartInterpretationRepository } from '../../domain/interfaces/birth-chart-interpretation-repository.interface';

/**
 * Interpretación de un planeta individual
 */
export interface PlanetInterpretation {
  planet: Planet;
  planetName: string;
  planetSymbol: string;
  sign: ZodiacSign;
  signName: string;
  house: number;
  isRetrograde: boolean;
  intro?: string;
  inSign?: string;
  inHouse?: string;
  aspects?: AspectInterpretation[];
}

/**
 * Interpretación de un aspecto
 */
export interface AspectInterpretation {
  planet1: string;
  planet2: string;
  aspectType: AspectType;
  aspectName: string;
  aspectSymbol: string;
  orb: number;
  interpretation?: string;
}

/**
 * Interpretación del Big Three
 */
export interface BigThreeInterpretation {
  sun: {
    sign: ZodiacSign;
    signName: string;
    interpretation: string;
  };
  moon: {
    sign: ZodiacSign;
    signName: string;
    interpretation: string;
  };
  ascendant: {
    sign: ZodiacSign;
    signName: string;
    interpretation: string;
  };
}

/**
 * Informe completo de interpretación
 */
export interface FullChartInterpretation {
  bigThree: BigThreeInterpretation;
  planets: PlanetInterpretation[];
  distribution: {
    elements: { name: string; count: number; percentage: number }[];
    modalities: { name: string; count: number; percentage: number }[];
  };
  aspectSummary: {
    total: number;
    harmonious: number;
    challenging: number;
    strongest?: AspectInterpretation;
  };
}

/**
 * Servicio de interpretación de cartas astrales
 *
 * Ensambla las interpretaciones para una carta astral, organizándolas
 * según el plan del usuario (Big Three para anónimos, completo para Free/Premium).
 *
 * @example
 * const bigThree = await service.generateBigThreeInterpretation(
 *   ZodiacSign.LEO,
 *   ZodiacSign.SCORPIO,
 *   ZodiacSign.VIRGO
 * );
 *
 * const fullInterpretation = await service.generateFullInterpretation(chartData);
 */
@Injectable()
export class ChartInterpretationService {
  private readonly logger = new Logger(ChartInterpretationService.name);

  constructor(
    @Inject('BIRTH_CHART_INTERPRETATION_REPOSITORY')
    private readonly interpretationRepo: IBirthChartInterpretationRepository,
  ) {}

  /**
   * Genera interpretación del Big Three (para TODOS los planes)
   *
   * @param sunSign - Signo solar
   * @param moonSign - Signo lunar
   * @param ascendantSign - Signo ascendente
   * @returns Interpretación del Big Three con textos completos
   */
  async generateBigThreeInterpretation(
    sunSign: ZodiacSign,
    moonSign: ZodiacSign,
    ascendantSign: ZodiacSign,
  ): Promise<BigThreeInterpretation> {
    this.logger.debug('Generating Big Three interpretation');

    const { sun, moon, ascendant } = await this.interpretationRepo.findBigThree(
      sunSign,
      moonSign,
      ascendantSign,
    );

    return {
      sun: {
        sign: sunSign,
        signName: ZodiacSignMetadata[sunSign]?.name || sunSign,
        interpretation:
          sun?.content || this.getDefaultInterpretation('sun', sunSign),
      },
      moon: {
        sign: moonSign,
        signName: ZodiacSignMetadata[moonSign]?.name || moonSign,
        interpretation:
          moon?.content || this.getDefaultInterpretation('moon', moonSign),
      },
      ascendant: {
        sign: ascendantSign,
        signName: ZodiacSignMetadata[ascendantSign]?.name || ascendantSign,
        interpretation:
          ascendant?.content ||
          this.getDefaultInterpretation('ascendant', ascendantSign),
      },
    };
  }

  /**
   * Genera interpretación completa (para Free y Premium)
   *
   * @param chartData - Datos completos de la carta astral
   * @returns Informe completo con todas las interpretaciones
   */
  async generateFullInterpretation(
    chartData: ChartData,
  ): Promise<FullChartInterpretation> {
    this.logger.debug('Generating full chart interpretation');

    // 1. Preparar parámetros para búsqueda batch
    const planets = chartData.planets.map((p) => ({
      planet: p.planet as Planet,
      sign: p.sign as ZodiacSign,
      house: p.house,
    }));

    const aspects = chartData.aspects.map((a) => ({
      planet1: a.planet1 as Planet,
      planet2: a.planet2 as Planet,
      aspectType: a.aspectType as AspectType,
    }));

    const ascendantSign = chartData.ascendant.sign as ZodiacSign;

    // 2. Obtener todas las interpretaciones en batch
    const interpretationsMap = await this.interpretationRepo.findAllForChart({
      planets,
      aspects,
      ascendantSign,
    });

    // 3. Generar Big Three
    const sunSign = chartData.planets.find(
      (p) => (p.planet as Planet) === Planet.SUN,
    )?.sign as ZodiacSign;
    const moonSign = chartData.planets.find(
      (p) => (p.planet as Planet) === Planet.MOON,
    )?.sign as ZodiacSign;
    const bigThree = await this.generateBigThreeInterpretation(
      sunSign,
      moonSign,
      ascendantSign,
    );

    // 4. Generar interpretaciones de planetas
    const planetInterpretations = this.buildPlanetInterpretations(
      chartData.planets,
      chartData.aspects,
      interpretationsMap,
    );

    // 5. Calcular distribución con porcentajes
    const distribution = this.buildDistributionSummary(chartData.distribution);

    // 6. Generar resumen de aspectos
    const aspectSummary = this.buildAspectSummary(
      chartData.aspects,
      interpretationsMap,
    );

    return {
      bigThree,
      planets: planetInterpretations,
      distribution,
      aspectSummary,
    };
  }

  /**
   * Construye interpretaciones para cada planeta
   */
  private buildPlanetInterpretations(
    planets: PlanetPosition[],
    aspects: ChartAspect[],
    interpretationsMap: Map<string, BirthChartInterpretation>,
  ): PlanetInterpretation[] {
    return planets.map((planet) => {
      const planetEnum = planet.planet as Planet;
      const signEnum = planet.sign as ZodiacSign;

      // Buscar interpretaciones
      const introKey = BirthChartInterpretation.generateKey(
        InterpretationCategory.PLANET_INTRO,
        planetEnum,
      );
      const signKey = BirthChartInterpretation.generateKey(
        InterpretationCategory.PLANET_IN_SIGN,
        planetEnum,
        signEnum,
      );
      const houseKey = BirthChartInterpretation.generateKey(
        InterpretationCategory.PLANET_IN_HOUSE,
        planetEnum,
        null,
        planet.house,
      );

      // Obtener aspectos de este planeta
      const planetAspects = aspects
        .filter(
          (a) => a.planet1 === planet.planet || a.planet2 === planet.planet,
        )
        .map((a) => this.buildAspectInterpretation(a, interpretationsMap));

      return {
        planet: planetEnum,
        planetName: PlanetMetadata[planetEnum]?.name || planet.planet,
        planetSymbol: PlanetMetadata[planetEnum]?.symbol || '',
        sign: signEnum,
        signName: ZodiacSignMetadata[signEnum]?.name || planet.sign,
        house: planet.house,
        isRetrograde: planet.isRetrograde,
        intro: interpretationsMap.get(introKey)?.content,
        inSign: interpretationsMap.get(signKey)?.content,
        inHouse: interpretationsMap.get(houseKey)?.content,
        aspects: planetAspects,
      };
    });
  }

  /**
   * Construye interpretación de un aspecto
   */
  private buildAspectInterpretation(
    aspect: ChartAspect,
    interpretationsMap: Map<string, BirthChartInterpretation>,
  ): AspectInterpretation {
    const aspectKey = BirthChartInterpretation.generateKey(
      InterpretationCategory.ASPECT,
      aspect.planet1 as Planet,
      null,
      null,
      aspect.aspectType as AspectType,
      aspect.planet2 as Planet,
    );

    const metadata = AspectTypeMetadata[aspect.aspectType as AspectType];

    return {
      planet1: aspect.planet1,
      planet2: aspect.planet2,
      aspectType: aspect.aspectType as AspectType,
      aspectName: metadata?.name || aspect.aspectType,
      aspectSymbol: metadata?.symbol || '',
      orb: aspect.orb,
      interpretation: interpretationsMap.get(aspectKey)?.content,
    };
  }

  /**
   * Construye resumen de distribución con porcentajes
   */
  private buildDistributionSummary(distribution: ChartData['distribution']): {
    elements: { name: string; count: number; percentage: number }[];
    modalities: { name: string; count: number; percentage: number }[];
  } {
    const totalPlanets = 11; // 10 planetas + Ascendente

    const elements = [
      { name: 'Fuego', count: distribution.elements.fire },
      { name: 'Tierra', count: distribution.elements.earth },
      { name: 'Aire', count: distribution.elements.air },
      { name: 'Agua', count: distribution.elements.water },
    ].map((e) => ({
      ...e,
      percentage: Math.round((e.count / totalPlanets) * 100),
    }));

    const modalities = [
      { name: 'Cardinal', count: distribution.modalities.cardinal },
      { name: 'Fijo', count: distribution.modalities.fixed },
      { name: 'Mutable', count: distribution.modalities.mutable },
    ].map((m) => ({
      ...m,
      percentage: Math.round((m.count / totalPlanets) * 100),
    }));

    return { elements, modalities };
  }

  /**
   * Construye resumen de aspectos
   */
  private buildAspectSummary(
    aspects: ChartAspect[],
    interpretationsMap: Map<string, BirthChartInterpretation>,
  ): {
    total: number;
    harmonious: number;
    challenging: number;
    strongest?: AspectInterpretation;
  } {
    let harmonious = 0;
    let challenging = 0;

    for (const aspect of aspects) {
      const metadata = AspectTypeMetadata[aspect.aspectType as AspectType];
      if (metadata?.nature === 'harmonious') {
        harmonious++;
      } else if (metadata?.nature === 'challenging') {
        challenging++;
      }
    }

    // Encontrar el aspecto más fuerte (menor orbe)
    const strongest =
      aspects.length > 0
        ? aspects.reduce((min, a) => (a.orb < min.orb ? a : min))
        : undefined;

    return {
      total: aspects.length,
      harmonious,
      challenging,
      strongest: strongest
        ? this.buildAspectInterpretation(strongest, interpretationsMap)
        : undefined,
    };
  }

  /**
   * Genera interpretación por defecto si no existe en DB
   *
   * @param type - Tipo de interpretación (sun, moon, ascendant)
   * @param sign - Signo zodiacal
   * @returns Texto de interpretación por defecto
   */
  private getDefaultInterpretation(type: string, sign: ZodiacSign): string {
    const signName = ZodiacSignMetadata[sign]?.name || sign;

    switch (type) {
      case 'sun':
        return `Tu Sol en ${signName} representa tu esencia y propósito vital. Este signo influye en tu identidad central y cómo expresas tu individualidad.`;
      case 'moon':
        return `Tu Luna en ${signName} revela tu mundo emocional interior. Este signo influye en cómo procesas tus sentimientos y qué necesitas para sentirte seguro.`;
      case 'ascendant':
        return `Tu Ascendente en ${signName} es la máscara que muestras al mundo. Este signo influye en la primera impresión que causas y cómo inicias nuevas experiencias.`;
      default:
        return '';
    }
  }
}
