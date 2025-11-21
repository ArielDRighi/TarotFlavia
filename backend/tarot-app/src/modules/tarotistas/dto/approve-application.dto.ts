import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class ApproveApplicationDto {
  @ApiProperty({
    description: 'Notas del administrador al aprobar la aplicación',
    example: 'Excelente perfil, experiencia verificada',
    required: false,
    minLength: 5,
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  adminNotes?: string;
}
