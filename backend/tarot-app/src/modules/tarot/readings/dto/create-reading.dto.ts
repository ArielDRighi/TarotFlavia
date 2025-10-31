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
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsExclusiveWithConstraint } from './validators/is-exclusive-with.validator';

/**
 * Validador que asegura que al menos uno de predefinedQuestionId o customQuestion esté presente
 */
@ValidatorConstraint({ name: 'hasQuestion', async: false })
export class HasQuestionConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const object = args.object as CreateReadingDto;
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
    return 'Debes proporcionar una pregunta predefinida o una pregunta personalizada';
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
    description: 'ID de la pregunta predefinida (para usuarios free)',
    required: false,
  })
  @ValidateIf(
    (o: CreateReadingDto) =>
      o.predefinedQuestionId !== undefined || !o.customQuestion,
  )
  @IsInt({
    message: 'El ID de la pregunta predefinida debe ser un número entero',
  })
  @Validate(IsExclusiveWithConstraint, ['customQuestion'], {
    message:
      'Debes proporcionar solo una: pregunta predefinida o pregunta personalizada, no ambas',
  })
  @Validate(HasQuestionConstraint)
  predefinedQuestionId?: number;

  @ApiProperty({
    example: '¿Cuál es mi propósito en la vida?',
    description: 'Pregunta personalizada (requiere plan premium)',
    required: false,
    maxLength: 500,
  })
  @ValidateIf((o: CreateReadingDto) => o.customQuestion !== undefined)
  @IsString({ message: 'La pregunta personalizada debe ser texto' })
  @IsNotEmpty({ message: 'La pregunta personalizada no puede estar vacía' })
  @MaxLength(500, {
    message: 'La pregunta personalizada no debe exceder los 500 caracteres',
  })
  @Validate(IsExclusiveWithConstraint, ['predefinedQuestionId'], {
    message:
      'Debes proporcionar una pregunta predefinida o una pregunta personalizada',
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

  @ApiProperty({
    example: true,
    description: 'Si se debe generar una interpretación automática',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  generateInterpretation: boolean = true;
}
