import { Injectable, Logger } from '@nestjs/common';
import { AspectType, AspectTypeMetadata } from '../../domain/enums';
import { ChartAspect, PlanetPosition } from '../../entities/birth-chart.entity';

/**
 * Configuración de un aspecto astrológico
 */
interface AspectConfig {
  type: AspectType;
  angle: number;
  orb: number;
}

/**
 * Servicio de cálculo de aspectos astrológicos
 *
 * Detecta y calcula aspectos (conjunción, oposición, cuadratura, trígono, sextil)
 * entre planetas basándose en sus posiciones y los orbes permitidos.
 *
 * @example
 * const planets = [...]; // Posiciones planetarias
 * const aspects = service.calculateAspects(planets);
 */
@Injectable()
export class AspectCalculationService {
  private readonly logger = new Logger(AspectCalculationService.name);

  /**
   * Configuración de aspectos mayores con sus orbes
   * Los orbes se toman de AspectTypeMetadata
   */
  private readonly ASPECTS: AspectConfig[] = [
    {
      type: AspectType.CONJUNCTION,
      angle: AspectTypeMetadata[AspectType.CONJUNCTION].angle,
      orb: AspectTypeMetadata[AspectType.CONJUNCTION].orb,
    },
    {
      type: AspectType.OPPOSITION,
      angle: AspectTypeMetadata[AspectType.OPPOSITION].angle,
      orb: AspectTypeMetadata[AspectType.OPPOSITION].orb,
    },
    {
      type: AspectType.SQUARE,
      angle: AspectTypeMetadata[AspectType.SQUARE].angle,
      orb: AspectTypeMetadata[AspectType.SQUARE].orb,
    },
    {
      type: AspectType.TRINE,
      angle: AspectTypeMetadata[AspectType.TRINE].angle,
      orb: AspectTypeMetadata[AspectType.TRINE].orb,
    },
    {
      type: AspectType.SEXTILE,
      angle: AspectTypeMetadata[AspectType.SEXTILE].angle,
      orb: AspectTypeMetadata[AspectType.SEXTILE].orb,
    },
  ];

  /**
   * Calcula todos los aspectos entre planetas
   *
   * @param planets - Array de posiciones planetarias
   * @param ascendant - Opcional: Ascendente para incluir en aspectos
   * @returns Array de aspectos detectados, ordenados por fuerza (menor orbe primero)
   */
  calculateAspects(
    planets: PlanetPosition[],
    ascendant?: PlanetPosition,
  ): ChartAspect[] {
    const aspects: ChartAspect[] = [];
    const allPoints = [...planets];

    // Opcionalmente incluir Ascendente en aspectos
    if (ascendant) {
      allPoints.push(ascendant);
    }

    this.logger.debug(
      `Calculating aspects for ${allPoints.length} celestial points`,
    );

    // Comparar cada par de planetas (evitar duplicados)
    for (let i = 0; i < allPoints.length; i++) {
      for (let j = i + 1; j < allPoints.length; j++) {
        const planet1 = allPoints[i];
        const planet2 = allPoints[j];

        const aspect = this.findAspect(planet1, planet2);
        if (aspect) {
          aspects.push(aspect);
        }
      }
    }

    // Ordenar por fuerza del aspecto (menor orbe = más fuerte)
    const sortedAspects = aspects.sort((a, b) => a.orb - b.orb);

    this.logger.debug(`Found ${sortedAspects.length} aspects`);

    return sortedAspects;
  }

  /**
   * Busca si hay un aspecto entre dos planetas
   *
   * @param planet1 - Primera posición planetaria
   * @param planet2 - Segunda posición planetaria
   * @returns Aspecto detectado o null si no hay aspecto dentro del orbe
   */
  private findAspect(
    planet1: PlanetPosition,
    planet2: PlanetPosition,
  ): ChartAspect | null {
    const angle = this.calculateAngle(planet1.longitude, planet2.longitude);

    for (const aspectConfig of this.ASPECTS) {
      const orb = this.calculateOrb(angle, aspectConfig.angle);

      if (orb <= aspectConfig.orb) {
        // Determinar si el aspecto es aplicativo o separativo
        const isApplying = this.isAspectApplying(planet1, planet2, angle);

        return {
          planet1: planet1.planet,
          planet2: planet2.planet,
          aspectType: aspectConfig.type,
          angle: Math.round(angle * 100) / 100,
          orb: Math.round(orb * 100) / 100,
          isApplying,
        };
      }
    }

    return null;
  }

  /**
   * Calcula el ángulo entre dos longitudes eclípticas
   * Siempre retorna el ángulo menor (0-180°)
   *
   * @param long1 - Longitud eclíptica del primer planeta (0-360°)
   * @param long2 - Longitud eclíptica del segundo planeta (0-360°)
   * @returns Ángulo entre las dos posiciones (0-180°)
   */
  private calculateAngle(long1: number, long2: number): number {
    let diff = Math.abs(long1 - long2);

    // Siempre usar el ángulo menor (máximo 180°)
    if (diff > 180) {
      diff = 360 - diff;
    }

    return diff;
  }

