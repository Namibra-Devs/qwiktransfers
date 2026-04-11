ALTER TABLE "Users" ADD COLUMN "two_factor_secret" VARCHAR(255);
ALTER TABLE "Users" ADD COLUMN "two_factor_enabled" BOOLEAN DEFAULT false;
