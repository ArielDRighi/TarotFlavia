import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { TarotCard } from '../../cards/entities/tarot-card.entity';
import { TarotDeck } from '../../decks/entities/tarot-deck.entity';

@Entity()
export class TarotReading {
  @ApiProperty({ example: 1, description: 'ID único de la lectura' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Mi futuro profesional',
    description: 'Tema o pregunta de la lectura',
  })
  @Column({ nullable: true })
  question: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => TarotDeck)
  deck: TarotDeck;

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

  @DeleteDateColumn()
  deletedAt?: Date;
}
