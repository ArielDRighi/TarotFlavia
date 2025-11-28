import { Repository } from 'typeorm';
import { seedPlans } from './plans.seeder';
import { Plan } from '../../modules/plan-config/entities/plan.entity';
import { UserPlan } from '../../modules/users/entities/user.entity';

describe('Plans Seeder', () => {
  let planRepository: Repository<Plan>;

  beforeEach(() => {
    planRepository = {
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as Repository<Plan>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should seed all three plans when database is empty', async () => {
    // Mock empty database
    (planRepository.count as jest.Mock).mockResolvedValue(0);

    // Mock create and save
    const mockPlans = [
      {
        id: 1,
        planType: UserPlan.FREE,
        name: 'Plan Gratuito',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
      },
      {
        id: 2,
        planType: UserPlan.PREMIUM,
        name: 'Plan Premium',
        price: 9.99,
        readingsLimit: -1,
        aiQuotaMonthly: -1,
      },
      {
        id: 3,
        planType: UserPlan.PROFESSIONAL,
        name: 'Plan Profesional',
        price: 19.99,
        readingsLimit: -1,
        aiQuotaMonthly: -1,
      },
    ];

    (planRepository.create as jest.Mock).mockImplementation((data) => data);
    (planRepository.save as jest.Mock).mockImplementation((plan) => {
      const index = mockPlans.findIndex((p) => p.planType === plan.planType);
      return Promise.resolve(mockPlans[index]);
    });

    // Spy on console.log
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Execute seeder
    await seedPlans(planRepository);

    // Verify repository methods were called
    expect(planRepository.count).toHaveBeenCalledTimes(1);
    expect(planRepository.create).toHaveBeenCalledTimes(3);
    expect(planRepository.save).toHaveBeenCalledTimes(3);

    // Verify FREE plan was created
    expect(planRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        planType: UserPlan.FREE,
        name: 'Plan Gratuito',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
        allowCustomQuestions: false,
      }),
    );

    // Verify PREMIUM plan was created
    expect(planRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        planType: UserPlan.PREMIUM,
        name: 'Plan Premium',
        price: 9.99,
        readingsLimit: -1,
        aiQuotaMonthly: -1,
        allowCustomQuestions: true,
      }),
    );

    // Verify PROFESSIONAL plan was created
    expect(planRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        planType: UserPlan.PROFESSIONAL,
        name: 'Plan Profesional',
        price: 19.99,
        readingsLimit: -1,
        aiQuotaMonthly: -1,
        allowCustomQuestions: true,
      }),
    );

    // Verify console output
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '📊 Starting Plans seeding process...',
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Successfully seeded plan'),
    );

    consoleLogSpy.mockRestore();
  });

  it('should skip seeding when plans already exist (idempotency)', async () => {
    // Mock existing plans
    (planRepository.count as jest.Mock).mockResolvedValue(3);

    // Spy on console.log
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Execute seeder
    await seedPlans(planRepository);

    // Verify only count was called, no create or save
    expect(planRepository.count).toHaveBeenCalledTimes(1);
    expect(planRepository.create).not.toHaveBeenCalled();
    expect(planRepository.save).not.toHaveBeenCalled();

    // Verify skip message
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Plans already seeded'),
    );

    consoleLogSpy.mockRestore();
  });

  it('should create plans with correct feature flags', async () => {
    (planRepository.count as jest.Mock).mockResolvedValue(0);
    (planRepository.create as jest.Mock).mockImplementation((data) => data);
    (planRepository.save as jest.Mock).mockImplementation((plan) =>
      Promise.resolve({ ...plan, id: 1 }),
    );

    jest.spyOn(console, 'log').mockImplementation();

    await seedPlans(planRepository);

    // Check FREE plan features
    expect(planRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        planType: UserPlan.FREE,
        allowCustomQuestions: false,
        allowSharing: false,
        allowAdvancedSpreads: false,
      }),
    );

    // Check PREMIUM plan features
    expect(planRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        planType: UserPlan.PREMIUM,
        allowCustomQuestions: true,
        allowSharing: true,
        allowAdvancedSpreads: true,
      }),
    );

    // Check PROFESSIONAL plan features
    expect(planRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        planType: UserPlan.PROFESSIONAL,
        allowCustomQuestions: true,
        allowSharing: true,
        allowAdvancedSpreads: true,
      }),
    );
  });
});
