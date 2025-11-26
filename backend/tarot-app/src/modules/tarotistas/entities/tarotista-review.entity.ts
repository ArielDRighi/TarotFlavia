import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tarotista } from './tarotista.entity';
import { User } from '../../users/entities/user.entity';
import { TarotReading } from '../../tarot/readings/entities/tarot-reading.entity';

@Entity('tarotista_reviews')
@Index(['userId', 'tarotistaId'], { unique: true })
@Check('"rating" >= 1 AND "rating" <= 5')
export class TarotistaReview {
  @ApiProperty({ example: 1, description: 'ID único del review' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: 'ID del tarotista' })
  @Column({ name: 'tarotista_id' })
  tarotistaId: number;

  @ApiProperty({
    description: 'Relación con el tarotista',
    type: () => Tarotista,
  })
  @ManyToOne(() => Tarotista, (tarotista) => tarotista.reviews)
  @JoinColumn({ name: 'tarotista_id' })
  tarotista: Tarotista;

  @ApiProperty({ example: 1, description: 'ID del usuario que deja el review' })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({
    description: 'Relación con el usuario',
    type: () => User,
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    example: 1,
    description: 'ID de la lectura relacionada (opcional)',
  })
  @Column({ name: 'reading_id', type: 'int', nullable: true })
  readingId: number | null;

  @ApiProperty({
    description: 'Relación con la lectura',
    type: () => TarotReading,
    required: false,
  })
  @ManyToOne(() => TarotReading, { nullable: true })
  @JoinColumn({ name: 'reading_id' })
  reading: TarotReading | null;

  @ApiProperty({
    example: 5,
    description: 'Rating del 1 al 5',
    minimum: 1,
    maximum: 5,
  })
  @Column({ type: 'int' })
  rating: number;

  @ApiProperty({
    example: 'Excelente lectura, muy precisa y detallada',
    description: 'Comentario del usuario',
  })
  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @ApiProperty({
    example: false,
    description: 'Indica si el review fue aprobado por moderación',
  })
  @Column({ name: 'is_approved', default: false })
  isApproved: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si el review está oculto',
  })
  @Column({ name: 'is_hidden', default: false })
  isHidden: boolean;

  @ApiProperty({
    example: 'Review aprobado',
    description: 'Notas internas de moderación',
  })
  @Column({ name: 'moderation_notes', type: 'text', nullable: true })
  moderationNotes: string | null;

  @ApiProperty({
    example: 'Gracias por tu comentario',
    description: 'Respuesta del tarotista al review',
  })
  @Column({ name: 'tarotist_response', type: 'text', nullable: true })
  tarotistResponse: string | null;

  @ApiProperty({
    example: '2023-01-02T00:00:00Z',
    description: 'Fecha de respuesta del tarotista',
  })
  @Column({ name: 'tarotist_response_at', type: 'timestamp', nullable: true })
  tarotistResponseAt: Date | null;

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
