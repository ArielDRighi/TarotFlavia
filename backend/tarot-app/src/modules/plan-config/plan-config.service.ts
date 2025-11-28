import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { UserPlan } from '../users/entities/user.entity';

@Injectable()
export class PlanConfigService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  /**
   * Obtiene todos los planes configurados
   */
  async findAll(): Promise<Plan[]> {
    return this.planRepository.find({
      order: { planType: 'ASC' },
    });
  }

  /**
   * Busca un plan por su tipo
   * @param planType - Tipo de plan a buscar
   * @throws NotFoundException si el plan no existe
   */
  async findByPlanType(planType: UserPlan): Promise<Plan> {
    const plan = await this.planRepository.findOne({
      where: { planType },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with type ${planType} not found`);
    }

    return plan;
  }

  /**
   * Crea un nuevo plan
   * @param createPlanDto - Datos del plan a crear
   * @throws ConflictException si ya existe un plan con ese tipo
   */
  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    // Verificar que no exista un plan con ese tipo
    const existing = await this.planRepository.findOne({
      where: { planType: createPlanDto.planType },
    });

    if (existing) {
      throw new ConflictException(
        `Plan with type ${createPlanDto.planType} already exists`,
      );
    }

    const plan = this.planRepository.create(createPlanDto);
    return this.planRepository.save(plan);
  }

  /**
   * Actualiza un plan existente
   * @param planType - Tipo de plan a actualizar
   * @param updatePlanDto - Datos a actualizar
   * @throws NotFoundException si el plan no existe
   */
  async update(
    planType: UserPlan,
    updatePlanDto: UpdatePlanDto,
  ): Promise<Plan> {
    const plan = await this.findByPlanType(planType);

    // Evitar que se cambie el planType (destructuring para excluir)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { planType: _ignored, ...updateData } = updatePlanDto;

    Object.assign(plan, updateData);

    return this.planRepository.save(plan);
  }

  /**
   * Elimina un plan
   * @param planType - Tipo de plan a eliminar
   * @throws NotFoundException si el plan no existe
   */
  async remove(planType: UserPlan): Promise<void> {
    const plan = await this.findByPlanType(planType);
    await this.planRepository.delete(plan.id);
  }

  /**
   * Obtiene el límite de lecturas para un tipo de plan
   * @param planType - Tipo de plan
   * @returns Límite de lecturas (-1 para ilimitado)
   */
  async getReadingsLimit(planType: UserPlan): Promise<number> {
    const plan = await this.findByPlanType(planType);
    return plan.readingsLimit;
  }

  /**
   * Obtiene la cuota de IA para un tipo de plan
   * @param planType - Tipo de plan
   * @returns Cuota mensual de IA (-1 para ilimitado)
   */
  async getAiQuota(planType: UserPlan): Promise<number> {
    const plan = await this.findByPlanType(planType);
    return plan.aiQuotaMonthly;
  }

  /**
   * Verifica si un plan tiene una característica habilitada
   * @param planType - Tipo de plan
   * @param feature - Nombre de la característica
   * @returns true si la característica está habilitada
   */
  async hasFeature(
    planType: UserPlan,
    feature: 'allowCustomQuestions' | 'allowSharing' | 'allowAdvancedSpreads',
  ): Promise<boolean> {
    const plan = await this.findByPlanType(planType);
    return plan.hasFeature(feature);
  }
}
