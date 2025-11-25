-- Drop old columns from Product table (if they exist)
ALTER TABLE "public"."Product" DROP COLUMN IF EXISTS "isTopPick";
ALTER TABLE "public"."Product" DROP COLUMN IF EXISTS "topPickOrder";
DROP INDEX IF EXISTS "Product_isTopPick_topPickOrder_idx";

-- CreateTable (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS "TopPickProduct" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopPickProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (only if they don't exist)
CREATE UNIQUE INDEX IF NOT EXISTS "TopPickProduct_productId_key" ON "TopPickProduct"("productId");
CREATE INDEX IF NOT EXISTS "TopPickProduct_order_idx" ON "TopPickProduct"("order");

-- AddForeignKey (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'TopPickProduct_productId_fkey'
    ) THEN
        ALTER TABLE "TopPickProduct" 
        ADD CONSTRAINT "TopPickProduct_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
