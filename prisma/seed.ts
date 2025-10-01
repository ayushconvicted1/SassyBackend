import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create or find 4 Mandatory Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Rings" },
      update: {},
      create: { name: "Rings" },
    }),
    prisma.category.upsert({
      where: { name: "Necklaces" },
      update: {},
      create: { name: "Necklaces" },
    }),
    prisma.category.upsert({
      where: { name: "Earrings" },
      update: {},
      create: { name: "Earrings" },
    }),
    prisma.category.upsert({
      where: { name: "Bracelets" },
      update: {},
      create: { name: "Bracelets" },
    }),
  ]);

  // Create or find 8 Tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: "Wedding" },
      update: {},
      create: { name: "Wedding" },
    }),
    prisma.tag.upsert({
      where: { name: "Gold" },
      update: {},
      create: { name: "Gold" },
    }),
    prisma.tag.upsert({
      where: { name: "Diamond" },
      update: {},
      create: { name: "Diamond" },
    }),
    prisma.tag.upsert({
      where: { name: "Silver" },
      update: {},
      create: { name: "Silver" },
    }),
    prisma.tag.upsert({
      where: { name: "Pearl" },
      update: {},
      create: { name: "Pearl" },
    }),
    prisma.tag.upsert({
      where: { name: "Emerald" },
      update: {},
      create: { name: "Emerald" },
    }),
    prisma.tag.upsert({
      where: { name: "Ruby" },
      update: {},
      create: { name: "Ruby" },
    }),
    prisma.tag.upsert({
      where: { name: "Sapphire" },
      update: {},
      create: { name: "Sapphire" },
    }),
  ]);

  // Create or find Sizes
  const sizes = await Promise.all([
    prisma.size.upsert({
      where: { name: "XS" },
      update: {},
      create: { name: "XS" },
    }),
    prisma.size.upsert({
      where: { name: "S" },
      update: {},
      create: { name: "S" },
    }),
    prisma.size.upsert({
      where: { name: "M" },
      update: {},
      create: { name: "M" },
    }),
    prisma.size.upsert({
      where: { name: "L" },
      update: {},
      create: { name: "L" },
    }),
    prisma.size.upsert({
      where: { name: "XL" },
      update: {},
      create: { name: "XL" },
    }),
    prisma.size.upsert({
      where: { name: "6" },
      update: {},
      create: { name: "6" },
    }),
    prisma.size.upsert({
      where: { name: "7" },
      update: {},
      create: { name: "7" },
    }),
    prisma.size.upsert({
      where: { name: "8" },
      update: {},
      create: { name: "8" },
    }),
  ]);

  // Create Media (Product Images)
  const media = await Promise.all([
    // Rings
    prisma.media.create({
      data: {
        url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e",
        mimeType: "image/jpeg",
        type: "product",
      },
    }),
    prisma.media.create({
      data: {
        url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
        mimeType: "image/jpeg",
        type: "product",
      },
    }),
    prisma.media.create({
      data: {
        url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f",
        mimeType: "image/jpeg",
        type: "product",
      },
    }),
    // Necklaces
    prisma.media.create({
      data: {
        url: "https://images.unsplash.com/photo-1596944924616-7b384c8c2e0a",
        mimeType: "image/jpeg",
        type: "product",
      },
    }),
    prisma.media.create({
      data: {
        url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a",
        mimeType: "image/jpeg",
        type: "product",
      },
    }),
    prisma.media.create({
      data: {
        url: "https://images.unsplash.com/photo-1608043152251-1df7f8e4c1c7",
        mimeType: "image/jpeg",
        type: "product",
      },
    }),
    // Earrings
    prisma.media.create({
      data: {
        url: "https://images.unsplash.com/photo-1617038220319-276d4f4b0b0e",
        mimeType: "image/jpeg",
        type: "product",
      },
    }),
    prisma.media.create({
      data: {
        url: "https://images.unsplash.com/photo-1617038220319-276d4f4b0b0e",
        mimeType: "image/jpeg",
        type: "product",
      },
    }),
    prisma.media.create({
      data: {
        url: "https://images.unsplash.com/photo-1617038220319-276d4f4b0b0e",
        mimeType: "image/jpeg",
        type: "product",
      },
    }),
    // Bracelets
    prisma.media.create({
      data: {
        url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a",
        mimeType: "image/jpeg",
        type: "product",
      },
    }),
    prisma.media.create({
      data: {
        url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a",
        mimeType: "image/jpeg",
        type: "product",
      },
    }),
    prisma.media.create({
      data: {
        url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a",
        mimeType: "image/jpeg",
        type: "product",
      },
    }),
  ]);

  // Create or find User with Avatar and Cart
  const user = await prisma.user.upsert({
    where: { email: "john.doe@example.com" },
    update: {},
    create: {
      email: "john.doe@example.com",
      name: "John Doe",
      role: "USER",
      avatar: { connect: { id: media[0].id } },
      cart: { create: {} },
    },
  });

  // Create Products with proper categories and tags
  const products = await Promise.all([
    // Wedding Gold Diamond Ring
    prisma.product.create({
      data: {
        name: "Eternal Love Gold Diamond Ring",
        description:
          "A stunning 18k gold ring with a 1-carat diamond. Perfect for weddings and special occasions.",
        price: 1299.99,
        stock: 15,
        isAvailable: true,
        category: { connect: { name: "Rings" } }, // Rings
        images: { connect: [{ id: media[0].id }, { id: media[1].id }] },
        tags: {
          create: [
            { tagId: tags[0].id }, // Wedding
            { tagId: tags[1].id }, // Gold
            { tagId: tags[2].id }, // Diamond
          ],
        },
        sizes: {
          create: [
            { sizeId: sizes[5].id, stock: 5 }, // Size 6
            { sizeId: sizes[6].id, stock: 5 }, // Size 7
            { sizeId: sizes[7].id, stock: 5 }, // Size 8
          ],
        },
      },
    }),

    // Silver Pearl Necklace
    prisma.product.create({
      data: {
        name: "Ocean Pearl Silver Necklace",
        description:
          "Elegant silver necklace with freshwater pearls. A timeless piece for any occasion.",
        price: 299.99,
        stock: 25,
        isAvailable: true,
        category: { connect: { name: "Necklaces" } }, // Necklaces
        images: { connect: [{ id: media[3].id }, { id: media[4].id }] },
        tags: {
          create: [
            { tagId: tags[3].id }, // Silver
            { tagId: tags[4].id }, // Pearl
          ],
        },
        sizes: {
          create: [
            { sizeId: sizes[0].id, stock: 8 }, // XS
            { sizeId: sizes[1].id, stock: 8 }, // S
            { sizeId: sizes[2].id, stock: 9 }, // M
          ],
        },
      },
    }),

    // Gold Emerald Earrings
    prisma.product.create({
      data: {
        name: "Royal Gold Emerald Drop Earrings",
        description:
          "Luxurious gold earrings with emerald stones. Perfect for formal events and special occasions.",
        price: 899.99,
        stock: 12,
        isAvailable: true,
        category: { connect: { name: "Earrings" } }, // Earrings
        images: { connect: [{ id: media[6].id }, { id: media[7].id }] },
        tags: {
          create: [
            { tagId: tags[1].id }, // Gold
            { tagId: tags[5].id }, // Emerald
          ],
        },
        sizes: {
          create: [
            { sizeId: sizes[0].id, stock: 4 }, // XS
            { sizeId: sizes[1].id, stock: 4 }, // S
            { sizeId: sizes[2].id, stock: 4 }, // M
          ],
        },
      },
    }),

    // Silver Ruby Bracelet
    prisma.product.create({
      data: {
        name: "Passion Silver Ruby Bracelet",
        description:
          "Beautiful silver bracelet with ruby accents. A statement piece for any outfit.",
        price: 199.99,
        stock: 20,
        isAvailable: true,
        category: { connect: { name: "Bracelets" } }, // Bracelets
        images: { connect: [{ id: media[9].id }, { id: media[10].id }] },
        tags: {
          create: [
            { tagId: tags[3].id }, // Silver
            { tagId: tags[6].id }, // Ruby
          ],
        },
        sizes: {
          create: [
            { sizeId: sizes[0].id, stock: 6 }, // XS
            { sizeId: sizes[1].id, stock: 7 }, // S
            { sizeId: sizes[2].id, stock: 7 }, // M
          ],
        },
      },
    }),

    // Diamond Sapphire Ring
    prisma.product.create({
      data: {
        name: "Celestial Diamond Sapphire Ring",
        description:
          "Exquisite ring featuring diamonds and sapphires. A masterpiece of elegance and sophistication.",
        price: 2499.99,
        stock: 8,
        isAvailable: true,
        category: { connect: { name: "Rings" } }, // Rings
        images: { connect: [{ id: media[2].id }] },
        tags: {
          create: [
            { tagId: tags[2].id }, // Diamond
            { tagId: tags[7].id }, // Sapphire
          ],
        },
        sizes: {
          create: [
            { sizeId: sizes[5].id, stock: 3 }, // Size 6
            { sizeId: sizes[6].id, stock: 3 }, // Size 7
            { sizeId: sizes[7].id, stock: 2 }, // Size 8
          ],
        },
      },
    }),

    // Pearl Gold Necklace
    prisma.product.create({
      data: {
        name: "Classic Pearl Gold Chain Necklace",
        description:
          "Timeless gold chain necklace with pearl details. Perfect for both casual and formal wear.",
        price: 599.99,
        stock: 18,
        isAvailable: true,
        category: { connect: { name: "Necklaces" } }, // Necklaces
        images: { connect: [{ id: media[5].id }] },
        tags: {
          create: [
            { tagId: tags[1].id }, // Gold
            { tagId: tags[4].id }, // Pearl
          ],
        },
        sizes: {
          create: [
            { sizeId: sizes[1].id, stock: 6 }, // S
            { sizeId: sizes[2].id, stock: 6 }, // M
            { sizeId: sizes[3].id, stock: 6 }, // L
          ],
        },
      },
    }),

    // Silver Diamond Earrings
    prisma.product.create({
      data: {
        name: "Sparkle Silver Diamond Stud Earrings",
        description:
          "Classic diamond stud earrings in silver setting. A must-have for every jewelry collection.",
        price: 799.99,
        stock: 22,
        isAvailable: true,
        category: { connect: { name: "Earrings" } }, // Earrings
        images: { connect: [{ id: media[8].id }] },
        tags: {
          create: [
            { tagId: tags[3].id }, // Silver
            { tagId: tags[2].id }, // Diamond
          ],
        },
        sizes: {
          create: [
            { sizeId: sizes[0].id, stock: 7 }, // XS
            { sizeId: sizes[1].id, stock: 8 }, // S
            { sizeId: sizes[2].id, stock: 7 }, // M
          ],
        },
      },
    }),

    // Gold Ruby Bracelet
    prisma.product.create({
      data: {
        name: "Luxury Gold Ruby Tennis Bracelet",
        description:
          "Stunning gold bracelet with ruby stones. A luxurious piece that commands attention.",
        price: 1899.99,
        stock: 10,
        isAvailable: true,
        category: { connect: { name: "Bracelets" } }, // Bracelets
        images: { connect: [{ id: media[11].id }] },
        tags: {
          create: [
            { tagId: tags[1].id }, // Gold
            { tagId: tags[6].id }, // Ruby
          ],
        },
        sizes: {
          create: [
            { sizeId: sizes[1].id, stock: 3 }, // S
            { sizeId: sizes[2].id, stock: 4 }, // M
            { sizeId: sizes[3].id, stock: 3 }, // L
          ],
        },
      },
    }),
  ]);

  console.log("Database seeded successfully!");
  console.log(
    `Created ${categories.length} categories:`,
    categories.map((c) => c.name)
  );
  console.log(
    `Created ${tags.length} tags:`,
    tags.map((t) => t.name)
  );
  console.log(`Created ${products.length} products`);
  console.log(`Created ${media.length} media files`);
  console.log(`Created ${sizes.length} sizes`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
