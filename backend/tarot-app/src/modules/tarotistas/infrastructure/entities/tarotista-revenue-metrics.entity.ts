import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Check,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tarotista } from './tarotista.entity';
import { User } from '../../users/entities/user.entity';
import { TarotReading } from '../../tarot/readings/entities/tarot-reading.entity';
import { SubscriptionType } from './user-tarotista-subscription.entity';

@Entity('tarotista_revenue_metrics')
@Check('"revenue_share_usd" + "platform_fee_usd" = "total_revenue_usd"')
@Index(['tarotistaId', 'calculationDate'])
@Index(['tarotistaId', 'periodStart', 'periodEnd'])
export class TarotistaRevenueMetrics {
  @ApiProperty({ example: 1, description: 'ID único de la métrica' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: 'ID del tarotista' })
  @Column({ name: 'tarotista_id' })
  tarotistaId: number;

  @ApiProperty({
    description: 'Relación con el tarotista',
    type: () => Tarotista,
  })
  @ManyToOne(() => Tarotista, (tarotista) => tarotista.revenueMetrics)
  @JoinColumn({ name: 'tarotista_id' })
  tarotista: Tarotista;

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

  @ApiProperty({ example: 1, description: 'ID de la lectura (opcional)' })
  @Column({ name: 'reading_id', type: 'int', nullable: true })
  readingId: number | null;

  @ApiProperty({
    description: 'Relación con la lectura',
    type: () => TarotReading,
    required: false,
  })
  @ManyToOne(() => TarotReading, { nullable: true })
  @JoinColumn({ name: 'reading_id' })
  reading: TarotReading | null;

  @ApiProperty({
    example: 'premium_individual',
    description: 'Tipo de suscripción que generó el ingreso',
    enum: SubscriptionType,
  })
  @Column({
    name: 'subscription_type',
    type: 'enum',
    enum: SubscriptionType,
  })
  subscriptionType: SubscriptionType;

  @ApiProperty({
    example: 35.0,
    description: 'Ingreso del tarotista (después de comisión)',
  })
  @Column({
    name: 'revenue_share_usd',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  revenueShareUsd: number;

  @ApiProperty({
    example: 15.0,
    description: 'Comisión de la plataforma',
  })
  @Column({
    name: 'platform_fee_usd',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  platformFeeUsd: number;

  @ApiProperty({
    example: 50.0,
    description: 'Ingreso total de la transacción',
  })
  @Column({
    name: 'total_revenue_usd',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalRevenueUsd: number;

  @ApiProperty({
    example: '2023-01-15T00:00:00Z',
    description: 'Fecha de cálculo de la métrica',
  })
  @Column({ name: 'calculation_date', type: 'date' })
  calculationDate: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Inicio del período',
  })
  @Column({ name: 'period_start', type: 'date' })
  periodStart: Date;

  @ApiProperty({
    example: '2023-01-31T23:59:59Z',
    description: 'Fin del período',
  })
  @Column({ name: 'period_end', type: 'date' })
  periodEnd: Date;

  @ApiProperty({
    example: {},
    description: 'Metadata adicional en formato JSON',
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de creación',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
