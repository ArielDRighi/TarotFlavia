import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TarotDeck } from '../../decks/entities/tarot-deck.entity';
import { TarotReading } from '../../readings/entities/tarot-reading.entity';

@Entity()
export class TarotCard {
  @ApiProperty({ example: 1, description: 'ID único de la carta' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'El Loco',
    description: 'Nombre de la carta de tarot',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 0,
    description: 'Número de la carta (0 para El Loco, etc.)',
  })
  @Column()
  number: number;

  @ApiProperty({
    example: 'arcanos_mayores',
    description: 'Categoría de la carta (arcanos mayores, copas, oros, etc.)',
  })
  @Column()
  category: string;

  @ApiProperty({
    example: 'https://ejemplo.com/cartas/el_loco.jpg',
    description: 'URL de la imagen de la carta',
  })
  @Column()
  imageUrl: string;

  @ApiProperty({
    example: 'https://ejemplo.com/cartas/el_loco_reverso.jpg',
    description: 'URL de la imagen de la carta invertida (opcional)',
  })
  @Column({ nullable: true })
  reversedImageUrl: string;

  @ApiProperty({
    example: 'Nuevos comienzos, libertad y espontaneidad...',
    description: 'Significado de la carta en posición normal',
  })
  @Column('text')
  meaningUpright: string;

  @ApiProperty({
    example: 'Imprudencia, toma de riesgos innecesarios...',
    description: 'Significado de la carta en posición invertida',
  })
  @Column('text')
  meaningReversed: string;

  @ApiProperty({
    example: 'El Loco simboliza el inicio de un viaje hacia lo desconocido...',
    description: 'Descripción detallada de la carta',
  })
  @Column('text')
  description: string;

  @ApiProperty({
    example: 'Aventura, libertad, espíritu libre, caos, potencial',
    description: 'Palabras clave asociadas a la carta',
  })
  @Column('text')
  keywords: string;

  @ApiProperty({
    example: 1,
    description: 'ID del mazo al que pertenece la carta',
  })
  @Column()
  deckId: number;

  @ManyToOne(() => TarotDeck, (deck) => deck.cards)
  @JoinColumn({ name: 'deckId' })
  deck: TarotDeck;

  @ManyToMany(() => TarotReading, (reading) => reading.cards)
  readings: TarotReading[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
