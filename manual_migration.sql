-- Remove ProductRelation table
DROP TABLE IF EXISTS "ProductRelation";

-- Add hasSizing column to Product table
ALTER TABLE "Product" ADD COLUMN "hasSizing" BOOLEAN NOT NULL DEFAULT false;
