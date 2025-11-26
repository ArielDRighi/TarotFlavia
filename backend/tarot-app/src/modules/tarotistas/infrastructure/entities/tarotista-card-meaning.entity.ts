import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tarotista } from './tarotista.entity';
import { TarotCard } from '../../../tarot/cards/entities/tarot-card.entity';

@Entity('tarotista_card_meanings')
@Index(['tarotistaId', 'cardId'], { unique: true })
export class TarotistaCardMeaning {
  @ApiProperty({
    example: 1,
    description: 'ID único del significado personalizado',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: 'ID del tarotista' })
  @Column({ name: 'tarotista_id' })
  tarotistaId: number;

  @ApiProperty({
    description: 'Relación con el tarotista',
    type: () => Tarotista,
  })
  @ManyToOne(() => Tarotista, (tarotista) => tarotista.customCardMeanings)
  @JoinColumn({ name: 'tarotista_id' })
  tarotista: Tarotista;

  @ApiProperty({ example: 5, description: 'ID de la carta' })
  @Column({ name: 'card_id' })
  cardId: number;

  @ApiProperty({
    description: 'Relación con la carta',
    type: () => TarotCard,
  })
  @ManyToOne(() => TarotCard)
  @JoinColumn({ name: 'card_id' })
  card: TarotCard;

  @ApiProperty({
    example: 'Custom upright interpretation...',
    description: 'Significado personalizado cuando la carta está derecha',
  })
  @Column({ name: 'custom_meaning_upright', type: 'text', nullable: true })
  customMeaningUpright: string | null;

  @ApiProperty({
    example: 'Custom reversed interpretation...',
    description: 'Significado personalizado cuando la carta está invertida',
  })
  @Column({ name: 'custom_meaning_reversed', type: 'text', nullable: true })
  customMeaningReversed: string | null;

  @ApiProperty({
    example: 'transformation, change, rebirth',
    description: 'Keywords personalizados separados por comas',
  })
  @Column({ name: 'custom_keywords', type: 'text', nullable: true })
  customKeywords: string | null;

  @ApiProperty({
    example: 'This card represents...',
    description: 'Descripción personalizada de la carta',
  })
  @Column({ name: 'custom_description', type: 'text', nullable: true })
  customDescription: string | null;

  @ApiProperty({
    example: 'Personal notes about interpretations',
    description: 'Notas privadas del tarotista (no visibles para usuarios)',
  })
  @Column({ name: 'private_notes', type: 'text', nullable: true })
  privateNotes: string | null;

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
