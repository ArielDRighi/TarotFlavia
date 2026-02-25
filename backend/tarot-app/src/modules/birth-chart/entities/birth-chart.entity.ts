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
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

/**
 * Interfaz para posición de un planeta
 */
export interface PlanetPosition {
  planet: string;
  longitude: number; // Grados absolutos (0-360)
  sign: string; // Signo zodiacal
  signDegree: number; // Grado dentro del signo (0-30)
  house: number; // Número de casa (1-12)
  isRetrograde: boolean; // Si está retrógrado
}

/**
 * Interfaz para cúspide de casa
 */
export interface HouseCusp {
  house: number;
  longitude: number;
  sign: string;
  signDegree: number;
}

/**
 * Interfaz para aspecto entre planetas
 */
export interface ChartAspect {
  planet1: string;
  planet2: string;
  aspectType: string;
  angle: number;
  orb: number;
  isApplying: boolean;
}

/**
 * Interfaz para distribución de elementos/modalidades
 */
export interface ChartDistribution {
  elements: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  modalities: {
    cardinal: number;
    fixed: number;
    mutable: number;
  };
  polarity: {
    masculine: number;
    feminine: number;
  };
}

/**
 * Interfaz completa de datos calculados de la carta
 */
export interface ChartData {
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: ChartAspect[];
  ascendant: PlanetPosition;
  midheaven: PlanetPosition;
  distribution: ChartDistribution;
  aiSynthesis?: string; // Síntesis generada por IA (solo Premium)
}

/**
 * Entidad de Carta Astral
 * Almacena cartas astrales generadas por usuarios (Premium)
 * Incluye datos de nacimiento, posiciones planetarias, casas y aspectos
 */
@Entity('birth_charts')
@Index('idx_birth_chart_user', ['userId'])
@Index(
  'idx_birth_chart_user_birth',
  ['userId', 'birthDate', 'birthTime', 'latitude', 'longitude', 'orbSystem'],
  { unique: true },
)
export class BirthChart {
  @ApiProperty({ example: 1, description: 'ID único de la carta astral' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: 'ID del usuario propietario' })
  @Column()
  userId: number;

  @ApiProperty({
    example: 'Mi carta natal',
    description: 'Nombre identificador de la carta',
  })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ example: '1990-05-15', description: 'Fecha de nacimiento' })
  @Column({ type: 'date' })
  birthDate: Date;

  @ApiProperty({
    example: '14:30:00',
    description: 'Hora de nacimiento (HH:mm:ss)',
  })
  @Column({ type: 'time' })
  birthTime: string;

  @ApiProperty({
    example: 'Buenos Aires, Argentina',
    description: 'Lugar de nacimiento',
  })
  @Column({ type: 'varchar', length: 255 })
  birthPlace: string;

  @ApiProperty({
    example: -34.6037,
    description: 'Latitud del lugar de nacimiento',
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    transformer: {
      to: (value: number | null | undefined) => value,
      from: (value: string | null | undefined): number | null | undefined =>
        value !== null && value !== undefined ? parseFloat(value) : value,
    },
  })
  latitude: number;

  @ApiProperty({
    example: -58.3816,
    description: 'Longitud del lugar de nacimiento',
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    transformer: {
      to: (value: number | null | undefined) => value,
      from: (value: string | null | undefined): number | null | undefined =>
        value !== null && value !== undefined ? parseFloat(value) : value,
    },
  })
  longitude: number;

  @ApiProperty({
    example: 'America/Argentina/Buenos_Aires',
    description: 'Zona horaria IANA',
  })
  @Column({ type: 'varchar', length: 100 })
  timezone: string;

  @ApiProperty({
    example: 'commercial',
    description: 'Sistema de orbes usado en el cálculo (strict o commercial)',
  })
  @Column({ type: 'varchar', length: 20, default: 'commercial' })
  orbSystem: string;

  @ApiProperty({
    description: 'Datos calculados de la carta (posiciones, aspectos, etc.)',
  })
  @Column({ type: 'jsonb' })
  chartData: ChartData;

  @ApiProperty({
    example: 'leo',
    description: 'Signo solar (para búsquedas rápidas)',
  })
  @Column({ type: 'varchar', length: 20 })
  sunSign: string;

  @ApiProperty({ example: 'scorpio', description: 'Signo lunar' })
  @Column({ type: 'varchar', length: 20 })
  moonSign: string;

  @ApiProperty({ example: 'virgo', description: 'Signo ascendente' })
  @Column({ type: 'varchar', length: 20 })
  ascendantSign: string;

  @ApiProperty({
    example: '2026-02-06T12:00:00Z',
    description: 'Fecha de creación',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2026-02-06T12:00:00Z',
    description: 'Fecha de última actualización',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // ============================================================================
  // RELACIONES
  // ============================================================================

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // ============================================================================
  // MÉTODOS HELPER
  // ============================================================================

  /**
   * Obtiene el "Big Three" de la carta
   */
  getBigThree(): { sun: string; moon: string; ascendant: string } {
    return {
      sun: this.sunSign,
      moon: this.moonSign,
      ascendant: this.ascendantSign,
    };
  }

  /**
   * Verifica si la carta tiene síntesis de IA
   */
  hasAiSynthesis(): boolean {
    return !!this.chartData?.aiSynthesis;
  }

  /**
   * Obtiene los aspectos de un planeta específico
   */
  getAspectsForPlanet(planet: string): ChartAspect[] {
    return (
      this.chartData?.aspects?.filter(
        (a) => a.planet1 === planet || a.planet2 === planet,
      ) || []
    );
  }
}
