import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ReadingCategory } from '../../categories/entities/reading-category.entity';

@Entity('predefined_question')
@Index(['categoryId'])
export class PredefinedQuestion {
  @ApiProperty({
    example: 1,
    description: 'ID único de la pregunta predefinida',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la categoría a la que pertenece',
  })
  @Column({ name: 'category_id' })
  categoryId: number;

  @ApiProperty({
    example: '¿Cómo puedo mejorar mi relación de pareja?',
    description: 'Texto de la pregunta predefinida',
    maxLength: 200,
  })
  @Column({ length: 200, name: 'question_text' })
  questionText: string;

  @ApiProperty({
    example: 1,
    description: 'Orden de visualización de la pregunta',
  })
  @Column({ default: 0 })
  order: number;

  @ApiProperty({
    example: true,
    description: 'Indica si la pregunta está activa',
  })
  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @ApiProperty({
    example: 42,
    description: 'Contador de veces que se ha usado esta pregunta',
  })
  @Column({ default: 0, name: 'usage_count' })
  usageCount: number;

  @ManyToOne(() => ReadingCategory, { eager: false })
  @JoinColumn({ name: 'category_id' })
  category: ReadingCategory;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
