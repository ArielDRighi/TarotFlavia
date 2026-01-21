import { Injectable } from '@nestjs/common';
import { calculateAllNumbers } from '../../common/utils/numerology.utils';
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

@Injectable()
export class NumerologyService {
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
        isMaster: [11, 22, 33].includes(number),
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
}
