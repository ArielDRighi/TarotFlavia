import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TarotCard } from '../../cards/entities/tarot-card.entity';

@Entity()
export class TarotDeck {
  @ApiProperty({ example: 1, description: 'ID único del mazo' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Rider-Waite',
    description: 'Nombre del mazo de tarot',
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    example:
      'El tarot Rider-Waite es uno de los mazos más populares y reconocidos mundialmente...',
    description: 'Descripción del mazo',
  })
  @Column('text')
  description: string;

  @ApiProperty({
    example: 'https://ejemplo.com/mazos/rider-waite.jpg',
    description: 'URL de la imagen de portada del mazo',
  })
  @Column()
  imageUrl: string;

  @ApiProperty({ example: 78, description: 'Número de cartas en el mazo' })
  @Column({ default: 78 })
  cardCount: number;

  @ApiProperty({
    example: true,
    description: 'Si el mazo está activo para ser usado',
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: true,
    description: 'Si este es el mazo predeterminado del sistema',
  })
  @Column({ default: false })
  isDefault: boolean;

  @ApiProperty({
    example: 'Pamela Colman Smith',
    description: 'Artista que ilustró el mazo',
  })
  @Column({ nullable: true })
  artist: string;

  @ApiProperty({
    example: 1909,
    description: 'Año de creación del mazo',
  })
  @Column({ nullable: true })
  yearCreated: number;

  @ApiProperty({
    example: 'Hermética / Orden del Amanecer Dorado',
    description: 'Tradición esotérica del mazo',
  })
  @Column({ nullable: true })
  tradition: string;

  @ApiProperty({
    example: 'Rider & Company',
    description: 'Editorial que publicó el mazo',
  })
  @Column({ nullable: true })
  publisher: string;

  @OneToMany(() => TarotCard, (card) => card.deck)
  cards: TarotCard[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
