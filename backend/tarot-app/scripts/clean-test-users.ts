import { NestFactory } from '@nestjs/core';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { User } from '../src/modules/users/entities/user.entity';

// Safety check: Prevent running in production
if (process.env.NODE_ENV === 'production') {
  console.error('❌ ERROR: Cannot run this script in production!');
  console.error(
    '   This script deletes test users and should only run in development/testing.',
  );
  process.exit(1);
}

async function cleanTestUsers() {
  console.log('🧹 Cleaning E2E test users from database...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  try {
    console.log('✅ Connected to database');

    // Keep only users from seed and specific test users
    const keepEmails = [
      'free@test.com',
      'premium@test.com',
      'admin@test.com',
      'flavia@tarotflavia.com',
      'ariel@mail.com',
    ];

    // Find E2E test users to delete
    // Note: Using query builder would be more efficient for large datasets,
    // but find() is acceptable for test databases with limited users
    const allUsers = await userRepository.find();
    const usersToDelete = allUsers.filter((user) => {
      const email = user.email;

      // Skip users we want to keep
      if (keepEmails.includes(email)) {
        return false;
      }

      // Only delete test.com emails (intentional - protects other domains)
      if (!email.endsWith('@test.com')) {
        return false;
      }

      // Check if matches E2E test patterns
      return (
        email.startsWith('mvp-free-') ||
        email.startsWith('mvp-premium-') ||
        /^free-\d+@test\.com$/.test(email) ||
        /^premium-\d+@test\.com$/.test(email) ||
        email.startsWith('password-test')
      );
    });

    console.log(`\n🗑️  Found ${usersToDelete.length} E2E test users to delete`);

    // Delete users
    if (usersToDelete.length > 0) {
      await userRepository.remove(usersToDelete);
      console.log('\n📝 Deleted users:');
      usersToDelete.forEach((user) => {
        console.log(`   ✓ ${user.email} (ID: ${user.id})`);
      });
    } else {
      console.log('   ℹ️  No E2E test users found to delete');
    }

    // Show remaining users (using in-memory filtering for efficiency)
    const deletedUserIds = new Set(usersToDelete.map((u) => u.id));
    const remainingUsers = allUsers
      .filter((user) => !deletedUserIds.has(user.id))
      .sort((a, b) => a.id - b.id);

    console.log(`\n👥 Remaining users (${remainingUsers.length}):`);
    remainingUsers.forEach((user) => {
      console.log(`   ${user.id}. ${user.email} - ${user.name} (${user.plan})`);
    });

    console.log('\n✅ Database cleanup completed!');
  } catch (error) {
    console.error('❌ Error cleaning test users:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void cleanTestUsers();
