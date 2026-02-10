import { BirthChartInterpretation } from '../../entities/birth-chart-interpretation.entity';
import {
  InterpretationCategory,
  Planet,
  ZodiacSign,
  AspectType,
} from '../enums';

/**
 * Interface del repositorio de interpretaciones de carta astral
 * Encapsula las consultas a la tabla birth_chart_interpretations
 */
export interface IBirthChartInterpretationRepository {
  /**
   * Busca interpretación de planeta en signo
   * @param planet Planeta (ej: Planet.SUN)
   * @param sign Signo zodiacal (ej: ZodiacSign.ARIES)
   * @returns Interpretación o null si no existe
   */
  findPlanetInSign(
    planet: Planet,
    sign: ZodiacSign,
  ): Promise<BirthChartInterpretation | null>;

  /**
   * Busca interpretación de planeta en casa
   * @param planet Planeta (ej: Planet.SUN)
   * @param house Número de casa (1-12)
   * @returns Interpretación o null si no existe
   */
  findPlanetInHouse(
    planet: Planet,
    house: number,
  ): Promise<BirthChartInterpretation | null>;

  /**
   * Busca interpretación de aspecto entre planetas
   * Busca en ambas direcciones (planet1-planet2 o planet2-planet1)
   * @param planet1 Primer planeta
   * @param planet2 Segundo planeta
   * @param aspectType Tipo de aspecto (ej: AspectType.CONJUNCTION)
   * @returns Interpretación o null si no existe
   */
  findAspect(
    planet1: Planet,
    planet2: Planet,
    aspectType: AspectType,
  ): Promise<BirthChartInterpretation | null>;

  /**
   * Busca interpretación del Ascendente en signo
   * @param sign Signo zodiacal del Ascendente
   * @returns Interpretación o null si no existe
   */
  findAscendant(sign: ZodiacSign): Promise<BirthChartInterpretation | null>;

  /**
   * Busca introducción de un planeta
   * @param planet Planeta (ej: Planet.SUN)
   * @returns Interpretación o null si no existe
   */
  findPlanetIntro(planet: Planet): Promise<BirthChartInterpretation | null>;

  /**
   * Obtiene todas las interpretaciones necesarias para una carta
   * Optimiza consultas ejecutándolas en paralelo
   * @param params Parámetros de planetas, aspectos y ascendente
   * @returns Map de interpretaciones con clave única generada
   */
  findAllForChart(params: {
    planets: Array<{ planet: Planet; sign: ZodiacSign; house: number }>;
    aspects: Array<{
      planet1: Planet;
      planet2: Planet;
      aspectType: AspectType;
    }>;
    ascendantSign: ZodiacSign;
  }): Promise<Map<string, BirthChartInterpretation>>;

  /**
   * Obtiene solo interpretaciones del Big Three
   * (Sol, Luna, Ascendente - disponible para todos los planes)
   * @param sunSign Signo solar
   * @param moonSign Signo lunar
   * @param ascendantSign Signo ascendente
   * @returns Objeto con las tres interpretaciones
   */
  findBigThree(
    sunSign: ZodiacSign,
    moonSign: ZodiacSign,
    ascendantSign: ZodiacSign,
  ): Promise<{
    sun: BirthChartInterpretation | null;
    moon: BirthChartInterpretation | null;
    ascendant: BirthChartInterpretation | null;
  }>;

  /**
   * Cuenta interpretaciones por categoría (para estadísticas)
   * @returns Objeto con conteo por categoría (solo categorías presentes)
   */
  countByCategory(): Promise<Partial<Record<InterpretationCategory, number>>>;
}
