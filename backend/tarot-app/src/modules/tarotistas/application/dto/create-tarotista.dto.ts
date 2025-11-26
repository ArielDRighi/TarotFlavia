import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsArray,
  MinLength,
  ArrayNotEmpty,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateTarotistaDto {
  @ApiProperty({
    description: 'ID del usuario que será tarotista',
    example: 1,
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    description: 'Nombre público del tarotista',
    example: 'Luna Mística',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  nombrePublico: string;

  @ApiProperty({
    description: 'Biografía del tarotista',
    example: 'Tarotista con 15 años de experiencia especializada en amor',
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
    description: 'URL de la foto de perfil',
    example: 'https://example.com/tarotistas/luna.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  fotoPerfil?: string;

  @ApiProperty({
    description: 'Identidad del sistema prompt para IA',
    example: 'Soy Luna, una tarotista especializada en lecturas de amor...',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  systemPromptIdentity?: string;

  @ApiProperty({
    description: 'Guías del sistema prompt para IA',
    example: 'Mis lecturas se enfocan en mensajes positivos y constructivos...',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  systemPromptGuidelines?: string;
}
