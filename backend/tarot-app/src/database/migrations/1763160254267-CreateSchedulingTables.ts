import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateSchedulingTables1763160254267 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create tarotist_availability table
    await queryRunner.createTable(
      new Table({
        name: 'tarotist_availability',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'tarotista_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'day_of_week',
            type: 'int',
            isNullable: false,
            comment: '0=Sunday, 1=Monday, ..., 6=Saturday',
          },
          {
            name: 'start_time',
            type: 'time',
            isNullable: false,
            comment: 'Format: HH:MM',
          },
          {
            name: 'end_time',
            type: 'time',
            isNullable: false,
            comment: 'Format: HH:MM',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create FK for tarotist_availability
    await queryRunner.createForeignKey(
      'tarotist_availability',
      new TableForeignKey({
        columnNames: ['tarotista_id'],
        referencedTableName: 'tarotistas',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create index for availability lookup
    await queryRunner.createIndex(
      'tarotist_availability',
      new TableIndex({
        name: 'idx_tarotista_day',
        columnNames: ['tarotista_id', 'day_of_week'],
      }),
    );

    // 2. Create tarotist_exceptions table
    await queryRunner.createTable(
      new Table({
        name: 'tarotist_exceptions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'tarotista_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'exception_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'exception_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'start_time',
            type: 'time',
            isNullable: true,
          },
          {
            name: 'end_time',
            type: 'time',
            isNullable: true,
          },
          {
            name: 'reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // FKs para tarotist_exceptions
    await queryRunner.createForeignKey(
      'tarotist_exceptions',
      new TableForeignKey({
        columnNames: ['tarotista_id'],
        referencedTableName: 'tarotistas',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create unique index for exception date
    await queryRunner.createIndex(
      'tarotist_exceptions',
      new TableIndex({
        name: 'idx_tarotista_exception_date',
        columnNames: ['tarotista_id', 'exception_date'],
        isUnique: true,
      }),
    );

    // 3. Create sessions table
    await queryRunner.createTable(
      new Table({
        name: 'sessions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'tarotista_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'session_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'session_time',
            type: 'time',
            isNullable: false,
            comment: 'Format: HH:MM',
          },
          {
            name: 'duration_minutes',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'session_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'price_usd',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'payment_status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'google_meet_link',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'user_email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'user_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tarotist_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'cancelled_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'cancellation_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'confirmed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create FKs for sessions
    await queryRunner.createForeignKey(
      'sessions',
      new TableForeignKey({
        columnNames: ['tarotista_id'],
        referencedTableName: 'tarotistas',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'sessions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for sessions
    await queryRunner.createIndex(
      'sessions',
      new TableIndex({
        name: 'idx_tarotista_session_date_time',
        columnNames: ['tarotista_id', 'session_date', 'session_time'],
      }),
    );

    await queryRunner.createIndex(
      'sessions',
      new TableIndex({
        name: 'idx_user_session_date',
        columnNames: ['user_id', 'session_date'],
      }),
    );

    await queryRunner.createIndex(
      'sessions',
      new TableIndex({
        name: 'idx_session_status',
        columnNames: ['status'],
      }),
    );

    // Create generic trigger function for updating updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER trigger_update_sessions_updated_at
      BEFORE UPDATE ON sessions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create trigger for updating updated_at on tarotist_availability
    await queryRunner.query(`
      CREATE TRIGGER trigger_update_availability_updated_at
      BEFORE UPDATE ON tarotist_availability
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trigger_update_availability_updated_at ON tarotist_availability`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trigger_update_sessions_updated_at ON sessions`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_updated_at_column()`,
    );

    // Drop indexes
    await queryRunner.dropIndex('sessions', 'idx_session_status');
    await queryRunner.dropIndex('sessions', 'idx_user_session_date');
    await queryRunner.dropIndex('sessions', 'idx_tarotista_session_date_time');
    await queryRunner.dropIndex(
      'tarotist_exceptions',
      'idx_tarotista_exception_date',
    );
    await queryRunner.dropIndex('tarotist_availability', 'idx_tarotista_day');

    // Drop tables
    await queryRunner.dropTable('sessions', true);
    await queryRunner.dropTable('tarotist_exceptions', true);
    await queryRunner.dropTable('tarotist_availability', true);
  }
}
