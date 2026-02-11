import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { SanitizeHtml } from '../../../../common/decorators/sanitize.decorator';

/**
 * DTO para geocodificar un lugar de nacimiento
 */
export class GeocodePlaceDto {
  @ApiProperty({
    example: 'Buenos Aires, Argentina',
    description: 'Texto de búsqueda del lugar',
  })
  @IsString({
    message: 'El texto de búsqueda debe ser una cadena de caracteres',
  })
  @IsNotEmpty({ message: 'El texto de búsqueda es requerido' })
  @MinLength(3, { message: 'Ingrese al menos 3 caracteres' })
  @MaxLength(255, {
    message: 'El texto de búsqueda no puede superar los 255 caracteres',
  })
  @SanitizeHtml()
  query: string;
}
