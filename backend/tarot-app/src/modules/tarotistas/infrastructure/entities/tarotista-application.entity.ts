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
import { User } from '../../../users/entities/user.entity';

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('tarotista_applications')
@Index('idx_application_status', ['status'])
@Index('idx_application_user', ['userId'])
export class TarotistaApplication {
  @ApiProperty({ example: 1, description: 'ID único de la aplicación' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: 'ID del usuario aplicante' })
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
    example: 'Luna Mística',
    description: 'Nombre público propuesto',
  })
  @Column({ name: 'nombre_publico', length: 100 })
  nombrePublico: string;

  @ApiProperty({
    example: 'Tarotista con 15 años de experiencia...',
    description: 'Biografía propuesta',
  })
  @Column({ type: 'text' })
  biografia: string;

  @ApiProperty({
    example: ['amor', 'trabajo', 'espiritual'],
    description: 'Especialidades propuestas',
    type: [String],
  })
  @Column({ type: 'text', array: true, default: [] })
  especialidades: string[];

  @ApiProperty({
    example: 'Quiero compartir mi don con más personas...',
    description: 'Motivación del aplicante',
  })
  @Column({ type: 'text' })
  motivacion: string;

  @ApiProperty({
    example: '15 años practicando tarot...',
    description: 'Experiencia del aplicante',
  })
  @Column({ type: 'text' })
  experiencia: string;

  @ApiProperty({
    example: 'pending',
    description: 'Estado de la aplicación',
    enum: ApplicationStatus,
  })
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @ApiProperty({
    example: 'Excelente perfil, aprobado',
    description: 'Notas del administrador',
  })
  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string | null;

  @ApiProperty({
    example: 1,
    description: 'ID del admin que revisó',
  })
  @Column({ name: 'reviewed_by_user_id', nullable: true })
  reviewedByUserId: number | null;

  @ApiProperty({
    description: 'Admin que revisó la aplicación',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_user_id' })
  reviewedBy: User | null;

  @ApiProperty({
    example: '2023-01-15T10:00:00Z',
    description: 'Fecha de revisión',
  })
  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

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
