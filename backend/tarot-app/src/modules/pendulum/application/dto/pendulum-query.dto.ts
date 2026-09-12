import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

/**
 * DTO para consultar el péndulo
 */
export class PendulumQueryDto {
  @ApiPropertyOptional({
    example: '¿Debo aceptar este trabajo?',
    description:
      'Pregunta escrita (opcional, solo Premium puede escribir preguntas)',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La pregunta no puede exceder 500 caracteres' })
  question?: string;

  /**
   * TASK-515: el frontend manda el mismo fingerprint de sesión que usa en
   * GET /users/capabilities, para que CheckUsageLimitGuard registre y consulte
   * el consumo anónimo bajo una única clave. Debe estar declarado acá porque el
   * ValidationPipe global usa `forbidNonWhitelisted`.
   */
  @ApiPropertyOptional({
    example: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    description:
      'Fingerprint de sesión del navegador (solo anónimos; hash hexadecimal de 32 a 64 caracteres)',
    minLength: 32,
    maxLength: 64,
  })
  @IsOptional()
  @IsString()
  @Length(32, 64, {
    message: 'El fingerprint debe tener entre 32 y 64 caracteres',
  })
  @Matches(/^[a-f0-9]+$/, {
    message: 'El fingerprint debe ser un hash hexadecimal válido',
  })
  fingerprint?: string;
}
