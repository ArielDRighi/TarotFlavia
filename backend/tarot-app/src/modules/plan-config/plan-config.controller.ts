import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PlanConfigService } from './plan-config.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan } from './entities/plan.entity';
import { UserPlan } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/infrastructure/guards/admin.guard';

@ApiTags('plan-config')
@Controller('plan-config')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class PlanConfigController {
  constructor(private readonly planConfigService: PlanConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los planes configurados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de planes',
    type: [Plan],
  })
  async findAll(): Promise<Plan[]> {
    return this.planConfigService.findAll();
  }

  @Get(':planType')
  @ApiOperation({ summary: 'Obtener un plan específico por tipo' })
  @ApiResponse({
    status: 200,
    description: 'Plan encontrado',
    type: Plan,
  })
  @ApiResponse({
    status: 404,
    description: 'Plan no encontrado',
  })
  async findOne(@Param('planType') planType: UserPlan): Promise<Plan> {
    return this.planConfigService.findByPlanType(planType);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo plan' })
  @ApiResponse({
    status: 201,
    description: 'Plan creado exitosamente',
    type: Plan,
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un plan con ese tipo',
  })
  async create(@Body() createPlanDto: CreatePlanDto): Promise<Plan> {
    return this.planConfigService.create(createPlanDto);
  }

  @Put(':planType')
  @ApiOperation({ summary: 'Actualizar un plan existente' })
  @ApiResponse({
    status: 200,
    description: 'Plan actualizado exitosamente',
    type: Plan,
  })
  @ApiResponse({
    status: 404,
    description: 'Plan no encontrado',
  })
  async update(
    @Param('planType') planType: UserPlan,
    @Body() updatePlanDto: UpdatePlanDto,
  ): Promise<Plan> {
    return this.planConfigService.update(planType, updatePlanDto);
  }

  @Delete(':planType')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un plan' })
  @ApiResponse({
    status: 204,
    description: 'Plan eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Plan no encontrado',
  })
  async remove(@Param('planType') planType: UserPlan): Promise<void> {
    return this.planConfigService.remove(planType);
  }
}
