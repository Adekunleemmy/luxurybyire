import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const prisma = new PrismaClient();

// ─── Demo Product Image URLs (Cloudinary) ───────────────────
const demoImages = {
  sneakers: [
    'https://res.cloudinary.com/miqitaxh/image/upload/v1789300618/luxurybyire/products/h85odjrixkmkbhnnmund.jpg',
    'https://res.cloudinary.com/miqitaxh/image/upload/v1789300620/luxurybyire/products/r7ex13oumknhhnaxucfz.jpg',
    'https://res.cloudinary.com/miqitaxh/image/upload/v1789300622/luxurybyire/products/pbtza6j0lxceexo9srlp.jpg',
    'https://res.cloudinary.com/miqitaxh/image/upload/v1789300624/luxurybyire/products/jbr0uya5fgzuvt1hib35.jpg',
    'https://res.cloudinary.com/miqitaxh/image/upload/v1789300625/luxurybyire/products/kklqkiftmeric5zumn9h.jpg',
  ],
  casual: [
    'https://res.cloudinary.com/miqitaxh/image/upload/v1789300627/luxurybyire/products/ctd5dnqbqzg4vvnoyj4e.jpg',
    'https://res.cloudinary.com/miqitaxh/image/upload/v1789300630/luxurybyire/products/x545rjjhxmbza6fxgouw.jpg',
    'https://res.cloudinary.com/miqitaxh/image/upload/v1789300633/luxurybyire/products/vcl0vsw2ipecsc6hnmgb.jpg',
    'https://res.cloudinary.com/miqitaxh/image/upload/v1789300635/luxurybyire/products/hjva2mtooxdav4igjy0m.jpg',
  ],
  formal: [
    'https://res.cloudinary.com/miqitaxh/image/upload/v1789300637/luxurybyire/products/jdvc39h2v52yi2qks6zc.jpg',
    'https://res.cloudinary.com/miqitaxh/image/upload/v1789300638/luxurybyire/products/b0wn7mebfhoyks2rvgjz.jpg',
    'https://res.cloudinary.com/miqitaxh/image/upload/v1789300641/luxurybyire/products/vf2xdvcc2ljpmmmrjerf.jpg',
  ],
  sandals: [
    'https://res.cloudinary.com/miqitaxh/image/upload/v1789300643/luxurybyire/products/qdrh78yqw8xwre4w8z3g.jpg',
  ],
  boots: [
    'https://res.cloudinary.com/miqitaxh/image/upload/v1789300645/luxurybyire/products/lwuhqk3jbi5dyczob79n.jpg',
    'https://res.cloudinary.com/miqitaxh/image/upload/v1789300647/luxurybyire/products/bko8lmdqnee9r2n4cthy.jpg',
    'https://res.cloudinary.com/miqitaxh/image/upload/v1789300649/luxurybyire/products/dm394iipcuwtkwjxeq10.jpg',
  ],
};

