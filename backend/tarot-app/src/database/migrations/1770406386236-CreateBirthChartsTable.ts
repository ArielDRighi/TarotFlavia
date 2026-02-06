import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBirthChartsTable1770406386236 implements MigrationInterface {
  name = 'CreateBirthChartsTable1770406386236';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" DROP CONSTRAINT "FK_tarot_reading_tarotista"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" DROP CONSTRAINT "FK_tarot_reading_predefined_question"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" DROP CONSTRAINT "FK_tarot_reading_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_limit" DROP CONSTRAINT "FK_usage_limit_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotistas" DROP CONSTRAINT "FK_tarotistas_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" DROP CONSTRAINT "FK_user_tarotista_subscriptions_tarotista"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" DROP CONSTRAINT "FK_user_tarotista_subscriptions_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" DROP CONSTRAINT "FK_tarotista_reviews_reading"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" DROP CONSTRAINT "FK_tarotista_reviews_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" DROP CONSTRAINT "FK_tarotista_reviews_tarotista"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" DROP CONSTRAINT "FK_tarotista_revenue_metrics_reading"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" DROP CONSTRAINT "FK_tarotista_revenue_metrics_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" DROP CONSTRAINT "FK_tarotista_revenue_metrics_tarotista"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" DROP CONSTRAINT "FK_tarotista_config_tarotista"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_card_meanings" DROP CONSTRAINT "FK_tarotista_card_meanings_card"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_card_meanings" DROP CONSTRAINT "FK_tarotista_card_meanings_tarotista"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_applications" DROP CONSTRAINT "FK_tarotista_applications_reviewer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_applications" DROP CONSTRAINT "FK_tarotista_applications_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_readings" DROP CONSTRAINT "FK_daily_readings_card"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_readings" DROP CONSTRAINT "FK_daily_readings_tarotista"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_readings" DROP CONSTRAINT "FK_daily_readings_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sacred_event_notifications" DROP CONSTRAINT "fk_event_notification"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sacred_event_notifications" DROP CONSTRAINT "fk_user_notification"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ritual_steps" DROP CONSTRAINT "fk_step_ritual"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ritual_materials" DROP CONSTRAINT "fk_material_ritual"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_ritual_history" DROP CONSTRAINT "fk_history_ritual"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_ritual_history" DROP CONSTRAINT "fk_history_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "predefined_question" DROP CONSTRAINT "FK_predefined_question_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pendulum_queries" DROP CONSTRAINT "fk_pendulum_query_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "numerology_interpretations" DROP CONSTRAINT "FK_numerology_interpretation_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notifications" DROP CONSTRAINT "fk_notification_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_refresh_tokens_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "FK_password_reset_tokens_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" DROP CONSTRAINT "FK_ai_usage_logs_reading"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" DROP CONSTRAINT "FK_ai_usage_logs_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tarot_reading_user_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tarot_reading_deleted_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tarot_reading_shared_token"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tarot_reading_created_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tarot_reading_question_type"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_user_country"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_plan"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_last_login"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_banned_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_name"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_ai_quota_reset"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_usage_limit_user_feature_tarotista_date"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_anonymous_usage_fingerprint_date_feature"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_anonymous_usage_date"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_single_favorite"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_user_single_premium_individual"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_user_single_premium_all_access"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_review_user_tarotista"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_revenue_tarotista_calc_date"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_revenue_tarotista_period"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_tarotista_config_active_unique"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_tarotista_card_unique"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tarot_interpretation_reading"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_daily_readings_user_date"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_daily_readings_fingerprint_date"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."UQ_daily_readings_user_date_tarotista"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."UQ_daily_readings_fingerprint_date_tarotista"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_security_events_user_id_created_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_security_events_event_type_created_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_security_events_severity_created_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_security_events_ip_address_created_at"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_sacred_event_slug"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_predefined_question_category"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_predefined_question_usage"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_pendulum_query_user"`);
    await queryRunner.query(`DROP INDEX "public"."idx_pendulum_query_created"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_pendulum_query_response"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_interpretation_response_type"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_notification_user_created_at_desc"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_chinese_horoscope_year"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cached_interpretations_cache_key"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cached_interpretations_expires_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cached_interpretations_hit_count"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cache_metrics_date_hour"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_cache_metrics_date"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_refresh_tokens_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_refresh_tokens_token"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_refresh_tokens_token_hash"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_refresh_tokens_user_token"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_password_reset_tokens_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_password_reset_tokens_token"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_password_reset_tokens_expires_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_audit_logs_target_user_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ai_usage_logs_user_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ai_usage_logs_provider_created"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_ai_usage_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ai_usage_provider"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ai_usage_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ai_provider_usage_provider_month"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotistas" DROP CONSTRAINT "CHK_tarotistas_comision"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotistas" DROP CONSTRAINT "CHK_tarotistas_rating"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" DROP CONSTRAINT "CHK_review_rating"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" DROP CONSTRAINT "CHK_revenue_sum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" DROP CONSTRAINT "CHK_tarotista_config_temperature"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" DROP CONSTRAINT "CHK_tarotista_config_top_p"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_readings" DROP CONSTRAINT "CHK_daily_readings_user_or_fingerprint"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_ritual_history" DROP CONSTRAINT "user_ritual_history_rating_check"`,
    );
    await queryRunner.query(
      `CREATE TABLE "birth_charts" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "name" character varying(100) NOT NULL, "birthDate" date NOT NULL, "birthTime" TIME NOT NULL, "birthPlace" character varying(255) NOT NULL, "latitude" numeric(10,6) NOT NULL, "longitude" numeric(10,6) NOT NULL, "timezone" character varying(100) NOT NULL, "chartData" jsonb NOT NULL, "sunSign" character varying(20) NOT NULL, "moonSign" character varying(20) NOT NULL, "ascendantSign" character varying(20) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6adf9d4c56c90eb3ef9c2ec691f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_birth_chart_user_birth" ON "birth_charts" ("userId", "birthDate", "birthTime", "latitude", "longitude") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_birth_chart_user" ON "birth_charts" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_roles_enum" AS ENUM('consumer', 'tarotist', 'admin')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "roles" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "roles" TYPE "public"."user_roles_enum"[] USING "roles"::"text"::"public"."user_roles_enum"[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "roles" SET DEFAULT '{consumer}'`,
    );
    await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."user_subscription_status_enum" RENAME TO "user_subscription_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_subscriptionstatus_enum" AS ENUM('active', 'cancelled', 'expired')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "subscriptionStatus" TYPE "public"."user_subscriptionstatus_enum" USING "subscriptionStatus"::"text"::"public"."user_subscriptionstatus_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_subscription_status_enum_old"`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "user"."timezone" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."countryCode" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."hemisphere" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."latitude" IS NULL`);
    await queryRunner.query(
      `ALTER TYPE "public"."usage_feature_enum" RENAME TO "usage_feature_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."usage_limit_feature_enum" AS ENUM('daily_card', 'tarot_reading', 'oracle_query', 'interpretation_regeneration', 'pendulum_query')`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_limit" ALTER COLUMN "feature" TYPE "public"."usage_limit_feature_enum" USING "feature"::"text"::"public"."usage_limit_feature_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."usage_feature_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "anonymous_usage" DROP COLUMN "feature"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."anonymous_usage_feature_enum" AS ENUM('daily_card', 'tarot_reading', 'oracle_query', 'interpretation_regeneration', 'pendulum_query')`,
    );
    await queryRunner.query(
      `ALTER TABLE "anonymous_usage" ADD "feature" "public"."anonymous_usage_feature_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotistas" ALTER COLUMN "comisión_porcentaje" SET DEFAULT '30'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."subscription_type_enum" RENAME TO "subscription_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_tarotista_subscriptions_subscription_type_enum" AS ENUM('favorite', 'premium_individual', 'premium_all_access')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" ALTER COLUMN "subscription_type" TYPE "public"."user_tarotista_subscriptions_subscription_type_enum" USING "subscription_type"::"text"::"public"."user_tarotista_subscriptions_subscription_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."subscription_type_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."subscription_status_enum" RENAME TO "subscription_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_tarotista_subscriptions_status_enum" AS ENUM('active', 'cancelled', 'expired')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" ALTER COLUMN "status" TYPE "public"."user_tarotista_subscriptions_status_enum" USING "status"::"text"::"public"."user_tarotista_subscriptions_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" ALTER COLUMN "status" SET DEFAULT 'active'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."subscription_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" DROP COLUMN "stripe_subscription_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" ADD "stripe_subscription_id" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."subscription_type_enum" RENAME TO "subscription_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tarotista_revenue_metrics_subscription_type_enum" AS ENUM('favorite', 'premium_individual', 'premium_all_access')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" ALTER COLUMN "subscription_type" TYPE "public"."tarotista_revenue_metrics_subscription_type_enum" USING "subscription_type"::"text"::"public"."tarotista_revenue_metrics_subscription_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."subscription_type_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" ALTER COLUMN "temperature" SET DEFAULT '0.7'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" ALTER COLUMN "top_p" SET DEFAULT '0.9'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_spread" ALTER COLUMN "requiredPlan" SET DEFAULT 'anonymous'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."security_event_type_enum" RENAME TO "security_event_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."security_events_event_type_enum" AS ENUM('failed_login', 'successful_login', 'password_changed', 'password_reset_requested', 'password_reset_completed', 'account_locked', 'account_unlocked', 'role_changed', 'permission_changed', 'admin_access', 'rate_limit_violation', 'suspicious_activity', 'token_refresh', 'token_revoked', 'email_changed', 'profile_updated')`,
    );
    await queryRunner.query(
      `ALTER TABLE "security_events" ALTER COLUMN "event_type" TYPE "public"."security_events_event_type_enum" USING "event_type"::"text"::"public"."security_events_event_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."security_event_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."security_event_severity_enum" RENAME TO "security_event_severity_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."security_events_severity_enum" AS ENUM('low', 'medium', 'high', 'critical')`,
    );
    await queryRunner.query(
      `ALTER TABLE "security_events" ALTER COLUMN "severity" TYPE "public"."security_events_severity_enum" USING "severity"::"text"::"public"."security_events_severity_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."security_event_severity_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "security_events" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotist_exceptions" DROP COLUMN "exception_type"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tarotist_exceptions_exception_type_enum" AS ENUM('blocked', 'custom_hours')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotist_exceptions" ADD "exception_type" "public"."tarotist_exceptions_exception_type_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotist_exceptions" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotist_availability" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotist_availability" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP COLUMN "session_type"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sessions_session_type_enum" AS ENUM('tarot_reading', 'energy_cleaning', 'hebrew_pendulum', 'consultation')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "session_type" "public"."sessions_session_type_enum" NOT NULL`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_session_status"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "status"`);
    await queryRunner.query(
      `CREATE TYPE "public"."sessions_status_enum" AS ENUM('pending', 'confirmed', 'completed', 'cancelled_by_user', 'cancelled_by_tarotist')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "status" "public"."sessions_status_enum" NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP COLUMN "payment_status"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sessions_payment_status_enum" AS ENUM('pending', 'paid', 'refunded')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "payment_status" "public"."sessions_payment_status_enum" NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sacred_events" ADD CONSTRAINT "UQ_ba30192d44125d7620b619cac8f" UNIQUE ("slug")`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."sacred_event_type_enum" RENAME TO "sacred_event_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sacred_events_event_type_enum" AS ENUM('sabbat', 'lunar_phase', 'portal', 'cultural', 'eclipse')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sacred_events" ALTER COLUMN "event_type" TYPE "public"."sacred_events_event_type_enum" USING "event_type"::"text"::"public"."sacred_events_event_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."sacred_event_type_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."sabbat_enum" RENAME TO "sabbat_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sacred_events_sabbat_enum" AS ENUM('samhain', 'yule', 'imbolc', 'ostara', 'beltane', 'litha', 'lammas', 'mabon')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sacred_events" ALTER COLUMN "sabbat" TYPE "public"."sacred_events_sabbat_enum" USING "sabbat"::"text"::"public"."sacred_events_sabbat_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."sabbat_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."lunar_phase_enum" RENAME TO "lunar_phase_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sacred_events_lunar_phase_enum" AS ENUM('new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sacred_events" ALTER COLUMN "lunar_phase" TYPE "public"."sacred_events_lunar_phase_enum" USING "lunar_phase"::"text"::"public"."sacred_events_lunar_phase_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."lunar_phase_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."hemisphere_enum" RENAME TO "hemisphere_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sacred_events_hemisphere_enum" AS ENUM('north', 'south')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sacred_events" ALTER COLUMN "hemisphere" TYPE "public"."sacred_events_hemisphere_enum" USING "hemisphere"::"text"::"public"."sacred_events_hemisphere_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."hemisphere_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."sacred_event_importance_enum" RENAME TO "sacred_event_importance_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sacred_events_importance_enum" AS ENUM('high', 'medium', 'low')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sacred_events" ALTER COLUMN "importance" TYPE "public"."sacred_events_importance_enum" USING "importance"::"text"::"public"."sacred_events_importance_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."sacred_event_importance_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sacred_events" ALTER COLUMN "is_active" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sacred_events" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sacred_events" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sacred_event_notifications" ALTER COLUMN "notified_24h" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sacred_event_notifications" ALTER COLUMN "notified_on_day" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sacred_event_notifications" ALTER COLUMN "dismissed" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sacred_event_notifications" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sacred_event_notifications" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."material_type_enum" RENAME TO "material_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ritual_materials_type_enum" AS ENUM('required', 'optional', 'alternative')`,
    );
    await queryRunner.query(
      `ALTER TABLE "ritual_materials" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "ritual_materials" ALTER COLUMN "type" TYPE "public"."ritual_materials_type_enum" USING "type"::"text"::"public"."ritual_materials_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ritual_materials" ALTER COLUMN "type" SET DEFAULT 'required'`,
    );
    await queryRunner.query(`DROP TYPE "public"."material_type_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "ritual_materials" ALTER COLUMN "type" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ritual_materials" ALTER COLUMN "quantity" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."ritual_category_enum" RENAME TO "ritual_category_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rituals_category_enum" AS ENUM('tarot', 'lunar', 'cleansing', 'meditation', 'protection', 'abundance', 'love', 'healing')`,
    );
    await queryRunner.query(
      `ALTER TABLE "rituals" ALTER COLUMN "category" TYPE "public"."rituals_category_enum" USING "category"::"text"::"public"."rituals_category_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."ritual_category_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."ritual_difficulty_enum" RENAME TO "ritual_difficulty_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rituals_difficulty_enum" AS ENUM('beginner', 'intermediate', 'advanced')`,
    );
    await queryRunner.query(
      `ALTER TABLE "rituals" ALTER COLUMN "difficulty" TYPE "public"."rituals_difficulty_enum" USING "difficulty"::"text"::"public"."rituals_difficulty_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."ritual_difficulty_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."lunar_phase_enum" RENAME TO "lunar_phase_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rituals_best_lunar_phase_enum" AS ENUM('new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent')`,
    );
    await queryRunner.query(
      `ALTER TABLE "rituals" ALTER COLUMN "best_lunar_phase" TYPE "public"."rituals_best_lunar_phase_enum" USING "best_lunar_phase"::"text"::"public"."rituals_best_lunar_phase_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."lunar_phase_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "rituals" ALTER COLUMN "is_active" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rituals" ALTER COLUMN "is_featured" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rituals" ALTER COLUMN "completion_count" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rituals" ALTER COLUMN "view_count" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "rituals" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "rituals" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "rituals" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "rituals" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."lunar_phase_enum" RENAME TO "lunar_phase_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_ritual_history_lunar_phase_enum" AS ENUM('new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_ritual_history" ALTER COLUMN "lunar_phase" TYPE "public"."user_ritual_history_lunar_phase_enum" USING "lunar_phase"::"text"::"public"."user_ritual_history_lunar_phase_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."lunar_phase_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "user_ritual_history" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_ritual_history" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "plans"."readingsLimit" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "plans"."daily_card_limit" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "plans"."tarot_readings_limit" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "plans"."pendulum_daily_limit" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "plans"."pendulum_monthly_limit" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."pendulum_response_enum" RENAME TO "pendulum_response_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pendulum_queries_response_enum" AS ENUM('yes', 'no', 'maybe')`,
    );
    await queryRunner.query(
      `ALTER TABLE "pendulum_queries" ALTER COLUMN "response" TYPE "public"."pendulum_queries_response_enum" USING "response"::"text"::"public"."pendulum_queries_response_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."pendulum_response_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "pendulum_queries" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pendulum_queries" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."pendulum_response_enum" RENAME TO "pendulum_response_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pendulum_interpretations_responsetype_enum" AS ENUM('yes', 'no', 'maybe')`,
    );
    await queryRunner.query(
      `ALTER TABLE "pendulum_interpretations" ALTER COLUMN "responseType" TYPE "public"."pendulum_interpretations_responsetype_enum" USING "responseType"::"text"::"public"."pendulum_interpretations_responsetype_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."pendulum_response_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "pendulum_interpretations" ALTER COLUMN "isActive" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."notification_type_enum" RENAME TO "notification_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_notifications_type_enum" AS ENUM('sacred_event', 'sacred_event_reminder', 'ritual_reminder', 'pattern_insight')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notifications" ALTER COLUMN "type" TYPE "public"."user_notifications_type_enum" USING "type"::"text"::"public"."user_notifications_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notification_type_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "user_notifications" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notifications" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_horoscope_sign_date"`);
    await queryRunner.query(
      `ALTER TYPE "public"."zodiac_sign_enum" RENAME TO "zodiac_sign_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."daily_horoscopes_zodiac_sign_enum" AS ENUM('aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces')`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_horoscopes" ALTER COLUMN "zodiac_sign" TYPE "public"."daily_horoscopes_zodiac_sign_enum" USING "zodiac_sign"::"text"::"public"."daily_horoscopes_zodiac_sign_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."zodiac_sign_enum_old"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_chinese_animal_element_year"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."chinese_zodiac_animal_enum" RENAME TO "chinese_zodiac_animal_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."chinese_horoscopes_animal_enum" AS ENUM('rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig')`,
    );
    await queryRunner.query(
      `ALTER TABLE "chinese_horoscopes" ALTER COLUMN "animal" TYPE "public"."chinese_horoscopes_animal_enum" USING "animal"::"text"::"public"."chinese_horoscopes_animal_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."chinese_zodiac_animal_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."chinese_element_enum" RENAME TO "chinese_element_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."chinese_horoscopes_element_enum" AS ENUM('metal', 'water', 'wood', 'fire', 'earth')`,
    );
    await queryRunner.query(
      `ALTER TABLE "chinese_horoscopes" ALTER COLUMN "element" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "chinese_horoscopes" ALTER COLUMN "element" TYPE "public"."chinese_horoscopes_element_enum" USING "element"::"text"::"public"."chinese_horoscopes_element_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."chinese_element_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."ai_provider_enum" RENAME TO "ai_provider_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ai_usage_logs_provider_enum" AS ENUM('groq', 'deepseek', 'openai', 'gemini')`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" ALTER COLUMN "provider" TYPE "public"."ai_usage_logs_provider_enum" USING "provider"::"text"::"public"."ai_usage_logs_provider_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."ai_provider_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."ai_usage_status_enum" RENAME TO "ai_usage_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ai_usage_logs_status_enum" AS ENUM('success', 'error', 'cached')`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" ALTER COLUMN "status" TYPE "public"."ai_usage_logs_status_enum" USING "status"::"text"::"public"."ai_usage_logs_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" ALTER COLUMN "status" SET DEFAULT 'success'`,
    );
    await queryRunner.query(`DROP TYPE "public"."ai_usage_status_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."ai_provider_enum" RENAME TO "ai_provider_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ai_provider_usage_provider_enum" AS ENUM('groq', 'deepseek', 'openai', 'gemini')`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_provider_usage" ALTER COLUMN "provider" TYPE "public"."ai_provider_usage_provider_enum" USING "provider"::"text"::"public"."ai_provider_usage_provider_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."ai_provider_enum_old"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_7ac7f749c5f170877ee8536a03" ON "anonymous_usage" ("fingerprint", "date", "feature") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_973380431a226501cd9ca22d2b" ON "tarotista_reviews" ("user_id", "tarotista_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c1b00fca91963a0f41d6947ca6" ON "tarotista_revenue_metrics" ("tarotista_id", "period_start", "period_end") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aaca918f0e4e5ea3664592ab8e" ON "tarotista_revenue_metrics" ("tarotista_id", "calculation_date") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ad2fc565b38dda36986762fc9f" ON "tarotista_card_meanings" ("tarotista_id", "card_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_af9b403fc5683943b9377aa514" ON "daily_readings" ("anonymous_fingerprint", "reading_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfad6b38aacd2ea0ed89e619d4" ON "daily_readings" ("user_id", "reading_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e3771c7c360d1df5d7462a4ebc" ON "security_events" ("ip_address", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7567faf52e0f0da34dbab2daf3" ON "security_events" ("severity", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7be8e81bef0d82c4c44a5ea920" ON "security_events" ("event_type", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_87123d25025bb5487c4baf9b46" ON "security_events" ("user_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_session_status" ON "sessions" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_39748578c913d4c905eca9f5e8" ON "predefined_question" ("category_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_notification_user_created" ON "user_notifications" ("user_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_horoscope_sign_date" ON "daily_horoscopes" ("zodiac_sign", "horoscope_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_chinese_year" ON "chinese_horoscopes" ("year") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_chinese_animal_element_year" ON "chinese_horoscopes" ("animal", "element", "year") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_23edd90f9840bc3ff41e740dc2" ON "cached_interpretations" ("cache_key") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fb1d970a40659fd3d45be6941d" ON "cached_interpretations" ("tarotista_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_826530376923f57fce0543f2ff" ON "cached_interpretations" ("tarotista_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0d1bca6826903354623ffed776" ON "cached_interpretations" ("tarotista_id", "spread_id", "question_hash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_355953facfeaac4f131106f178" ON "cache_metrics" ("metric_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_00cd23aaf738d33862c319fb42" ON "cache_metrics" ("metric_date", "metric_hour") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4542dd2f38a61354a040ba9fd5" ON "refresh_tokens" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a7838d2ba25be1342091b6695f" ON "refresh_tokens" ("token_hash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ccc78af11ba25b380c6a78e7f2" ON "refresh_tokens" ("user_id", "token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ab5ed3a03ac523b37364823ee5" ON "audit_logs" ("target_user_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_22a45ceff43f1fa6dc78d6012a" ON "ai_usage_logs" ("provider", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1e5e3365fc6bd49074e5fda3f9" ON "ai_usage_logs" ("user_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5f94f537d3da398d592a26d689" ON "ai_provider_usage" ("provider", "month") `,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotistas" ADD CONSTRAINT "CHK_e4b4adc2911d46a155209c80a2" CHECK ("rating_promedio" >= 0 AND "rating_promedio" <= 5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotistas" ADD CONSTRAINT "CHK_4e517c0a3f30b8d10f2cecfcbe" CHECK ("comisión_porcentaje" >= 0 AND "comisión_porcentaje" <= 100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" ADD CONSTRAINT "CHK_f943cc9f1207f0fdd2812bf503" CHECK ("rating" >= 1 AND "rating" <= 5)`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" ADD CONSTRAINT "CHK_2526263936c06368962b891f9a" CHECK ("revenue_share_usd" + "platform_fee_usd" = "total_revenue_usd")`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" ADD CONSTRAINT "CHK_dd6d8660e33fdabb290f373dde" CHECK ("top_p" >= 0 AND "top_p" <= 1)`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" ADD CONSTRAINT "CHK_c7137479a9739ad4714b8e4daa" CHECK ("temperature" >= 0 AND "temperature" <= 2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" ADD CONSTRAINT "FK_f9be0e8cac3dc2a38a6d2a75d78" FOREIGN KEY ("predefinedQuestionId") REFERENCES "predefined_question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" ADD CONSTRAINT "FK_2c61d048538a585246861e536e9" FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" ADD CONSTRAINT "FK_67f8a6fe854769000309222285b" FOREIGN KEY ("categoryId") REFERENCES "reading_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_limit" ADD CONSTRAINT "FK_a1ae24517bbbb0dc7337a159351" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotistas" ADD CONSTRAINT "FK_b8cc1c7c4873dfd9f0257fcff85" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" ADD CONSTRAINT "FK_3b7c8e9b2f46a7e4a4f3e18dd92" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" ADD CONSTRAINT "FK_f2ff9124ac12aa334aaf3bcc400" FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" ADD CONSTRAINT "FK_e5eb1657757f772a7a40a01c457" FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" ADD CONSTRAINT "FK_76da3eb212eeb40c060b6456275" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" ADD CONSTRAINT "FK_b055df97e5280845a7a93a89aa3" FOREIGN KEY ("reading_id") REFERENCES "tarot_reading"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" ADD CONSTRAINT "FK_c24274bf3657829cba91656901e" FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" ADD CONSTRAINT "FK_c30b3519a115abad9e6322d1e54" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" ADD CONSTRAINT "FK_4c30922358803546839b39264e8" FOREIGN KEY ("reading_id") REFERENCES "tarot_reading"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" ADD CONSTRAINT "FK_c9a1a2f912e5e88c593b344b100" FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_card_meanings" ADD CONSTRAINT "FK_8ef5885c11fcc49f5103a4b4d6e" FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_card_meanings" ADD CONSTRAINT "FK_fdb33a43d2114afb5ce12231637" FOREIGN KEY ("card_id") REFERENCES "tarot_card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_applications" ADD CONSTRAINT "FK_23ce8320cb8e4bb141fdbd14ec9" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_applications" ADD CONSTRAINT "FK_933bd8af07d02ce610a8499d134" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_readings" ADD CONSTRAINT "FK_f138b867aff839616abebd57238" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_readings" ADD CONSTRAINT "FK_5427b68773e7cc999a602f5c14a" FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_readings" ADD CONSTRAINT "FK_1b05f2edf1ad3ee7b4e35ebc2c6" FOREIGN KEY ("card_id") REFERENCES "tarot_card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sacred_event_notifications" ADD CONSTRAINT "FK_e4c551cc24b2ff340c5d6a4a976" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sacred_event_notifications" ADD CONSTRAINT "FK_4bf3479d83b2ebf6be93efbbf3d" FOREIGN KEY ("event_id") REFERENCES "sacred_events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ritual_steps" ADD CONSTRAINT "FK_83ce4fd2fe20669cb830387044f" FOREIGN KEY ("ritual_id") REFERENCES "rituals"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ritual_materials" ADD CONSTRAINT "FK_695fe1db04ea93a8033c2dea506" FOREIGN KEY ("ritual_id") REFERENCES "rituals"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_ritual_history" ADD CONSTRAINT "FK_f5907e0e9fae081d5b5f527912b" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_ritual_history" ADD CONSTRAINT "FK_e088678925cf2e7ab6a311d8d9e" FOREIGN KEY ("ritual_id") REFERENCES "rituals"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "predefined_question" ADD CONSTRAINT "FK_39748578c913d4c905eca9f5e83" FOREIGN KEY ("category_id") REFERENCES "reading_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pendulum_queries" ADD CONSTRAINT "FK_3269ba468147820e8230df51e2d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "numerology_interpretations" ADD CONSTRAINT "FK_e88e5743616eecc84e6e3e0f791" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notifications" ADD CONSTRAINT "FK_ae9b1d1f1fe780ef8e3e7d0c0f6" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "birth_charts" ADD CONSTRAINT "FK_7727043dfc6bc17b0305483a3d2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "FK_52ac39dd8a28730c63aeb428c9c" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "FK_b81535100ed8a29f2184b4e862c" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "FK_9941f8088661ec2d1b0d82953b4" FOREIGN KEY ("reading_id") REFERENCES "tarot_reading"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" DROP CONSTRAINT "FK_9941f8088661ec2d1b0d82953b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" DROP CONSTRAINT "FK_b81535100ed8a29f2184b4e862c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "FK_52ac39dd8a28730c63aeb428c9c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "birth_charts" DROP CONSTRAINT "FK_7727043dfc6bc17b0305483a3d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notifications" DROP CONSTRAINT "FK_ae9b1d1f1fe780ef8e3e7d0c0f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "numerology_interpretations" DROP CONSTRAINT "FK_e88e5743616eecc84e6e3e0f791"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pendulum_queries" DROP CONSTRAINT "FK_3269ba468147820e8230df51e2d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "predefined_question" DROP CONSTRAINT "FK_39748578c913d4c905eca9f5e83"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_ritual_history" DROP CONSTRAINT "FK_e088678925cf2e7ab6a311d8d9e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_ritual_history" DROP CONSTRAINT "FK_f5907e0e9fae081d5b5f527912b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ritual_materials" DROP CONSTRAINT "FK_695fe1db04ea93a8033c2dea506"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ritual_steps" DROP CONSTRAINT "FK_83ce4fd2fe20669cb830387044f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sacred_event_notifications" DROP CONSTRAINT "FK_4bf3479d83b2ebf6be93efbbf3d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sacred_event_notifications" DROP CONSTRAINT "FK_e4c551cc24b2ff340c5d6a4a976"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_readings" DROP CONSTRAINT "FK_1b05f2edf1ad3ee7b4e35ebc2c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_readings" DROP CONSTRAINT "FK_5427b68773e7cc999a602f5c14a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_readings" DROP CONSTRAINT "FK_f138b867aff839616abebd57238"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_applications" DROP CONSTRAINT "FK_933bd8af07d02ce610a8499d134"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_applications" DROP CONSTRAINT "FK_23ce8320cb8e4bb141fdbd14ec9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_card_meanings" DROP CONSTRAINT "FK_fdb33a43d2114afb5ce12231637"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_card_meanings" DROP CONSTRAINT "FK_8ef5885c11fcc49f5103a4b4d6e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" DROP CONSTRAINT "FK_c9a1a2f912e5e88c593b344b100"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" DROP CONSTRAINT "FK_4c30922358803546839b39264e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" DROP CONSTRAINT "FK_c30b3519a115abad9e6322d1e54"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" DROP CONSTRAINT "FK_c24274bf3657829cba91656901e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" DROP CONSTRAINT "FK_b055df97e5280845a7a93a89aa3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" DROP CONSTRAINT "FK_76da3eb212eeb40c060b6456275"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" DROP CONSTRAINT "FK_e5eb1657757f772a7a40a01c457"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" DROP CONSTRAINT "FK_f2ff9124ac12aa334aaf3bcc400"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" DROP CONSTRAINT "FK_3b7c8e9b2f46a7e4a4f3e18dd92"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotistas" DROP CONSTRAINT "FK_b8cc1c7c4873dfd9f0257fcff85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_limit" DROP CONSTRAINT "FK_a1ae24517bbbb0dc7337a159351"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" DROP CONSTRAINT "FK_67f8a6fe854769000309222285b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" DROP CONSTRAINT "FK_2c61d048538a585246861e536e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" DROP CONSTRAINT "FK_f9be0e8cac3dc2a38a6d2a75d78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" DROP CONSTRAINT "CHK_c7137479a9739ad4714b8e4daa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" DROP CONSTRAINT "CHK_dd6d8660e33fdabb290f373dde"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" DROP CONSTRAINT "CHK_2526263936c06368962b891f9a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" DROP CONSTRAINT "CHK_f943cc9f1207f0fdd2812bf503"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotistas" DROP CONSTRAINT "CHK_4e517c0a3f30b8d10f2cecfcbe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotistas" DROP CONSTRAINT "CHK_e4b4adc2911d46a155209c80a2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5f94f537d3da398d592a26d689"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1e5e3365fc6bd49074e5fda3f9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_22a45ceff43f1fa6dc78d6012a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ab5ed3a03ac523b37364823ee5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ccc78af11ba25b380c6a78e7f2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a7838d2ba25be1342091b6695f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4542dd2f38a61354a040ba9fd5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_00cd23aaf738d33862c319fb42"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_355953facfeaac4f131106f178"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0d1bca6826903354623ffed776"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_826530376923f57fce0543f2ff"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fb1d970a40659fd3d45be6941d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_23edd90f9840bc3ff41e740dc2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_chinese_animal_element_year"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_chinese_year"`);
    await queryRunner.query(`DROP INDEX "public"."idx_horoscope_sign_date"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_notification_user_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_39748578c913d4c905eca9f5e8"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_session_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_87123d25025bb5487c4baf9b46"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7be8e81bef0d82c4c44a5ea920"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7567faf52e0f0da34dbab2daf3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e3771c7c360d1df5d7462a4ebc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bfad6b38aacd2ea0ed89e619d4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_af9b403fc5683943b9377aa514"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ad2fc565b38dda36986762fc9f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_aaca918f0e4e5ea3664592ab8e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c1b00fca91963a0f41d6947ca6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_973380431a226501cd9ca22d2b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7ac7f749c5f170877ee8536a03"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ai_provider_enum_old" AS ENUM('deepseek', 'gemini', 'groq', 'openai')`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_provider_usage" ALTER COLUMN "provider" TYPE "public"."ai_provider_enum_old" USING "provider"::"text"::"public"."ai_provider_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."ai_provider_usage_provider_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."ai_provider_enum_old" RENAME TO "ai_provider_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ai_usage_status_enum_old" AS ENUM('cached', 'error', 'success')`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" ALTER COLUMN "status" TYPE "public"."ai_usage_status_enum_old" USING "status"::"text"::"public"."ai_usage_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" ALTER COLUMN "status" SET DEFAULT 'success'`,
    );
    await queryRunner.query(`DROP TYPE "public"."ai_usage_logs_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."ai_usage_status_enum_old" RENAME TO "ai_usage_status_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ai_provider_enum_old" AS ENUM('deepseek', 'gemini', 'groq', 'openai')`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" ALTER COLUMN "provider" TYPE "public"."ai_provider_enum_old" USING "provider"::"text"::"public"."ai_provider_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."ai_usage_logs_provider_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."ai_provider_enum_old" RENAME TO "ai_provider_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."chinese_element_enum_old" AS ENUM('earth', 'fire', 'metal', 'water', 'wood')`,
    );
    await queryRunner.query(
      `ALTER TABLE "chinese_horoscopes" ALTER COLUMN "element" TYPE "public"."chinese_element_enum_old" USING "element"::"text"::"public"."chinese_element_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chinese_horoscopes" ALTER COLUMN "element" SET DEFAULT 'earth'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."chinese_horoscopes_element_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."chinese_element_enum_old" RENAME TO "chinese_element_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."chinese_zodiac_animal_enum_old" AS ENUM('dog', 'dragon', 'goat', 'horse', 'monkey', 'ox', 'pig', 'rabbit', 'rat', 'rooster', 'snake', 'tiger')`,
    );
    await queryRunner.query(
      `ALTER TABLE "chinese_horoscopes" ALTER COLUMN "animal" TYPE "public"."chinese_zodiac_animal_enum_old" USING "animal"::"text"::"public"."chinese_zodiac_animal_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."chinese_horoscopes_animal_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."chinese_zodiac_animal_enum_old" RENAME TO "chinese_zodiac_animal_enum"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_chinese_animal_element_year" ON "chinese_horoscopes" ("animal", "year", "element") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."zodiac_sign_enum_old" AS ENUM('aquarius', 'aries', 'cancer', 'capricorn', 'gemini', 'leo', 'libra', 'pisces', 'sagittarius', 'scorpio', 'taurus', 'virgo')`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_horoscopes" ALTER COLUMN "zodiac_sign" TYPE "public"."zodiac_sign_enum_old" USING "zodiac_sign"::"text"::"public"."zodiac_sign_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."daily_horoscopes_zodiac_sign_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."zodiac_sign_enum_old" RENAME TO "zodiac_sign_enum"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_horoscope_sign_date" ON "daily_horoscopes" ("zodiac_sign", "horoscope_date") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notifications" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notifications" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_type_enum_old" AS ENUM('pattern_insight', 'ritual_reminder', 'sacred_event', 'sacred_event_reminder')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notifications" ALTER COLUMN "type" TYPE "public"."notification_type_enum_old" USING "type"::"text"::"public"."notification_type_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_notifications_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."notification_type_enum_old" RENAME TO "notification_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pendulum_interpretations" ALTER COLUMN "isActive" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pendulum_response_enum_old" AS ENUM('maybe', 'no', 'yes')`,
    );
    await queryRunner.query(
      `ALTER TABLE "pendulum_interpretations" ALTER COLUMN "responseType" TYPE "public"."pendulum_response_enum_old" USING "responseType"::"text"::"public"."pendulum_response_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."pendulum_interpretations_responsetype_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."pendulum_response_enum_old" RENAME TO "pendulum_response_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pendulum_queries" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pendulum_queries" ADD "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pendulum_response_enum_old" AS ENUM('maybe', 'no', 'yes')`,
    );
    await queryRunner.query(
      `ALTER TABLE "pendulum_queries" ALTER COLUMN "response" TYPE "public"."pendulum_response_enum_old" USING "response"::"text"::"public"."pendulum_response_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."pendulum_queries_response_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."pendulum_response_enum_old" RENAME TO "pendulum_response_enum"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "plans"."pendulum_monthly_limit" IS 'Límite mensual de consultas al Péndulo (-1 para ilimitado)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "plans"."pendulum_daily_limit" IS 'Límite diario de consultas al Péndulo (-1 para ilimitado)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "plans"."tarot_readings_limit" IS 'Daily limit for "Tiradas de Tarot" feature (-1 for unlimited)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "plans"."daily_card_limit" IS 'Daily limit for "Carta del Día" feature (-1 for unlimited)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "plans"."readingsLimit" IS 'DEPRECATED: Use daily_card_limit and tarot_readings_limit instead'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_ritual_history" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_ritual_history" ADD "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."lunar_phase_enum_old" AS ENUM('first_quarter', 'full_moon', 'last_quarter', 'new_moon', 'waning_crescent', 'waning_gibbous', 'waxing_crescent', 'waxing_gibbous')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_ritual_history" ALTER COLUMN "lunar_phase" TYPE "public"."lunar_phase_enum_old" USING "lunar_phase"::"text"::"public"."lunar_phase_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_ritual_history_lunar_phase_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."lunar_phase_enum_old" RENAME TO "lunar_phase_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "rituals" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "rituals" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "rituals" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "rituals" ADD "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "rituals" ALTER COLUMN "view_count" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rituals" ALTER COLUMN "completion_count" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rituals" ALTER COLUMN "is_featured" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rituals" ALTER COLUMN "is_active" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."lunar_phase_enum_old" AS ENUM('first_quarter', 'full_moon', 'last_quarter', 'new_moon', 'waning_crescent', 'waning_gibbous', 'waxing_crescent', 'waxing_gibbous')`,
    );
    await queryRunner.query(
      `ALTER TABLE "rituals" ALTER COLUMN "best_lunar_phase" TYPE "public"."lunar_phase_enum_old" USING "best_lunar_phase"::"text"::"public"."lunar_phase_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."rituals_best_lunar_phase_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."lunar_phase_enum_old" RENAME TO "lunar_phase_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ritual_difficulty_enum_old" AS ENUM('advanced', 'beginner', 'intermediate')`,
    );
    await queryRunner.query(
      `ALTER TABLE "rituals" ALTER COLUMN "difficulty" TYPE "public"."ritual_difficulty_enum_old" USING "difficulty"::"text"::"public"."ritual_difficulty_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."rituals_difficulty_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."ritual_difficulty_enum_old" RENAME TO "ritual_difficulty_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ritual_category_enum_old" AS ENUM('abundance', 'cleansing', 'healing', 'love', 'lunar', 'meditation', 'protection', 'tarot')`,
    );
    await queryRunner.query(
      `ALTER TABLE "rituals" ALTER COLUMN "category" TYPE "public"."ritual_category_enum_old" USING "category"::"text"::"public"."ritual_category_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."rituals_category_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."ritual_category_enum_old" RENAME TO "ritual_category_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ritual_materials" ALTER COLUMN "quantity" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ritual_materials" ALTER COLUMN "type" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."material_type_enum_old" AS ENUM('alternative', 'optional', 'required')`,
    );
    await queryRunner.query(
      `ALTER TABLE "ritual_materials" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "ritual_materials" ALTER COLUMN "type" TYPE "public"."material_type_enum_old" USING "type"::"text"::"public"."material_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ritual_materials" ALTER COLUMN "type" SET DEFAULT 'required'`,
    );
    await queryRunner.query(`DROP TYPE "public"."ritual_materials_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."material_type_enum_old" RENAME TO "material_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sacred_event_notifications" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sacred_event_notifications" ADD "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sacred_event_notifications" ALTER COLUMN "dismissed" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sacred_event_notifications" ALTER COLUMN "notified_on_day" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sacred_event_notifications" ALTER COLUMN "notified_24h" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sacred_events" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sacred_events" ADD "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sacred_events" ALTER COLUMN "is_active" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sacred_event_importance_enum_old" AS ENUM('high', 'low', 'medium')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sacred_events" ALTER COLUMN "importance" TYPE "public"."sacred_event_importance_enum_old" USING "importance"::"text"::"public"."sacred_event_importance_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."sacred_events_importance_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."sacred_event_importance_enum_old" RENAME TO "sacred_event_importance_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."hemisphere_enum_old" AS ENUM('north', 'south')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sacred_events" ALTER COLUMN "hemisphere" TYPE "public"."hemisphere_enum_old" USING "hemisphere"::"text"::"public"."hemisphere_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."sacred_events_hemisphere_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."hemisphere_enum_old" RENAME TO "hemisphere_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."lunar_phase_enum_old" AS ENUM('first_quarter', 'full_moon', 'last_quarter', 'new_moon', 'waning_crescent', 'waning_gibbous', 'waxing_crescent', 'waxing_gibbous')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sacred_events" ALTER COLUMN "lunar_phase" TYPE "public"."lunar_phase_enum_old" USING "lunar_phase"::"text"::"public"."lunar_phase_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."sacred_events_lunar_phase_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."lunar_phase_enum_old" RENAME TO "lunar_phase_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sabbat_enum_old" AS ENUM('beltane', 'imbolc', 'lammas', 'litha', 'mabon', 'ostara', 'samhain', 'yule')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sacred_events" ALTER COLUMN "sabbat" TYPE "public"."sabbat_enum_old" USING "sabbat"::"text"::"public"."sabbat_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."sacred_events_sabbat_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."sabbat_enum_old" RENAME TO "sabbat_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sacred_event_type_enum_old" AS ENUM('cultural', 'eclipse', 'lunar_phase', 'portal', 'sabbat')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sacred_events" ALTER COLUMN "event_type" TYPE "public"."sacred_event_type_enum_old" USING "event_type"::"text"::"public"."sacred_event_type_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."sacred_events_event_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."sacred_event_type_enum_old" RENAME TO "sacred_event_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sacred_events" DROP CONSTRAINT "UQ_ba30192d44125d7620b619cac8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP COLUMN "payment_status"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."sessions_payment_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "payment_status" character varying(50) NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."sessions_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "status" character varying(50) NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_session_status" ON "sessions" ("status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP COLUMN "session_type"`,
    );
    await queryRunner.query(`DROP TYPE "public"."sessions_session_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "session_type" character varying(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotist_availability" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotist_availability" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotist_exceptions" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotist_exceptions" DROP COLUMN "exception_type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."tarotist_exceptions_exception_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotist_exceptions" ADD "exception_type" character varying(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "security_events" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."security_event_severity_enum_old" AS ENUM('critical', 'high', 'low', 'medium')`,
    );
    await queryRunner.query(
      `ALTER TABLE "security_events" ALTER COLUMN "severity" TYPE "public"."security_event_severity_enum_old" USING "severity"::"text"::"public"."security_event_severity_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."security_events_severity_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."security_event_severity_enum_old" RENAME TO "security_event_severity_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."security_event_type_enum_old" AS ENUM('account_locked', 'account_unlocked', 'admin_access', 'email_changed', 'failed_login', 'password_changed', 'password_reset_completed', 'password_reset_requested', 'permission_changed', 'profile_updated', 'rate_limit_violation', 'role_changed', 'successful_login', 'suspicious_activity', 'token_refresh', 'token_revoked')`,
    );
    await queryRunner.query(
      `ALTER TABLE "security_events" ALTER COLUMN "event_type" TYPE "public"."security_event_type_enum_old" USING "event_type"::"text"::"public"."security_event_type_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."security_events_event_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."security_event_type_enum_old" RENAME TO "security_event_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_spread" ALTER COLUMN "requiredPlan" SET DEFAULT 'free'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" ALTER COLUMN "top_p" SET DEFAULT 0.90`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" ALTER COLUMN "temperature" SET DEFAULT 0.70`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."subscription_type_enum_old" AS ENUM('favorite', 'premium_all_access', 'premium_individual')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" ALTER COLUMN "subscription_type" TYPE "public"."subscription_type_enum_old" USING "subscription_type"::"text"::"public"."subscription_type_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."tarotista_revenue_metrics_subscription_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."subscription_type_enum_old" RENAME TO "subscription_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" DROP COLUMN "stripe_subscription_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" ADD "stripe_subscription_id" character varying`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."subscription_status_enum_old" AS ENUM('active', 'cancelled', 'expired')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" ALTER COLUMN "status" TYPE "public"."subscription_status_enum_old" USING "status"::"text"::"public"."subscription_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" ALTER COLUMN "status" SET DEFAULT 'active'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_tarotista_subscriptions_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."subscription_status_enum_old" RENAME TO "subscription_status_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."subscription_type_enum_old" AS ENUM('favorite', 'premium_all_access', 'premium_individual')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" ALTER COLUMN "subscription_type" TYPE "public"."subscription_type_enum_old" USING "subscription_type"::"text"::"public"."subscription_type_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_tarotista_subscriptions_subscription_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."subscription_type_enum_old" RENAME TO "subscription_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotistas" ALTER COLUMN "comisión_porcentaje" SET DEFAULT 30.00`,
    );
    await queryRunner.query(
      `ALTER TABLE "anonymous_usage" DROP COLUMN "feature"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."anonymous_usage_feature_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "anonymous_usage" ADD "feature" character varying NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."usage_feature_enum_old" AS ENUM('daily_card', 'interpretation_regeneration', 'oracle_query', 'pendulum_query', 'tarot_reading')`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_limit" ALTER COLUMN "feature" TYPE "public"."usage_feature_enum_old" USING "feature"::"text"::"public"."usage_feature_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."usage_limit_feature_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."usage_feature_enum_old" RENAME TO "usage_feature_enum"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."latitude" IS 'Latitud del usuario para detección automática de hemisferio'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."hemisphere" IS 'Hemisferio geográfico del usuario'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."countryCode" IS 'Código ISO de país del usuario (ISO 3166-1 alpha-2)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."timezone" IS 'Zona horaria del usuario (formato IANA)'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_subscription_status_enum_old" AS ENUM('active', 'cancelled', 'expired')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "subscriptionStatus" TYPE "public"."user_subscription_status_enum_old" USING "subscriptionStatus"::"text"::"public"."user_subscription_status_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_subscriptionstatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_subscription_status_enum_old" RENAME TO "user_subscription_status_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum_old" AS ENUM('admin', 'consumer', 'tarotist')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "roles" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "roles" TYPE "public"."user_role_enum_old"[] USING "roles"::"text"::"public"."user_role_enum_old"[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "roles" SET DEFAULT '{consumer}'`,
    );
    await queryRunner.query(`DROP TYPE "public"."user_roles_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_birth_chart_user"`);
    await queryRunner.query(`DROP INDEX "public"."idx_birth_chart_user_birth"`);
    await queryRunner.query(`DROP TABLE "birth_charts"`);
    await queryRunner.query(
      `ALTER TABLE "user_ritual_history" ADD CONSTRAINT "user_ritual_history_rating_check" CHECK (((rating >= 1) AND (rating <= 5)))`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_readings" ADD CONSTRAINT "CHK_daily_readings_user_or_fingerprint" CHECK ((((user_id IS NOT NULL) AND (anonymous_fingerprint IS NULL)) OR ((user_id IS NULL) AND (anonymous_fingerprint IS NOT NULL))))`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" ADD CONSTRAINT "CHK_tarotista_config_top_p" CHECK (((top_p >= (0)::numeric) AND (top_p <= (1)::numeric)))`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" ADD CONSTRAINT "CHK_tarotista_config_temperature" CHECK (((temperature >= (0)::numeric) AND (temperature <= (2)::numeric)))`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" ADD CONSTRAINT "CHK_revenue_sum" CHECK (((revenue_share_usd + platform_fee_usd) = total_revenue_usd))`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" ADD CONSTRAINT "CHK_review_rating" CHECK (((rating >= 1) AND (rating <= 5)))`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotistas" ADD CONSTRAINT "CHK_tarotistas_rating" CHECK (((rating_promedio >= (0)::numeric) AND (rating_promedio <= (5)::numeric)))`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotistas" ADD CONSTRAINT "CHK_tarotistas_comision" CHECK ((("comisión_porcentaje" >= (0)::numeric) AND ("comisión_porcentaje" <= (100)::numeric)))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ai_provider_usage_provider_month" ON "ai_provider_usage" ("provider", "month") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ai_usage_status" ON "ai_usage_logs" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ai_usage_provider" ON "ai_usage_logs" ("provider") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ai_usage_created_at" ON "ai_usage_logs" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ai_usage_logs_provider_created" ON "ai_usage_logs" ("provider", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ai_usage_logs_user_created" ON "ai_usage_logs" ("user_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_logs_target_user_created" ON "audit_logs" ("target_user_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_password_reset_tokens_expires_at" ON "password_reset_tokens" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_password_reset_tokens_token" ON "password_reset_tokens" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_password_reset_tokens_user_id" ON "password_reset_tokens" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_user_token" ON "refresh_tokens" ("user_id", "token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_token_hash" ON "refresh_tokens" ("token_hash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_token" ON "refresh_tokens" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cache_metrics_date" ON "cache_metrics" ("metric_date") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cache_metrics_date_hour" ON "cache_metrics" ("metric_date", "metric_hour") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cached_interpretations_hit_count" ON "cached_interpretations" ("hit_count") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cached_interpretations_expires_at" ON "cached_interpretations" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cached_interpretations_cache_key" ON "cached_interpretations" ("cache_key") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_chinese_horoscope_year" ON "chinese_horoscopes" ("year") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_notification_user_created_at_desc" ON "user_notifications" ("user_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_interpretation_response_type" ON "pendulum_interpretations" ("responseType") WHERE ("isActive" = true)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pendulum_query_response" ON "pendulum_queries" ("response") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pendulum_query_created" ON "pendulum_queries" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pendulum_query_user" ON "pendulum_queries" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_predefined_question_usage" ON "predefined_question" ("usage_count") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_predefined_question_category" ON "predefined_question" ("category_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_sacred_event_slug" ON "sacred_events" ("slug") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_security_events_ip_address_created_at" ON "security_events" ("ip_address", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_security_events_severity_created_at" ON "security_events" ("severity", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_security_events_event_type_created_at" ON "security_events" ("event_type", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_security_events_user_id_created_at" ON "security_events" ("user_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_daily_readings_fingerprint_date_tarotista" ON "daily_readings" ("tarotista_id", "reading_date", "anonymous_fingerprint") WHERE (anonymous_fingerprint IS NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_daily_readings_user_date_tarotista" ON "daily_readings" ("user_id", "tarotista_id", "reading_date") WHERE (user_id IS NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_daily_readings_fingerprint_date" ON "daily_readings" ("reading_date", "anonymous_fingerprint") WHERE (anonymous_fingerprint IS NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_daily_readings_user_date" ON "daily_readings" ("user_id", "reading_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tarot_interpretation_reading" ON "tarot_interpretation" ("readingId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_tarotista_card_unique" ON "tarotista_card_meanings" ("tarotista_id", "card_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_tarotista_config_active_unique" ON "tarotista_config" ("tarotista_id") WHERE (is_active = true)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_revenue_tarotista_period" ON "tarotista_revenue_metrics" ("tarotista_id", "period_start", "period_end") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_revenue_tarotista_calc_date" ON "tarotista_revenue_metrics" ("tarotista_id", "calculation_date") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_review_user_tarotista" ON "tarotista_reviews" ("tarotista_id", "user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_user_single_premium_all_access" ON "user_tarotista_subscriptions" ("user_id") WHERE ((subscription_type = 'premium_all_access'::subscription_type_enum) AND (status = 'active'::subscription_status_enum))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_user_single_premium_individual" ON "user_tarotista_subscriptions" ("user_id") WHERE ((subscription_type = 'premium_individual'::subscription_type_enum) AND (status = 'active'::subscription_status_enum))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_user_single_favorite" ON "user_tarotista_subscriptions" ("user_id") WHERE ((subscription_type = 'favorite'::subscription_type_enum) AND (status = 'active'::subscription_status_enum))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_anonymous_usage_date" ON "anonymous_usage" ("date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_anonymous_usage_fingerprint_date_feature" ON "anonymous_usage" ("fingerprint", "date", "feature") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_usage_limit_user_feature_tarotista_date" ON "usage_limit" ("user_id", "feature", "date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_ai_quota_reset" ON "user" ("ai_usage_reset_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_created_at" ON "user" ("createdAt") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_user_name" ON "user" ("name") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_user_banned_at" ON "user" ("bannedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_last_login" ON "user" ("lastLogin") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_user_plan" ON "user" ("plan") `);
    await queryRunner.query(
      `CREATE INDEX "idx_user_country" ON "user" ("countryCode") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tarot_reading_question_type" ON "tarot_reading" ("questionType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tarot_reading_created_at" ON "tarot_reading" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tarot_reading_shared_token" ON "tarot_reading" ("sharedToken") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tarot_reading_deleted_at" ON "tarot_reading" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tarot_reading_user_created" ON "tarot_reading" ("createdAt", "userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "FK_ai_usage_logs_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "FK_ai_usage_logs_reading" FOREIGN KEY ("reading_id") REFERENCES "tarot_reading"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "FK_password_reset_tokens_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_refresh_tokens_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notifications" ADD CONSTRAINT "fk_notification_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "numerology_interpretations" ADD CONSTRAINT "FK_numerology_interpretation_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pendulum_queries" ADD CONSTRAINT "fk_pendulum_query_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "predefined_question" ADD CONSTRAINT "FK_predefined_question_category" FOREIGN KEY ("category_id") REFERENCES "reading_category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_ritual_history" ADD CONSTRAINT "fk_history_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_ritual_history" ADD CONSTRAINT "fk_history_ritual" FOREIGN KEY ("ritual_id") REFERENCES "rituals"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ritual_materials" ADD CONSTRAINT "fk_material_ritual" FOREIGN KEY ("ritual_id") REFERENCES "rituals"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ritual_steps" ADD CONSTRAINT "fk_step_ritual" FOREIGN KEY ("ritual_id") REFERENCES "rituals"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sacred_event_notifications" ADD CONSTRAINT "fk_user_notification" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sacred_event_notifications" ADD CONSTRAINT "fk_event_notification" FOREIGN KEY ("event_id") REFERENCES "sacred_events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_readings" ADD CONSTRAINT "FK_daily_readings_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_readings" ADD CONSTRAINT "FK_daily_readings_tarotista" FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_readings" ADD CONSTRAINT "FK_daily_readings_card" FOREIGN KEY ("card_id") REFERENCES "tarot_card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_applications" ADD CONSTRAINT "FK_tarotista_applications_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_applications" ADD CONSTRAINT "FK_tarotista_applications_reviewer" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_card_meanings" ADD CONSTRAINT "FK_tarotista_card_meanings_tarotista" FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_card_meanings" ADD CONSTRAINT "FK_tarotista_card_meanings_card" FOREIGN KEY ("card_id") REFERENCES "tarot_card"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" ADD CONSTRAINT "FK_tarotista_config_tarotista" FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" ADD CONSTRAINT "FK_tarotista_revenue_metrics_tarotista" FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" ADD CONSTRAINT "FK_tarotista_revenue_metrics_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_revenue_metrics" ADD CONSTRAINT "FK_tarotista_revenue_metrics_reading" FOREIGN KEY ("reading_id") REFERENCES "tarot_reading"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" ADD CONSTRAINT "FK_tarotista_reviews_tarotista" FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" ADD CONSTRAINT "FK_tarotista_reviews_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_reviews" ADD CONSTRAINT "FK_tarotista_reviews_reading" FOREIGN KEY ("reading_id") REFERENCES "tarot_reading"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" ADD CONSTRAINT "FK_user_tarotista_subscriptions_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tarotista_subscriptions" ADD CONSTRAINT "FK_user_tarotista_subscriptions_tarotista" FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotistas" ADD CONSTRAINT "FK_tarotistas_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_limit" ADD CONSTRAINT "FK_usage_limit_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" ADD CONSTRAINT "FK_tarot_reading_category" FOREIGN KEY ("categoryId") REFERENCES "reading_category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" ADD CONSTRAINT "FK_tarot_reading_predefined_question" FOREIGN KEY ("predefinedQuestionId") REFERENCES "predefined_question"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" ADD CONSTRAINT "FK_tarot_reading_tarotista" FOREIGN KEY ("tarotista_id") REFERENCES "tarotistas"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
