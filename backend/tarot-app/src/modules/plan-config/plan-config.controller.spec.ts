import { Test, TestingModule } from '@nestjs/testing';
import { PlanConfigController } from './plan-config.controller';
import { PlanConfigService } from './plan-config.service';
import { UserPlan } from '../users/entities/user.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan } from './entities/plan.entity';

describe('PlanConfigController', () => {
  let controller: PlanConfigController;
  let service: PlanConfigService;

  const mockPlanConfigService = {
    findAll: jest.fn(),
    findByPlanType: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanConfigController],
      providers: [
        {
          provide: PlanConfigService,
          useValue: mockPlanConfigService,
        },
      ],
    }).compile();

    controller = module.get<PlanConfigController>(PlanConfigController);
    service = module.get<PlanConfigService>(PlanConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all plans', async () => {
      const mockPlans = [
        {
          id: 1,
          planType: UserPlan.FREE,
          name: 'Plan Gratuito',
          price: 0,
        } as Plan,
      ];

      mockPlanConfigService.findAll.mockResolvedValue(mockPlans);

      const result = await controller.findAll();

      expect(result).toEqual(mockPlans);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a specific plan', async () => {
      const mockPlan = {
        id: 1,
        planType: UserPlan.FREE,
        name: 'Plan Gratuito',
        price: 0,
      } as Plan;

      mockPlanConfigService.findByPlanType.mockResolvedValue(mockPlan);

      const result = await controller.findOne(UserPlan.FREE);

      expect(result).toEqual(mockPlan);
      expect(service.findByPlanType).toHaveBeenCalledWith(UserPlan.FREE);
    });
  });

  describe('create', () => {
    it('should create a new plan', async () => {
      const createDto: CreatePlanDto = {
        planType: UserPlan.FREE,
        name: 'Plan Gratuito',
        description: 'Plan básico',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
      };

      const mockPlan = {
        id: 1,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Plan;

      mockPlanConfigService.create.mockResolvedValue(mockPlan);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockPlan);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update an existing plan', async () => {
      const updateDto: UpdatePlanDto = {
        name: 'Plan Gratuito Actualizado',
        price: 0,
      };

      const mockPlan = {
        id: 1,
        planType: UserPlan.FREE,
        name: 'Plan Gratuito Actualizado',
        price: 0,
      } as Plan;

      mockPlanConfigService.update.mockResolvedValue(mockPlan);

      const result = await controller.update(UserPlan.FREE, updateDto);

      expect(result).toEqual(mockPlan);
      expect(service.update).toHaveBeenCalledWith(UserPlan.FREE, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a plan', async () => {
      mockPlanConfigService.remove.mockResolvedValue(undefined);

      await controller.remove(UserPlan.PROFESSIONAL);

      expect(service.remove).toHaveBeenCalledWith(UserPlan.PROFESSIONAL);
    });
  });
});
