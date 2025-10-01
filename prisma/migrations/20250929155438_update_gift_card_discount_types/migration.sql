/*
  Warnings:

  - You are about to drop the column `amount` on the `GiftCard` table. All the data in the column will be lost.
  - Added the required column `discountType` to the `GiftCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountValue` to the `GiftCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."GiftCard" DROP COLUMN "amount",
ADD COLUMN     "discountType" "public"."DiscountType" NOT NULL,
ADD COLUMN     "discountValue" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "maxDiscount" DECIMAL(65,30),
ADD COLUMN     "minOrderValue" DECIMAL(65,30);
