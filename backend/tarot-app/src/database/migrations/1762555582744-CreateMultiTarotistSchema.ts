import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMultiTarotistSchema1762555582744
  implements MigrationInterface
{
  name = 'CreateMultiTarotistSchema1762555582744';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create UserRole enum
    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM('consumer', 'tarotist', 'admin')`,
    );

    // 2. Add roles column to user table
    await queryRunner.query(
      `ALTER TABLE "user" ADD "roles" "user_role_enum"[] NOT NULL DEFAULT '{consumer}'`,
    );

    // 3. Create tarotistas table
    await queryRunner.query(
      `CREATE TABLE "tarotistas" (
        "id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "nombre_publico" character varying(100) NOT NULL,
        "bio" text,
        "foto_perfil" character varying(500),
        "especialidades" text[] NOT NULL DEFAULT '{}',
        "idiomas" text[] NOT NULL DEFAULT '{}',
        "años_experiencia" integer,
        "ofrece_sesiones_virtuales" boolean NOT NULL DEFAULT false,
        "precio_sesion_usd" numeric(10,2),
        "duracion_sesion_minutos" integer,
        "is_active" boolean NOT NULL DEFAULT true,
        "is_accepting_new_clients" boolean NOT NULL DEFAULT true,
        "is_featured" boolean NOT NULL DEFAULT false,
        "comisión_porcentaje" numeric(5,2) NOT NULL DEFAULT '30.00',
        "total_lecturas" integer NOT NULL DEFAULT '0',
        "rating_promedio" numeric(3,2),
        "total_reviews" integer NOT NULL DEFAULT '0',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tarotistas" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tarotistas_user_id" UNIQUE ("user_id"),
        CONSTRAINT "CHK_tarotistas_comision" CHECK ("comisión_porcentaje" >= 0 AND "comisión_porcentaje" <= 100),
        CONSTRAINT "CHK_tarotistas_rating" CHECK ("rating_promedio" >= 0 AND "rating_promedio" <= 5)
      )`,
    );

    // Create indexes for tarotistas
    await queryRunner.query(
      `CREATE INDEX "idx_tarotista_active" ON "tarotistas" ("is_active")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_tarotista_featured" ON "tarotistas" ("is_featured")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_tarotista_rating" ON "tarotistas" ("rating_promedio") WHERE "is_active" = true`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_tarotista_especialidades" ON "tarotistas" USING GIN ("especialidades")`,
    );

    // 4. Create tarotista_config table
    await queryRunner.query(
      `CREATE TABLE "tarotista_config" (
        "id" SERIAL NOT NULL,
        "tarotista_id" integer NOT NULL,
        "system_prompt" text NOT NULL,
        "style_config" jsonb,
        "temperature" numeric(3,2) NOT NULL DEFAULT '0.70',
        "max_tokens" integer NOT NULL DEFAULT '1000',
        "top_p" numeric(3,2) NOT NULL DEFAULT '0.90',
        "custom_keywords" jsonb,
        "additional_instructions" text,
        "version" integer NOT NULL DEFAULT '1',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tarotista_config" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_tarotista_config_temperature" CHECK ("temperature" >= 0 AND "temperature" <= 2),
        CONSTRAINT "CHK_tarotista_config_top_p" CHECK ("top_p" >= 0 AND "top_p" <= 1)
      )`,
    );

    // Create unique partial index for active config
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_tarotista_config_active_unique" 
       ON "tarotista_config"("tarotista_id") 
       WHERE "is_active" = true`,
    );

    // 5. Create tarotista_card_meanings table
    await queryRunner.query(
      `CREATE TABLE "tarotista_card_meanings" (
        "id" SERIAL NOT NULL,
        "tarotista_id" integer NOT NULL,
        "card_id" integer NOT NULL,
        "custom_meaning_upright" text,
        "custom_meaning_reversed" text,
        "custom_keywords" text,
        "custom_description" text,
        "private_notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tarotista_card_meanings" PRIMARY KEY ("id")
      )`,
    );

    // Create unique index for tarotista-card combination
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_tarotista_card_unique" 
       ON "tarotista_card_meanings"("tarotista_id", "card_id")`,
    );

    // 6. Create subscription types and statuses enums
    await queryRunner.query(
      `CREATE TYPE "subscription_type_enum" AS ENUM('favorite', 'premium_individual', 'premium_all_access')`,
    );
    await queryRunner.query(
      `CREATE TYPE "subscription_status_enum" AS ENUM('active', 'cancelled', 'expired')`,
    );

    // 7. Create user_tarotista_subscriptions table
    await queryRunner.query(
      `CREATE TABLE "user_tarotista_subscriptions" (
        "id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "tarotista_id" integer,
        "subscription_type" "subscription_type_enum" NOT NULL,
        "status" "subscription_status_enum" NOT NULL DEFAULT 'active',
        "started_at" TIMESTAMP NOT NULL DEFAULT now(),
        "expires_at" TIMESTAMP,
        "cancelled_at" TIMESTAMP,
        "can_change_at" TIMESTAMP,
        "change_count" integer NOT NULL DEFAULT '0',
        "stripe_subscription_id" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_tarotista_subscriptions" PRIMARY KEY ("id")
      )`,
    );

    // Create unique partial indexes for subscription types
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_user_single_favorite" 
       ON "user_tarotista_subscriptions"("user_id") 
       WHERE "subscription_type" = 'favorite' AND "status" = 'active'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_user_single_premium_individual" 
       ON "user_tarotista_subscriptions"("user_id") 
       WHERE "subscription_type" = 'premium_individual' AND "status" = 'active'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_user_single_premium_all_access" 
       ON "user_tarotista_subscriptions"("user_id") 
       WHERE "subscription_type" = 'premium_all_access' AND "status" = 'active'`,
    );

    // 8. Create tarotista_revenue_metrics table
    await queryRunner.query(
      `CREATE TABLE "tarotista_revenue_metrics" (
        "id" SERIAL NOT NULL,
        "tarotista_id" integer NOT NULL,
        "user_id" integer NOT NULL,
        "reading_id" integer,
        "subscription_type" "subscription_type_enum" NOT NULL,
        "revenue_share_usd" numeric(10,2) NOT NULL,
        "platform_fee_usd" numeric(10,2) NOT NULL,
        "total_revenue_usd" numeric(10,2) NOT NULL,
        "calculation_date" date NOT NULL,
        "period_start" date NOT NULL,
        "period_end" date NOT NULL,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tarotista_revenue_metrics" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_revenue_sum" CHECK ("revenue_share_usd" + "platform_fee_usd" = "total_revenue_usd")
      )`,
    );

    // Create indexes for revenue metrics
    await queryRunner.query(
      `CREATE INDEX "idx_revenue_tarotista_calc_date" 
       ON "tarotista_revenue_metrics"("tarotista_id", "calculation_date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_revenue_tarotista_period" 
       ON "tarotista_revenue_metrics"("tarotista_id", "period_start", "period_end")`,
    );

    // 9. Create tarotista_reviews table
    await queryRunner.query(
      `CREATE TABLE "tarotista_reviews" (
        "id" SERIAL NOT NULL,
        "tarotista_id" integer NOT NULL,
        "user_id" integer NOT NULL,
        "reading_id" integer,
        "rating" integer NOT NULL,
        "comment" text,
        "is_approved" boolean NOT NULL DEFAULT false,
        "is_hidden" boolean NOT NULL DEFAULT false,
        "moderation_notes" text,
        "tarotist_response" text,
        "tarotist_response_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tarotista_reviews" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_review_rating" CHECK ("rating" >= 1 AND "rating" <= 5)
      )`,
    );

    // Create unique index for user-tarotista review
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_review_user_tarotista" 
       ON "tarotista_reviews"("user_id", "tarotista_id")`,
    );

    // 10. Add tarotistaId to existing tables
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" ADD "tarotista_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_limit" ADD "tarotista_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" ADD "tarotista_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "cached_interpretations" ADD "tarotista_id" integer`,
    );

    // 11. Update usage_limit unique index to include tarotistaId
    await queryRunner.query(`DROP INDEX "IDX_usage_limit_user_feature_date"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_usage_limit_user_feature_tarotista_date" 
       ON "usage_limit" ("user_id", "feature", COALESCE("tarotista_id", 0), "date")`,
    );

    // 12. Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "tarotistas" 
       ADD CONSTRAINT "FK_tarotistas_user" 
       FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "tarotista_config" 
       ADD CONSTRAINT "FK_tarotista_config_tarotista" 
       FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "tarotista_card_meanings" 
       ADD CONSTRAINT "FK_tarotista_card_meanings_tarotista" 
       FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "tarotista_card_meanings" 
       ADD CONSTRAINT "FK_tarotista_card_meanings_card" 
       FOREIGN KEY ("card_id") REFERENCES "tarot_card"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" 
       ADD CONSTRAINT "FK_user_tarotista_subscriptions_user" 
       FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" 
       ADD CONSTRAINT "FK_user_tarotista_subscriptions_tarotista" 
       FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" 
       ADD CONSTRAINT "FK_tarotista_revenue_metrics_tarotista" 
       FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" 
       ADD CONSTRAINT "FK_tarotista_revenue_metrics_user" 
       FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" 
       ADD CONSTRAINT "FK_tarotista_revenue_metrics_reading" 
       FOREIGN KEY ("reading_id") REFERENCES "tarot_reading"("id") ON DELETE SET NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" 
       ADD CONSTRAINT "FK_tarotista_reviews_tarotista" 
       FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" 
       ADD CONSTRAINT "FK_tarotista_reviews_user" 
       FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" 
       ADD CONSTRAINT "FK_tarotista_reviews_reading" 
       FOREIGN KEY ("reading_id") REFERENCES "tarot_reading"("id") ON DELETE SET NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "tarot_reading" 
       ADD CONSTRAINT "FK_tarot_reading_tarotista" 
       FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE SET NULL`,
    );

    // 13. Create trigger function for updating updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // 14. Create triggers for updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_tarotistas_updated_at 
      BEFORE UPDATE ON tarotistas 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_tarotista_config_updated_at 
      BEFORE UPDATE ON tarotista_config 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_tarotista_card_meanings_updated_at 
      BEFORE UPDATE ON tarotista_card_meanings 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_user_tarotista_subscriptions_updated_at 
      BEFORE UPDATE ON user_tarotista_subscriptions 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_tarotista_reviews_updated_at 
      BEFORE UPDATE ON tarotista_reviews 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers first
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_tarotista_reviews_updated_at ON tarotista_reviews`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_user_tarotista_subscriptions_updated_at ON user_tarotista_subscriptions`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_tarotista_card_meanings_updated_at ON tarotista_card_meanings`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_tarotista_config_updated_at ON tarotista_config`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_tarotistas_updated_at ON tarotistas`,
    );

    // Drop trigger function
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_updated_at_column()`,
    );

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" DROP CONSTRAINT IF EXISTS "FK_tarot_reading_tarotista"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" DROP CONSTRAINT IF EXISTS "FK_tarotista_reviews_reading"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" DROP CONSTRAINT IF EXISTS "FK_tarotista_reviews_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" DROP CONSTRAINT IF EXISTS "FK_tarotista_reviews_tarotista"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" DROP CONSTRAINT IF EXISTS "FK_tarotista_revenue_metrics_reading"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" DROP CONSTRAINT IF EXISTS "FK_tarotista_revenue_metrics_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" DROP CONSTRAINT IF EXISTS "FK_tarotista_revenue_metrics_tarotista"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" DROP CONSTRAINT IF EXISTS "FK_user_tarotista_subscriptions_tarotista"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" DROP CONSTRAINT IF EXISTS "FK_user_tarotista_subscriptions_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_card_meanings" DROP CONSTRAINT IF EXISTS "FK_tarotista_card_meanings_card"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_card_meanings" DROP CONSTRAINT IF EXISTS "FK_tarotista_card_meanings_tarotista"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" DROP CONSTRAINT IF EXISTS "FK_tarotista_config_tarotista"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotistas" DROP CONSTRAINT IF EXISTS "FK_tarotistas_user"`,
    );

    // Restore usage_limit unique index
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_usage_limit_user_feature_tarotista_date"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_usage_limit_user_feature_date" 
       ON "usage_limit" ("user_id", "feature", "date")`,
    );

    // Remove tarotistaId columns from existing tables
    await queryRunner.query(
      `ALTER TABLE "cached_interpretations" DROP COLUMN IF EXISTS "tarotista_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" DROP COLUMN IF EXISTS "tarotista_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_limit" DROP COLUMN IF EXISTS "tarotista_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" DROP COLUMN IF EXISTS "tarotista_id"`,
    );

    // Drop tables in reverse dependency order
    await queryRunner.query(`DROP TABLE IF EXISTS "tarotista_reviews"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tarotista_revenue_metrics"`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "user_tarotista_subscriptions"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "tarotista_card_meanings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tarotista_config"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tarotistas"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "subscription_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "subscription_type_enum"`);

    // Remove roles column from user table
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "roles"`);

    // Drop UserRole enum
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}
