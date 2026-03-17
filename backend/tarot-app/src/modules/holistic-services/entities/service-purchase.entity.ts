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
import { User } from '../../users/entities/user.entity';
import { Session } from '../../scheduling/entities/session.entity';
import { HolisticService } from './holistic-service.entity';
import { PurchaseStatus } from '../domain/enums/purchase-status.enum';

/**
 * Represents a user's purchase of a holistic service.
 * Payment is approved manually by admin (pending Mercado Pago webhook integration).
 */
@Entity('service_purchases')
@Index('idx_service_purchases_user_status', ['userId', 'paymentStatus'])
@Index('idx_service_purchases_service_status', [
  'holisticServiceId',
  'paymentStatus',
])
export class ServicePurchase {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'holistic_service_id', type: 'int' })
  holisticServiceId: number;

  @ManyToOne(() => HolisticService, (service) => service.purchases, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'holistic_service_id' })
  holisticService: HolisticService;

  @Column({ name: 'session_id', type: 'int', nullable: true })
  sessionId: number | null;

  @ManyToOne(() => Session, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'session_id' })
  session: Session | null;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PurchaseStatus,
    default: PurchaseStatus.PENDING,
  })
  paymentStatus: PurchaseStatus;

  @Column({
    name: 'amount_ars',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string): number => parseFloat(value),
    },
  })
  amountArs: number;

  @Column({
    name: 'payment_reference',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  paymentReference: string | null;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'approved_by_admin_id', type: 'int', nullable: true })
  approvedByAdminId: number | null;

  /**
   * Date selected by the user when creating the purchase (for automatic scheduling post-payment).
   * Format: YYYY-MM-DD
   */
  @Column({ name: 'selected_date', type: 'date', nullable: true })
  selectedDate: string | null;

  /**
   * Time selected by the user when creating the purchase (for automatic scheduling post-payment).
   * Format: HH:MM
   */
  @Column({
    name: 'selected_time',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  selectedTime: string | null;

  /**
   * Mercado Pago payment ID for reconciliation (populated via webhook IPN).
   */
  @Column({
    name: 'mercado_pago_payment_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  mercadoPagoPaymentId: string | null;

  /**
   * Mercado Pago preference ID generated when the purchase was created (Checkout Pro).
   */
  @Column({
    name: 'preference_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  preferenceId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
