/*
  Warnings:

  - You are about to drop the `GiftCard` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Offer" ADD COLUMN     "applicableCategories" TEXT[];

-- DropTable
DROP TABLE "public"."GiftCard";
