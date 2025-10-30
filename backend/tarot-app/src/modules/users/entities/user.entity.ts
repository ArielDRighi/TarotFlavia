import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TarotReading } from '../../tarot/readings/entities/tarot-reading.entity';

export enum UserPlan {
  FREE = 'free',
  PREMIUM = 'premium',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

/**
 * Tipo que representa un usuario sin el campo password
 * Incluye todos los campos y métodos de User excepto password
 */
export type UserWithoutPassword = Omit<User, 'password'>;

@Entity()
export class User {
  @ApiProperty({ example: 1, description: 'ID único del usuario' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Email único del usuario',
  })
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'https://ejemplo.com/foto.jpg',
    description: 'URL de la foto de perfil',
  })
  @Column({ nullable: true })
  profilePicture: string;

  @ApiProperty({
    example: false,
    description: 'Indica si el usuario tiene permisos de administrador',
  })
  @Column({ default: false })
  isAdmin: boolean;

  @ApiProperty({
    example: 'free',
    description: 'Plan del usuario (free o premium)',
    enum: UserPlan,
  })
  @Column({
    type: 'enum',
    enum: UserPlan,
    default: UserPlan.FREE,
  })
  plan: UserPlan;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de inicio del plan actual',
    nullable: true,
  })
  @Column({ nullable: true })
  planStartedAt: Date;

  @ApiProperty({
    example: '2023-12-31T23:59:59Z',
    description: 'Fecha de expiración del plan',
    nullable: true,
  })
  @Column({ nullable: true })
  planExpiresAt: Date;

  @ApiProperty({
    example: 'active',
    description: 'Estado de la suscripción',
    enum: SubscriptionStatus,
    nullable: true,
  })
  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    nullable: true,
  })
  subscriptionStatus: SubscriptionStatus;

  @ApiProperty({
    example: 'cus_123456789',
    description: 'ID del cliente en Stripe',
    nullable: true,
  })
  @Column({ nullable: true })
  stripeCustomerId: string;

  @OneToMany(() => TarotReading, (reading) => reading.user)
  readings: TarotReading[];

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de creación del usuario',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de última actualización del usuario',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Verifica si el usuario tiene un plan premium activo
   * @returns true si el usuario tiene plan premium y está activo
   */
  isPremium(): boolean {
    return (
      this.plan === UserPlan.PREMIUM &&
      this.subscriptionStatus === SubscriptionStatus.ACTIVE &&
      !this.hasPlanExpired()
    );
  }

  /**
   * Verifica si el plan del usuario ha expirado
   * @returns true si la fecha de expiración es anterior a la fecha actual
   */
  hasPlanExpired(): boolean {
    if (!this.planExpiresAt) {
      return false;
    }
    return new Date() > new Date(this.planExpiresAt);
  }
}
