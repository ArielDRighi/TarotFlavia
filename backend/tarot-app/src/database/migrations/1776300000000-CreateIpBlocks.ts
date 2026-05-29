import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIpBlocks1776300000000 implements MigrationInterface {
  name = 'CreateIpBlocks1776300000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ip_blocks" (
        "id" SERIAL NOT NULL,
        "ip" character varying NOT NULL,
        "blocked_until" TIMESTAMP WITH TIME ZONE NOT NULL,
        "reason" character varying NOT NULL DEFAULT 'Rate limit exceeded',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ip_blocks" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ip_blocks_ip" ON "ip_blocks" ("ip")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ip_blocks_blocked_until" ON "ip_blocks" ("blocked_until")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_ip_blocks_blocked_until"`);
    await queryRunner.query(`DROP INDEX "IDX_ip_blocks_ip"`);
    await queryRunner.query(`DROP TABLE "ip_blocks"`);
  }
}
