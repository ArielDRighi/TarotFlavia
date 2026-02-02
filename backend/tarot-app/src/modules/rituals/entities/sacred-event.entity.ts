import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import {
  SacredEventType,
  Sabbat,
  LunarPhase,
  Hemisphere,
  SacredEventImportance,
  RitualCategory,
} from '../domain/enums';

/**
 * Entidad de Eventos del Calendario Sagrado
 * Representa eventos especiales como Sabbats, fases lunares, portales numéricos, etc.
 */
@Entity('sacred_events')
@Index('idx_sacred_event_date', ['eventDate'])
@Index('idx_sacred_event_type', ['eventType'])
@Index('idx_sacred_event_hemisphere', ['hemisphere'])
export class SacredEvent {
  @PrimaryGeneratedColumn()
  id: number;

  // Identificación
  @Column({ type: 'varchar', length: 100 })
  name: string; // "Luna Llena en Leo", "Samhain"

  @Column({ type: 'varchar', length: 100 })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  // Tipo de evento
  @Column({ name: 'event_type', type: 'enum', enum: SacredEventType })
  eventType: SacredEventType;

  // Solo para eventos tipo SABBAT
  @Column({ type: 'enum', enum: Sabbat, nullable: true })
  sabbat: Sabbat | null;

  // Solo para eventos tipo LUNAR_PHASE
  @Column({
    name: 'lunar_phase',
    type: 'enum',
    enum: LunarPhase,
    nullable: true,
  })
  lunarPhase: LunarPhase | null;

  // Fecha del evento
  @Column({ name: 'event_date', type: 'date' })
  eventDate: Date;

  // Hora exacta del evento (opcional)
  @Column({ name: 'event_time', type: 'time', nullable: true })
  eventTime: string | null;

  // Hemisferio (null = evento global como lunas)
  @Column({ type: 'enum', enum: Hemisphere, nullable: true })
  hemisphere: Hemisphere | null;

  // Nivel de importancia
  @Column({ type: 'enum', enum: SacredEventImportance })
  importance: SacredEventImportance;

  // Descripción de la energía del día
  @Column({ name: 'energy_description', type: 'text' })
  energyDescription: string; // "Ideal para nuevos comienzos..."

  // Categorías de rituales sugeridas
  @Column({
    name: 'suggested_ritual_categories',
    type: 'jsonb',
    nullable: true,
  })
  suggestedRitualCategories: RitualCategory[] | null;

  // IDs de rituales específicos recomendados
  @Column({ name: 'suggested_ritual_ids', type: 'jsonb', nullable: true })
  suggestedRitualIds: number[] | null;

  // Estado
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
