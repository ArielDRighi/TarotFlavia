import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSecurityEventsTable1763378576976
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM types
    await queryRunner.query(`
      CREATE TYPE "security_event_type_enum" AS ENUM (
        'failed_login',
        'successful_login',
        'password_changed',
        'password_reset_requested',
        'password_reset_completed',
        'account_locked',
        'account_unlocked',
        'role_changed',
        'permission_changed',
        'admin_access',
        'rate_limit_violation',
        'suspicious_activity',
        'token_refresh',
        'token_revoked',
        'email_changed',
        'profile_updated'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "security_event_severity_enum" AS ENUM (
        'low',
        'medium',
        'high',
        'critical'
      )
    `);

    // Create security_events table
    await queryRunner.createTable(
      new Table({
        name: 'security_events',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'event_type',
            type: 'security_event_type_enum',
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'severity',
            type: 'security_event_severity_enum',
          },
          {
            name: 'details',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'security_events',
      new TableIndex({
        name: 'IDX_security_events_user_id_created_at',
        columnNames: ['user_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'security_events',
      new TableIndex({
        name: 'IDX_security_events_event_type_created_at',
        columnNames: ['event_type', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'security_events',
      new TableIndex({
        name: 'IDX_security_events_severity_created_at',
        columnNames: ['severity', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'security_events',
      new TableIndex({
        name: 'IDX_security_events_ip_address_created_at',
        columnNames: ['ip_address', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex(
      'security_events',
      'IDX_security_events_ip_address_created_at',
    );
    await queryRunner.dropIndex(
      'security_events',
      'IDX_security_events_severity_created_at',
    );
    await queryRunner.dropIndex(
      'security_events',
      'IDX_security_events_event_type_created_at',
    );
    await queryRunner.dropIndex(
      'security_events',
      'IDX_security_events_user_id_created_at',
    );

    // Drop table
    await queryRunner.dropTable('security_events');

    // Drop ENUM types
    await queryRunner.query('DROP TYPE "security_event_severity_enum"');
    await queryRunner.query('DROP TYPE "security_event_type_enum"');
  }
}
