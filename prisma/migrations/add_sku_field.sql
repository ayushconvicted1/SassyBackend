-- Add SKU field to Product table
-- This migration adds the SKU field and creates a unique index

-- Add the SKU column (nullable first to allow existing products)
ALTER TABLE "Product" ADD COLUMN "sku" VARCHAR(10);

-- Create a unique index on SKU (will be enforced after we populate existing records)
-- CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- Note: You'll need to manually populate SKU values for existing products
-- Example: UPDATE "Product" SET "sku" = 'SS-NK-' || LPAD(id::text, 3, '0') WHERE "sku" IS NULL;
-- Then make the field NOT NULL and add the unique constraint:
-- ALTER TABLE "Product" ALTER COLUMN "sku" SET NOT NULL;
-- CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");