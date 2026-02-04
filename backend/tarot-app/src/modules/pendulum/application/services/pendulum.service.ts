import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendulumQuery } from '../../entities/pendulum-query.entity';
import {
  PendulumResponse,
  PendulumMovement,
} from '../../domain/enums/pendulum.enums';
import { PendulumInterpretationService } from './pendulum-interpretation.service';
import { PendulumContentValidatorService } from './pendulum-content-validator.service';
import { LunarPhaseService } from '../../../rituals/application/services/lunar-phase.service';

/**
 * DTO para consultar el péndulo
 */
export interface PendulumQueryDto {
  question?: string;
}

/**
 * DTO de respuesta de consulta al péndulo
 */
export interface PendulumQueryResponseDto {
  response: PendulumResponse;
  movement: PendulumMovement;
  responseText: string;
  interpretation: string;
  queryId: number | null;
  lunarPhase: string;
  lunarPhaseName: string;
}

/**
 * Servicio principal del Péndulo Digital
 *
 * Responsabilidades:
 * - Generar respuestas aleatorias (40% Yes, 40% No, 20% Maybe)
 * - Validar contenido de preguntas (solo Premium)
 * - Guardar historial (solo Premium con userId)
 * - Obtener interpretaciones y fase lunar
 */
@Injectable()
export class PendulumService {
  constructor(
    @InjectRepository(PendulumQuery)
    private readonly queryRepository: Repository<PendulumQuery>,
    private readonly interpretationService: PendulumInterpretationService,
    private readonly contentValidator: PendulumContentValidatorService,
    private readonly lunarService: LunarPhaseService,
  ) {}

  /**
   * Consultar el péndulo
   * @param dto - Datos de la consulta (pregunta opcional)
   * @param userId - ID del usuario (undefined para anónimos/free)
   * @returns Respuesta del péndulo con interpretación y datos lunares
   */
  async query(
    dto: PendulumQueryDto,
    userId?: number,
  ): Promise<PendulumQueryResponseDto> {
    // Validar contenido si hay pregunta y usuario autenticado
    if (dto.question && userId) {
      const validation = this.contentValidator.validateQuestion(dto.question);
      if (!validation.isValid) {
        throw new BadRequestException({
          code: 'BLOCKED_CONTENT',
          category: validation.blockedCategory,
          message: `Tu pregunta contiene temas de ${validation.blockedCategory}. Te recomendamos consultar con un profesional.`,
        });
      }
    }

    // Generar respuesta aleatoria (40% Yes, 40% No, 20% Maybe)
    const response = this.generateResponse();
    const movement = this.getMovementForResponse(response);
    const responseText = this.getResponseText(response);

    // Obtener fase lunar
    const lunarInfo = this.lunarService.getCurrentPhase();

    // Obtener interpretación aleatoria
    const interpretation =
      await this.interpretationService.getRandomInterpretation(response);

    // Guardar en historial si está autenticado
    let queryId: number | null = null;
    if (userId) {
      const savedQuery = await this.saveQuery(
        userId,
        dto,
        response,
        interpretation,
        lunarInfo.phase,
      );
      queryId = savedQuery.id;
    }

    return {
      response,
      movement,
      responseText,
      interpretation,
      queryId,
      lunarPhase: lunarInfo.phase,
      lunarPhaseName: lunarInfo.phaseName,
    };
  }

  /**
   * Genera respuesta aleatoria respetando probabilidades
   * @returns PendulumResponse (yes/no/maybe)
   * @private
   */
  private generateResponse(): PendulumResponse {
    const random = Math.random() * 100;
    if (random < 40) return PendulumResponse.YES;
    if (random < 80) return PendulumResponse.NO;
    return PendulumResponse.MAYBE;
  }

  /**
   * Obtiene el movimiento correspondiente a la respuesta
   * @param response - Respuesta del péndulo
   * @returns PendulumMovement
   * @private
   */
  private getMovementForResponse(response: PendulumResponse): PendulumMovement {
    switch (response) {
      case PendulumResponse.YES:
        return PendulumMovement.VERTICAL;
      case PendulumResponse.NO:
        return PendulumMovement.HORIZONTAL;
      case PendulumResponse.MAYBE:
        return PendulumMovement.CIRCULAR;
    }
  }

  /**
   * Obtiene el texto en español de la respuesta
   * @param response - Respuesta del péndulo
   * @returns Texto de respuesta
   * @private
   */
  private getResponseText(response: PendulumResponse): string {
    switch (response) {
      case PendulumResponse.YES:
        return 'Sí';
      case PendulumResponse.NO:
        return 'No';
      case PendulumResponse.MAYBE:
        return 'Quizás';
    }
  }

  /**
   * Guarda la consulta en el historial
   * @param userId - ID del usuario
   * @param dto - DTO de la consulta
   * @param response - Respuesta generada
   * @param interpretation - Interpretación asignada
   * @param lunarPhase - Fase lunar actual
   * @returns Consulta guardada
   * @private
   */
  private async saveQuery(
    userId: number,
    dto: PendulumQueryDto,
    response: PendulumResponse,
    interpretation: string,
    lunarPhase: string,
  ): Promise<PendulumQuery> {
    const query = this.queryRepository.create({
      userId,
      question: dto.question || null,
      response,
      interpretation,
      lunarPhase,
    });
    return this.queryRepository.save(query);
  }
}
