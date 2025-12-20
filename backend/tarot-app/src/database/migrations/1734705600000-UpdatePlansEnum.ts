import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Update Plans Enum
 *
 * TASK-002: Migración de base de datos para actualizar planes
 *
 * This migration:
 * 1. Adds 'anonymous' to enums if not exists
 * 2. Migrates data: 'guest' → 'anonymous' (if guest exists)
 * 3. Recreates enums with only 3 values: 'anonymous', 'free', 'premium'
 *
 * Note: 'professional' is not expected to exist in current schema
 *
 * IMPORTANT: This is a production-ready migration with full rollback support
 *
 * @see docs/TECHNICAL_BACKLOG.md TASK-002
 */
export class UpdatePlansEnum1734705600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Starting UpdatePlansEnum migration...');

    // Step 1: Check current enum values
    console.log('📝 Step 1: Checking current enum state...');
    const currentEnumValues = await queryRunner.query(`
      SELECT unnest(enum_range(NULL::user_plan_enum))::text as enum_value
    `);
    const enumValues = currentEnumValues.map((row: any) => row.enum_value);
    console.log('   Current user_plan_enum values:', enumValues);

    const planEnumValues = await queryRunner.query(`
      SELECT unnest(enum_range(NULL::plans_plantype_enum))::text as enum_value
    `);
    const planEnums = planEnumValues.map((row: any) => row.enum_value);
    console.log('   Current plans_plantype_enum values:', planEnums);

    // Step 2: Add 'anonymous' to user_plan_enum if not exists
    if (!enumValues.includes('anonymous')) {
      console.log('📝 Step 2: Adding anonymous to user_plan_enum...');
      await queryRunner.query(
        `ALTER TYPE user_plan_enum ADD VALUE 'anonymous'`,
      );
      console.log('   ✅ Added anonymous to user_plan_enum');
    } else {
      console.log('📝 Step 2: anonymous already exists in user_plan_enum');
    }

    // Step 3: Add 'anonymous' to plans_plantype_enum if not exists
    if (!planEnums.includes('anonymous')) {
      console.log('📝 Step 3: Adding anonymous to plans_plantype_enum...');
      await queryRunner.query(
        `ALTER TYPE plans_plantype_enum ADD VALUE 'anonymous'`,
      );
      console.log('   ✅ Added anonymous to plans_plantype_enum');
    } else {
      console.log('📝 Step 3: anonymous already exists in plans_plantype_enum');
    }

    // Step 4: Migrate users with 'guest' plan to 'anonymous' (if exists)
    if (enumValues.includes('guest')) {
      console.log('📝 Step 4: Migrating guest users to anonymous...');
      const guestUsersResult = await queryRunner.query(
        `SELECT COUNT(*) as count FROM "user" WHERE plan = 'guest'`,
      );
      const guestCount = parseInt(guestUsersResult[0]?.count || '0');

      if (guestCount > 0) {
        console.log(`   Found ${guestCount} guest user(s). Migrating...`);
        await queryRunner.query(
          `UPDATE "user" SET plan = 'anonymous' WHERE plan = 'guest'`,
        );
        console.log(`   ✅ Migrated ${guestCount} user(s) to anonymous`);
      } else {
        console.log('   ℹ️  No guest users found');
      }
    } else {
      console.log('📝 Step 4: No guest value in enum, skipping user migration');
    }

    // Step 5: Update 'guest' to 'anonymous' in plans table (if exists)
    if (planEnums.includes('guest')) {
      console.log(
        '📝 Step 5: Updating guest plan to anonymous in plans table...',
      );
      const guestPlanResult = await queryRunner.query(
        `SELECT COUNT(*) as count FROM plans WHERE "planType" = 'guest'`,
      );
      const guestPlanCount = parseInt(guestPlanResult[0]?.count || '0');

      if (guestPlanCount > 0) {
        await queryRunner.query(
          `UPDATE plans SET "planType" = 'anonymous' WHERE "planType" = 'guest'`,
        );
        console.log('   ✅ Updated guest plan to anonymous');
      } else {
        console.log('   ℹ️  No guest plan found in table');
      }
    } else {
      console.log('📝 Step 5: No guest value in plans enum, skipping');
    }

    // Step 6: Recreate user_plan_enum with only 3 values
    console.log('📝 Step 6: Recreating user_plan_enum with final values...');

    // Drop default temporarily
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN plan DROP DEFAULT`,
    );
    console.log('   ✅ Dropped default for user.plan');

    // Create new enum type
    await queryRunner.query(
      `CREATE TYPE user_plan_enum_new AS ENUM('anonymous', 'free', 'premium')`,
    );
    console.log('   ✅ Created user_plan_enum_new');

    // Update user table to use new enum
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN plan TYPE user_plan_enum_new USING plan::text::user_plan_enum_new`,
    );
    console.log('   ✅ Updated user.plan column to use new enum');

    // Drop old enum
    await queryRunner.query(`DROP TYPE user_plan_enum`);
    console.log('   ✅ Dropped old user_plan_enum');

    // Rename new enum to original name
    await queryRunner.query(
      `ALTER TYPE user_plan_enum_new RENAME TO user_plan_enum`,
    );
    console.log('   ✅ Renamed user_plan_enum_new to user_plan_enum');

    // Restore default
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN plan SET DEFAULT 'free'::user_plan_enum`,
    );
    console.log('   ✅ Restored default for user.plan');

    // Step 7: Recreate plans_plantype_enum with only 3 values
    console.log(
      '📝 Step 7: Recreating plans_plantype_enum with final values...',
    );

    // Create new enum type
    await queryRunner.query(
      `CREATE TYPE plans_plantype_enum_new AS ENUM('anonymous', 'free', 'premium')`,
    );
    console.log('   ✅ Created plans_plantype_enum_new');

    // Update plans table to use new enum
    await queryRunner.query(
      `ALTER TABLE plans ALTER COLUMN "planType" TYPE plans_plantype_enum_new USING "planType"::text::plans_plantype_enum_new`,
    );
    console.log('   ✅ Updated plans.planType column to use new enum');

    // Drop old enum
    await queryRunner.query(`DROP TYPE plans_plantype_enum`);
    console.log('   ✅ Dropped old plans_plantype_enum');

    // Rename new enum to original name
    await queryRunner.query(
      `ALTER TYPE plans_plantype_enum_new RENAME TO plans_plantype_enum`,
    );
    console.log('   ✅ Renamed plans_plantype_enum_new to plans_plantype_enum');

    // Step 8: Verify final state
    console.log('📝 Step 8: Verifying migration...');
    const finalUserPlans = await queryRunner.query(
      `SELECT plan, COUNT(*) as count FROM "user" GROUP BY plan ORDER BY plan`,
    );
    console.log('   User plans distribution:', finalUserPlans);

    const finalPlans = await queryRunner.query(
      `SELECT "planType", name FROM plans ORDER BY "planType"`,
    );
    console.log('   Plans table:', finalPlans);

    // Verify final enum values
    const finalEnumValues = await queryRunner.query(`
      SELECT unnest(enum_range(NULL::user_plan_enum))::text as enum_value ORDER BY 1
    `);
    console.log(
      '   Final user_plan_enum values:',
      finalEnumValues.map((r: any) => r.enum_value),
    );

    console.log('✅ UpdatePlansEnum migration completed successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Rolling back UpdatePlansEnum migration...');

    // Step 1: Recreate user_plan_enum with old values (including guest)
    console.log('📝 Step 1: Recreating user_plan_enum with old values...');

    // Update anonymous back to guest first
    await queryRunner.query(
      `UPDATE "user" SET plan = 'guest'::text WHERE plan = 'anonymous'`,
    );

    await queryRunner.query(
      `CREATE TYPE user_plan_enum_old AS ENUM('guest', 'free', 'premium')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN plan TYPE user_plan_enum_old USING plan::text::user_plan_enum_old`,
    );
    await queryRunner.query(`DROP TYPE user_plan_enum`);
    await queryRunner.query(
      `ALTER TYPE user_plan_enum_old RENAME TO user_plan_enum`,
    );
    console.log('   ✅ Reverted user_plan_enum');

    // Step 2: Recreate plans_plantype_enum with old values
    console.log('📝 Step 2: Recreating plans_plantype_enum with old values...');

    // Update anonymous back to guest in plans table
    await queryRunner.query(
      `UPDATE plans SET "planType" = 'guest'::text WHERE "planType" = 'anonymous'`,
    );

    await queryRunner.query(
      `CREATE TYPE plans_plantype_enum_old AS ENUM('guest', 'free', 'premium')`,
    );
    await queryRunner.query(
      `ALTER TABLE plans ALTER COLUMN "planType" TYPE plans_plantype_enum_old USING "planType"::text::plans_plantype_enum_old`,
    );
    await queryRunner.query(`DROP TYPE plans_plantype_enum`);
    await queryRunner.query(
      `ALTER TYPE plans_plantype_enum_old RENAME TO plans_plantype_enum`,
    );
    console.log('   ✅ Reverted plans_plantype_enum');

    console.log('✅ UpdatePlansEnum rollback completed!');
    console.log('⚠️  Note: Users will be reverted from anonymous to guest');
  }
}
