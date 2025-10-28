import { IsString, IsOptional, IsUrl, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCardDto {
  @ApiProperty({
    example: 'El Loco (Actualizado)',
    description: 'Nombre actualizado de la carta de tarot',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 0,
    description: 'Número actualizado de la carta',
    required: false,
  })
  @IsInt()
  @Min(0, { message: 'El número debe ser positivo o cero' })
  @IsOptional()
  number?: number;

  @ApiProperty({
    example: 'arcanos_mayores',
    description: 'Categoría actualizada de la carta',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    example: 'https://ejemplo.com/cartas/el_loco_nuevo.jpg',
    description: 'URL actualizada de la imagen de la carta',
    required: false,
  })
  @IsUrl({}, { message: 'Debe proporcionar una URL válida para la imagen' })
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    example: 'https://ejemplo.com/cartas/el_loco_reverso_nuevo.jpg',
    description: 'URL actualizada de la imagen de la carta invertida',
    required: false,
  })
  @IsUrl(
    {},
    { message: 'Debe proporcionar una URL válida para la imagen invertida' },
  )
  @IsOptional()
  reversedImageUrl?: string;

  @ApiProperty({
    example: 'Nuevos significados, libertad renovada...',
    description: 'Significado actualizado de la carta en posición normal',
    required: false,
  })
  @IsString()
  @IsOptional()
  meaningUpright?: string;

  @ApiProperty({
    example: 'Nuevos riesgos, imprudencia actualizada...',
    description: 'Significado actualizado de la carta en posición invertida',
    required: false,
  })
  @IsString()
  @IsOptional()
  meaningReversed?: string;

  @ApiProperty({
    example: 'El Loco simboliza nuevos inicios y aventuras...',
    description: 'Descripción detallada actualizada de la carta',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'Nuevas aventuras, libertad renovada, potencial ampliado',
    description: 'Palabras clave actualizadas asociadas a la carta',
    required: false,
  })
  @IsString()
  @IsOptional()
  keywords?: string;
}
