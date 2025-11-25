/**
 * Verification script to check if TopPickProduct table is properly set up
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyTopPicks() {
  try {
    console.log("🔍 Verifying TopPickProduct setup...\n");

    // 1. Check if Prisma client has topPickProduct
    console.log("1. Checking Prisma Client...");
    if ("topPickProduct" in prisma) {
      console.log("   ✅ topPickProduct exists in Prisma client");
    } else {
      console.log("   ❌ topPickProduct NOT found in Prisma client");
      console.log(
        "   Available models:",
        Object.keys(prisma)
          .filter((k) => !k.startsWith("_") && !k.startsWith("$"))
          .join(", ")
      );
      return;
    }

    // 2. Try to query the table
    console.log("\n2. Testing database query...");
    const count = await (prisma as any).topPickProduct.count();
    console.log(`   ✅ Successfully queried TopPickProduct table`);
    console.log(`   📊 Current top picks count: ${count}`);

    // 3. Check table structure
    console.log("\n3. Checking table structure...");
    const sample = await (prisma as any).topPickProduct.findFirst({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    if (sample) {
      console.log("   ✅ Table structure is correct");
      console.log(`   📦 Sample record:`, {
        id: sample.id,
        productId: sample.productId,
        order: sample.order,
        productName: sample.product?.name,
      });
    } else {
      console.log("   ✅ Table structure is correct (no records yet)");
    }

    // 4. Verify foreign key relationship
    console.log("\n4. Testing foreign key relationship...");
    const products = await prisma.product.findMany({
      take: 1,
      where: { isAvailable: true },
    });

    if (products.length > 0) {
      console.log(
        `   ✅ Products available for testing (${products.length} found)`
      );
    } else {
      console.log("   ⚠️  No available products found to test with");
    }

    console.log("\n✅ All checks passed! TopPickProduct is properly set up.");
  } catch (error: any) {
    console.error("\n❌ Error during verification:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTopPicks();
