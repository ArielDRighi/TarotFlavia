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
      `CREATE TABLE "tarot_reading" ("id" SERIAL NOT NULL, "question" character varying, "cardPositions" jsonb NOT NULL, "interpretation" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer, "deckId" integer, "categoryId" integer, CONSTRAINT "PK_8f96c960d305aaf75bd688fb2cd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "name" character varying NOT NULL, "profilePicture" character varying, "isAdmin" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tarot_spread" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "cardCount" integer NOT NULL, "positions" jsonb NOT NULL, "imageUrl" character varying, "difficulty" character varying NOT NULL DEFAULT 'beginner', "isBeginnerFriendly" boolean NOT NULL DEFAULT true, "whenToUse" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_957eb94a9818cae3b346c0b70b1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tarot_interpretation" ("id" SERIAL NOT NULL, "content" text NOT NULL, "aiConfig" jsonb NOT NULL, "modelUsed" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "readingId" integer, CONSTRAINT "REL_b41f049863deb7f13835ba43c7" UNIQUE ("readingId"), CONSTRAINT "PK_c11341a6e30c3a97298c10663ca" PRIMARY KEY ("id"))`,
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
      `ALTER TABLE "tarot_reading" ADD CONSTRAINT "FK_tarot_reading_category" FOREIGN KEY ("categoryId") REFERENCES "reading_category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
      `ALTER TABLE "tarot_reading" DROP CONSTRAINT "FK_tarot_reading_category"`,
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
    await queryRunner.query(`DROP TABLE "tarot_interpretation"`);
    await queryRunner.query(`DROP TABLE "tarot_spread"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "tarot_reading"`);
    await queryRunner.query(`DROP TABLE "reading_category"`);
    await queryRunner.query(`DROP TABLE "tarot_card"`);
    await queryRunner.query(`DROP TABLE "tarot_deck"`);
  }
}
