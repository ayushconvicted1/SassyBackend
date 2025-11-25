-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "isTopPick" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "topPickOrder" INTEGER;

-- CreateIndex
CREATE INDEX "Product_isTopPick_topPickOrder_idx" ON "public"."Product"("isTopPick", "topPickOrder");
