import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePremiumPlanPriceToArs1776100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "plans" SET "price" = 7000 WHERE "planType" = 'premium' AND "price" = 9.99`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "plans" SET "price" = 9.99 WHERE "planType" = 'premium' AND "price" = 7000`,
    );
  }
}
