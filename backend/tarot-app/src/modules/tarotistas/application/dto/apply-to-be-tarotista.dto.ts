import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, MinLength, ArrayNotEmpty } from 'class-validator';

export class ApplyToBeTarotistaDto {
  @ApiProperty({
    description: 'Nombre público que utilizará el tarotista',
    example: 'Luna Mística',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  nombrePublico: string;

  @ApiProperty({
    description: 'Biografía del aspirante a tarotista',
    example: 'Tarotista con 15 años de experiencia en lecturas de amor',
    minLength: 20,
  })
  @IsString()
  @MinLength(20)
  biografia: string;

  @ApiProperty({
    description: 'Especialidades del tarotista',
    example: ['amor', 'trabajo', 'familia'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  especialidades: string[];

  @ApiProperty({
    description: 'Motivación para ser tarotista en la plataforma',
    example: 'Deseo compartir mi don con personas que buscan guía espiritual',
    minLength: 20,
  })
  @IsString()
  @MinLength(20)
  motivacion: string;

  @ApiProperty({
    description: 'Experiencia previa en lecturas de tarot',
    example: 'He realizado más de 1000 lecturas en los últimos 10 años',
    minLength: 20,
  })
  @IsString()
  @MinLength(20)
  experiencia: string;
}
