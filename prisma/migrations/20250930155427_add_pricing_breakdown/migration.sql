-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "offerDiscount" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "prepaidDiscount" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "shipping" DECIMAL(65,30),
ADD COLUMN     "subtotal" DECIMAL(65,30),
ADD COLUMN     "tax" DECIMAL(65,30);
