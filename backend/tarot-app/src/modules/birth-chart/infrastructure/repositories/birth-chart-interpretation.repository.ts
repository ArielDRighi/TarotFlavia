import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BirthChartInterpretation } from '../../entities/birth-chart-interpretation.entity';
import { IBirthChartInterpretationRepository } from '../../domain/interfaces/birth-chart-interpretation-repository.interface';
import {
  InterpretationCategory,
  Planet,
  ZodiacSign,
  AspectType,
} from '../../domain/enums';

/**
 * Implementación TypeORM del repositorio de interpretaciones de carta astral
 * Optimizado para búsquedas rápidas y consultas en paralelo
 */
@Injectable()
export class BirthChartInterpretationRepository implements IBirthChartInterpretationRepository {
  private readonly logger = new Logger(BirthChartInterpretationRepository.name);

  constructor(
    @InjectRepository(BirthChartInterpretation)
    private readonly repo: Repository<BirthChartInterpretation>,
  ) {}

  async findPlanetInSign(
    planet: Planet,
    sign: ZodiacSign,
  ): Promise<BirthChartInterpretation | null> {
    return this.repo.findOne({
      where: {
        category: InterpretationCategory.PLANET_IN_SIGN,
        planet,
        sign,
        isActive: true,
      },
    });
  }

  async findPlanetInHouse(
    planet: Planet,
    house: number,
  ): Promise<BirthChartInterpretation | null> {
    return this.repo.findOne({
      where: {
        category: InterpretationCategory.PLANET_IN_HOUSE,
        planet,
        house,
        isActive: true,
      },
    });
  }

  async findAspect(
    planet1: Planet,
    planet2: Planet,
    aspectType: AspectType,
  ): Promise<BirthChartInterpretation | null> {
    // Buscar en ambas direcciones (Sol-Luna o Luna-Sol)
    const result = await this.repo.findOne({
      where: [
        {
          category: InterpretationCategory.ASPECT,
          planet: planet1,
          planet2: planet2,
          aspectType,
          isActive: true,
        },
        {
          category: InterpretationCategory.ASPECT,
          planet: planet2,
          planet2: planet1,
          aspectType,
          isActive: true,
        },
      ],
    });

    return result;
  }

  async findAscendant(
    sign: ZodiacSign,
  ): Promise<BirthChartInterpretation | null> {
    return this.repo.findOne({
      where: {
        category: InterpretationCategory.ASCENDANT,
        sign,
        isActive: true,
      },
    });
  }

  async findPlanetIntro(
    planet: Planet,
  ): Promise<BirthChartInterpretation | null> {
    return this.repo.findOne({
      where: {
        category: InterpretationCategory.PLANET_INTRO,
        planet,
        isActive: true,
      },
    });
  }

  async findBigThree(
    sunSign: ZodiacSign,
    moonSign: ZodiacSign,
    ascendantSign: ZodiacSign,
  ): Promise<{
    sun: BirthChartInterpretation | null;
    moon: BirthChartInterpretation | null;
    ascendant: BirthChartInterpretation | null;
  }> {
    const [sun, moon, ascendant] = await Promise.all([
      this.findPlanetInSign(Planet.SUN, sunSign),
      this.findPlanetInSign(Planet.MOON, moonSign),
      this.findAscendant(ascendantSign),
    ]);

    return { sun, moon, ascendant };
  }

  async findAllForChart(params: {
    planets: Array<{ planet: Planet; sign: ZodiacSign; house: number }>;
    aspects: Array<{
      planet1: Planet;
      planet2: Planet;
      aspectType: AspectType;
    }>;
    ascendantSign: ZodiacSign;
  }): Promise<Map<string, BirthChartInterpretation>> {
    const results = new Map<string, BirthChartInterpretation>();

    this.logger.debug(
      `Fetching interpretations for ${params.planets.length} planets and ${params.aspects.length} aspects`,
    );

    // 1. Buscar introducciones de planetas (batch)
    const planetIntros = await this.repo.find({
      where: {
        category: InterpretationCategory.PLANET_INTRO,
        planet: In(params.planets.map((p) => p.planet)),
        isActive: true,
      },
    });

    for (const interp of planetIntros) {
      const key = BirthChartInterpretation.generateKey(
        InterpretationCategory.PLANET_INTRO,
        interp.planet,
      );
      results.set(key, interp);
    }

    // 2. Buscar planetas en casas (paralelo)
    const planetHousePromises = params.planets.map((p) =>
      this.findPlanetInHouse(p.planet, p.house).then((interp) => {
        if (interp) {
          const key = BirthChartInterpretation.generateKey(
            InterpretationCategory.PLANET_IN_HOUSE,
            interp.planet,
            null,
            interp.house,
          );
          results.set(key, interp);
        }
      }),
    );

    // 3. Buscar planetas en signos (paralelo)
    const planetSignPromises = params.planets.map((p) =>
      this.findPlanetInSign(p.planet, p.sign).then((interp) => {
        if (interp) {
          const key = BirthChartInterpretation.generateKey(
            InterpretationCategory.PLANET_IN_SIGN,
            interp.planet,
            interp.sign,
          );
          results.set(key, interp);
        }
      }),
    );

    // 4. Buscar aspectos (paralelo)
    const aspectPromises = params.aspects.map((a) =>
      this.findAspect(a.planet1, a.planet2, a.aspectType).then((interp) => {
        if (interp) {
          const key = BirthChartInterpretation.generateKey(
            InterpretationCategory.ASPECT,
            interp.planet,
            null,
            null,
            interp.aspectType,
            interp.planet2,
          );
          results.set(key, interp);
        }
      }),
    );

    // 5. Buscar Ascendente
    const ascendantPromise = this.findAscendant(params.ascendantSign).then(
      (interp) => {
        if (interp) {
          const key = BirthChartInterpretation.generateKey(
            InterpretationCategory.ASCENDANT,
            null,
            interp.sign,
          );
          results.set(key, interp);
        }
      },
    );

    // Ejecutar todas las promesas en paralelo
    await Promise.all([
      ...planetHousePromises,
      ...planetSignPromises,
      ...aspectPromises,
      ascendantPromise,
    ]);

    this.logger.debug(`Retrieved ${results.size} interpretations`);

    return results;
  }

  /**
   * Cuenta interpretaciones por categoría (para estadísticas)
   */
  async countByCategory(): Promise<Record<InterpretationCategory, number>> {
    const counts = await this.repo
      .createQueryBuilder('interp')
      .select('interp.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('interp.isActive = :active', { active: true })
      .groupBy('interp.category')
      .getRawMany<{ category: InterpretationCategory; count: string }>();

    const result = {} as Record<InterpretationCategory, number>;
    for (const row of counts) {
      result[row.category] = parseInt(row.count, 10);
    }

    return result;
  }
}
