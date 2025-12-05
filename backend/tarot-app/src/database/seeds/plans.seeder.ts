import { Repository } from 'typeorm';
import { Plan } from '../../modules/plan-config/entities/plan.entity';
import { UserPlan } from '../../modules/users/entities/user.entity';

/**
 * Seed Plans Configuration
 * This seeder populates the database with the initial plan configurations
 *
 * Features:
 * - Idempotent: Can be run multiple times without duplicating data
 * - Creates GUEST, FREE, PREMIUM, and PROFESSIONAL plans
 * - Configures limits and features for each plan
 * - GUEST: For non-registered users (3 readings, no AI, no history)
 * - FREE: For registered users (10 readings, 100 AI requests, save history)
 * - PREMIUM: Paid plan (unlimited, all features)
 * - PROFESSIONAL: For professional tarotists (unlimited + priority support)
 */
export async function seedPlans(
  planRepository: Repository<Plan>,
): Promise<void> {
  console.log('📊 Starting Plans seeding process...');

  // Check if plans already exist (idempotency)
  const existingPlansCount = await planRepository.count();
  if (existingPlansCount > 0) {
    console.log(
      `✅ Plans already seeded (found ${existingPlansCount} plan(s)). Skipping...`,
    );
    return;
  }

  // Define plan configurations
  const plansData = [
    {
      planType: UserPlan.GUEST,
      name: 'Plan Invitado',
      description:
        'Plan para usuarios no registrados con acceso limitado para probar la aplicación',
      price: 0,
      readingsLimit: 3,
      aiQuotaMonthly: 0, // No AI for guests
      allowCustomQuestions: false,
      allowSharing: false,
      allowAdvancedSpreads: false,
      isActive: true,
    },
    {
      planType: UserPlan.FREE,
      name: 'Plan Gratuito',
      description:
        'Plan básico con lecturas limitadas y funcionalidades esenciales para usuarios registrados',
      price: 0,
      readingsLimit: 10,
      aiQuotaMonthly: 100,
      allowCustomQuestions: false,
      allowSharing: false,
      allowAdvancedSpreads: false,
      isActive: true,
    },
    {
      planType: UserPlan.PREMIUM,
      name: 'Plan Premium',
      description:
        'Plan completo con lecturas ilimitadas, preguntas personalizadas y compartir lecturas',
      price: 9.99,
      readingsLimit: -1, // Ilimitado
      aiQuotaMonthly: -1, // Ilimitado
      allowCustomQuestions: true,
      allowSharing: true,
      allowAdvancedSpreads: true,
      isActive: true,
    },
    {
      planType: UserPlan.PROFESSIONAL,
      name: 'Plan Profesional',
      description:
        'Plan para tarotistas profesionales con todas las funcionalidades y soporte prioritario',
      price: 19.99,
      readingsLimit: -1, // Ilimitado
      aiQuotaMonthly: -1, // Ilimitado
      allowCustomQuestions: true,
      allowSharing: true,
      allowAdvancedSpreads: true,
      isActive: true,
    },
  ];

  // Save all plans
  const savedPlans: Plan[] = [];

  for (const planData of plansData) {
    const plan = planRepository.create(planData);

    console.log(`💾 Saving plan: ${plan.name}...`);
    const savedPlan = await planRepository.save(plan);
    savedPlans.push(savedPlan);

    console.log(
      `✅ Successfully seeded plan: ${savedPlan.name} (ID: ${savedPlan.id})`,
    );
    console.log(`   • Type: ${savedPlan.planType}`);
    console.log(`   • Price: $${savedPlan.price}`);
    console.log(
      `   • Readings Limit: ${savedPlan.readingsLimit === -1 ? 'Unlimited' : savedPlan.readingsLimit}`,
    );
    console.log(
      `   • AI Quota: ${savedPlan.aiQuotaMonthly === -1 ? 'Unlimited' : savedPlan.aiQuotaMonthly}`,
    );
    console.log(`   • Custom Questions: ${savedPlan.allowCustomQuestions}`);
    console.log(`   • Sharing: ${savedPlan.allowSharing}`);
    console.log(`   • Advanced Spreads: ${savedPlan.allowAdvancedSpreads}`);
  }

  console.log(
    `\n🎉 Successfully seeded ${savedPlans.length} plan configurations!`,
  );
}
