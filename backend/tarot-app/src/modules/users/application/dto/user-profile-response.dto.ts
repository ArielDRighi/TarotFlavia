import { ApiProperty } from '@nestjs/swagger';
import { UserCapabilitiesDto } from './user-capabilities.dto';
import { UserRole } from '../../entities/user.entity';

/**
 * Enum para el plan del usuario
 */
export enum UserPlan {
  ANONYMOUS = 'anonymous',
  FREE = 'free',
  PREMIUM = 'premium',
}

/**
 * Enum para el estado de la suscripción
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

/**
 * DTO para la respuesta del endpoint GET /users/profile
 * Incluye campos deprecated para backward compatibility
 * Este DTO refleja TODOS los campos que el endpoint retorna (User entity sin password)
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
    description: 'Fecha de nacimiento del usuario (formato: YYYY-MM-DD)',
    example: '1990-05-15',
    nullable: true,
  })
  birthDate: Date | null;

  @ApiProperty({
    description: 'Plan actual del usuario',
    enum: ['anonymous', 'free', 'premium'],
    example: 'free',
  })
  plan: string;

  @ApiProperty({
    description: 'Roles del usuario',
    example: ['user'],
    enum: UserRole,
    isArray: true,
  })
  roles: UserRole[];

  @ApiProperty({
    description: 'Indica si el usuario tiene permisos de administrador',
    example: false,
  })
  isAdmin: boolean;

  @ApiProperty({
    description: 'Fecha de inicio del plan actual',
    example: '2024-01-01T00:00:00.000Z',
    nullable: true,
  })
  planStartedAt: Date | null;

  @ApiProperty({
    description: 'Fecha de expiración del plan',
    example: '2024-12-31T23:59:59.000Z',
    nullable: true,
  })
  planExpiresAt: Date | null;

  @ApiProperty({
    description: 'Estado de la suscripción',
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
    nullable: true,
  })
  subscriptionStatus: SubscriptionStatus | null;

  @ApiProperty({
    description: 'ID del cliente en Stripe',
    example: 'cus_123456789',
    nullable: true,
  })
  stripeCustomerId: string | null;

  @ApiProperty({
    description: 'Número de requests de IA usados este mes',
    example: 0,
  })
  aiRequestsUsedMonth: number;

  @ApiProperty({
    description: 'Costo acumulado en USD de IA este mes',
    example: 0.0,
  })
  aiCostUsdMonth: number;

  @ApiProperty({
    description: 'Tokens de IA usados este mes',
    example: 0,
  })
  aiTokensUsedMonth: number;

  @ApiProperty({
    description: 'Proveedor de IA usado mayoritariamente',
    example: 'groq',
    nullable: true,
  })
  aiProviderUsed: string | null;

  @ApiProperty({
    description: 'Indica si se envió advertencia de cuota al usuario',
    example: false,
  })
  quotaWarningSent: boolean;

  @ApiProperty({
    description: 'Fecha del último reset de uso de IA',
    example: '2024-01-01T00:00:00.000Z',
    nullable: true,
  })
  aiUsageResetAt: Date | null;

  @ApiProperty({
    description: 'Fecha de último inicio de sesión',
    example: '2024-01-01T00:00:00.000Z',
    nullable: true,
  })
  lastLogin: Date | null;

  @ApiProperty({
    description: 'Fecha en que el usuario fue baneado',
    example: null,
    nullable: true,
  })
  bannedAt: Date | null;

  @ApiProperty({
    description: 'Razón del baneo del usuario',
    example: null,
    nullable: true,
  })
  banReason: string | null;

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
