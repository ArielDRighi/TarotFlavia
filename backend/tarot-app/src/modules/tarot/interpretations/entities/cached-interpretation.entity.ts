import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('cached_interpretations')
export class CachedInterpretation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  @Index()
  cache_key: string;

  @Column({ type: 'uuid', nullable: true })
  spread_id: string | null;

  @Column({ type: 'jsonb' })
  card_combination: {
    card_id: string;
    position: number;
    is_reversed: boolean;
  }[];

  @Column({ length: 64 })
  question_hash: string;

  @Column({ type: 'text' })
  interpretation_text: string;

  @Column({ type: 'int', default: 0 })
  hit_count: number;

  @Column({ type: 'timestamp', nullable: true })
  last_used_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp' })
  expires_at: Date;
}
