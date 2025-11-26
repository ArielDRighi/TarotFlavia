import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RejectApplicationDto {
  @ApiProperty({
    description: 'Razón del rechazo de la aplicación',
    example: 'No cumple con los requisitos mínimos de experiencia',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  adminNotes: string;
}
