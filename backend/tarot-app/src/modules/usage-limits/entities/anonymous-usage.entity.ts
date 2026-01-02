import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UsageFeature } from './usage-limit.entity';

@Entity('anonymous_usage')
@Index(['fingerprint', 'date', 'feature'])
export class AnonymousUsage {
  @ApiProperty({ example: 1, description: 'ID único del registro de uso' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'a1b2c3d4e5f6...',
    description: 'Hash SHA-256 de IP + User Agent',
  })
  @Column({ type: 'varchar', length: 64 })
  fingerprint: string;

  @ApiProperty({
    example: '192.168.1.1',
    description: 'IP del usuario anónimo',
  })
  @Column({ type: 'varchar', length: 45 })
  ip: string;

  @ApiProperty({
    example: '2026-01-02',
    description: 'Fecha del uso (UTC)',
  })
  @Column({ type: 'date' })
  date: string;

  @ApiProperty({
    example: 'tarot_reading',
    description: 'Tipo de feature usada',
    enum: UsageFeature,
  })
  @Column({
    type: 'enum',
    enum: UsageFeature,
  })
  feature: UsageFeature;

  @ApiProperty({
    example: '2026-01-02T10:30:00Z',
    description: 'Fecha de creación del registro',
  })
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
