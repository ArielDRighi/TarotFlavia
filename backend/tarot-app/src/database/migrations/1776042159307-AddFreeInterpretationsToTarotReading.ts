import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFreeInterpretationsToTarotReading1776042159307 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'tarot_reading',
      new TableColumn({
        name: 'freeInterpretations',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('tarot_reading', 'freeInterpretations');
  }
}
