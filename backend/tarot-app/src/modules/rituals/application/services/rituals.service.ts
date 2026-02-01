import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ritual } from '../../entities/ritual.entity';
import { LunarPhaseService } from './lunar-phase.service';
import { RitualFiltersDto } from '../dto/ritual-filters.dto';
import { RitualSummaryDto, RitualDetailDto } from '../dto/ritual-response.dto';
import { MaterialType } from '../../domain/enums';

/**
 * Servicio para gestión de rituales
 *
 * Responsabilidades:
 * - Consultar rituales con filtros
 * - Obtener rituales destacados según fase lunar
 * - Obtener detalle de rituales
 * - Incrementar contadores (vistas, completados)
 */
@Injectable()
export class RitualsService {
  constructor(
    @InjectRepository(Ritual)
    private readonly ritualRepository: Repository<Ritual>,
    private readonly lunarPhaseService: LunarPhaseService,
  ) {}

  /**
   * Obtiene todos los rituales con filtros opcionales
   */
  async findAll(filters?: RitualFiltersDto): Promise<RitualSummaryDto[]> {
    const query = this.ritualRepository
      .createQueryBuilder('ritual')
      .leftJoinAndSelect('ritual.materials', 'materials')
      .leftJoinAndSelect('ritual.steps', 'steps')
      .where('ritual.isActive = :isActive', { isActive: true });

    if (filters?.category) {
      query.andWhere('ritual.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.difficulty) {
      query.andWhere('ritual.difficulty = :difficulty', {
        difficulty: filters.difficulty,
      });
    }

    if (filters?.lunarPhase) {
      query.andWhere(
        '(ritual.bestLunarPhase = :phase OR ritual.bestLunarPhases @> :phaseArray)',
        {
          phase: filters.lunarPhase,
          phaseArray: JSON.stringify([filters.lunarPhase]),
        },
      );
    }

    if (filters?.search) {
      query.andWhere(
        '(ritual.title ILIKE :search OR ritual.description ILIKE :search)',
        {
          search: `%${filters.search}%`,
        },
      );
    }

    query
      .orderBy('ritual.isFeatured', 'DESC')
      .addOrderBy('ritual.completionCount', 'DESC');

    const rituals = await query.getMany();

    return rituals.map((r) => this.toSummaryDto(r));
  }

  /**
   * Obtiene rituales destacados según la fase lunar actual
   */
  async getFeatured(): Promise<RitualSummaryDto[]> {
    const lunarInfo = this.lunarPhaseService.getCurrentPhase();
    const currentPhase = lunarInfo.phase;

    const rituals = await this.ritualRepository
      .createQueryBuilder('ritual')
      .leftJoinAndSelect('ritual.materials', 'materials')
      .leftJoinAndSelect('ritual.steps', 'steps')
      .where('ritual.isActive = :isActive', { isActive: true })
      .andWhere(
        '(ritual.isFeatured = true OR ritual.bestLunarPhase = :phase OR ritual.bestLunarPhases @> :phaseArray)',
        { phase: currentPhase, phaseArray: JSON.stringify([currentPhase]) },
      )
      .orderBy('ritual.isFeatured', 'DESC')
      .addOrderBy('ritual.completionCount', 'DESC')
      .take(6)
      .getMany();

    return rituals.map((r) => this.toSummaryDto(r));
  }

  /**
   * Obtiene un ritual por su slug
   */
  async findBySlug(slug: string): Promise<RitualDetailDto> {
    const ritual = await this.ritualRepository.findOne({
      where: { slug, isActive: true },
      relations: ['materials', 'steps'],
    });

    if (!ritual) {
      throw new NotFoundException(`Ritual "${slug}" no encontrado`);
    }

    // Incrementar vistas (fire-and-forget)
    this.incrementViewCount(ritual.id).catch(() => {});

    return this.toDetailDto(ritual);
  }

  /**
   * Obtiene un ritual por ID
   */
  async findById(id: number): Promise<Ritual> {
    const ritual = await this.ritualRepository.findOne({
      where: { id },
      relations: ['materials', 'steps'],
    });

    if (!ritual) {
      throw new NotFoundException(`Ritual con ID ${id} no encontrado`);
    }

    return ritual;
  }

  /**
   * Obtiene las categorías disponibles con conteo
   */
  async getCategories(): Promise<{ category: string; count: number }[]> {
    const results = await this.ritualRepository
      .createQueryBuilder('ritual')
      .select('ritual.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('ritual.isActive = :isActive', { isActive: true })
      .groupBy('ritual.category')
      .getRawMany<{ category: string; count: string }>();

    return results.map((result: { category: string; count: string }) => ({
      category: result.category,
      count: parseInt(result.count, 10),
    }));
  }

  /**
   * Incrementa el contador de completados de un ritual
   */
  async incrementCompletionCount(ritualId: number): Promise<void> {
    await this.ritualRepository
      .createQueryBuilder()
      .update()
      .set({ completionCount: () => 'completion_count + 1' })
      .where('id = :id', { id: ritualId })
      .execute();
  }

  /**
   * Incrementa el contador de vistas de un ritual
   */
  private async incrementViewCount(ritualId: number): Promise<void> {
    await this.ritualRepository
      .createQueryBuilder()
      .update()
      .set({ viewCount: () => 'view_count + 1' })
      .where('id = :id', { id: ritualId })
      .execute();
  }

  /**
   * Convierte una entidad Ritual a RitualSummaryDto
   */
  private toSummaryDto(ritual: Ritual): RitualSummaryDto {
    return {
      id: ritual.id,
      slug: ritual.slug,
      title: ritual.title,
      description: ritual.description,
      category: ritual.category,
      difficulty: ritual.difficulty,
      durationMinutes: ritual.durationMinutes,
      bestLunarPhase: ritual.bestLunarPhase,
      imageUrl: ritual.thumbnailUrl || ritual.imageUrl,
      materialsCount: ritual.materials?.length || 0,
      stepsCount: ritual.steps?.length || 0,
    };
  }

  /**
   * Convierte una entidad Ritual a RitualDetailDto
   */
  private toDetailDto(ritual: Ritual): RitualDetailDto {
    return {
      ...this.toSummaryDto(ritual),
      bestTimeOfDay: ritual.bestTimeOfDay,
      purpose: ritual.purpose,
      preparation: ritual.preparation,
      closing: ritual.closing,
      tips: ritual.tips,
      audioUrl: ritual.audioUrl,
      materials:
        ritual.materials
          ?.sort((a, b) => {
            const aRequired = a.type === MaterialType.REQUIRED;
            const bRequired = b.type === MaterialType.REQUIRED;

            if (aRequired === bRequired) {
              return 0;
            }

            return aRequired ? -1 : 1;
          })
          .map((m) => ({
            id: m.id,
            name: m.name,
            description: m.description,
            type: m.type,
            alternative: m.alternative,
            quantity: m.quantity,
            unit: m.unit,
          })) || [],
      steps:
        ritual.steps
          ?.sort((a, b) => a.stepNumber - b.stepNumber)
          .map((s) => ({
            id: s.id,
            stepNumber: s.stepNumber,
            title: s.title,
            description: s.description,
            durationSeconds: s.durationSeconds,
            imageUrl: s.imageUrl,
            mantra: s.mantra,
            visualization: s.visualization,
          })) || [],
      completionCount: ritual.completionCount,
    };
  }
}
