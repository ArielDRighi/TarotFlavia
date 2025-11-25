import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { TarotReading } from '../../tarot/readings/entities/tarot-reading.entity';
import { UserTarotistaSubscription } from './user-tarotista-subscription.entity';

@Entity('tarotistas')
@Check('"comisión_porcentaje" >= 0 AND "comisión_porcentaje" <= 100')
@Check('"rating_promedio" >= 0 AND "rating_promedio" <= 5')
@Index('idx_tarotista_active', ['isActive'])
@Index('idx_tarotista_featured', ['isFeatured'])
@Index('idx_tarotista_rating', ['ratingPromedio'], {
  where: '"is_active" = true',
})
export class Tarotista {
  @ApiProperty({ example: 1, description: 'ID único del tarotista' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: 'ID del usuario asociado' })
  @Column({ name: 'user_id', unique: true })
  userId: number;

  @ApiProperty({
    description: 'Relación con el usuario',
    type: () => User,
  })
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    example: 'Flavia',
    description: 'Nombre público del tarotista',
  })
  @Column({ name: 'nombre_publico', length: 100 })
  nombrePublico: string;

  @ApiProperty({
    example: 'Tarotista con 20 años de experiencia',
    description: 'Biografía del tarotista',
  })
  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @ApiProperty({
    example: 'https://example.com/photo.jpg',
    description: 'URL de la foto de perfil',
  })
  @Column({ name: 'foto_perfil', type: 'varchar', length: 500, nullable: true })
  fotoPerfil: string | null;

  @ApiProperty({
    example: ['Amor', 'Trabajo', 'Salud'],
    description: 'Especialidades del tarotista',
    type: [String],
  })
  @Index('idx_tarotista_especialidades', { synchronize: false })
  @Column({ type: 'text', array: true, default: [] })
  especialidades: string[];

  @ApiProperty({
    example: ['Español', 'Inglés'],
    description: 'Idiomas que habla el tarotista',
    type: [String],
  })
  @Column({ type: 'text', array: true, default: [] })
  idiomas: string[];

  @ApiProperty({
    example: 20,
    description: 'Años de experiencia del tarotista',
  })
  @Column({ name: 'años_experiencia', type: 'int', nullable: true })
  añosExperiencia: number | null;

  @ApiProperty({
    example: true,
    description: 'Indica si ofrece sesiones virtuales',
  })
  @Column({ name: 'ofrece_sesiones_virtuales', default: false })
  ofreceSesionesVirtuales: boolean;

  @ApiProperty({
    example: 50.0,
    description: 'Precio por sesión en USD',
  })
  @Column({
    name: 'precio_sesion_usd',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  precioSesionUsd: number | null;

  @ApiProperty({
    example: 60,
    description: 'Duración de la sesión en minutos',
  })
  @Column({ name: 'duracion_sesion_minutos', type: 'int', nullable: true })
  duracionSesionMinutos: number | null;

  @ApiProperty({
    example: true,
    description: 'Indica si el tarotista está activo',
  })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    example: true,
    description: 'Indica si acepta nuevos clientes',
  })
  @Column({ name: 'is_accepting_new_clients', default: true })
  isAcceptingNewClients: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si es un tarotista destacado',
  })
  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @ApiProperty({
    example: 30.0,
    description: 'Porcentaje de comisión (0-100)',
  })
  @Column({
    name: 'comisión_porcentaje',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 30.0,
  })
  comisiónPorcentaje: number;

  @ApiProperty({
    example: 150,
    description: 'Total de lecturas realizadas',
  })
  @Column({ name: 'total_lecturas', type: 'int', default: 0 })
  totalLecturas: number;

  @ApiProperty({
    example: 4.8,
    description: 'Rating promedio (0-5)',
  })
  @Column({
    name: 'rating_promedio',
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
    // Note: This transformer handles PostgreSQL decimal/numeric columns that may be returned as strings.
    // It also handles cases where the value may already be a number (for other DB drivers).
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | number | null | undefined) => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'number') return value;
        if (typeof value === 'string') return parseFloat(value);
        return null;
      },
    },
  })
  ratingPromedio: number | null;

  @ApiProperty({
    example: 50,
    description: 'Total de reviews recibidas',
  })
  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews: number;

  @ApiProperty({
    description: 'Configuraciones de IA del tarotista',
    type: () => 'TarotistaConfig',
    isArray: true,
  })
  @OneToMany('TarotistaConfig', 'tarotista')
  configs: unknown[];

  @ApiProperty({
    description: 'Significados personalizados de cartas',
    type: () => 'TarotistaCardMeaning',
    isArray: true,
  })
  @OneToMany('TarotistaCardMeaning', 'tarotista')
  customCardMeanings: unknown[];

  @ApiProperty({
    description: 'Suscripciones de usuarios a este tarotista',
    type: () => UserTarotistaSubscription,
    isArray: true,
  })
  @OneToMany(
    () => UserTarotistaSubscription,
    (subscription) => subscription.tarotista,
  )
  subscriptions: UserTarotistaSubscription[];

  @ApiProperty({
    description: 'Lecturas realizadas por el tarotista',
    type: () => TarotReading,
    isArray: true,
  })
  @OneToMany(() => TarotReading, (reading) => reading.tarotista)
  readings: TarotReading[];

  @ApiProperty({
    description: 'Reviews del tarotista',
    type: () => 'TarotistaReview',
    isArray: true,
  })
  @OneToMany('TarotistaReview', 'tarotista')
  reviews: unknown[];

  @ApiProperty({
    description: 'Métricas de ingresos del tarotista',
    type: () => 'TarotistaRevenueMetrics',
    isArray: true,
  })
  @OneToMany('TarotistaRevenueMetrics', 'tarotista')
  revenueMetrics: unknown[];

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