  /**
   * Calcula el orbe (desviación del ángulo exacto del aspecto)
   *
   * @param actualAngle - Ángulo calculado entre planetas
   * @param aspectAngle - Ángulo exacto del aspecto (ej: 90° para cuadratura)
   * @returns Desviación en grados del aspecto exacto
   */
  private calculateOrb(actualAngle: number, aspectAngle: number): number {
    return Math.abs(actualAngle - aspectAngle);
  }

  /**
   * Determina si un aspecto es aplicativo (acercándose) o separativo (alejándose)
   *
   * Nota: Esta es una implementación simplificada basada en la geometría actual.
   * Una implementación completa usaría las velocidades de los planetas para
   * determinar la dirección del movimiento.
   *
   * @param planet1 - Primera posición planetaria
   * @param planet2 - Segunda posición planetaria
   * @param currentAngle - Ángulo actual entre los planetas
   * @returns true si el aspecto es aplicativo, false si es separativo
   */
  private isAspectApplying(
    planet1: PlanetPosition,
    planet2: PlanetPosition,
    currentAngle: number,
  ): boolean {
    // Implementación simplificada: basada en la posición relativa
    // En una implementación real, se usaría longitudeSpeed de las efemérides

    // Simular movimiento futuro (aproximación simple)
    const futureAngle = this.calculateAngle(
      planet1.longitude + 1, // 1 grado de movimiento
      planet2.longitude + 0.5, // Planeta más lento
    );

    // Si el ángulo futuro es menor que el actual, está aplicándose
    return futureAngle < currentAngle;
  }

  /**
   * Obtiene todos los aspectos que involucran a un planeta específico
   *
   * @param aspects - Array de todos los aspectos
   * @param planet - Nombre del planeta (ej: "sun", "moon")
   * @returns Array de aspectos que involucran al planeta
   */
  getAspectsForPlanet(aspects: ChartAspect[], planet: string): ChartAspect[] {
    return aspects.filter((a) => a.planet1 === planet || a.planet2 === planet);
  }

  /**
   * Filtra aspectos por tipo
   *
   * @param aspects - Array de todos los aspectos
   * @param type - Tipo de aspecto a filtrar
   * @returns Array de aspectos del tipo especificado
   */
  getAspectsByType(aspects: ChartAspect[], type: AspectType): ChartAspect[] {
    return aspects.filter((a) => a.aspectType === (type as string));
  }

  /**
   * Cuenta aspectos armónicos vs desafiantes vs neutrales
   *
   * @param aspects - Array de aspectos a analizar
   * @returns Balance de aspectos por naturaleza
   */
  getAspectBalance(aspects: ChartAspect[]): {
    harmonious: number;
    challenging: number;
    neutral: number;
  } {
    let harmonious = 0;
    let challenging = 0;
    let neutral = 0;

    for (const aspect of aspects) {
      const metadata = AspectTypeMetadata[aspect.aspectType as AspectType];

      switch (metadata?.nature) {
        case 'harmonious':
          harmonious++;
          break;
        case 'challenging':
          challenging++;
          break;
        default:
          neutral++;
      }
    }

    return { harmonious, challenging, neutral };
  }

  /**
   * Encuentra el aspecto más fuerte (menor orbe)
   *
   * @param aspects - Array de aspectos
   * @returns Aspecto con menor orbe, o null si no hay aspectos
   */
  getStrongestAspect(aspects: ChartAspect[]): ChartAspect | null {
    if (aspects.length === 0) return null;

    return aspects.reduce((strongest, current) =>
      current.orb < strongest.orb ? current : strongest,
    );
  }

  /**
   * Formatea un aspecto para display humano
   *
   * @param aspect - Aspecto a formatear
   * @returns String formateado (ej: "sun ☌ moon - 2.5° (aplicativo)")
   */
  formatAspect(aspect: ChartAspect): string {
    const metadata = AspectTypeMetadata[aspect.aspectType as AspectType];
    const applying = aspect.isApplying ? '(aplicativo)' : '(separativo)';

    return `${aspect.planet1} ${metadata?.symbol || '?'} ${aspect.planet2} - ${aspect.orb}° ${applying}`;
  }

  /**
   * Genera matriz de aspectos (aspectario)
   *
   * Crea una matriz bidimensional donde cada celda [planeta1][planeta2]
   * contiene el aspecto entre ellos, o null si no hay aspecto.
   * La diagonal siempre es null (planeta consigo mismo).
   *
   * @param aspects - Array de aspectos calculados
   * @param planets - Array de nombres de planetas
   * @returns Matriz de aspectos
   */
  generateAspectMatrix(
    aspects: ChartAspect[],
    planets: string[],
  ): Record<string, Record<string, ChartAspect | null>> {
    const matrix: Record<string, Record<string, ChartAspect | null>> = {};

    for (const p1 of planets) {
      matrix[p1] = {};
      for (const p2 of planets) {
        if (p1 === p2) {
          // Diagonal: planeta consigo mismo
          matrix[p1][p2] = null;
          continue;
        }

        // Buscar aspecto entre p1 y p2 (en cualquier dirección)
        const aspect = aspects.find(
          (a) =>
            (a.planet1 === p1 && a.planet2 === p2) ||
            (a.planet1 === p2 && a.planet2 === p1),
        );

        matrix[p1][p2] = aspect || null;
      }
    }

    return matrix;
  }
}
