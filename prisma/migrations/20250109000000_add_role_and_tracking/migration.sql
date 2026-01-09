-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'installer');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'installer';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "tracking_code" VARCHAR(8);

-- Заполни tracking_code для существующих заказов
UPDATE "orders" SET "tracking_code" = UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)) WHERE "tracking_code" IS NULL;

-- Сделай tracking_code обязательным и уникальным
ALTER TABLE "orders" ALTER COLUMN "tracking_code" SET NOT NULL;
CREATE UNIQUE INDEX "orders_tracking_code_key" ON "orders"("tracking_code");