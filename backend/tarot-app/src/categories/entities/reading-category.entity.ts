import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TarotReading } from '../../readings/entities/tarot-reading.entity';

@Entity('reading_category')
export class ReadingCategory {
  @ApiProperty({ example: 1, description: 'ID único de la categoría' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Amor y Relaciones',
    description: 'Nombre de la categoría',
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    example: 'amor-relaciones',
    description: 'Slug único para URLs y referencias',
  })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({
    example: 'Consultas sobre amor, relaciones de pareja y vínculos afectivos',
    description: 'Descripción de la categoría',
  })
  @Column('text')
  description: string;

  @ApiProperty({
    example: '❤️',
    description: 'Icono o emoji representativo de la categoría',
  })
  @Column()
  icon: string;

  @ApiProperty({
    example: '#FF6B9D',
    description: 'Color hexadecimal representativo de la categoría',
  })
  @Column()
  color: string;

  @ApiProperty({
    example: 1,
    description: 'Orden de visualización de la categoría',
  })
  @Column({ default: 0 })
  order: number;

  @ApiProperty({
    example: true,
    description: 'Indica si la categoría está activa',
  })
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => TarotReading, (reading) => reading.category)
  readings: TarotReading[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
