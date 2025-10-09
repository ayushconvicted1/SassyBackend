import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data first to ensure clean state
  await prisma.productTag.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.media.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.size.deleteMany();
  await prisma.user.deleteMany();

  // Create categories with specific IDs based on pageData
  // ID 1: Rings, ID 2: Earrings, ID 3: Necklaces, ID 4: Bracelets
  const ringsCategory = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Rings" },
  });
  const earringsCategory = await prisma.category.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: "Earrings" },
  });
  const necklacesCategory = await prisma.category.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, name: "Necklaces" },
  });
  const braceletsCategory = await prisma.category.upsert({
    where: { id: 4 },
    update: {},
    create: { id: 4, name: "Bracelets" },
  });

  const categories = [
    ringsCategory,
    earringsCategory,
    necklacesCategory,
    braceletsCategory,
  ];

  // Create tags with specific IDs based on pageData
  // ID 1: Gold, ID 2: Diamond, ID 3: Wedding, ID 4: Silver, ID 5: Pearl, ID 6: Sapphire, ID 7: Ruby, ID 8: Emerald
  const goldTag = await prisma.tag.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Gold" },
  });
  const diamondTag = await prisma.tag.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: "Diamond" },
  });
  const weddingTag = await prisma.tag.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, name: "Wedding" },
  });
  const silverTag = await prisma.tag.upsert({
    where: { id: 4 },
    update: {},
    create: { id: 4, name: "Silver" },
  });
  const pearlTag = await prisma.tag.upsert({
    where: { id: 5 },
    update: {},
    create: { id: 5, name: "Pearl" },
  });
  const sapphireTag = await prisma.tag.upsert({
    where: { id: 6 },
    update: {},
    create: { id: 6, name: "Sapphire" },
  });
  const rubyTag = await prisma.tag.upsert({
    where: { id: 7 },
    update: {},
    create: { id: 7, name: "Ruby" },
  });
  const emeraldTag = await prisma.tag.upsert({
    where: { id: 8 },
    update: {},
    create: { id: 8, name: "Emerald" },
  });

  const tags = [
    goldTag,
    diamondTag,
    weddingTag,
    silverTag,
    pearlTag,
    sapphireTag,
    rubyTag,
    emeraldTag,
  ];

  // Create sizes for jewelry
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
  ]);

  // Create 20 real necklace products with working images
  const necklaceProducts = [
    {
      sku: "SS-NK-001",
      name: "Elegant Gold Chain Necklace",
      description:
        "A timeless 18k gold chain necklace perfect for everyday elegance. Crafted with precision and designed to complement any outfit.",
      price: 299.99,
      stock: 25,
      images: [
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500",
        "https://images.unsplash.com/photo-1596944924616-7b384c8c2e0a?w=500",
      ],
      tags: [1], // Gold
    },
    {
      sku: "SS-NK-002",
      name: "Diamond Pendant Necklace",
      description:
        "Stunning diamond pendant on a delicate silver chain. Features a brilliant-cut diamond that catches light beautifully.",
      price: 899.99,
      stock: 15,
      images: [
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500",
        "https://images.unsplash.com/photo-1608043152251-1df7f8e4c1c7?w=500",
      ],
      tags: [2, 4], // Diamond, Silver
    },
    {
      sku: "SS-NK-003",

      name: "Bridal Pearl Necklace Set",
      description:
        "Exquisite pearl necklace perfect for weddings. Features lustrous freshwater pearls with gold accents.",
      price: 599.99,
      stock: 12,
      images: [
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500",
      ],
      tags: [3, 5, 1], // Wedding, Pearl, Gold
    },
    {
      sku: "SS-NK-004",

      name: "Silver Statement Choker",
      description:
        "Bold silver choker necklace that makes a statement. Perfect for modern, edgy looks.",
      price: 199.99,
      stock: 30,
      images: [
        "https://images.unsplash.com/photo-1617038220319-276d4f4b0b0e?w=500",
        "https://images.unsplash.com/photo-1596944924616-7b384c8c2e0a?w=500",
      ],
      tags: [4], // Silver
    },
    {
      sku: "SS-NK-005",

      name: "Sapphire Drop Necklace",
      description:
        "Elegant sapphire drop necklace with white gold chain. Features genuine blue sapphires in a classic setting.",
      price: 1299.99,
      stock: 8,
      images: [
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500",
        "https://images.unsplash.com/photo-1608043152251-1df7f8e4c1c7?w=500",
      ],
      tags: [6, 1], // Sapphire, Gold
    },
    {
      sku: "SS-NK-006",

      name: "Ruby Heart Pendant",
      description:
        "Romantic ruby heart pendant on a gold chain. Perfect for expressing love and passion.",
      price: 799.99,
      stock: 18,
      images: [
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500",
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
      ],
      tags: [7, 1], // Ruby, Gold
    },
    {
      sku: "SS-NK-007",

      name: "Emerald Tennis Necklace",
      description:
        "Luxurious emerald tennis necklace with matching emerald stones. A true statement of elegance.",
      price: 1899.99,
      stock: 6,
      images: [
        "https://images.unsplash.com/photo-1596944924616-7b384c8c2e0a?w=500",
        "https://images.unsplash.com/photo-1617038220319-276d4f4b0b0e?w=500",
      ],
      tags: [8, 1], // Emerald, Gold
    },
    {
      sku: "SS-NK-008",

      name: "Layered Gold Necklace Set",
      description:
        "Trendy layered gold necklace set with three different chain lengths. Perfect for the modern fashionista.",
      price: 399.99,
      stock: 22,
      images: [
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500",
        "https://images.unsplash.com/photo-1608043152251-1df7f8e4c1c7?w=500",
      ],
      tags: [1], // Gold
    },
    {
      sku: "SS-NK-009",

      name: "Vintage Pearl Strand",
      description:
        "Classic vintage-inspired pearl strand necklace. Timeless elegance that never goes out of style.",
      price: 449.99,
      stock: 16,
      images: [
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500",
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500",
      ],
      tags: [5], // Pearl
    },
    {
      sku: "SS-NK-010",

      name: "Diamond Infinity Necklace",
      description:
        "Beautiful diamond infinity symbol necklace representing eternal love. Crafted in white gold.",
      price: 1099.99,
      stock: 10,
      images: [
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
        "https://images.unsplash.com/photo-1596944924616-7b384c8c2e0a?w=500",
      ],
      tags: [2, 4], // Diamond, Silver
    },
    {
      sku: "SS-NK-011",

      name: "Bohemian Silver Pendant",
      description:
        "Artistic bohemian-style silver pendant with intricate detailing. Perfect for free-spirited individuals.",
      price: 179.99,
      stock: 28,
      images: [
        "https://images.unsplash.com/photo-1617038220319-276d4f4b0b0e?w=500",
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500",
      ],
      tags: [4], // Silver
    },
    {
      sku: "SS-NK-012",

      name: "Gold Coin Necklace",
      description:
        "Trendy gold coin necklace with ancient-inspired design. A perfect blend of history and modern style.",
      price: 349.99,
      stock: 20,
      images: [
        "https://images.unsplash.com/photo-1608043152251-1df7f8e4c1c7?w=500",
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500",
      ],
      tags: [1], // Gold
    },
    {
      sku: "SS-NK-013",

      name: "Sapphire Cluster Necklace",
      description:
        "Stunning sapphire cluster necklace with multiple blue sapphires creating a dazzling effect.",
      price: 1599.99,
      stock: 7,
      images: [
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500",
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
      ],
      tags: [6, 1], // Sapphire, Gold
    },
    {
      sku: "SS-NK-014",

      name: "Ruby Vintage Choker",
      description:
        "Vintage-inspired ruby choker with ornate gold setting. Perfect for special occasions and formal events.",
      price: 999.99,
      stock: 9,
      images: [
        "https://images.unsplash.com/photo-1596944924616-7b384c8c2e0a?w=500",
        "https://images.unsplash.com/photo-1617038220319-276d4f4b0b0e?w=500",
      ],
      tags: [7, 1], // Ruby, Gold
    },
    {
      sku: "SS-NK-015",

      name: "Emerald Leaf Pendant",
      description:
        "Nature-inspired emerald leaf pendant on a delicate gold chain. Celebrates the beauty of nature.",
      price: 699.99,
      stock: 14,
      images: [
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500",
        "https://images.unsplash.com/photo-1608043152251-1df7f8e4c1c7?w=500",
      ],
      tags: [8, 1], // Emerald, Gold
    },
    {
      sku: "SS-NK-016",

      name: "Bridal Diamond Necklace",
      description:
        "Exquisite bridal diamond necklace designed for the most special day. Features multiple diamonds in elegant setting.",
      price: 2499.99,
      stock: 5,
      images: [
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500",
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500",
      ],
      tags: [3, 2, 1], // Wedding, Diamond, Gold
    },
    {
      sku: "SS-NK-017",

      name: "Silver Moon Phase Necklace",
      description:
        "Mystical silver moon phase necklace perfect for celestial lovers. Features detailed moon phase charms.",
      price: 229.99,
      stock: 24,
      images: [
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
        "https://images.unsplash.com/photo-1596944924616-7b384c8c2e0a?w=500",
      ],
      tags: [4], // Silver
    },
    {
      sku: "SS-NK-018",

      name: "Pearl and Gold Lariat",
      description:
        "Sophisticated pearl and gold lariat necklace that can be styled multiple ways. Versatile and elegant.",
      price: 549.99,
      stock: 13,
      images: [
        "https://images.unsplash.com/photo-1617038220319-276d4f4b0b0e?w=500",
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500",
      ],
      tags: [5, 1], // Pearl, Gold
    },
    {
      sku: "SS-NK-019",

      name: "Diamond Halo Pendant",
      description:
        "Brilliant diamond halo pendant that maximizes sparkle and brilliance. A true showstopper piece.",
      price: 1399.99,
      stock: 11,
      images: [
        "https://images.unsplash.com/photo-1608043152251-1df7f8e4c1c7?w=500",
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500",
      ],
      tags: [2, 1], // Diamond, Gold
    },
    {
      sku: "SS-NK-020",

      name: "Multi-Gemstone Statement Necklace",
      description:
        "Bold statement necklace featuring sapphires, rubies, and emeralds in a stunning gold setting.",
      price: 2199.99,
      stock: 4,
      images: [
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500",
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
      ],
      tags: [6, 7, 8, 1], // Sapphire, Ruby, Emerald, Gold
    },
  ];

  // Ring Products
  const ringProducts = [
    {
      sku: "SS-RG-001",
      name: "Classic Gold Wedding Band",
      description:
        "Timeless 18k gold wedding band with elegant simplicity. Perfect for everyday wear.",
      price: 899.99,
      stock: 25,
      images: [
        "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500",
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
      ],
      tags: [1], // Gold
    },
    {
      sku: "SS-RG-002",
      name: "Diamond Solitaire Ring",
      description:
        "Stunning 1-carat diamond solitaire ring in 18k gold setting. A true classic.",
      price: 1899.99,
      stock: 12,
      images: [
        "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500",
        "https://images.unsplash.com/photo-1596944924616-7b384c8c2e0a?w=500",
      ],
      tags: [5, 1], // Diamond, Gold
    },
    {
      sku: "SS-RG-003",
      name: "Sapphire Engagement Ring",
      description:
        "Beautiful blue sapphire engagement ring with diamond accents in platinum setting.",
      price: 1599.99,
      stock: 8,
      images: [
        "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500",
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500",
      ],
      tags: [6, 5], // Sapphire, Diamond
    },
    {
      sku: "SS-RG-004",
      name: "Ruby Vintage Ring",
      description:
        "Vintage-inspired ruby ring with intricate gold filigree work. A statement piece.",
      price: 1299.99,
      stock: 15,
      images: [
        "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500",
        "https://images.unsplash.com/photo-1617038220319-276d4f4b0b0e?w=500",
      ],
      tags: [7, 1], // Ruby, Gold
    },
    {
      sku: "SS-RG-005",
      name: "Emerald Cocktail Ring",
      description:
        "Bold emerald cocktail ring perfect for special occasions and evening wear.",
      price: 999.99,
      stock: 10,
      images: [
        "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500",
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500",
      ],
      tags: [8, 1], // Emerald, Gold
    },
    {
      sku: "SS-RG-006",
      name: "Pearl Statement Ring",
      description:
        "Elegant pearl statement ring with gold setting. Perfect for sophisticated looks.",
      price: 699.99,
      stock: 18,
      images: [
        "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500",
        "https://images.unsplash.com/photo-1608043152251-1df7f8e4c1c7?w=500",
      ],
      tags: [5, 1], // Pearl, Gold
    },
  ];

  // Bracelet Products
  const braceletProducts = [
    {
      sku: "SS-BR-001",
      name: "Gold Tennis Bracelet",
      description:
        "Classic gold tennis bracelet with sparkling diamonds. Perfect for elegant occasions.",
      price: 1499.99,
      stock: 12,
      images: [
        "https://images.unsplash.com/photo-1617038220319-276d4f4b0b0e?w=500",
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
      ],
      tags: [5, 1], // Diamond, Gold
    },
    {
      sku: "SS-BR-002",
      name: "Sapphire Charm Bracelet",
      description:
        "Delicate sapphire charm bracelet with multiple blue sapphire charms.",
      price: 799.99,
      stock: 20,
      images: [
        "https://images.unsplash.com/photo-1617038220319-276d4f4b0b0e?w=500",
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500",
      ],
      tags: [6, 1], // Sapphire, Gold
    },
    {
      sku: "SS-BR-003",
      name: "Ruby Bangle Bracelet",
      description:
        "Bold ruby bangle bracelet with gold accents. Makes a strong fashion statement.",
      price: 1199.99,
      stock: 8,
      images: [
        "https://images.unsplash.com/photo-1617038220319-276d4f4b0b0e?w=500",
        "https://images.unsplash.com/photo-1596944924616-7b384c8c2e0a?w=500",
      ],
      tags: [7, 1], // Ruby, Gold
    },
    {
      sku: "SS-BR-004",
      name: "Emerald Chain Bracelet",
      description:
        "Elegant emerald chain bracelet with alternating emerald and gold links.",
      price: 899.99,
      stock: 15,
      images: [
        "https://images.unsplash.com/photo-1617038220319-276d4f4b0b0e?w=500",
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500",
      ],
      tags: [8, 1], // Emerald, Gold
    },
    {
      sku: "SS-BR-005",
      name: "Pearl Stretch Bracelet",
      description:
        "Classic pearl stretch bracelet with lustrous white pearls. Timeless elegance.",
      price: 399.99,
      stock: 25,
      images: [
        "https://images.unsplash.com/photo-1617038220319-276d4f4b0b0e?w=500",
        "https://images.unsplash.com/photo-1608043152251-1df7f8e4c1c7?w=500",
      ],
      tags: [5], // Pearl
    },
    {
      sku: "SS-BR-006",
      name: "Diamond Cuff Bracelet",
      description:
        "Stunning diamond cuff bracelet with modern design. Perfect for special events.",
      price: 2199.99,
      stock: 6,
      images: [
        "https://images.unsplash.com/photo-1617038220319-276d4f4b0b0e?w=500",
        "https://images.unsplash.com/photo-1596944924616-7b384c8c2e0a?w=500",
      ],
      tags: [5, 1], // Diamond, Gold
    },
  ];

  // Earring Products
  const earringProducts = [
    {
      sku: "SS-ER-001",
      name: "Diamond Stud Earrings",
      description:
        "Classic diamond stud earrings in 18k gold setting. Perfect for everyday elegance.",
      price: 1299.99,
      stock: 20,
      images: [
        "https://images.unsplash.com/photo-1608043152251-1df7f8e4c1c7?w=500",
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
      ],
      tags: [5, 1], // Diamond, Gold
    },
    {
      sku: "SS-ER-002",
      name: "Sapphire Drop Earrings",
      description:
        "Elegant sapphire drop earrings with diamond accents. Perfect for evening wear.",
      price: 999.99,
      stock: 15,
      images: [
        "https://images.unsplash.com/photo-1608043152251-1df7f8e4c1c7?w=500",
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500",
      ],
      tags: [6, 5], // Sapphire, Diamond
    },
    {
      sku: "SS-ER-003",
      name: "Ruby Hoop Earrings",
      description:
        "Bold ruby hoop earrings with gold setting. Makes a strong fashion statement.",
      price: 799.99,
      stock: 18,
      images: [
        "https://images.unsplash.com/photo-1608043152251-1df7f8e4c1c7?w=500",
        "https://images.unsplash.com/photo-1617038220319-276d4f4b0b0e?w=500",
      ],
      tags: [7, 1], // Ruby, Gold
    },
    {
      sku: "SS-ER-004",
      name: "Emerald Chandelier Earrings",
      description:
        "Dramatic emerald chandelier earrings perfect for special occasions and formal events.",
      price: 1599.99,
      stock: 8,
      images: [
        "https://images.unsplash.com/photo-1608043152251-1df7f8e4c1c7?w=500",
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500",
      ],
      tags: [8, 1], // Emerald, Gold
    },
    {
      sku: "SS-ER-005",
      name: "Pearl Button Earrings",
      description:
        "Classic pearl button earrings with gold posts. Timeless and elegant.",
      price: 499.99,
      stock: 22,
      images: [
        "https://images.unsplash.com/photo-1608043152251-1df7f8e4c1c7?w=500",
        "https://images.unsplash.com/photo-1608043152251-1df7f8e4c1c7?w=500",
      ],
      tags: [5, 1], // Pearl, Gold
    },
    {
      sku: "SS-ER-006",
      name: "Diamond Cluster Earrings",
      description:
        "Stunning diamond cluster earrings with multiple diamonds creating a dazzling effect.",
      price: 1899.99,
      stock: 10,
      images: [
        "https://images.unsplash.com/photo-1608043152251-1df7f8e4c1c7?w=500",
        "https://images.unsplash.com/photo-1596944924616-7b384c8c2e0a?w=500",
      ],
      tags: [5, 1], // Diamond, Gold
    },
  ];

  // Helper function to create products for any category
  const createProductsForCategory = async (
    products: any[],
    categoryId: number
  ) => {
    for (let i = 0; i < products.length; i++) {
      const productData = products[i];

      // Create media for each product
      const productMedia = await Promise.all(
        productData.images.map((url: string) =>
          prisma.media.create({
            data: {
              url,
              mimeType: "image/jpeg",
              type: "product",
            },
          })
        )
      );

      // Create the product
      await prisma.product.create({
        data: {
          sku: productData.sku,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock: productData.stock,
          isAvailable: true,
          hasSizing: true,
          category: { connect: { id: categoryId } },
          images: { connect: productMedia.map((media) => ({ id: media.id })) },
          tags: {
            create: productData.tags.map((tagId: number) => ({
              tagId: tagId,
            })),
          },
          sizes: {
            create: sizes.map((size) => ({
              sizeId: size.id,
              stock: Math.floor(productData.stock / sizes.length),
            })),
          },
        },
      });
    }
  };

  // Create products for all categories
  await createProductsForCategory(necklaceProducts, necklacesCategory.id); // Necklaces
  await createProductsForCategory(ringProducts, ringsCategory.id); // Rings
  await createProductsForCategory(braceletProducts, braceletsCategory.id); // Bracelets
  await createProductsForCategory(earringProducts, earringsCategory.id); // Earrings

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { email: "test@sassyshringar.com" },
    update: {},
    create: {
      email: "test@sassyshringar.com",
      name: "Test User",
      role: "USER",
      cart: { create: {} },
    },
  });

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@sassyshringar.com" },
    update: {},
    create: {
      email: "admin@sassyshringar.com",
      name: "Admin User",
      role: "ADMIN",
    },
  });

  console.log("Database seeded successfully!");
  console.log(
    `Created ${categories.length} categories:`,
    categories.map((c) => c.name)
  );
  console.log(
    `Created ${tags.length} tags:`,
    tags.map((t) => t.name)
  );
  console.log(`Created ${necklaceProducts.length} necklace products`);
  console.log(`Created ${ringProducts.length} ring products`);
  console.log(`Created ${braceletProducts.length} bracelet products`);
  console.log(`Created ${earringProducts.length} earring products`);
  console.log(`Created ${sizes.length} sizes`);
  console.log("Created test user and admin user");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
