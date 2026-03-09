import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGuideTarotCategory1772200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "enc_article_category_enum" ADD VALUE IF NOT EXISTS 'guide_tarot'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing enum values directly
    // Manual intervention required for rollback
  }
}
