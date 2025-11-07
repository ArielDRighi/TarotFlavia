import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum UsageFeature {
  TAROT_READING = 'tarot_reading',
  ORACLE_QUERY = 'oracle_query',
  INTERPRETATION_REGENERATION = 'interpretation_regeneration',
}

@Entity('usage_limit')
@Index(['userId', 'feature', 'tarotistaId', 'date'], { unique: true })
export class UsageLimit {
  @ApiProperty({ example: 1, description: 'ID único del registro de uso' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 1,
    description: 'ID del usuario',
  })
  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    example: 1,
    description: 'ID del tarotista (opcional para límites específicos)',
    required: false,
  })
  @Column({ name: 'tarotista_id', type: 'int', nullable: true })
  tarotistaId: number | null;

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
    example: 3,
    description: 'Cantidad de usos en el día',
  })
  @Column({ default: 0 })
  count: number;

  @ApiProperty({
    example: '2023-10-30',
    description: 'Fecha del uso (solo fecha, sin hora)',
  })
  @Column({ type: 'date' })
  date: Date;

  @ApiProperty({
    example: '2023-10-30T12:00:00Z',
    description: 'Fecha de creación del registro',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
