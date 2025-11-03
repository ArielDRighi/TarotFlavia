import { Repository } from 'typeorm';
import { User, UserPlan } from '../../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

/**
 * Seed Users - Test Users for Development and E2E Testing
 *
 * Creates test users with different subscription tiers:
 * - FREE user: Basic access with limits
 * - PREMIUM user: Full access with custom questions
 * - ADMIN user: Administrative access
 *
 * Features:
 * - Idempotent: Can be run multiple times without duplicating data
 * - Pre-hashed passwords for security
 * - Clear test credentials for development
 *
 * IMPORTANT: These users are for DEVELOPMENT/TESTING only.
 * Remove or disable in production!
 */
export async function seedUsers(
  userRepository: Repository<User>,
): Promise<void> {
  console.log('👥 Starting Users seeding process...');

  // Check if users already exist (idempotency)
  const existingUsersCount = await userRepository.count();
  if (existingUsersCount > 0) {
    console.log(
      `✅ Users already seeded (found ${existingUsersCount} user(s)). Skipping...`,
    );
    return;
  }

  // Hash password once for all test users (Test123456!)
  const hashedPassword = await bcrypt.hash('Test123456!', 10);

  // Test users data
  const testUsers = [
    {
      email: 'free@test.com',
      name: 'Free Test User',
      password: hashedPassword,
      plan: UserPlan.FREE,
      isAdmin: false,
    },
    {
      email: 'premium@test.com',
      name: 'Premium Test User',
      password: hashedPassword,
      plan: UserPlan.PREMIUM,
      isAdmin: false,
    },
    {
      email: 'admin@test.com',
      name: 'Admin Test User',
      password: hashedPassword,
      plan: UserPlan.PREMIUM, // Admin tiene acceso premium
      isAdmin: true,
    },
  ];

  console.log('💾 Creating test users...');

  for (const userData of testUsers) {
    const user = userRepository.create(userData);
    await userRepository.save(user);
    console.log(`   ✓ Created: ${userData.email} (${userData.plan}`);
  }

  console.log('✅ Successfully seeded test users!');
  console.log('');
  console.log('📋 Test Credentials:');
  console.log('   FREE User:');
  console.log('      Email: free@test.com');
  console.log('      Password: Test123456!');
  console.log('');
  console.log('   PREMIUM User:');
  console.log('      Email: premium@test.com');
  console.log('      Password: Test123456!');
  console.log('');
  console.log('   ADMIN User:');
  console.log('      Email: admin@test.com');
  console.log('      Password: Test123456!');
  console.log('');
  console.log('⚠️  WARNING: These are TEST users. Remove in production!');
}
