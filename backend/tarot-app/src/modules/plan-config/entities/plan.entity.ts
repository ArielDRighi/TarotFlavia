import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserPlan } from '../../users/entities/user.entity';

/**
 * Plan Entity
 * Defines subscription plan configurations with dynamic limits and features
 */
@Entity('plans')
export class Plan {
  @ApiProperty({
    example: 1,
    description: 'ID único del plan',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'free',
    description: 'Tipo de plan (free, premium, professional)',
    enum: UserPlan,
  })
  @Column({
    type: 'enum',
    enum: UserPlan,
    unique: true,
  })
  planType: UserPlan;

  @ApiProperty({
    example: 'Plan Gratuito',
    description: 'Nombre descriptivo del plan',
  })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({
    example: 'Plan básico con lecturas limitadas',
    description: 'Descripción del plan',
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: 0,
    description: 'Precio mensual en USD',
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @ApiProperty({
    example: 10,
    description: 'Límite de lecturas mensuales (-1 para ilimitado)',
  })
  @Column({ type: 'int', default: 10 })
  readingsLimit: number;

  @ApiProperty({
    example: 100,
    description: 'Cuota mensual de solicitudes IA (-1 para ilimitado)',
  })
  @Column({ type: 'int', default: 100 })
  aiQuotaMonthly: number;

  @ApiProperty({
    example: false,
    description: 'Permite preguntas personalizadas',
  })
  @Column({ type: 'boolean', default: false })
  allowCustomQuestions: boolean;

  @ApiProperty({
    example: false,
    description: 'Permite compartir lecturas',
  })
  @Column({ type: 'boolean', default: false })
  allowSharing: boolean;

  @ApiProperty({
    example: false,
    description: 'Permite tiradas avanzadas',
  })
  @Column({ type: 'boolean', default: false })
  allowAdvancedSpreads: boolean;

  @ApiProperty({
    example: true,
    description: 'Indica si el plan está activo',
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Fecha de creación del plan',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Fecha de última actualización',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Verifica si el plan tiene límites ilimitados
   * @returns true si readingsLimit es -1 (ilimitado)
   */
  isUnlimited(): boolean {
    return this.readingsLimit === -1;
  }

  /**
   * Verifica si el plan tiene una característica específica habilitada
   * @param feature - Nombre de la característica a verificar
   * @returns true si la característica está habilitada
   * @throws Error si el nombre de la característica es inválido
   */
  hasFeature(
    feature: 'allowCustomQuestions' | 'allowSharing' | 'allowAdvancedSpreads',
  ): boolean {
    const validFeatures = [
      'allowCustomQuestions',
      'allowSharing',
      'allowAdvancedSpreads',
    ];
    if (!validFeatures.includes(feature)) {
      throw new Error(`Invalid feature name: ${feature}`);
    }
    return this[feature] === true;
  }

  /**
   * Obtiene la cuota efectiva de IA (convierte -1 a Number.MAX_SAFE_INTEGER)
   * @returns El límite efectivo de cuota de IA
   */
  getEffectiveAiQuota(): number {
    return this.aiQuotaMonthly === -1
      ? Number.MAX_SAFE_INTEGER
      : this.aiQuotaMonthly;
  }
}
