/*
  Warnings:

  - You are about to drop the `ProductRelation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ProductRelation" DROP CONSTRAINT "ProductRelation_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductRelation" DROP CONSTRAINT "ProductRelation_relatedProductId_fkey";

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "appliedDiscount" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'razorpay';

-- DropTable
DROP TABLE "public"."ProductRelation";
