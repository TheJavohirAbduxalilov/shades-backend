-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('new', 'in_progress', 'measured', 'completed');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('installation', 'removal');

-- CreateTable
CREATE TABLE "languages" (
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "preferred_language_code" VARCHAR(10) NOT NULL DEFAULT 'ru',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "client_name" VARCHAR(100) NOT NULL,
    "client_phone" VARCHAR(20) NOT NULL,
    "client_address" VARCHAR(255) NOT NULL,
    "notes" TEXT,
    "visit_date" DATE NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'new',
    "assigned_user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "windows" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shades" (
    "id" SERIAL NOT NULL,
    "window_id" INTEGER NOT NULL,
    "shade_type_id" INTEGER NOT NULL,
    "width" DECIMAL(10,2) NOT NULL,
    "height" DECIMAL(10,2) NOT NULL,
    "material_variant_id" INTEGER NOT NULL,
    "installation_included" BOOLEAN NOT NULL DEFAULT false,
    "removal_included" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shade_options" (
    "id" SERIAL NOT NULL,
    "shade_id" INTEGER NOT NULL,
    "option_type_id" INTEGER NOT NULL,
    "option_value_id" INTEGER NOT NULL,

    CONSTRAINT "shade_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shade_types" (
    "id" SERIAL NOT NULL,
    "min_price" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shade_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shade_type_translations" (
    "id" SERIAL NOT NULL,
    "shade_type_id" INTEGER NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "shade_type_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_types" (
    "id" SERIAL NOT NULL,
    "shade_type_id" INTEGER NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "option_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_type_translations" (
    "id" SERIAL NOT NULL,
    "option_type_id" INTEGER NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "option_type_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_values" (
    "id" SERIAL NOT NULL,
    "option_type_id" INTEGER NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "option_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_value_translations" (
    "id" SERIAL NOT NULL,
    "option_value_id" INTEGER NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "option_value_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_translations" (
    "id" SERIAL NOT NULL,
    "material_id" INTEGER NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "material_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_variants" (
    "id" SERIAL NOT NULL,
    "material_id" INTEGER NOT NULL,
    "color_hex" VARCHAR(7),
    "image_url" VARCHAR(255),
    "price_per_sqm" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "material_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_variant_translations" (
    "id" SERIAL NOT NULL,
    "material_variant_id" INTEGER NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,
    "color_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "material_variant_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shade_type_materials" (
    "shade_type_id" INTEGER NOT NULL,
    "material_id" INTEGER NOT NULL,

    CONSTRAINT "shade_type_materials_pkey" PRIMARY KEY ("shade_type_id","material_id")
);

-- CreateTable
CREATE TABLE "service_prices" (
    "id" SERIAL NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_price_translations" (
    "id" SERIAL NOT NULL,
    "service_price_id" INTEGER NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "service_price_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_translations" (
    "id" SERIAL NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "order_status_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "shade_options_shade_id_option_type_id_key" ON "shade_options"("shade_id", "option_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "shade_type_translations_shade_type_id_language_code_key" ON "shade_type_translations"("shade_type_id", "language_code");

-- CreateIndex
CREATE UNIQUE INDEX "option_type_translations_option_type_id_language_code_key" ON "option_type_translations"("option_type_id", "language_code");

-- CreateIndex
CREATE UNIQUE INDEX "option_value_translations_option_value_id_language_code_key" ON "option_value_translations"("option_value_id", "language_code");

-- CreateIndex
CREATE UNIQUE INDEX "material_translations_material_id_language_code_key" ON "material_translations"("material_id", "language_code");

-- CreateIndex
CREATE UNIQUE INDEX "material_variant_translations_material_variant_id_language__key" ON "material_variant_translations"("material_variant_id", "language_code");

-- CreateIndex
CREATE UNIQUE INDEX "service_prices_service_type_key" ON "service_prices"("service_type");

-- CreateIndex
CREATE UNIQUE INDEX "service_price_translations_service_price_id_language_code_key" ON "service_price_translations"("service_price_id", "language_code");

-- CreateIndex
CREATE UNIQUE INDEX "order_status_translations_status_language_code_key" ON "order_status_translations"("status", "language_code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_preferred_language_code_fkey" FOREIGN KEY ("preferred_language_code") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "windows" ADD CONSTRAINT "windows_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shades" ADD CONSTRAINT "shades_window_id_fkey" FOREIGN KEY ("window_id") REFERENCES "windows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shades" ADD CONSTRAINT "shades_shade_type_id_fkey" FOREIGN KEY ("shade_type_id") REFERENCES "shade_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shades" ADD CONSTRAINT "shades_material_variant_id_fkey" FOREIGN KEY ("material_variant_id") REFERENCES "material_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shade_options" ADD CONSTRAINT "shade_options_shade_id_fkey" FOREIGN KEY ("shade_id") REFERENCES "shades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shade_options" ADD CONSTRAINT "shade_options_option_type_id_fkey" FOREIGN KEY ("option_type_id") REFERENCES "option_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shade_options" ADD CONSTRAINT "shade_options_option_value_id_fkey" FOREIGN KEY ("option_value_id") REFERENCES "option_values"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shade_type_translations" ADD CONSTRAINT "shade_type_translations_shade_type_id_fkey" FOREIGN KEY ("shade_type_id") REFERENCES "shade_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shade_type_translations" ADD CONSTRAINT "shade_type_translations_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option_types" ADD CONSTRAINT "option_types_shade_type_id_fkey" FOREIGN KEY ("shade_type_id") REFERENCES "shade_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option_type_translations" ADD CONSTRAINT "option_type_translations_option_type_id_fkey" FOREIGN KEY ("option_type_id") REFERENCES "option_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option_type_translations" ADD CONSTRAINT "option_type_translations_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option_values" ADD CONSTRAINT "option_values_option_type_id_fkey" FOREIGN KEY ("option_type_id") REFERENCES "option_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option_value_translations" ADD CONSTRAINT "option_value_translations_option_value_id_fkey" FOREIGN KEY ("option_value_id") REFERENCES "option_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option_value_translations" ADD CONSTRAINT "option_value_translations_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_translations" ADD CONSTRAINT "material_translations_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_translations" ADD CONSTRAINT "material_translations_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_variants" ADD CONSTRAINT "material_variants_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_variant_translations" ADD CONSTRAINT "material_variant_translations_material_variant_id_fkey" FOREIGN KEY ("material_variant_id") REFERENCES "material_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_variant_translations" ADD CONSTRAINT "material_variant_translations_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shade_type_materials" ADD CONSTRAINT "shade_type_materials_shade_type_id_fkey" FOREIGN KEY ("shade_type_id") REFERENCES "shade_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shade_type_materials" ADD CONSTRAINT "shade_type_materials_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_price_translations" ADD CONSTRAINT "service_price_translations_service_price_id_fkey" FOREIGN KEY ("service_price_id") REFERENCES "service_prices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_price_translations" ADD CONSTRAINT "service_price_translations_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_translations" ADD CONSTRAINT "order_status_translations_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;