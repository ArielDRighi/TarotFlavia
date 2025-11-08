import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TarotReading } from '../../tarot/readings/entities/tarot-reading.entity';

export enum AIProvider {
  GROQ = 'groq',
  DEEPSEEK = 'deepseek',
  OPENAI = 'openai',
  GEMINI = 'gemini',
}

export enum AIUsageStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  CACHED = 'cached',
}

@Entity('ai_usage_logs')
@Index(['userId', 'createdAt'])
@Index(['provider', 'createdAt'])
export class AIUsageLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'reading_id', type: 'int', nullable: true })
  readingId: number | null;

  @ManyToOne(() => TarotReading, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reading_id' })
  reading: TarotReading | null;

  @Column({ name: 'tarotista_id', type: 'int', nullable: true })
  tarotistaId: number | null;

  @Column({
    type: 'enum',
    enum: AIProvider,
  })
  provider: AIProvider;

  @Column({ name: 'model_used', type: 'varchar', length: 100 })
  modelUsed: string;

  @Column({ name: 'prompt_tokens', type: 'int', default: 0 })
  promptTokens: number;

  @Column({ name: 'completion_tokens', type: 'int', default: 0 })
  completionTokens: number;

  @Column({ name: 'total_tokens', type: 'int', default: 0 })
  totalTokens: number;

  @Column({
    name: 'cost_usd',
    type: 'decimal',
    precision: 10,
    scale: 6,
    default: 0,
  })
  costUsd: number;

  @Column({ name: 'duration_ms', type: 'int', default: 0 })
  durationMs: number;

  @Column({
    type: 'enum',
    enum: AIUsageStatus,
    default: AIUsageStatus.SUCCESS,
  })
  status: AIUsageStatus;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'fallback_used', type: 'boolean', default: false })
  fallbackUsed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
