import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendulumInterpretation } from '../../entities/pendulum-interpretation.entity';
import { PendulumResponse } from '../../domain/enums/pendulum.enums';

/**
 * Servicio para gestionar interpretaciones del péndulo
 *
 * Responsabilidades:
 * - Obtener interpretaciones aleatorias según el tipo de respuesta
 * - Filtrar solo interpretaciones activas
 * - Proveer fallbacks cuando no hay interpretaciones disponibles
 */
@Injectable()
export class PendulumInterpretationService {
  constructor(
    @InjectRepository(PendulumInterpretation)
    private readonly repository: Repository<PendulumInterpretation>,
  ) {}

  /**
   * Obtiene una interpretación aleatoria para el tipo de respuesta
   * @param responseType - Tipo de respuesta del péndulo (yes/no/maybe)
   * @returns Texto de la interpretación
   */
  async getRandomInterpretation(
    responseType: PendulumResponse,
  ): Promise<string> {
    const interpretations = await this.repository.find({
      where: { responseType, isActive: true },
    });

    if (interpretations.length === 0) {
      return this.getFallbackInterpretation(responseType);
    }

    const randomIndex = Math.floor(Math.random() * interpretations.length);
    return interpretations[randomIndex].text;
  }

  /**
   * Retorna interpretación de fallback cuando no hay interpretaciones en la BD
   * @param responseType - Tipo de respuesta del péndulo
   * @returns Texto de interpretación por defecto
   * @private
   */
  private getFallbackInterpretation(responseType: PendulumResponse): string {
    switch (responseType) {
      case PendulumResponse.YES:
        return 'El universo afirma tu camino.';
      case PendulumResponse.NO:
        return 'El universo sugiere otra dirección.';
      case PendulumResponse.MAYBE:
        return 'El universo guarda silencio por ahora.';
    }
  }
}
