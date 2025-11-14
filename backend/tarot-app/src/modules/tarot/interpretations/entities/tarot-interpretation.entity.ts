import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

// Interface to avoid circular dependency
interface ITarotReading {
  id: number;
}

@Entity()
export class TarotInterpretation {
  @ApiProperty({ example: 1, description: 'ID único de la interpretación' })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('TarotReading', 'interpretations', { eager: false })
  @JoinColumn()
  reading: ITarotReading;

  @ApiProperty({
    example: 'Tu lectura indica un período de transformación...',
    description: 'Interpretación generada por OpenAI',
  })
  @Column('text')
  content: string;

  @ApiProperty({
    example: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
    },
    description: 'Configuración utilizada para la generación',
  })
  @Column('jsonb')
  aiConfig: {
    model: string;
    temperature: number;
    maxTokens: number;
    [key: string]: any;
  };

  @ApiProperty({
    example: 'gpt-4',
    description: 'Modelo de OpenAI utilizado',
  })
  @Column()
  modelUsed: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de creación de la interpretación',
  })
  @CreateDateColumn()
  createdAt: Date;
}
