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

// Interfaces to avoid circular dependencies
interface IUser {
  id: number;
  email: string;
}

interface ITarotCard {
  id: number;
  name: string;
}

interface ITarotDeck {
  id: number;
  name: string;
}

interface IReadingCategory {
  id: number;
  name: string;
}

interface IPredefinedQuestion {
  id: number;
  question: string;
}

interface ITarotInterpretation {
  id: number;
  interpretation: string;
}

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
    required: false,
  })
  @ManyToOne('PredefinedQuestion', { nullable: true })
  @JoinColumn({ name: 'predefinedQuestionId' })
  predefinedQuestion: IPredefinedQuestion | null;

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

  @ManyToOne('User')
  user: IUser;

  @ManyToOne('TarotDeck')
  deck: ITarotDeck;

  @ApiProperty({
    description: 'Tarotista que realizó la lectura',
    required: false,
  })
  @ManyToOne('Tarotista', 'readings', { nullable: true })
  @JoinColumn({ name: 'tarotista_id' })
  tarotista: unknown;

  @Column({ name: 'tarotista_id', nullable: true })
  tarotistaId: number | null;

  @ApiProperty({
    description: 'Categoría de la lectura',
    required: false,
  })
  @ManyToOne('ReadingCategory', { nullable: true })
  category: IReadingCategory | null;

  @ApiProperty({
    description: 'Cartas seleccionadas para la lectura',
  })
  @ManyToMany('TarotCard', 'readings')
  @JoinTable()
  cards: ITarotCard[];

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
    isArray: true,
    description: 'Historial de interpretaciones para esta lectura',
  })
  @OneToMany('TarotInterpretation', 'reading')
  interpretations: ITarotInterpretation[];

  @ApiProperty({
    example: 'abc123xyz',
    description: 'Token único para compartir la lectura públicamente',
    required: false,
  })
  @Column({ type: 'varchar', length: 12, nullable: true, unique: true })
  sharedToken: string | null;

  @ApiProperty({
    example: false,
    description: 'Indica si la lectura es pública y compartible',
  })
  @Column({ default: false })
  isPublic: boolean;

  @ApiProperty({
    example: 0,
    description: 'Número de veces que se visualizó la lectura compartida',
  })
  @Column({ default: 0 })
  viewCount: number;

  @DeleteDateColumn()
  deletedAt?: Date;
}
