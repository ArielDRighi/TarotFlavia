import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class TarotSpread {
  @ApiProperty({ example: 1, description: 'ID único de la tirada' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Tirada de Tres Cartas',
    description: 'Nombre de la tirada',
  })
  @Column()
  name: string;

  @ApiProperty({
    example:
      'Una tirada simple pero poderosa que representa pasado, presente y futuro',
    description: 'Descripción de la tirada',
  })
  @Column('text')
  description: string;

  @ApiProperty({
    example: 3,
    description: 'Número de cartas utilizadas en esta tirada',
  })
  @Column()
  cardCount: number;

  @ApiProperty({
    example:
      '[{"name": "Pasado", "description": "Representa eventos pasados que influyeron en la situación actual"}, ...]',
    description: 'Definición de las posiciones en esta tirada',
  })
  @Column('jsonb')
  positions: {
    name: string;
    description: string;
  }[];

  @ApiProperty({
    example: 'https://ejemplo.com/tiradas/tres-cartas.jpg',
    description: 'URL de la imagen ilustrativa de la tirada',
  })
  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
