-- Reconcile live DB with Prisma schema:
-- 1. Add missing `image` column (schema field User.image)
-- 2. Drop stale `password_hash` column (superseded by `password`)
ALTER TABLE "users" ADD COLUMN "image" VARCHAR(191);
ALTER TABLE "users" DROP COLUMN "password_hash";
