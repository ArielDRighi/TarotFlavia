import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserBanAndLastLoginFieldsClean1762973040894
  implements MigrationInterface
{
  name = 'AddUserBanAndLastLoginFieldsClean1762973040894';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add ban and last login columns to user table
    await queryRunner.query(`ALTER TABLE "user" ADD "lastLogin" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "user" ADD "bannedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "banReason" character varying(500)`,
    );

    // Add indexes for frequent search fields
    await queryRunner.query(
      `CREATE INDEX "IDX_user_last_login" ON "user" ("lastLogin") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_banned_at" ON "user" ("bannedAt") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_user_name" ON "user" ("name") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_user_created_at" ON "user" ("createdAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes
    await queryRunner.query(`DROP INDEX "public"."IDX_user_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_name"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_banned_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_last_login"`);

    // Remove columns
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "banReason"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "bannedAt"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastLogin"`);
  }
}
