import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarotReading } from '../../entities/tarot-reading.entity';
import { User, UserPlan } from '../../../../users/entities/user.entity';
import { PlanConfigService } from '../../../../plan-config/plan-config.service';
import { CategoriesService } from '../../../../categories/categories.service';

@Injectable()
export class ReadingValidatorService {
  private static readonly FREE_ALLOWED_CATEGORY_SLUGS: string[] = [
    'amor',
    'salud',
    'dinero',
  ];

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(TarotReading)
    private readonly readingRepo: Repository<TarotReading>,
    private readonly planConfigService: PlanConfigService,
    private readonly categoriesService: CategoriesService,
  ) {}

  /**
   * Validate that a user exists by their ID.
   *
   * @param userId - The user's unique identifier
   * @returns The user entity if found
   * @throws NotFoundException if user doesn't exist
   */
  async validateUser(userId: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  /**
   * Validate that a user has PREMIUM plan.
   * Users with ANONYMOUS or FREE plans will be rejected.
   *
   * @param userId - The user's unique identifier
   * @returns The user entity if they have PREMIUM plan
   * @throws NotFoundException if user doesn't exist
   * @throws ForbiddenException if user doesn't have PREMIUM plan
   */
  async validateUserIsPremium(userId: number): Promise<User> {
    const user = await this.validateUser(userId);

    if (user.plan !== UserPlan.PREMIUM) {
      throw new ForbiddenException(
        'Solo los usuarios premium pueden realizar esta acción',
      );
    }

    return user;
  }

  /**
   * Validate that a user owns a specific reading.
   * Works for users with any plan (ANONYMOUS, FREE, or PREMIUM).
   *
   * @param readingId - The reading's unique identifier
   * @param userId - The user's unique identifier
   * @param includeDeleted - Whether to include soft-deleted readings
   * @returns The reading entity if owned by the user
   * @throws NotFoundException if reading doesn't exist
   * @throws ForbiddenException if user doesn't own the reading
   * @throws BadRequestException if reading data is corrupted
   */
  async validateReadingOwnership(
    readingId: number,
    userId: number,
    includeDeleted = false,
  ): Promise<TarotReading> {
    const queryBuilder = this.readingRepo
      .createQueryBuilder('reading')
      .leftJoinAndSelect('reading.user', 'user')
      .where('reading.id = :id', { id: readingId });

    if (includeDeleted) {
      queryBuilder.withDeleted();
    }

    const reading = await queryBuilder.getOne();

    if (!reading) {
      throw new NotFoundException(`Reading with ID ${readingId} not found`);
    }

    // BUG FIX: Validate that reading has a user relation loaded
    if (!reading.user) {
      throw new BadRequestException(
        'Reading data is corrupted: missing user relation',
      );
    }

    if (reading.user.id !== userId) {
      throw new ForbiddenException('You do not own this reading');
    }

    return reading;
  }

  /**
   * Validate that a reading is not soft-deleted.
   *
   * @param reading - The reading entity to validate
   * @throws BadRequestException if reading is deleted
   */
  validateReadingNotDeleted(reading: TarotReading): void {
    if (reading.deletedAt) {
      throw new BadRequestException('Reading is deleted');
    }
  }

  /**
   * Validate that a reading is soft-deleted.
   *
   * @param reading - The reading entity to validate
   * @throws BadRequestException if reading is not deleted
   */
  validateReadingDeleted(reading: TarotReading): void {
    if (!reading.deletedAt) {
      throw new BadRequestException('Reading is not deleted');
    }
  }

  /**
   * Validate that a reading hasn't exceeded the maximum regeneration count.
   * Maximum: 3 regenerations per reading (applies to all plans).
   *
   * @param reading - The reading entity to validate
   * @throws HttpException (TOO_MANY_REQUESTS) if maximum regenerations reached
   * @throws BadRequestException if regenerationCount is invalid/corrupted
   */
  validateRegenerationCount(reading: TarotReading): void {
    // BUG FIX: Validate that regenerationCount is a valid number
    if (
      reading.regenerationCount === null ||
      reading.regenerationCount === undefined ||
      typeof reading.regenerationCount !== 'number' ||
      isNaN(reading.regenerationCount)
    ) {
      throw new BadRequestException(
        'Reading data is corrupted: invalid regenerationCount',
      );
    }

    const MAX_REGENERATIONS = 3;
    if (reading.regenerationCount >= MAX_REGENERATIONS) {
      throw new HttpException(
        `Has alcanzado el máximo de regeneraciones (${MAX_REGENERATIONS}) para esta lectura`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /**
   * Validate that the user has not reached their reading limit.
   * Applies only to FREE and ANONYMOUS plans (PREMIUM has no limit).
   * The limit is fetched dynamically from the database configuration.
   *
   * @param totalReadings - Current count of active readings
   * @param userPlan - The user's subscription plan (ANONYMOUS, FREE, or PREMIUM)
   * @throws ForbiddenException if limit is reached
   * @throws BadRequestException if inputs are invalid
   */
  async validateFreeUserReadingsLimit(
    totalReadings: number,
    userPlan: UserPlan,
  ): Promise<void> {
    // BUG FIX: Validate that totalReadings is a valid number
    if (
      totalReadings === null ||
      totalReadings === undefined ||
      typeof totalReadings !== 'number' ||
      isNaN(totalReadings) ||
      totalReadings < 0
    ) {
      throw new BadRequestException(
        'Invalid totalReadings value: must be a non-negative number',
      );
    }

    // BUG FIX: Validate that userPlan is valid
    if (!userPlan || !Object.values(UserPlan).includes(userPlan)) {
      throw new BadRequestException('Invalid user plan');
    }

    // Get limit from database configuration (dynamic)
    const planLimit = await this.planConfigService.getReadingsLimit(userPlan);

    // -1 means unlimited (PREMIUM)
    if (planLimit === -1) {
      return; // No limit for unlimited plans
    }

    // Check if user has reached the limit
    if (totalReadings >= planLimit) {
      throw new ForbiddenException(
        `Los usuarios ${userPlan} están limitados a ${planLimit} lecturas`,
      );
    }
  }

  /**
   * Validate that a user has access to a specific spread based on their plan.
   * Users can only use spreads that match their plan or lower.
   * Plan hierarchy: ANONYMOUS < FREE < PREMIUM
   *
   * @param userPlan - The user's subscription plan
   * @param spreadRequiredPlan - The minimum plan required for the spread
   * @throws ForbiddenException if user doesn't have access to the spread
   */
  validateSpreadAccess(userPlan: UserPlan, spreadRequiredPlan: UserPlan): void {
    // Define plan hierarchy
    const planHierarchy = {
      [UserPlan.ANONYMOUS]: 0,
      [UserPlan.FREE]: 1,
      [UserPlan.PREMIUM]: 2,
    };

    const userPlanLevel = planHierarchy[userPlan];
    const requiredPlanLevel = planHierarchy[spreadRequiredPlan];

    if (userPlanLevel < requiredPlanLevel) {
      const planNames = {
        [UserPlan.ANONYMOUS]: 'anónimo',
        [UserPlan.FREE]: 'gratuito',
        [UserPlan.PREMIUM]: 'premium',
      };

      throw new ForbiddenException(
        `Esta tirada requiere plan ${planNames[spreadRequiredPlan]}. Tu plan actual es ${planNames[userPlan]}`,
      );
    }
  }

  /**
   * Validate that a user has access to a specific reading category.
   * PREMIUM users have access to all categories.
   * FREE and ANONYMOUS users can only access: 'amor', 'salud', 'dinero'.
   *
   * @param userPlan - The user's subscription plan
   * @param categoryId - The ID of the category to validate access for
   * @throws ForbiddenException if user doesn't have access to the category
   * @throws NotFoundException if category doesn't exist (propagated from CategoriesService)
   */
  async validateCategoryAccess(
    userPlan: UserPlan,
    categoryId: number,
  ): Promise<void> {
    // PREMIUM has unrestricted access — no DB call needed
    if (userPlan === UserPlan.PREMIUM) {
      return;
    }

    const category = await this.categoriesService.findOne(categoryId);

    if (
      !ReadingValidatorService.FREE_ALLOWED_CATEGORY_SLUGS.includes(
        category.slug,
      )
    ) {
      const planNames = {
        [UserPlan.ANONYMOUS]: 'anónimo',
        [UserPlan.FREE]: 'gratuito',
        [UserPlan.PREMIUM]: 'premium',
      };

      throw new ForbiddenException(
        `Los usuarios ${planNames[userPlan]} solo pueden acceder a las categorías: ${ReadingValidatorService.FREE_ALLOWED_CATEGORY_SLUGS.join(', ')}`,
      );
    }
  }
}