async function main() {
  console.log('🌱 Seeding Luxurybyire database...\n');

  // ─── 1. Create Admin ───────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@luxurybyire.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'LuxuryAdmin2024!';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Luxurybyire Admin',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // ─── 2. Create Categories ─────────────────────────────
  const categoryData = [
    { name: 'Sneakers', slug: 'sneakers', description: 'Premium sneakers from top brands' },
    { name: 'Casual', slug: 'casual', description: 'Comfortable everyday casual footwear' },
    { name: 'Formal', slug: 'formal', description: 'Elegant formal shoes for every occasion' },
    { name: 'Sandals', slug: 'sandals', description: 'Stylish sandals and slides' },
    { name: 'Boots', slug: 'boots', description: 'Premium boots for all seasons' },
  ];

  const categories = {};
  for (const cat of categoryData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = category;
    console.log(`✅ Category: ${category.name}`);
  }

  // ─── 3. Create Business Settings ──────────────────────
  const settings = await prisma.businessSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      businessName: 'Luxurybyire',
      whatsappNumber: process.env.WHATSAPP_NUMBER || '2348012345678',
      phone: '+234 801 234 5678',
      email: 'hello@luxurybyire.com',
      address: 'Lagos, Nigeria',
      instagramUrl: '',
      tiktokUrl: 'https://tiktok.com/@luxurybyire',
      facebookUrl: '',
    },
  });
  console.log(`✅ Business settings configured`);

  // ─── 4. Create Delivery Zones ─────────────────────────
  await prisma.deliveryZone.deleteMany();
  const zones = await Promise.all([
    prisma.deliveryZone.create({
      data: { name: 'Lagos Mainland', fee: 5000, description: 'Mainland Lagos delivery', sortOrder: 0 },
    }),
    prisma.deliveryZone.create({
      data: { name: 'Lagos Island', fee: 10000, description: 'Lekki, Victoria Island, Ikoyi and similar areas', sortOrder: 1 },
    }),
    prisma.deliveryZone.create({
      data: { name: 'Outside Lagos', fee: 20000, description: 'Delivery outside Lagos state', sortOrder: 2 },
    }),
  ]);
  console.log(`✅ ${zones.length} delivery zones created`);

  // ─── 5. Create Demo Products ──────────────────────────
  // Clear existing products for clean seed
  await prisma.productImage.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.productColour.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  const products = [
    // Sneakers
    {
      name: 'Nike Air Max 90',
      slug: 'nike-air-max-90',
      brand: 'Nike',
      description: 'The Nike Air Max 90 stays true to its OG running roots with the iconic Waffle sole, stitched overlays and classic TPU details. Fresh colours give a modern look while Max Air cushioning adds comfort to your journey.',
      price: 150000,
      previousPrice: 180000,
      gender: 'UNISEX',
      stockQuantity: 15,
      isFeatured: true,
      isNewArrival: true,
      isSale: true,
      categoryId: categories.sneakers.id,
      images: [demoImages.sneakers[0], demoImages.sneakers[1]],
      sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
      colours: ['White', 'Black', 'Grey'],
    },
    {
      name: 'Adidas Ultraboost 23',
      slug: 'adidas-ultraboost-23',
      brand: 'Adidas',
      description: 'Experience ultimate comfort and energy return with the Adidas Ultraboost 23. Featuring an updated BOOST midsole and Primeknit upper for a sock-like fit that moves with you.',
      price: 185000,
      previousPrice: null,
      gender: 'MEN',
      stockQuantity: 10,
      isFeatured: true,
      isNewArrival: false,
      isSale: false,
      categoryId: categories.sneakers.id,
      images: [demoImages.sneakers[2], demoImages.sneakers[3]],
      sizes: ['40', '41', '42', '43', '44', '45'],
      colours: ['Black', 'Navy'],
    },
    {
      name: 'Nike Dunk Low',
      slug: 'nike-dunk-low',
      brand: 'Nike',
      description: 'Created for the hardwood but taken to the streets, the Nike Dunk Low delivers a timeless design with premium materials and crisp colour blocking.',
      price: 120000,
      previousPrice: null,
      gender: 'UNISEX',
      stockQuantity: 20,
      isFeatured: true,
      isNewArrival: true,
      isSale: false,
      categoryId: categories.sneakers.id,
      images: [demoImages.sneakers[4]],
      sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
      colours: ['White/Green', 'White/Black'],
    },
    {
      name: 'Adidas Samba OG',
      slug: 'adidas-samba-og',
      brand: 'Adidas',
      description: 'Born on the football pitch, the Adidas Samba has become a streetwear icon. This OG version features soft leather, suede overlays and the signature gum sole.',
      price: 95000,
      previousPrice: 115000,
      gender: 'UNISEX',
      stockQuantity: 25,
      isFeatured: true,
      isNewArrival: false,
      isSale: true,
      categoryId: categories.sneakers.id,
      images: [demoImages.sneakers[1], demoImages.sneakers[0]],
      sizes: ['37', '38', '39', '40', '41', '42', '43', '44'],
      colours: ['White/Black', 'Black/White'],
    },

    // Casual
    {
      name: 'Nike Air Force 1 Low',
      slug: 'nike-air-force-1-low',
      brand: 'Nike',
      description: 'The radiance lives on in the Nike Air Force 1. This basketball original has been revamped for everyday comfort with durable, premium leather and timeless style.',
      price: 110000,
      previousPrice: null,
      gender: 'UNISEX',
      stockQuantity: 30,
      isFeatured: true,
      isNewArrival: false,
      isSale: false,
      categoryId: categories.casual.id,
      images: [demoImages.casual[0], demoImages.casual[1]],
      sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
      colours: ['White', 'Black', 'White/Black'],
    },
    {
      name: 'New Balance 550',
      slug: 'new-balance-550',
      brand: 'New Balance',
      description: 'The New Balance 550 is a classic basketball silhouette reborn as a lifestyle essential. Clean leather upper with vintage-inspired design details.',
      price: 135000,
      previousPrice: 155000,
      gender: 'UNISEX',
      stockQuantity: 12,
      isFeatured: false,
      isNewArrival: true,
      isSale: true,
      categoryId: categories.casual.id,
      images: [demoImages.casual[2], demoImages.casual[3]],
      sizes: ['38', '39', '40', '41', '42', '43', '44'],
      colours: ['White/Green', 'White/Navy'],
    },
    {
      name: 'Puma Suede Classic',
      slug: 'puma-suede-classic',
      brand: 'Puma',
      description: 'The Puma Suede Classic is a timeless favourite. Introduced in 1968 and still going strong, this icon features a premium suede upper and the iconic formstrip.',
      price: 68000,
      previousPrice: null,
      gender: 'UNISEX',
      stockQuantity: 18,
      isFeatured: false,
      isNewArrival: false,
      isSale: false,
      categoryId: categories.casual.id,
      images: [demoImages.casual[0]],
      sizes: ['38', '39', '40', '41', '42', '43'],
      colours: ['Black/White', 'Navy/White', 'Red/White'],
    },
    {
      name: 'Converse Chuck 70',
      slug: 'converse-chuck-70',
      brand: 'Converse',
      description: 'The Converse Chuck 70 brings premium materials and vintage details to the iconic All Star. Features heavier canvas, better cushioning and retro colours.',
      price: 55000,
      previousPrice: null,
      gender: 'UNISEX',
      stockQuantity: 22,
      isFeatured: false,
      isNewArrival: true,
      isSale: false,
      categoryId: categories.casual.id,
      images: [demoImages.casual[1]],
      sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
      colours: ['Black', 'Parchment', 'Navy'],
    },

    // Formal
    {
      name: 'Classic Oxford Leather',
      slug: 'classic-oxford-leather',
      brand: 'Clarks',
      description: 'Timeless craftsmanship meets modern comfort. This classic Oxford features premium full-grain leather, a leather sole and fine stitching detail.',
      price: 195000,
      previousPrice: null,
      gender: 'MEN',
      stockQuantity: 8,
      isFeatured: true,
      isNewArrival: false,
      isSale: false,
      categoryId: categories.formal.id,
      images: [demoImages.formal[0], demoImages.formal[1]],
      sizes: ['39', '40', '41', '42', '43', '44', '45'],
      colours: ['Black', 'Brown'],
    },
    {
      name: 'Italian Loafer Premium',
      slug: 'italian-loafer-premium',
      brand: 'Aldo',
      description: 'Sophisticated Italian-inspired loafers crafted from supple leather. Perfect for both formal and smart-casual occasions.',
      price: 165000,
      previousPrice: 200000,
      gender: 'MEN',
      stockQuantity: 6,
      isFeatured: false,
      isNewArrival: true,
      isSale: true,
      categoryId: categories.formal.id,
      images: [demoImages.formal[2], demoImages.formal[0]],
      sizes: ['39', '40', '41', '42', '43', '44'],
      colours: ['Tan', 'Black', 'Burgundy'],
    },
    {
      name: 'Elegant Court Heel',
      slug: 'elegant-court-heel',
      brand: 'Aldo',
      description: 'A refined court heel that exudes elegance. Crafted with premium materials and a comfortable block heel for all-day wear.',
      price: 145000,
      previousPrice: null,
      gender: 'WOMEN',
      stockQuantity: 10,
      isFeatured: true,
      isNewArrival: true,
      isSale: false,
      categoryId: categories.formal.id,
      images: [demoImages.formal[1]],
      sizes: ['36', '37', '38', '39', '40', '41'],
      colours: ['Black', 'Nude', 'Red'],
    },

    // Sandals
    {
      name: 'Nike Victori One Slide',
      slug: 'nike-victori-one-slide',
      brand: 'Nike',
      description: 'Slip into post-workout comfort with the Nike Victori One Slide. The foam sole offers lightweight cushioning while the wide strap provides a secure fit.',
      price: 35000,
      previousPrice: 45000,
      gender: 'UNISEX',
      stockQuantity: 35,
      isFeatured: false,
      isNewArrival: false,
      isSale: true,
      categoryId: categories.sandals.id,
      images: [demoImages.sandals[0], demoImages.sandals[1]],
      sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
      colours: ['Black', 'White', 'Navy'],
    },
    {
      name: 'Adidas Adilette Comfort',
      slug: 'adidas-adilette-comfort',
      brand: 'Adidas',
      description: 'The Adidas Adilette Comfort slides feature a Cloudfoam footbed for plush comfort. Classic three-stripe design on a soft synthetic strap.',
      price: 38000,
      previousPrice: null,
      gender: 'UNISEX',
      stockQuantity: 28,
      isFeatured: false,
      isNewArrival: true,
      isSale: false,
      categoryId: categories.sandals.id,
      images: [demoImages.sandals[1]],
      sizes: ['38', '39', '40', '41', '42', '43', '44'],
      colours: ['Black/White', 'Navy/White'],
    },

    // Boots
    {
      name: 'Timberland 6-Inch Premium',
      slug: 'timberland-6-inch-premium',
      brand: 'Timberland',
      description: 'The icon that started it all. The Timberland 6-Inch Premium boot features waterproof leather, sealed seams and a padded collar for comfort.',
      price: 220000,
      previousPrice: 250000,
      gender: 'MEN',
      stockQuantity: 7,
      isFeatured: true,
      isNewArrival: false,
      isSale: true,
      categoryId: categories.boots.id,
      images: [demoImages.boots[0], demoImages.boots[1]],
      sizes: ['40', '41', '42', '43', '44', '45'],
      colours: ['Wheat', 'Black'],
    },
    {
      name: 'Dr. Martens 1460',
      slug: 'dr-martens-1460',
      brand: 'Dr. Martens',
      description: 'The 1460 is the original Dr. Martens boot. Built on the iconic AirWair bouncing sole with Smooth leather and the signature yellow welt stitching.',
      price: 195000,
      previousPrice: null,
      gender: 'UNISEX',
      stockQuantity: 9,
      isFeatured: false,
      isNewArrival: true,
      isSale: false,
      categoryId: categories.boots.id,
      images: [demoImages.boots[2], demoImages.boots[0]],
      sizes: ['37', '38', '39', '40', '41', '42', '43', '44'],
      colours: ['Black', 'Cherry Red'],
    },
    {
      name: 'Chelsea Boot Premium',
      slug: 'chelsea-boot-premium',
      brand: 'Clarks',
      description: 'A modern take on the timeless Chelsea boot. Premium leather upper with elastic side panels and a refined silhouette suitable for any occasion.',
      price: 175000,
      previousPrice: null,
      gender: 'MEN',
      stockQuantity: 5,
      isFeatured: false,
      isNewArrival: false,
      isSale: false,
      categoryId: categories.boots.id,
      images: [demoImages.boots[1]],
      sizes: ['39', '40', '41', '42', '43', '44'],
      colours: ['Black', 'Brown', 'Tan'],
    },
  ];

  for (const product of products) {
    const { images, sizes, colours, ...productData } = product;
    productData.isAvailable = productData.stockQuantity > 0;

    const created = await prisma.product.create({
      data: {
        ...productData,
        images: {
          create: images.map((url, index) => ({
            url,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        },
        sizes: {
          create: sizes.map((size) => ({ size })),
        },
        colours: {
          create: colours.map((colour) => ({ colour })),
        },
      },
    });

    console.log(`✅ Product: ${created.name} (${created.brand})`);
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   ${products.length} products created`);
  console.log(`   ${categoryData.length} categories created`);
  console.log(`   ${zones.length} delivery zones created`);
  console.log(`   Admin: ${adminEmail}`);
  console.log(`\n   ⚠️  Change the admin password after first login!\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
