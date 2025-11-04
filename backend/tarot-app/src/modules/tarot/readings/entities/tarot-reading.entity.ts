import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../users/entities/user.entity';
import { TarotCard } from '../../cards/entities/tarot-card.entity';
import { TarotDeck } from '../../decks/entities/tarot-deck.entity';
import { ReadingCategory } from '../../../categories/entities/reading-category.entity';
import { PredefinedQuestion } from '../../../predefined-questions/entities/predefined-question.entity';
import { TarotInterpretation } from '../../interpretations/entities/tarot-interpretation.entity';

@Entity()
export class TarotReading {
  @ApiProperty({ example: 1, description: 'ID único de la lectura' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Mi futuro profesional',
    description:
      'Tema o pregunta de la lectura (deprecated, usar predefinedQuestionId o customQuestion)',
    deprecated: true,
  })
  @Column({ nullable: true })
  question: string;

  @ApiProperty({
    example: 5,
    description: 'ID de la pregunta predefinida usada (para usuarios free)',
    required: false,
  })
  @Column({ nullable: true })
  predefinedQuestionId: number | null;

  @ApiProperty({
    description: 'Relación con la pregunta predefinida',
    type: () => PredefinedQuestion,
    required: false,
  })
  @ManyToOne(() => PredefinedQuestion, { nullable: true })
  @JoinColumn({ name: 'predefinedQuestionId' })
  predefinedQuestion: PredefinedQuestion | null;

  @ApiProperty({
    example: '¿Cuál es mi propósito en la vida?',
    description: 'Pregunta personalizada (requiere plan premium)',
    required: false,
    maxLength: 500,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  customQuestion: string | null;

  @ApiProperty({
    example: 'predefined',
    description: 'Tipo de pregunta: predefined o custom',
    enum: ['predefined', 'custom'],
    required: false,
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  questionType: 'predefined' | 'custom' | null;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => TarotDeck)
  deck: TarotDeck;

  @ApiProperty({
    description: 'Categoría de la lectura',
    type: () => ReadingCategory,
    required: false,
  })
  @ManyToOne(() => ReadingCategory, { nullable: true })
  category: ReadingCategory | null;

  @ApiProperty({
    type: [TarotCard],
    description: 'Cartas seleccionadas para la lectura',
  })
  @ManyToMany(() => TarotCard, (card) => card.readings)
  @JoinTable()
  cards: TarotCard[];

  @ApiProperty({
    example: '[{id: 1, position: "pasado", isReversed: false}, ...]',
    description: 'Posición y orientación de cada carta',
  })
  @Column('jsonb')
  cardPositions: {
    cardId: number;
    position: string; // por ejemplo: "pasado", "presente", "futuro"
    isReversed: boolean;
  }[];

  @ApiProperty({
    example: 'Esta lectura sugiere que estás en un momento de transición...',
    description: 'Interpretación completa de la lectura',
  })
  @Column('text', { nullable: true })
  interpretation: string | null;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de la lectura',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de última actualización',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    example: 0,
    description: 'Número de veces que se regeneró la interpretación',
  })
  @Column({ default: 0 })
  regenerationCount: number;

  @ApiProperty({
    type: () => TarotInterpretation,
    isArray: true,
    description: 'Historial de interpretaciones para esta lectura',
  })
  @OneToMany(
    () => TarotInterpretation,
    (interpretation) => interpretation.reading,
  )
  interpretations: TarotInterpretation[];

  @DeleteDateColumn()
  deletedAt?: Date;
}
