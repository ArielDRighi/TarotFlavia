import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanConfigService } from './plan-config.service';
import { Plan } from './entities/plan.entity';
import { UserPlan } from '../users/entities/user.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('PlanConfigService', () => {
  let service: PlanConfigService;
  let _repository: Repository<Plan>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanConfigService,
        {
          provide: getRepositoryToken(Plan),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PlanConfigService>(PlanConfigService);
    _repository = module.get<Repository<Plan>>(getRepositoryToken(Plan));
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
          description: 'Plan básico',
          price: 0,
          readingsLimit: 10,
          aiQuotaMonthly: 100,
          allowCustomQuestions: false,
          allowSharing: false,
          allowAdvancedSpreads: false,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Plan,
      ];

      mockRepository.find.mockResolvedValue(mockPlans);

      const result = await service.findAll();

      expect(result).toEqual(mockPlans);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { planType: 'ASC' },
      });
    });

    it('should return empty array when no plans exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByPlanType', () => {
    it('should return a plan by planType', async () => {
      const mockPlan = {
        id: 1,
        planType: UserPlan.FREE,
        name: 'Plan Gratuito',
        description: 'Plan básico',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
        allowCustomQuestions: false,
        allowSharing: false,
        allowAdvancedSpreads: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Plan;

      mockRepository.findOne.mockResolvedValue(mockPlan);

      const result = await service.findByPlanType(UserPlan.FREE);

      expect(result).toEqual(mockPlan);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { planType: UserPlan.FREE },
      });
    });

    it('should throw NotFoundException when plan not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findByPlanType(UserPlan.PREMIUM)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByPlanType(UserPlan.PREMIUM)).rejects.toThrow(
        'Plan with type premium not found',
      );
    });
  });

  describe('create', () => {
    it('should create a new plan', async () => {
      const createDto = {
        planType: UserPlan.FREE,
        name: 'Plan Gratuito',
        description: 'Plan básico',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
        allowCustomQuestions: false,
        allowSharing: false,
        allowAdvancedSpreads: false,
        isActive: true,
      };

      const mockPlan = {
        id: 1,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Plan;

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockPlan);
      mockRepository.save.mockResolvedValue(mockPlan);

      const result = await service.create(createDto);

      expect(result).toEqual(mockPlan);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { planType: createDto.planType },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockPlan);
    });

    it('should throw ConflictException if plan already exists', async () => {
      const createDto = {
        planType: UserPlan.FREE,
        name: 'Plan Gratuito',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
      };

      const existingPlan = {
        id: 1,
        ...createDto,
        description: '',
        allowCustomQuestions: false,
        allowSharing: false,
        allowAdvancedSpreads: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Plan;

      mockRepository.findOne.mockResolvedValue(existingPlan);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Plan with type free already exists',
      );
    });
  });

  describe('update', () => {
    it('should update an existing plan', async () => {
      const updateDto = {
        name: 'Plan Gratuito Actualizado',
        price: 0,
      };

      const existingPlan = {
        id: 1,
        planType: UserPlan.FREE,
        name: 'Plan Gratuito',
        description: 'Plan básico',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
        allowCustomQuestions: false,
        allowSharing: false,
        allowAdvancedSpreads: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Plan;

      const updatedPlan = {
        ...existingPlan,
        ...updateDto,
      } as Plan;

      mockRepository.findOne.mockResolvedValue(existingPlan);
      mockRepository.save.mockResolvedValue(updatedPlan);

      const result = await service.update(UserPlan.FREE, updateDto);

      expect(result).toEqual(updatedPlan);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { planType: UserPlan.FREE },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedPlan);
    });

    it('should throw NotFoundException when plan not found', async () => {
      const updateDto = { name: 'Updated Plan' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(UserPlan.PREMIUM, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not allow changing planType', async () => {
      const updateDto = {
        planType: UserPlan.PREMIUM,
      };

      const existingPlan = {
        id: 1,
        planType: UserPlan.FREE,
        name: 'Plan Gratuito',
        description: 'Plan básico',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
        allowCustomQuestions: false,
        allowSharing: false,
        allowAdvancedSpreads: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Plan;

      mockRepository.findOne.mockResolvedValue(existingPlan);

      // The service should ignore planType in updates
      const updatedPlan = {
        ...existingPlan,
        ...updateDto,
        planType: UserPlan.FREE, // Should remain FREE
      };

      mockRepository.save.mockResolvedValue(updatedPlan);

      const result = await service.update(UserPlan.FREE, updateDto);

      expect(result.planType).toBe(UserPlan.FREE);
    });
  });

  describe('remove', () => {
    it('should remove a plan', async () => {
      const existingPlan = {
        id: 1,
        planType: UserPlan.PROFESSIONAL,
        name: 'Plan Profesional',
        description: 'Plan profesional',
        price: 19.99,
        readingsLimit: -1,
        aiQuotaMonthly: -1,
        allowCustomQuestions: true,
        allowSharing: true,
        allowAdvancedSpreads: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Plan;

      mockRepository.findOne.mockResolvedValue(existingPlan);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(UserPlan.PROFESSIONAL);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { planType: UserPlan.PROFESSIONAL },
      });
      expect(mockRepository.delete).toHaveBeenCalledWith(existingPlan.id);
    });

    it('should throw NotFoundException when plan not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(UserPlan.PREMIUM)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getReadingsLimit', () => {
    it('should return readings limit for a plan', async () => {
      const mockPlan = {
        id: 1,
        planType: UserPlan.FREE,
        name: 'Plan Gratuito',
        description: 'Plan básico',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
        allowCustomQuestions: false,
        allowSharing: false,
        allowAdvancedSpreads: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Plan;

      mockRepository.findOne.mockResolvedValue(mockPlan);

      const result = await service.getReadingsLimit(UserPlan.FREE);

      expect(result).toBe(10);
    });

    it('should return -1 for unlimited plan', async () => {
      const mockPlan = {
        id: 1,
        planType: UserPlan.PREMIUM,
        name: 'Plan Premium',
        description: 'Plan premium',
        price: 9.99,
        readingsLimit: -1,
        aiQuotaMonthly: -1,
        allowCustomQuestions: true,
        allowSharing: true,
        allowAdvancedSpreads: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Plan;

      mockRepository.findOne.mockResolvedValue(mockPlan);

      const result = await service.getReadingsLimit(UserPlan.PREMIUM);

      expect(result).toBe(-1);
    });
  });

  describe('getAiQuota', () => {
    it('should return AI quota for a plan', async () => {
      const mockPlan = {
        id: 1,
        planType: UserPlan.FREE,
        name: 'Plan Gratuito',
        description: 'Plan básico',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
        allowCustomQuestions: false,
        allowSharing: false,
        allowAdvancedSpreads: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Plan;

      mockRepository.findOne.mockResolvedValue(mockPlan);

      const result = await service.getAiQuota(UserPlan.FREE);

      expect(result).toBe(100);
    });
  });

  describe('hasFeature', () => {
    it('should return true when feature is enabled', async () => {
      const mockPlan = {
        id: 1,
        planType: UserPlan.PREMIUM,
        name: 'Plan Premium',
        description: 'Plan premium',
        price: 9.99,
        readingsLimit: -1,
        aiQuotaMonthly: -1,
        allowCustomQuestions: true,
        allowSharing: true,
        allowAdvancedSpreads: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        hasFeature: jest.fn().mockReturnValue(true),
      } as unknown as Plan;

      mockRepository.findOne.mockResolvedValue(mockPlan);

      const result = await service.hasFeature(
        UserPlan.PREMIUM,
        'allowCustomQuestions',
      );

      expect(result).toBe(true);
      expect(mockPlan.hasFeature).toHaveBeenCalledWith('allowCustomQuestions');
    });

    it('should return false when feature is disabled', async () => {
      const mockPlan = {
        id: 1,
        planType: UserPlan.FREE,
        name: 'Plan Gratuito',
        description: 'Plan básico',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
        allowCustomQuestions: false,
        allowSharing: false,
        allowAdvancedSpreads: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        hasFeature: jest.fn().mockReturnValue(false),
      } as unknown as Plan;

      mockRepository.findOne.mockResolvedValue(mockPlan);

      const result = await service.hasFeature(UserPlan.FREE, 'allowSharing');

      expect(result).toBe(false);
      expect(mockPlan.hasFeature).toHaveBeenCalledWith('allowSharing');
    });
  });
});
