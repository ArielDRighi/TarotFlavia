import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Ritual } from './ritual.entity';
import { MaterialType } from '../domain/enums';

/**
 * Material necesario para un ritual
 * Representa cada elemento requerido u opcional para realizar el ritual
 */
@Entity('ritual_materials')
@Index('idx_material_ritual', ['ritualId'])
export class RitualMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ritual_id' })
  ritualId: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: MaterialType,
    default: MaterialType.REQUIRED,
  })
  type: MaterialType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  alternative: string | null;

  @Column({ type: 'smallint', default: 1 })
  quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string | null;

  @ManyToOne(() => Ritual, (ritual) => ritual.materials, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ritual_id' })
  ritual: Ritual;
}
