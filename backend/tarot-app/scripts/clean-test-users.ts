import { NestFactory } from '@nestjs/core';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { User } from '../src/modules/users/entities/user.entity';

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
    const allUsers = await userRepository.find();
    const usersToDelete = allUsers.filter((user) => {
      const email = user.email;
      const isTestEmail = email.endsWith('@test.com');
      const isKeptEmail = keepEmails.includes(email);
      const isE2EPattern =
        email.startsWith('mvp-free-') ||
        email.startsWith('mvp-premium-') ||
        (email.startsWith('free-') && /free-\d+/.test(email)) ||
        (email.startsWith('premium-') && /premium-\d+/.test(email)) ||
        email.startsWith('password-test');

      return isTestEmail && !isKeptEmail && isE2EPattern;
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

    // Show remaining users
    const remainingUsers = await userRepository.find({ order: { id: 'ASC' } });

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
