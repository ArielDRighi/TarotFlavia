import { Injectable } from '@nestjs/common';
import { LunarPhase } from '../../domain/enums';

/**
 * Información de la fase lunar
 */
export interface LunarInfo {
  phase: LunarPhase;
  phaseName: string;
  illumination: number; // 0-100
  zodiacSign: string;
  isGoodFor: string[];
}

/**
 * Servicio para cálculo de fases lunares
 *
 * Responsabilidades:
 * - Calcular la fase lunar actual
 * - Calcular fase lunar para una fecha específica
 * - Proporcionar información sobre la fase lunar (nombre, signo, recomendaciones)
 *
 * Usa algoritmo simplificado basado en el ciclo lunar de 29.53 días.
 */
@Injectable()
export class LunarPhaseService {
  private readonly SYNODIC_MONTH = 29.530588853; // Días del ciclo lunar
  private readonly KNOWN_NEW_MOON = new Date(2000, 0, 6, 18, 14); // Luna nueva conocida

  /**
   * Obtiene información de la fase lunar actual
   */
  getCurrentPhase(): LunarInfo {
    const now = new Date();
    const phase = this.calculatePhase(now);
    const illumination = this.calculateIllumination(now);
    const zodiacSign = this.calculateLunarSign(now);

    return {
      phase,
      phaseName: this.getPhaseName(phase),
      illumination,
      zodiacSign,
      isGoodFor: this.getPhaseRecommendations(phase),
    };
  }

  /**
   * Calcula la fase lunar para una fecha específica
   */
  calculatePhase(date: Date): LunarPhase {
    const daysSince =
      (date.getTime() - this.KNOWN_NEW_MOON.getTime()) / (1000 * 60 * 60 * 24);
    const lunarAge = daysSince % this.SYNODIC_MONTH;

    // Dividir el ciclo en 8 fases
    const phaseIndex = Math.floor((lunarAge / this.SYNODIC_MONTH) * 8) % 8;

    const phases: LunarPhase[] = [
      LunarPhase.NEW_MOON,
      LunarPhase.WAXING_CRESCENT,
      LunarPhase.FIRST_QUARTER,
      LunarPhase.WAXING_GIBBOUS,
      LunarPhase.FULL_MOON,
      LunarPhase.WANING_GIBBOUS,
      LunarPhase.LAST_QUARTER,
      LunarPhase.WANING_CRESCENT,
    ];

    return phases[phaseIndex];
  }

  /**
   * Obtiene el nombre en español de la fase lunar
   */
  getPhaseName(phase: LunarPhase): string {
    const names: Record<LunarPhase, string> = {
      [LunarPhase.NEW_MOON]: 'Luna Nueva',
      [LunarPhase.WAXING_CRESCENT]: 'Luna Creciente',
      [LunarPhase.FIRST_QUARTER]: 'Cuarto Creciente',
      [LunarPhase.WAXING_GIBBOUS]: 'Gibosa Creciente',
      [LunarPhase.FULL_MOON]: 'Luna Llena',
      [LunarPhase.WANING_GIBBOUS]: 'Gibosa Menguante',
      [LunarPhase.LAST_QUARTER]: 'Cuarto Menguante',
      [LunarPhase.WANING_CRESCENT]: 'Luna Menguante',
    };
    return names[phase];
  }

  /**
   * Calcula el porcentaje de iluminación de la luna
   */
  private calculateIllumination(date: Date): number {
    const daysSince =
      (date.getTime() - this.KNOWN_NEW_MOON.getTime()) / (1000 * 60 * 60 * 24);
    const lunarAge = daysSince % this.SYNODIC_MONTH;

    // Iluminación varía de 0 (nueva) a 100 (llena) y de vuelta
    const phaseAngle = (lunarAge / this.SYNODIC_MONTH) * 2 * Math.PI;
    const illumination = ((1 - Math.cos(phaseAngle)) / 2) * 100;

    return Math.round(illumination);
  }

  /**
   * Calcula el signo zodiacal de la luna (simplificado)
   */
  private calculateLunarSign(date: Date): string {
    const signs = [
      'Aries',
      'Tauro',
      'Géminis',
      'Cáncer',
      'Leo',
      'Virgo',
      'Libra',
      'Escorpio',
      'Sagitario',
      'Capricornio',
      'Acuario',
      'Piscis',
    ];

    const dayOfYear = this.getDayOfYear(date);
    const lunarSignIndex =
      Math.floor((dayOfYear * 12) / 365 + date.getDate() / 2.5) % 12;

    return signs[lunarSignIndex];
  }

  /**
   * Calcula el día del año para una fecha
   */
  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtiene recomendaciones para una fase lunar
   */
  private getPhaseRecommendations(phase: LunarPhase): string[] {
    const recommendations: Record<LunarPhase, string[]> = {
      [LunarPhase.NEW_MOON]: [
        'Nuevos comienzos',
        'Establecer intenciones',
        'Planificación',
      ],
      [LunarPhase.WAXING_CRESCENT]: [
        'Tomar acción',
        'Desarrollar ideas',
        'Compromiso',
      ],
      [LunarPhase.FIRST_QUARTER]: [
        'Superar obstáculos',
        'Toma de decisiones',
        'Acción',
      ],
      [LunarPhase.WAXING_GIBBOUS]: ['Refinamiento', 'Ajustes', 'Preparación'],
      [LunarPhase.FULL_MOON]: ['Culminación', 'Celebración', 'Liberación'],
      [LunarPhase.WANING_GIBBOUS]: ['Gratitud', 'Compartir', 'Enseñar'],
      [LunarPhase.LAST_QUARTER]: ['Soltar', 'Perdonar', 'Limpiar'],
      [LunarPhase.WANING_CRESCENT]: ['Descanso', 'Reflexión', 'Sanación'],
    };
    return recommendations[phase];
  }
}
