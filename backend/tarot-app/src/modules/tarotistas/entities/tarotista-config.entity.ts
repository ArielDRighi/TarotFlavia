import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tarotista } from './tarotista.entity';

@Entity('tarotista_config')
@Check('"temperature" >= 0 AND "temperature" <= 2')
@Check('"top_p" >= 0 AND "top_p" <= 1')
export class TarotistaConfig {
  @ApiProperty({ example: 1, description: 'ID único de la configuración' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: 'ID del tarotista' })
  @Column({ name: 'tarotista_id' })
  tarotistaId: number;

  @ApiProperty({
    description: 'Relación con el tarotista',
    type: () => Tarotista,
  })
  @ManyToOne(() => Tarotista, (tarotista) => tarotista.configs)
  @JoinColumn({ name: 'tarotista_id' })
  tarotista: Tarotista;

  @ApiProperty({
    example: 'You are a mystical tarot reader with 20 years of experience...',
    description: 'Prompt del sistema para la IA',
  })
  @Column({ name: 'system_prompt', type: 'text' })
  systemPrompt: string;

  @ApiProperty({
    example: { tone: 'mystical', language: 'formal' },
    description: 'Configuración de estilo en formato JSON',
  })
  @Column({ name: 'style_config', type: 'jsonb', nullable: true })
  styleConfig: Record<string, unknown> | null;

  @ApiProperty({
    example: 0.7,
    description: 'Temperatura para generación de IA (0-2)',
  })
  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0.7,
  })
  temperature: number;

  @ApiProperty({
    example: 1000,
    description: 'Máximo de tokens para la respuesta',
  })
  @Column({ name: 'max_tokens', type: 'int', default: 1000 })
  maxTokens: number;

  @ApiProperty({
    example: 0.9,
    description: 'Top P para generación de IA (0-1)',
  })
  @Column({
    name: 'top_p',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0.9,
  })
  topP: number;

  @ApiProperty({
    example: ['energía', 'camino', 'transformación'],
    description: 'Keywords personalizados',
    type: [String],
  })
  @Column({ name: 'custom_keywords', type: 'jsonb', nullable: true })
  customKeywords: string[] | null;

  @ApiProperty({
    example: 'Always mention the spiritual aspect',
    description: 'Instrucciones adicionales para la IA',
  })
  @Column({ name: 'additional_instructions', type: 'text', nullable: true })
  additionalInstructions: string | null;

  @ApiProperty({
    example: 1,
    description: 'Versión de la configuración',
  })
  @Column({ type: 'int', default: 1 })
  version: number;

  @ApiProperty({
    example: true,
    description: 'Indica si esta configuración está activa',
  })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de creación',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de última actualización',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
