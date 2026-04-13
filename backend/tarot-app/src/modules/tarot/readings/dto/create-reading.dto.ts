import {
  IsArray,
  IsString,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsInt,
  IsNotEmpty,
  MaxLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidateIf,
  MinLength,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsExclusiveWithConstraint } from './validators/is-exclusive-with.validator';
import { SanitizeHtml } from '../../../../common/decorators/sanitize.decorator';

/**
 * Validador que asegura que al menos uno de predefinedQuestionId o customQuestion esté presente
 * cuando se solicita interpretación con IA (useAI === true)
 *
 * Para usuarios FREE (useAI === false o undefined), la pregunta NO es requerida
 * porque no se genera interpretación personalizada.
 */
@ValidatorConstraint({ name: 'hasQuestion', async: false })
export class HasQuestionConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const object = args.object as CreateReadingDto;

    // Si NO se usa IA, la pregunta NO es requerida
    if (!object.useAI) {
      return true;
    }

    // Si se usa IA (useAI === true), la pregunta SÍ es requerida
    const hasPredefined =
      object.predefinedQuestionId !== undefined &&
      object.predefinedQuestionId !== null;
    const hasCustom =
      object.customQuestion !== undefined &&
      object.customQuestion !== null &&
      object.customQuestion !== '';

    return hasPredefined || hasCustom;
  }

  defaultMessage(): string {
    return 'Debes proporcionar una pregunta predefinida o una pregunta personalizada cuando se solicita interpretación con IA';
  }
}

class CardPositionDto {
  @ApiProperty({ example: 1, description: 'ID de la carta' })
  @IsInt()
  cardId: number;

  @ApiProperty({
    example: 'pasado',
    description: 'Posición de la carta en la lectura',
  })
  @IsString()
  position: string;

  @ApiProperty({
    example: false,
    description: 'Si la carta está invertida o no',
  })
  @IsBoolean()
  isReversed: boolean;
}

export class CreateReadingDto {
  @ApiProperty({
    example: 5,
    description:
      'ID de la pregunta predefinida (opcional para usuarios FREE sin IA)',
    required: false,
  })
  @ValidateIf(
    (o: CreateReadingDto) =>
      o.predefinedQuestionId !== undefined && o.predefinedQuestionId !== null,
  )
  @IsInt({
    message: 'El ID de la pregunta predefinida debe ser un número entero',
  })
  @Validate(IsExclusiveWithConstraint, ['customQuestion'], {
    message:
      'Debes proporcionar solo una: pregunta predefinida o pregunta personalizada, no ambas',
  })
  predefinedQuestionId?: number;

  @ApiProperty({
    example: '¿Cuál es mi propósito en la vida?',
    description: 'Pregunta personalizada (requiere plan premium)',
    required: false,
    maxLength: 500,
  })
  @ValidateIf(
    (o: CreateReadingDto) =>
      o.customQuestion !== undefined && o.customQuestion !== null,
  )
  @IsString({ message: 'La pregunta personalizada debe ser texto' })
  @IsNotEmpty({ message: 'La pregunta personalizada no puede estar vacía' })
  @MinLength(10, {
    message: 'La pregunta personalizada debe tener al menos 10 caracteres',
  })
  @MaxLength(500, {
    message: 'La pregunta personalizada no debe exceder los 500 caracteres',
  })
  @SanitizeHtml()
  @Validate(IsExclusiveWithConstraint, ['predefinedQuestionId'], {
    message:
      'Debes proporcionar solo una: pregunta predefinida o pregunta personalizada, no ambas',
  })
  customQuestion?: string;

  @ApiProperty({
    example: 1,
    description: 'ID del mazo utilizado para la lectura',
  })
  @IsInt()
  @IsNotEmpty({ message: 'El ID del mazo es requerido' })
  deckId: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la tirada utilizada para la lectura',
  })
  @IsInt()
  @IsNotEmpty({ message: 'El ID de la tirada es requerido' })
  spreadId: number;

  @ApiProperty({
    type: [Number],
    example: [1, 5, 9],
    description: 'IDs de las cartas seleccionadas',
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  cardIds: number[];

  @ApiProperty({
    type: [CardPositionDto],
    description: 'Posición y orientación de cada carta',
  })
  @ValidateNested({ each: true })
  @Type(() => CardPositionDto)
  cardPositions: CardPositionDto[];

  /**
   * Campo para controlar el acceso a funcionalidades con IA (TASK-005)
   *
   * @remarks
   * - Este campo es validado por el `RequiresPremiumForAIGuard` para control de acceso
   * - Si `true`: Requiere plan PREMIUM, genera interpretación con IA en formato Markdown
   * - Si `false` o `undefined`: Permite acceso a todos los usuarios, solo retorna info de cartas desde DB
   * - Ambos flujos se guardan en `tarot_readings` y incrementan contador de uso
   * - **TASK-004:** Implementó control de acceso en el guard
   * - **TASK-005:** Implementó lógica de generación dual en el servicio
   * - **HasQuestionConstraint:** Valida que haya pregunta cuando useAI es true
   *
   * @see RequiresPremiumForAIGuard - Guard que valida este campo
   */
  @ApiProperty({
    example: true,
    description: 'Si se debe usar IA para generar la lectura (solo Premium)',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Validate(HasQuestionConstraint)
  useAI?: boolean;

  @ApiProperty({
    example: 1,
    description:
      'ID de la categoría elegida (requerido para usuarios FREE con interpretación pre-escrita)',
    required: false,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  categoryId?: number;
}
