import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Rings' } }),
    prisma.category.create({ data: { name: 'Necklaces' } }),
    prisma.category.create({ data: { name: 'Earrings' } }),
  ]);

  // Create Tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Wedding' } }),
    prisma.tag.create({ data: { name: 'Gold' } }),
    prisma.tag.create({ data: { name: 'Diamond' } }),
    prisma.tag.create({ data: { name: 'Silver' } }),
  ]);

  // Create Sizes
  const sizes = await Promise.all([
    prisma.size.create({ data: { name: '6' } }),
    prisma.size.create({ data: { name: '7' } }),
    prisma.size.create({ data: { name: 'S' } }),
    prisma.size.create({ data: { name: 'M' } }),
  ]);

  // Create Media (Images)
  const media = await Promise.all([
    prisma.media.create({
      data: {
        url: 'https://images.unsplash.com/photo-1608043152251-1df7f8e4c1c7',
        mimeType: 'image/jpeg',
        type: 'product',
      },
    }),
    prisma.media.create({
      data: {
        url: 'https://images.unsplash.com/photo-1611599953569-e05f4a1a6f7c',
        mimeType: 'image/jpeg',
        type: 'product',
      },
    }),
    prisma.media.create({
      data: {
        url: 'https://images.unsplash.com/photo-1608043152269-2a9d419c1f1f',
        mimeType: 'image/jpeg',
        type: 'avatar',
      },
    }),
  ]);

  // Create User with Avatar and Cart
  const user = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      password: 'hashed_password', // In production, hash the password
      name: 'John Doe',
      role: 'USER',
      avatar: { connect: { id: media[2].id } },
      cart: { create: {} },
    },
  });

  // Create Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Gold Diamond Ring',
        description: 'A stunning 18k gold ring with a 1-carat diamond.',
        price: 1200.99,
        stock: 10,
        isAvailable: true,
        category: { connect: { id: categories[0].id } },
        images: { connect: [{ id: media[0].id }, { id: media[1].id }] },
        tags: { create: [{ tagId: tags[0].id }, { tagId: tags[1].id }, { tagId: tags[2].id }] },
        sizes: {
          create: [
            { sizeId: sizes[0].id, stock: 5 },
            { sizeId: sizes[1].id, stock: 5 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Silver Necklace',
        description: 'Elegant silver necklace with a sapphire pendant.',
        price: 350.50,
        stock: 20,
        isAvailable: true,
        category: { connect: { id: categories[1].id } },
        images: { connect: [{ id: media[1].id }] },
        tags: { create: [{ tagId: tags[3].id }] },
        sizes: { create: [{ sizeId: sizes[2].id, stock: 10 }, { sizeId: sizes[3].id, stock: 10 }] },
      },
    }),
  ]);


  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });