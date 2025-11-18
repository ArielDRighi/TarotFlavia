import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entidad para tracking de métricas de caché
 * Permite análisis histórico de hit rate, tiempo de respuesta, etc.
 */
@Entity('cache_metrics')
@Index(['metric_date', 'metric_hour'])
export class CacheMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  @Index()
  metric_date: Date;

  @Column({ type: 'int' })
  metric_hour: number;

  @Column({ type: 'int', default: 0 })
  total_requests: number;

  @Column({ type: 'int', default: 0 })
  cache_hits: number;

  @Column({ type: 'int', default: 0 })
  cache_misses: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  hit_rate_percentage: number;

  @Column({ type: 'int', default: 0, nullable: true })
  avg_cache_response_time_ms: number | null;

  @Column({ type: 'int', default: 0, nullable: true })
  avg_ai_response_time_ms: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
