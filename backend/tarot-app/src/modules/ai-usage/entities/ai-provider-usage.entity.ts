import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { AIProvider } from './ai-usage-log.entity';

/**
 * Tracks monthly AI provider usage and cost limits
 * Prevents unexpected billing by enforcing hard limits per provider
 */
@Entity('ai_provider_usage')
@Index(['provider', 'month'], { unique: true })
export class AIProviderUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AIProvider,
  })
  provider: AIProvider;

  @Column({ type: 'date' })
  month: Date; // YYYY-MM-01 format

  @Column({ name: 'requests_count', type: 'int', default: 0 })
  requestsCount: number;

  @Column({ name: 'tokens_used', type: 'bigint', default: 0 })
  tokensUsed: string; // bigint as string for large numbers

  @Column({
    name: 'cost_usd',
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
  })
  costUsd: number;

  @Column({
    name: 'monthly_limit_usd',
    type: 'decimal',
    precision: 10,
    scale: 4,
  })
  monthlyLimitUsd: number;

  @Column({ name: 'limit_reached', type: 'boolean', default: false })
  limitReached: boolean;

  @Column({ name: 'warning_at_80_sent', type: 'boolean', default: false })
  warningAt80Sent: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
