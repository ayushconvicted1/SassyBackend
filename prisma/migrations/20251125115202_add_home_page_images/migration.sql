-- CreateEnum
CREATE TYPE "public"."HomePageImageType" AS ENUM ('HERO_CAROUSEL', 'POWER_FEATURES', 'POWERPLAY_CAROUSEL', 'CATEGORY');

-- CreateTable
CREATE TABLE "public"."HomePageImage" (
    "id" SERIAL NOT NULL,
    "type" "public"."HomePageImageType" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "mobileImageUrl" TEXT,
    "altText" TEXT,
    "title" TEXT,
    "subtitle" TEXT,
    "color" TEXT,
    "href" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomePageImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomePageImage_type_idx" ON "public"."HomePageImage"("type");

-- CreateIndex
CREATE INDEX "HomePageImage_type_order_idx" ON "public"."HomePageImage"("type", "order");
