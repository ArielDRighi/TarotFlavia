import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Entidad que persiste los bloqueos de IP en base de datos.
 * Permite que los bloqueos sobrevivan reinicios del servidor.
 */
@Entity('ip_blocks')
export class IpBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar' })
  ip: string;

  @Index()
  @Column({ name: 'blocked_until', type: 'timestamptz' })
  blockedUntil: Date;

  @Column({ type: 'varchar', default: 'Rate limit exceeded' })
  reason: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
