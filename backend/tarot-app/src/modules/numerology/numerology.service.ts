import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  calculateAllNumbers,
  MASTER_NUMBERS,
} from '../../common/utils/numerology.utils';
import {
  LIFE_PATH_INTERPRETATIONS,
  NumberInterpretation,
} from './data/interpretations.data';
import { getCompatibility, Compatibility } from './data/compatibility.data';
import { CalculateNumerologyDto } from './dto/calculate-numerology.dto';
import {
  NumerologyResponseDto,
  NumberDetailDto,
} from './dto/numerology-response.dto';
import { NumerologyInterpretation } from './entities/numerology-interpretation.entity';
import { AIProviderService } from '../ai/application/services/ai-provider.service';
import {
  NUMEROLOGY_SYSTEM_PROMPT,
  buildNumerologyUserPrompt,
} from './prompts/numerology-interpretation.prompt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NumerologyService {
  constructor(
    @InjectRepository(NumerologyInterpretation)
    private readonly interpretationRepo: Repository<NumerologyInterpretation>,
    private readonly aiProviderService: AIProviderService,
  ) {}
  /**
   * Calcula todos los números e incluye interpretaciones
   */
  calculate(dto: CalculateNumerologyDto): NumerologyResponseDto {
    const birthDate = new Date(dto.birthDate);
    // Manejar empty string como undefined
    const fullName =
      dto.fullName && dto.fullName.trim() !== '' ? dto.fullName : undefined;
    const result = calculateAllNumbers(birthDate, fullName);

    return {
      lifePath: this.getNumberDetail(result.lifePath),
      birthday: this.getNumberDetail(result.birthday),
      expression: result.expression
        ? this.getNumberDetail(result.expression)
        : null,
      soulUrge: result.soulUrge ? this.getNumberDetail(result.soulUrge) : null,
      personality: result.personality
        ? this.getNumberDetail(result.personality)
        : null,
      personalYear: result.personalYear,
      personalMonth: result.personalMonth,
      birthDate: result.birthDate,
      fullName: result.fullName,
    };
  }

  /**
   * Obtiene interpretación detallada de un número
   */
  getInterpretation(number: number): NumberInterpretation | null {
    return LIFE_PATH_INTERPRETATIONS[number] || null;
  }

  /**
   * Obtiene compatibilidad entre dos números
   */
  getCompatibility(num1: number, num2: number): Compatibility | null {
    return getCompatibility(num1, num2);
  }

  /**
   * Construye el detalle de un número con interpretación
   */
  private getNumberDetail(number: number): NumberDetailDto {
    const interpretation = LIFE_PATH_INTERPRETATIONS[number];

    if (!interpretation) {
      return {
        value: number,
        name: `Número ${number}`,
        keywords: [],
        description: '',
        isMaster: MASTER_NUMBERS.includes(number),
      };
    }

    return {
      value: number,
      name: interpretation.name,
      keywords: interpretation.keywords,
      description: interpretation.description,
      isMaster: interpretation.isMaster,
    };
  }

  /**
   * Obtiene interpretación IA existente del usuario
   */
  async getExistingInterpretation(
    userId: number,
  ): Promise<NumerologyInterpretation | null> {
    return this.interpretationRepo.findOne({ where: { userId } });
  }

  /**
   * Genera y guarda interpretación IA (solo si no existe)
   * Si el usuario ya tiene una interpretación, retorna la existente
   */
  async generateAndSaveInterpretation(
    user: User,
  ): Promise<NumerologyInterpretation> {
    // Verificar que no exista
    const existing = await this.getExistingInterpretation(user.id);
    if (existing) {
      return existing;
    }

    // Verificar que el usuario tenga fecha de nacimiento
    if (!user.birthDate) {
      throw new BadRequestException(
        'El usuario no tiene fecha de nacimiento configurada',
      );
    }

    // Calcular números
    const birthDate = new Date(user.birthDate);
    const numbers = calculateAllNumbers(birthDate, user.name);

    // Generar con IA
    const startTime = Date.now();
    const prompt = buildNumerologyUserPrompt({
      lifePath: numbers.lifePath,
      birthdayNumber: numbers.birthday,
      expressionNumber: numbers.expression,
      soulUrge: numbers.soulUrge,
      personality: numbers.personality,
      personalYear: numbers.personalYear,
      fullName: user.name,
    });

    const aiResponse = await this.aiProviderService.generateCompletion(
      [
        { role: 'system', content: NUMEROLOGY_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      user.id,
      null,
      { temperature: 0.7, maxTokens: 1500 },
    );

    const generationTimeMs = Date.now() - startTime;

    // Crear y guardar entidad
    const interpretation = this.interpretationRepo.create({
      userId: user.id,
      lifePath: numbers.lifePath,
      birthdayNumber: numbers.birthday,
      expressionNumber: numbers.expression,
      soulUrge: numbers.soulUrge,
      personality: numbers.personality,
      birthDate: birthDate,
      fullName: user.name,
      interpretation: aiResponse.content,
      aiProvider: aiResponse.provider,
      aiModel: aiResponse.model,
      tokensUsed: aiResponse.tokensUsed.total || 0,
      generationTimeMs,
    });

    return this.interpretationRepo.save(interpretation);
  }
}
