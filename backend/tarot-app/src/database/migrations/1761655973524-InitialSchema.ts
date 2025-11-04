import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1761655973524 implements MigrationInterface {
  name = 'InitialSchema1761655973524';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tarot_deck" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "imageUrl" character varying NOT NULL, "cardCount" integer NOT NULL DEFAULT '78', "isActive" boolean NOT NULL DEFAULT true, "isDefault" boolean NOT NULL DEFAULT false, "artist" character varying, "yearCreated" integer, "tradition" character varying, "publisher" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f21bce32ef2d1edb6a18d48d15a" UNIQUE ("name"), CONSTRAINT "PK_0eb08f32658736d260d271f65e5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tarot_card" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "number" integer NOT NULL, "category" character varying NOT NULL, "imageUrl" character varying NOT NULL, "reversedImageUrl" character varying, "meaningUpright" text NOT NULL, "meaningReversed" text NOT NULL, "description" text NOT NULL, "keywords" text NOT NULL, "deckId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4644ee36c645c993956a62bf2d2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reading_category" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text NOT NULL, "icon" character varying NOT NULL, "color" character varying NOT NULL, "order" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_reading_category_name" UNIQUE ("name"), CONSTRAINT "UQ_reading_category_slug" UNIQUE ("slug"), CONSTRAINT "PK_reading_category_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "predefined_question" ("id" SERIAL NOT NULL, "category_id" integer NOT NULL, "question_text" character varying(200) NOT NULL, "order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "usage_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_predefined_question_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_predefined_question_category" ON "predefined_question" ("category_id")`,
    );
    await queryRunner.query(
      `CREATE TABLE "tarot_reading" ("id" SERIAL NOT NULL, "question" character varying, "predefinedQuestionId" integer, "customQuestion" character varying(500), "questionType" character varying(20), "cardPositions" jsonb NOT NULL, "interpretation" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "regenerationCount" integer NOT NULL DEFAULT '0', "deletedAt" TIMESTAMP, "userId" integer, "deckId" integer, "categoryId" integer, CONSTRAINT "PK_8f96c960d305aaf75bd688fb2cd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "user_plan_enum" AS ENUM('free', 'premium')`,
    );
    await queryRunner.query(
      `CREATE TYPE "user_subscription_status_enum" AS ENUM('active', 'cancelled', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "name" character varying NOT NULL, "profilePicture" character varying, "isAdmin" boolean NOT NULL DEFAULT false, "plan" "user_plan_enum" NOT NULL DEFAULT 'free', "planStartedAt" TIMESTAMP, "planExpiresAt" TIMESTAMP, "subscriptionStatus" "user_subscription_status_enum", "stripeCustomerId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_user_plan" ON "user" ("plan")`);
    await queryRunner.query(
      `CREATE TYPE "usage_feature_enum" AS ENUM('tarot_reading', 'oracle_query', 'interpretation_regeneration')`,
    );
    await queryRunner.query(
      `CREATE TABLE "usage_limit" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "feature" "usage_feature_enum" NOT NULL, "count" integer NOT NULL DEFAULT '0', "date" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_usage_limit_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_usage_limit_user_feature_date" ON "usage_limit" ("user_id", "feature", "date")`,
    );
    await queryRunner.query(
      `CREATE TABLE "tarot_spread" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "cardCount" integer NOT NULL, "positions" jsonb NOT NULL, "imageUrl" character varying, "difficulty" character varying NOT NULL DEFAULT 'beginner', "isBeginnerFriendly" boolean NOT NULL DEFAULT true, "whenToUse" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_957eb94a9818cae3b346c0b70b1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tarot_interpretation" ("id" SERIAL NOT NULL, "content" text NOT NULL, "aiConfig" jsonb NOT NULL, "modelUsed" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "readingId" integer, CONSTRAINT "PK_c11341a6e30c3a97298c10663ca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tarot_interpretation_reading" ON "tarot_interpretation" ("readingId")`,
    );
    await queryRunner.query(
      `CREATE TABLE "tarot_reading_cards_tarot_card" ("tarotReadingId" integer NOT NULL, "tarotCardId" integer NOT NULL, CONSTRAINT "PK_c353c01874695631a4805fde250" PRIMARY KEY ("tarotReadingId", "tarotCardId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_517895e32a7d9645bd4443b0c3" ON "tarot_reading_cards_tarot_card" ("tarotReadingId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_527004ab3eb18d59af73150b59" ON "tarot_reading_cards_tarot_card" ("tarotCardId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_card" ADD CONSTRAINT "FK_da687700ab6d0ccb2a4f836baa0" FOREIGN KEY ("deckId") REFERENCES "tarot_deck"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" ADD CONSTRAINT "FK_87f71a12295d676cd76d13d2b73" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" ADD CONSTRAINT "FK_906c9f21a4276fc08a570bee56e" FOREIGN KEY ("deckId") REFERENCES "tarot_deck"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "predefined_question" ADD CONSTRAINT "FK_predefined_question_category" FOREIGN KEY ("category_id") REFERENCES "reading_category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" ADD CONSTRAINT "FK_tarot_reading_category" FOREIGN KEY ("categoryId") REFERENCES "reading_category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" ADD CONSTRAINT "FK_tarot_reading_predefined_question" FOREIGN KEY ("predefinedQuestionId") REFERENCES "predefined_question"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretation" ADD CONSTRAINT "FK_b41f049863deb7f13835ba43c79" FOREIGN KEY ("readingId") REFERENCES "tarot_reading"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading_cards_tarot_card" ADD CONSTRAINT "FK_517895e32a7d9645bd4443b0c3d" FOREIGN KEY ("tarotReadingId") REFERENCES "tarot_reading"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading_cards_tarot_card" ADD CONSTRAINT "FK_527004ab3eb18d59af73150b59e" FOREIGN KEY ("tarotCardId") REFERENCES "tarot_card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_limit" ADD CONSTRAINT "FK_usage_limit_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" integer NOT NULL, "token" character varying(500) NOT NULL, "token_hash" character varying(64) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "revoked_at" TIMESTAMP, "ip_address" character varying(45), "user_agent" character varying(500), CONSTRAINT "PK_refresh_tokens_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_token" ON "refresh_tokens" ("token")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_token_hash" ON "refresh_tokens" ("token_hash")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_user_token" ON "refresh_tokens" ("user_id", "token")`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_refresh_tokens_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE "password_reset_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" integer NOT NULL, "token" character varying(64) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "used_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_password_reset_tokens_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_password_reset_tokens_user_id" ON "password_reset_tokens" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_password_reset_tokens_token" ON "password_reset_tokens" ("token")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_password_reset_tokens_expires_at" ON "password_reset_tokens" ("expires_at")`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "FK_password_reset_tokens_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TYPE "ai_provider_enum" AS ENUM('groq', 'deepseek', 'openai', 'gemini')`,
    );
    await queryRunner.query(
      `CREATE TYPE "ai_usage_status_enum" AS ENUM('success', 'error', 'cached')`,
    );
    await queryRunner.query(
      `CREATE TABLE "ai_usage_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" integer, "reading_id" integer, "provider" "ai_provider_enum" NOT NULL, "model_used" character varying(100) NOT NULL, "prompt_tokens" integer NOT NULL DEFAULT '0', "completion_tokens" integer NOT NULL DEFAULT '0', "total_tokens" integer NOT NULL DEFAULT '0', "cost_usd" decimal(10,6) NOT NULL DEFAULT '0', "duration_ms" integer NOT NULL DEFAULT '0', "status" "ai_usage_status_enum" NOT NULL DEFAULT 'success', "error_message" text, "fallback_used" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ai_usage_logs_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ai_usage_logs_user_created" ON "ai_usage_logs" ("user_id", "created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ai_usage_logs_provider_created" ON "ai_usage_logs" ("provider", "created_at")`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "FK_ai_usage_logs_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "FK_ai_usage_logs_reading" FOREIGN KEY ("reading_id") REFERENCES "tarot_reading"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE "cached_interpretations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cache_key" character varying(255) NOT NULL, "spread_id" integer, "card_combination" jsonb NOT NULL, "question_hash" character varying(64) NOT NULL, "interpretation_text" text NOT NULL, "hit_count" integer NOT NULL DEFAULT '0', "last_used_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP NOT NULL, CONSTRAINT "UQ_cached_interpretations_cache_key" UNIQUE ("cache_key"), CONSTRAINT "PK_cached_interpretations_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cached_interpretations_cache_key" ON "cached_interpretations" ("cache_key")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cached_interpretations_expires_at" ON "cached_interpretations" ("expires_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cached_interpretations_hit_count" ON "cached_interpretations" ("hit_count")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cached_interpretations_hit_count"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cached_interpretations_expires_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cached_interpretations_cache_key"`,
    );
    await queryRunner.query(`DROP TABLE "cached_interpretations"`);
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" DROP CONSTRAINT "FK_ai_usage_logs_reading"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" DROP CONSTRAINT "FK_ai_usage_logs_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ai_usage_logs_provider_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ai_usage_logs_user_created"`,
    );
    await queryRunner.query(`DROP TABLE "ai_usage_logs"`);
    await queryRunner.query(`DROP TYPE "ai_usage_status_enum"`);
    await queryRunner.query(`DROP TYPE "ai_provider_enum"`);
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "FK_password_reset_tokens_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_password_reset_tokens_expires_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_password_reset_tokens_token"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_password_reset_tokens_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_refresh_tokens_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_refresh_tokens_user_token"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_refresh_tokens_token_hash"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_refresh_tokens_token"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_refresh_tokens_user_id"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(
      `ALTER TABLE "tarot_reading_cards_tarot_card" DROP CONSTRAINT "FK_527004ab3eb18d59af73150b59e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading_cards_tarot_card" DROP CONSTRAINT "FK_517895e32a7d9645bd4443b0c3d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretation" DROP CONSTRAINT "FK_b41f049863deb7f13835ba43c79"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" DROP CONSTRAINT "FK_tarot_reading_predefined_question"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" DROP CONSTRAINT "FK_tarot_reading_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "predefined_question" DROP CONSTRAINT "FK_predefined_question_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" DROP COLUMN "categoryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" DROP CONSTRAINT "FK_906c9f21a4276fc08a570bee56e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" DROP CONSTRAINT "FK_87f71a12295d676cd76d13d2b73"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_card" DROP CONSTRAINT "FK_da687700ab6d0ccb2a4f836baa0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_527004ab3eb18d59af73150b59"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_517895e32a7d9645bd4443b0c3"`,
    );
    await queryRunner.query(`DROP TABLE "tarot_reading_cards_tarot_card"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tarot_interpretation_reading"`,
    );
    await queryRunner.query(`DROP TABLE "tarot_interpretation"`);
    await queryRunner.query(`DROP TABLE "tarot_spread"`);
    await queryRunner.query(
      `ALTER TABLE "usage_limit" DROP CONSTRAINT "FK_usage_limit_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_usage_limit_user_feature_date"`,
    );
    await queryRunner.query(`DROP TABLE "usage_limit"`);
    await queryRunner.query(`DROP TYPE "usage_feature_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_plan"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "user_subscription_status_enum"`);
    await queryRunner.query(`DROP TYPE "user_plan_enum"`);
    await queryRunner.query(`DROP TABLE "tarot_reading"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_predefined_question_category"`,
    );
    await queryRunner.query(`DROP TABLE "predefined_question"`);
    await queryRunner.query(`DROP TABLE "reading_category"`);
    await queryRunner.query(`DROP TABLE "tarot_card"`);
    await queryRunner.query(`DROP TABLE "tarot_deck"`);
  }
}
