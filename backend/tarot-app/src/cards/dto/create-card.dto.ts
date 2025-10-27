import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCardDto {
  @ApiProperty({
    example: 'El Loco',
    description: 'Nombre de la carta de tarot',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la carta es requerido' })
  name: string;

  @ApiProperty({
    example: 0,
    description: 'Número de la carta (0 para El Loco, etc.)',
  })
  @IsInt()
  @Min(0, { message: 'El número debe ser positivo o cero' })
  number: number;

  @ApiProperty({
    example: 'arcanos_mayores',
    description: 'Categoría de la carta (arcanos mayores, copas, oros, etc.)',
  })
  @IsString()
  @IsNotEmpty({ message: 'La categoría de la carta es requerida' })
  category: string;

  @ApiProperty({
    example: 'https://ejemplo.com/cartas/el_loco.jpg',
    description: 'URL de la imagen de la carta',
  })
  @IsUrl({}, { message: 'Debe proporcionar una URL válida para la imagen' })
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty({
    example: 'https://ejemplo.com/cartas/el_loco_reverso.jpg',
    description: 'URL de la imagen de la carta invertida (opcional)',
    required: false,
  })
  @IsUrl(
    {},
    { message: 'Debe proporcionar una URL válida para la imagen invertida' },
  )
  @IsOptional()
  reversedImageUrl?: string;

  @ApiProperty({
    example: 'Nuevos comienzos, libertad y espontaneidad...',
    description: 'Significado de la carta en posición normal',
  })
  @IsString()
  @IsNotEmpty({ message: 'El significado en posición normal es requerido' })
  meaningUpright: string;

  @ApiProperty({
    example: 'Imprudencia, toma de riesgos innecesarios...',
    description: 'Significado de la carta en posición invertida',
  })
  @IsString()
  @IsNotEmpty({ message: 'El significado en posición invertida es requerido' })
  meaningReversed: string;

  @ApiProperty({
    example: 'El Loco simboliza el inicio de un viaje hacia lo desconocido...',
    description: 'Descripción detallada de la carta',
  })
  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  description: string;

  @ApiProperty({
    example: 'Aventura, libertad, espíritu libre, caos, potencial',
    description: 'Palabras clave asociadas a la carta',
  })
  @IsString()
  @IsNotEmpty({ message: 'Las palabras clave son requeridas' })
  keywords: string;

  @ApiProperty({
    example: 1,
    description: 'ID del mazo al que pertenece la carta',
  })
  @IsInt()
  @IsNotEmpty({ message: 'El ID del mazo es requerido' })
  deckId: number;
}
