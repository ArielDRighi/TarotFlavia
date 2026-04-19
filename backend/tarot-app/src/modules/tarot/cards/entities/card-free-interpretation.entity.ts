import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TarotCard } from './tarot-card.entity';
import { ReadingCategory } from '../../../categories/entities/reading-category.entity';

export type CardOrientation = 'upright' | 'reversed';

@Entity('card_free_interpretation')
@Unique(['cardId', 'categoryId', 'orientation'])
export class CardFreeInterpretation {
  @ApiProperty({ example: 1, description: 'ID único de la interpretación' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la carta de tarot asociada',
  })
  @Index()
  @Column()
  cardId: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la categoría de lectura asociada',
  })
  @Index()
  @Column()
  categoryId: number;

  @ApiProperty({
    example: 'upright',
    description: 'Orientación de la carta (derecha o invertida)',
    enum: ['upright', 'reversed'],
  })
  @Column({
    type: 'varchar',
    length: 10,
  })
  orientation: CardOrientation;

  @ApiProperty({
    example: 'El Loco te invita a abrirte a nuevas conexiones sin miedo...',
    description: 'Texto de interpretación pre-escrita para usuarios FREE',
  })
  @Column('text')
  content: string;

  @ManyToOne(() => TarotCard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cardId' })
  card: TarotCard;

  @ManyToOne(() => ReadingCategory, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category: ReadingCategory;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
