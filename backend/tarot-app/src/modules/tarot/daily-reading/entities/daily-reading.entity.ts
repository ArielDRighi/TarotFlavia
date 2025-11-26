import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TarotCard } from '../../cards/entities/tarot-card.entity';
import { User } from '../../../users/entities/user.entity';
import { Tarotista } from '../../../tarotistas/infrastructure/entities/tarotista.entity';

@Entity('daily_readings')
@Unique(['userId', 'readingDate', 'tarotistaId'])
@Index(['userId', 'readingDate'])
export class DailyReading {
  @ApiProperty({
    example: 1,
    description: 'ID único de la carta del día',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 1,
    description: 'ID del usuario que generó la carta',
  })
  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    example: 1,
    description: 'ID del tarotista que proporciona la interpretación',
  })
  @Column({ name: 'tarotista_id' })
  tarotistaId: number;

  @ManyToOne(() => Tarotista, { eager: false })
  @JoinColumn({ name: 'tarotista_id' })
  tarotista: Tarotista;

  @ApiProperty({
    example: 1,
    description: 'ID de la carta del tarot seleccionada',
  })
  @Column({ name: 'card_id' })
  cardId: number;

  @ManyToOne(() => TarotCard, { eager: true })
  @JoinColumn({ name: 'card_id' })
  card: TarotCard;

  @ApiProperty({
    example: false,
    description: 'Indica si la carta está invertida',
  })
  @Column({ name: 'is_reversed', default: false })
  isReversed: boolean;

  @ApiProperty({
    example:
      '**Energía del Día**: El Mago trae la energía de la manifestación y el poder personal...',
    description: 'Interpretación de la carta del día generada por IA',
  })
  @Column('text')
  interpretation: string;

  @ApiProperty({
    example: '2025-01-15',
    description: 'Fecha de la lectura (solo fecha, sin hora)',
  })
  @Column({ name: 'reading_date', type: 'date' })
  readingDate: Date;

  @ApiProperty({
    example: false,
    description: 'Indica si esta carta fue regenerada (solo usuarios premium)',
  })
  @Column({ name: 'was_regenerated', default: false })
  wasRegenerated: boolean;

  @ApiProperty({
    example: '2025-01-15T08:30:00Z',
    description: 'Fecha de creación del registro',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    example: '2025-01-15T08:30:00Z',
    description: 'Fecha de última actualización',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
