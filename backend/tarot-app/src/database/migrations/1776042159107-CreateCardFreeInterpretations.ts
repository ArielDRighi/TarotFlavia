import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCardFreeInterpretations1776042159107 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'card_free_interpretation',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'cardId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'categoryId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'orientation',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        uniques: [
          {
            name: 'UQ_card_free_interpretation_card_category_orientation',
            columnNames: ['cardId', 'categoryId', 'orientation'],
          },
        ],
        indices: [
          {
            name: 'IDX_card_free_interpretation_cardId',
            columnNames: ['cardId'],
          },
          {
            name: 'IDX_card_free_interpretation_categoryId',
            columnNames: ['categoryId'],
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'card_free_interpretation',
      new TableForeignKey({
        name: 'FK_card_free_interpretation_card',
        columnNames: ['cardId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tarot_card',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'card_free_interpretation',
      new TableForeignKey({
        name: 'FK_card_free_interpretation_category',
        columnNames: ['categoryId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'reading_category',
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'card_free_interpretation',
      'FK_card_free_interpretation_category',
    );
    await queryRunner.dropForeignKey(
      'card_free_interpretation',
      'FK_card_free_interpretation_card',
    );
    await queryRunner.dropIndex(
      'card_free_interpretation',
      'IDX_card_free_interpretation_categoryId',
    );
    await queryRunner.dropIndex(
      'card_free_interpretation',
      'IDX_card_free_interpretation_cardId',
    );
    await queryRunner.dropTable('card_free_interpretation');
  }
}
