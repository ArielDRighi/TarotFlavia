import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Tarotista } from './tarotista.entity';

export enum SubscriptionType {
  FAVORITE = 'favorite', // FREE: 1 tarotista favorito
  PREMIUM_INDIVIDUAL = 'premium_individual', // PREMIUM: 1 específico
  PREMIUM_ALL_ACCESS = 'premium_all_access', // PREMIUM: todos
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('user_tarotista_subscriptions')
export class UserTarotistaSubscription {
  @ApiProperty({ example: 1, description: 'ID único de la suscripción' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: 'ID del usuario' })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({
    description: 'Relación con el usuario',
    type: () => User,
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    example: 1,
    description: 'ID del tarotista (null para all-access)',
  })
  @Column({ name: 'tarotista_id', type: 'int', nullable: true })
  tarotistaId: number | null;

  @ApiProperty({
    description: 'Relación con el tarotista',
    type: () => Tarotista,
    required: false,
  })
  @ManyToOne(() => Tarotista, (tarotista) => tarotista.subscriptions, {
    nullable: true,
  })
  @JoinColumn({ name: 'tarotista_id' })
  tarotista: Tarotista | null;

  @ApiProperty({
    example: 'favorite',
    description: 'Tipo de suscripción',
    enum: SubscriptionType,
  })
  @Column({
    name: 'subscription_type',
    type: 'enum',
    enum: SubscriptionType,
  })
  subscriptionType: SubscriptionType;

  @ApiProperty({
    example: 'active',
    description: 'Estado de la suscripción',
    enum: SubscriptionStatus,
  })
  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de inicio de la suscripción',
  })
  @Column({ name: 'started_at', type: 'timestamp', default: () => 'NOW()' })
  startedAt: Date;

  @ApiProperty({
    example: '2023-12-31T23:59:59Z',
    description: 'Fecha de expiración',
  })
  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @ApiProperty({
    example: '2023-06-15T00:00:00Z',
    description: 'Fecha de cancelación',
  })
  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @ApiProperty({
    example: '2023-02-01T00:00:00Z',
    description:
      'Fecha en que el usuario FREE puede cambiar de tarotista favorito',
  })
  @Column({ name: 'can_change_at', type: 'timestamp', nullable: true })
  canChangeAt: Date | null;

  @ApiProperty({
    example: 0,
    description: 'Número de veces que el usuario cambió de tarotista favorito',
  })
  @Column({ name: 'change_count', type: 'int', default: 0 })
  changeCount: number;

  @ApiProperty({
    example: 'sub_123456789',
    description: 'ID de la suscripción en Stripe',
  })
  @Column({ name: 'stripe_subscription_id', nullable: true })
  stripeSubscriptionId: string | null;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de creación',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de última actualización',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
