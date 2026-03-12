import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { SessionType } from '../../scheduling/domain/enums/session-type.enum';
import { ServicePurchase } from './service-purchase.entity';

/**
 * Holistic service offered by Flavia (e.g. Family Tree, Hebrew Pendulum, Energy Cleaning)
 */
@Entity('holistic_services')
@Index('idx_holistic_services_display_order', ['displayOrder'])
export class HolisticService {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'slug', type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ name: 'short_description', type: 'text' })
  shortDescription: string;

  @Column({ name: 'long_description', type: 'text' })
  longDescription: string;

  @Column({
    name: 'price_ars',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string): number => parseFloat(value),
    },
  })
  priceArs: number;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  @Column({
    name: 'session_type',
    type: 'enum',
    enum: SessionType,
  })
  sessionType: SessionType;

  @Column({ name: 'whatsapp_number', type: 'varchar', length: 50 })
  whatsappNumber: string;

  @Column({ name: 'mercado_pago_link', type: 'varchar', length: 500 })
  mercadoPagoLink: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => ServicePurchase, (purchase) => purchase.holisticService)
  purchases: ServicePurchase[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
