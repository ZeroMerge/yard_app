import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding platforms...');
  const platformNames = ['instagram', 'tiktok', 'youtube', 'facebook', 'x'];
  for (const name of platformNames) {
    await prisma.platform.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seeding initial test accounts...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@yard.com' },
    update: {},
    create: {
      email: 'admin@yard.com',
      passwordHash,
      role: 'admin',
      status: 'active',
    },
  });

  // Brand user & Organization
  const brandUser = await prisma.user.upsert({
    where: { email: 'brand@glowbeauty.com' },
    update: {},
    create: {
      email: 'brand@glowbeauty.com',
      passwordHash,
      role: 'brand',
      status: 'active',
    },
  });

  let org = await prisma.organization.findFirst({
    where: { name: 'Glow Beauty Labs' },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'Glow Beauty Labs',
        website: 'https://glowbeautylabs.com',
        industry: 'Beauty & Personal Care',
        members: {
          create: {
            userId: brandUser.id,
            role: 'owner',
          },
        },
      },
    });
  }

  // Creator user & Profile
  const creatorUser = await prisma.user.upsert({
    where: { email: 'amaka@creators.ng' },
    update: {},
    create: {
      email: 'amaka@creators.ng',
      passwordHash,
      role: 'creator',
      status: 'active',
    },
  });

  let creator = await prisma.creator.findFirst({
    where: { userId: creatorUser.id },
  });

  if (!creator) {
    creator = await prisma.creator.create({
      data: {
        userId: creatorUser.id,
        displayName: 'Amaka Okafor',
        bio: 'Lagos beauty & skincare reviewer. 25k IG followers.',
        verified: true,
        payoutAccount: {
          bank_code: '058',
          bank_name: 'GTBank',
          account_number: '0123456789',
          account_name: 'Amaka Okafor',
        },
        socialAccounts: {
          create: [
            {
              platform: 'instagram',
              handle: 'amaka_beauty',
              profileUrl: 'https://instagram.com/amaka_beauty',
            },
            {
              platform: 'tiktok',
              handle: 'amaka_beauty_tok',
              profileUrl: 'https://tiktok.com/@amaka_beauty_tok',
            },
          ],
        },
        categories: {
          create: [{ category: 'beauty' }, { category: 'lifestyle' }],
        },
        languages: {
          create: [{ language: 'English' }, { language: 'Yoruba' }],
        },
        locations: {
          create: { country: 'Nigeria', city: 'Lagos' },
        },
        rates: {
          create: [
            { deliverableType: 'reel', amount: 150000.0, currency: 'NGN' },
            { deliverableType: 'story', amount: 50000.0, currency: 'NGN' },
          ],
        },
        stats: {
          create: {
            campaignsCompleted: 5,
            onTimeDeliveries: 5,
          },
        },
      },
    });
  }

  console.log('Seeding completed successfully!');
  console.log({
    admin: adminUser.email,
    brand: brandUser.email,
    creator: creatorUser.email,
    organization: org.name,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
