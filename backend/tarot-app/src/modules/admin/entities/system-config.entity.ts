import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Entidad para almacenar configuraciones del sistema
 * que pueden ser modificadas en tiempo de ejecución desde el panel de administración
 */
@Entity('system_config')
@Unique('uq_system_config_category_key', ['category', 'key'])
@Index('idx_system_config_category', ['category'])
export class SystemConfig {
  @ApiProperty({ example: 1, description: 'ID único de la configuración' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'usage_limits',
    description: 'Categoría de la configuración',
  })
  @Column({ type: 'varchar', length: 50 })
  category: string;

  @ApiProperty({
    example: 'birth_chart',
    description: 'Clave de la configuración',
  })
  @Column({ type: 'varchar', length: 100 })
  key: string;

  @ApiProperty({
    example: '{"anonymous":0,"free":3,"premium":5}',
    description: 'Valor de la configuración (JSON string)',
  })
  @Column({ type: 'text' })
  value: string;

  @ApiProperty({
    example: 'Límites mensuales de generación de cartas astrales',
    description: 'Descripción de la configuración',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @ApiProperty({
    example: 'admin@auguria.com',
    description: 'Email del administrador que realizó el último cambio',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string | null;

  @ApiProperty({ example: '2026-02-06T12:00:00Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2026-02-06T12:00:00Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}
