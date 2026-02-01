import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Ritual } from '../../entities/ritual.entity';
import { RitualStep } from '../../entities/ritual-step.entity';
import { RitualMaterial } from '../../entities/ritual-material.entity';
import {
  CreateRitualDto,
  CreateRitualStepDto,
  CreateRitualMaterialDto,
  UpdateRitualDto,
  UpdateRitualStepDto,
  UpdateRitualMaterialDto,
} from '../dto';

@Injectable()
export class RitualsAdminService {
  constructor(
    @InjectRepository(Ritual)
    private readonly ritualRepo: Repository<Ritual>,
    @InjectRepository(RitualStep)
    private readonly stepRepo: Repository<RitualStep>,
    @InjectRepository(RitualMaterial)
    private readonly materialRepo: Repository<RitualMaterial>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crear ritual completo con materiales y pasos
   */
  async create(dto: CreateRitualDto): Promise<Ritual> {
    // Verificar slug único
    const existing = await this.ritualRepo.findOne({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(
        `Ya existe un ritual con el slug "${dto.slug}"`,
      );
    }

    // Usar transacción para crear todo
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { materials, steps, ...ritualData } = dto;

      // Crear ritual
      const ritual = this.ritualRepo.create(ritualData);
      await queryRunner.manager.save(ritual);

      // Crear materiales
      for (const materialDto of materials) {
        const material = this.materialRepo.create({
          ...materialDto,
          ritualId: ritual.id,
        });
        await queryRunner.manager.save(material);
      }

      // Crear pasos
      for (const stepDto of steps) {
        const step = this.stepRepo.create({
          ...stepDto,
          ritualId: ritual.id,
        });
        await queryRunner.manager.save(step);
      }

      await queryRunner.commitTransaction();

      // Retornar ritual completo
      return this.findById(ritual.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Listar todos los rituales (incluye inactivos)
   */
  async findAll(): Promise<Ritual[]> {
    return this.ritualRepo.find({
      relations: ['materials', 'steps'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener ritual por ID
   */
  async findById(id: number): Promise<Ritual> {
    const ritual = await this.ritualRepo.findOne({
      where: { id },
      relations: ['materials', 'steps'],
    });

    if (!ritual) {
      throw new NotFoundException(`Ritual con ID ${id} no encontrado`);
    }

    return ritual;
  }

  /**
   * Actualizar ritual
   */
  async update(id: number, dto: UpdateRitualDto): Promise<Ritual> {
    const ritual = await this.findById(id);

    // Si hay materiales o pasos, actualizarlos
    const { materials, steps, ...ritualData } = dto;

    // Actualizar campos del ritual
    Object.assign(ritual, ritualData);
    await this.ritualRepo.save(ritual);

    // Si se envían materiales, reemplazar todos
    if (materials !== undefined) {
      await this.materialRepo.delete({ ritualId: id });
      for (const materialDto of materials) {
        const material = this.materialRepo.create({
          ...materialDto,
          ritualId: id,
        });
        await this.materialRepo.save(material);
      }
    }

    // Si se envían pasos, reemplazar todos
    if (steps !== undefined) {
      await this.stepRepo.delete({ ritualId: id });
      for (const stepDto of steps) {
        const step = this.stepRepo.create({
          ...stepDto,
          ritualId: id,
        });
        await this.stepRepo.save(step);
      }
    }

    return this.findById(id);
  }

  /**
   * Soft delete (marcar como inactivo)
   */
  async softDelete(id: number): Promise<void> {
    const ritual = await this.findById(id);
    ritual.isActive = false;
    await this.ritualRepo.save(ritual);
  }

  /**
   * Toggle activo/inactivo
   */
  async toggleActive(id: number): Promise<Ritual> {
    const ritual = await this.findById(id);
    ritual.isActive = !ritual.isActive;
    await this.ritualRepo.save(ritual);
    return ritual;
  }

  /**
   * Duplicar ritual
   */
  async duplicate(id: number, newSlug: string): Promise<Ritual> {
    const original = await this.findById(id);

    // Verificar slug único
    const existing = await this.ritualRepo.findOne({
      where: { slug: newSlug },
    });
    if (existing) {
      throw new ConflictException(
        `Ya existe un ritual con el slug "${newSlug}"`,
      );
    }

    const duplicateDto: CreateRitualDto = {
      slug: newSlug,
      title: `${original.title} (copia)`,
      description: original.description,
      category: original.category,
      difficulty: original.difficulty,
      durationMinutes: original.durationMinutes,
      imageUrl: original.imageUrl,
      bestLunarPhase: original.bestLunarPhase || undefined,
      bestLunarPhases: original.bestLunarPhases || undefined,
      bestTimeOfDay: original.bestTimeOfDay || undefined,
      purpose: original.purpose || undefined,
      preparation: original.preparation || undefined,
      closing: original.closing || undefined,
      tips: original.tips || undefined,
      thumbnailUrl: original.thumbnailUrl || undefined,
      audioUrl: original.audioUrl || undefined,
      isActive: false, // Inactivo por defecto
      isFeatured: false,
      materials: original.materials.map((m) => ({
        name: m.name,
        description: m.description || undefined,
        type: m.type,
        alternative: m.alternative || undefined,
        quantity: m.quantity,
        unit: m.unit || undefined,
      })),
      steps: original.steps.map((s) => ({
        stepNumber: s.stepNumber,
        title: s.title,
        description: s.description,
        durationSeconds: s.durationSeconds || undefined,
        imageUrl: s.imageUrl || undefined,
        mantra: s.mantra || undefined,
        visualization: s.visualization || undefined,
      })),
    };

    return this.create(duplicateDto);
  }

  // ==================
  // GESTIÓN DE PASOS
  // ==================

  async addStep(
    ritualId: number,
    dto: CreateRitualStepDto,
  ): Promise<RitualStep> {
    await this.findById(ritualId); // Verificar que existe

    const step = this.stepRepo.create({
      ...dto,
      ritualId,
    });
    return this.stepRepo.save(step);
  }

  async updateStep(
    ritualId: number,
    stepId: number,
    dto: UpdateRitualStepDto,
  ): Promise<RitualStep> {
    const step = await this.stepRepo.findOne({
      where: { id: stepId, ritualId },
    });

    if (!step) {
      throw new NotFoundException(
        `Paso ${stepId} no encontrado en ritual ${ritualId}`,
      );
    }

    Object.assign(step, dto);
    return this.stepRepo.save(step);
  }

  async deleteStep(ritualId: number, stepId: number): Promise<void> {
    const result = await this.stepRepo.delete({ id: stepId, ritualId });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Paso ${stepId} no encontrado en ritual ${ritualId}`,
      );
    }
  }

  // ==================
  // GESTIÓN DE MATERIALES
  // ==================

  async addMaterial(
    ritualId: number,
    dto: CreateRitualMaterialDto,
  ): Promise<RitualMaterial> {
    await this.findById(ritualId);

    const material = this.materialRepo.create({
      ...dto,
      ritualId,
    });
    return this.materialRepo.save(material);
  }

  async updateMaterial(
    ritualId: number,
    materialId: number,
    dto: UpdateRitualMaterialDto,
  ): Promise<RitualMaterial> {
    const material = await this.materialRepo.findOne({
      where: { id: materialId, ritualId },
    });

    if (!material) {
      throw new NotFoundException(
        `Material ${materialId} no encontrado en ritual ${ritualId}`,
      );
    }

    Object.assign(material, dto);
    return this.materialRepo.save(material);
  }

  async deleteMaterial(ritualId: number, materialId: number): Promise<void> {
    const result = await this.materialRepo.delete({ id: materialId, ritualId });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Material ${materialId} no encontrado en ritual ${ritualId}`,
      );
    }
  }
}
