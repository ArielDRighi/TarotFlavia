import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDailyFreeFieldsToTarotCard1776042159207 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('tarot_card', [
      new TableColumn({
        name: 'dailyFreeUpright',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'dailyFreeReversed',
        type: 'text',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('tarot_card', 'dailyFreeUpright');
    await queryRunner.dropColumn('tarot_card', 'dailyFreeReversed');
  }
}
