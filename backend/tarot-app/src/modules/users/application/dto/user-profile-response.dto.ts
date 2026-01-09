import { ApiProperty } from '@nestjs/swagger';
import { UserCapabilitiesDto } from './user-capabilities.dto';

/**
 * DTO para la respuesta del endpoint GET /users/profile
 * Incluye campos deprecated para backward compatibility
 */
export class UserProfileResponseDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'URL de la foto de perfil',
    example: 'https://example.com/profile.jpg',
    nullable: true,
  })
  profilePicture: string | null;

  @ApiProperty({
    description: 'Plan actual del usuario',
    enum: ['anonymous', 'free', 'premium'],
    example: 'free',
  })
  plan: string;

  @ApiProperty({
    description: 'Roles del usuario',
    example: ['user'],
    type: [String],
  })
  roles: string[];

  @ApiProperty({
    description: 'Fecha de creación del usuario',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del usuario',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Capabilities del usuario (sistema nuevo)',
    type: UserCapabilitiesDto,
  })
  capabilities: UserCapabilitiesDto;

  // ============================================
  // Campos DEPRECATED (Backward Compatibility)
  // ============================================

  @ApiProperty({
    description:
      '⚠️ DEPRECATED: Use capabilities.dailyCard.used instead. Contador de cartas del día usadas hoy.',
    example: 1,
    deprecated: true,
  })
  dailyCardCount: number;

  @ApiProperty({
    description:
      '⚠️ DEPRECATED: Use capabilities.dailyCard.limit instead. Límite diario de cartas del día.',
    example: 1,
    deprecated: true,
  })
  dailyCardLimit: number;

  @ApiProperty({
    description:
      '⚠️ DEPRECATED: Use capabilities.tarotReadings.used instead. Contador de tiradas de tarot usadas hoy.',
    example: 0,
    deprecated: true,
  })
  tarotReadingsCount: number;

  @ApiProperty({
    description:
      '⚠️ DEPRECATED: Use capabilities.tarotReadings.limit instead. Límite diario de tiradas de tarot.',
    example: 1,
    deprecated: true,
  })
  tarotReadingsLimit: number;

  @ApiProperty({
    description:
      '⚠️ DEPRECATED: Campo legacy. Use capabilities.dailyCard.used + capabilities.tarotReadings.used instead.',
    example: 1,
    deprecated: true,
  })
  dailyReadingsCount: number;

  @ApiProperty({
    description:
      '⚠️ DEPRECATED: Campo legacy. Use capabilities.dailyCard.limit + capabilities.tarotReadings.limit instead.',
    example: 2,
    deprecated: true,
  })
  dailyReadingsLimit: number;
}
