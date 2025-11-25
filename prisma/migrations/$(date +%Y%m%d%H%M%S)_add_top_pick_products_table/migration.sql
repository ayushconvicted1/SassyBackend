-- Drop old columns from Product table
ALTER TABLE "public"."Product" DROP COLUMN IF EXISTS "isTopPick";
ALTER TABLE "public"."Product" DROP COLUMN IF EXISTS "topPickOrder";
DROP INDEX IF EXISTS "Product_isTopPick_topPickOrder_idx";

-- CreateTable
CREATE TABLE "TopPickProduct" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopPickProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TopPickProduct_productId_key" ON "TopPickProduct"("productId");
CREATE INDEX "TopPickProduct_order_idx" ON "TopPickProduct"("order");

-- AddForeignKey
ALTER TABLE "TopPickProduct" ADD CONSTRAINT "TopPickProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

