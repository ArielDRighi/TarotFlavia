import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import { flaviaUserData } from './data/flavia-user.data';

/**
 * Seeds Flavia user in the database
 * Idempotent: can be run multiple times without creating duplicates
 *
 * @param userRepository - TypeORM repository for User entity
 * @returns userId of the created or existing user
 */
export async function seedFlaviaUser(
  userRepository: Repository<User>,
): Promise<number> {
  console.log('🔍 Checking if Flavia user exists...');

  // Check if user already exists
  const existingUser = await userRepository.findOne({
    where: { email: flaviaUserData.email },
  });

  if (existingUser) {
    console.log(`✅ Flavia user already exists (ID: ${existingUser.id})`);
    return existingUser.id;
  }

  console.log('🌱 Creating Flavia user...');

  // Hash password
  const hashedPassword = await bcrypt.hash('FlaviaSecurePassword2024!', 10);

  // Create user
  const user = userRepository.create({
    email: flaviaUserData.email,
    name: flaviaUserData.name,
    password: hashedPassword,
    roles: flaviaUserData.roles,
    plan: flaviaUserData.plan,
    isAdmin: flaviaUserData.isAdmin,
    planStartedAt: flaviaUserData.planStartedAt,
    subscriptionStatus: flaviaUserData.subscriptionStatus,
    profilePicture: flaviaUserData.profilePicture ?? undefined,
  });

  const savedUser = await userRepository.save(user);

  console.log(`✅ Flavia user created (ID: ${savedUser.id})`);

  return savedUser.id;
}
