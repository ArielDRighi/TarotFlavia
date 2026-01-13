import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSpreadFieldsToReading1768268329679 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add spreadId and spreadName columns to tarot_reading table
        await queryRunner.query(`
            ALTER TABLE "tarot_reading" 
            ADD COLUMN "spreadId" integer NULL,
            ADD COLUMN "spreadName" character varying(100) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove spreadId and spreadName columns from tarot_reading table
        await queryRunner.query(`
            ALTER TABLE "tarot_reading" 
            DROP COLUMN "spreadId",
            DROP COLUMN "spreadName"
        `);
    }

}
