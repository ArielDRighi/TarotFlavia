import { IsEnum, IsOptional, IsString, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UserPlan, SubscriptionStatus } from '../entities/user.entity';

export class UpdateUserPlanDto {
  @ApiProperty({
    description: 'Plan del usuario',
    enum: UserPlan,
    example: UserPlan.PREMIUM,
  })
  @IsEnum(UserPlan)
  plan: UserPlan;

  @ApiProperty({
    description: 'Fecha de inicio del plan',
    example: '2023-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  planStartedAt?: Date;

  @ApiProperty({
    description: 'Fecha de expiración del plan',
    example: '2023-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  planExpiresAt?: Date;

  @ApiProperty({
    description: 'Estado de la suscripción',
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  subscriptionStatus?: SubscriptionStatus;

  @ApiProperty({
    description: 'ID del cliente en Stripe',
    example: 'cus_123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  stripeCustomerId?: string;
}
