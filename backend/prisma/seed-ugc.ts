import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedUGC() {
  let org = await prisma.organization.findFirst({
    where: { name: 'Yard Technologies' },
  });
  if (!org) {
    org = await prisma.organization.findFirst();
  }

  const ugcCampaigns = [
    {
      name: 'Chowdeck Midnight Cravings: UGC Unboxing Reaction',
      goal: 'Brand Engagement & UGC Content',
      category: 'ugc',
      deliverableType: 'UGC TikTok Video (9:16)',
      budgetPerCreator: 180000,
      quantity: 5,
      brief: 'Order late-night suya or pasta on Chowdeck and record an authentic raw UGC unboxing reaction showing lightning-fast 30-minute delivery.',
      status: 'open',
      country: 'Nigeria',
      city: 'Lagos',
    },
    {
      name: 'AltSchool Africa: Zero to Tech Engineer UGC Story',
      goal: 'Student Signups & Credibility',
      category: 'ugc',
      deliverableType: 'UGC Vertical Video (60s)',
      budgetPerCreator: 150000,
      quantity: 4,
      brief: 'Film a casual, relatable day-in-the-life UGC video explaining how anyone in Africa can transition into tech with AltSchool.',
      status: 'open',
      country: 'Nigeria',
      city: 'Lagos',
    },
    {
      name: 'Kuda Everyday Banking: Campus UGC Lifestyle',
      goal: 'Gen-Z Adoption',
      category: 'ugc',
      deliverableType: 'UGC Creator Reel',
      budgetPerCreator: 220000,
      quantity: 6,
      brief: 'Capture an authentic campus moment splitting food with friends and using Kuda free transfers in real-time.',
      status: 'open',
      country: 'Nigeria',
      city: 'Abuja',
    },
    {
      name: 'Glow Skin Barrier Serum: Honest UGC First Impressions',
      goal: 'Authentic Social Proof',
      category: 'ugc',
      deliverableType: 'UGC Skincare Review (60s)',
      budgetPerCreator: 85000,
      quantity: 3,
      brief: '7-day honest skin transformation. No heavy studio lighting, pure authentic UGC morning bathroom skincare routine.',
      status: 'open',
      country: 'Nigeria',
      city: 'Lagos',
    },
    {
      name: 'FitLife Africa: Raw Gym Morning Routine UGC',
      goal: 'Community Fitness Challenge',
      category: 'fitness',
      deliverableType: 'UGC Workout Video',
      budgetPerCreator: 75000,
      quantity: 4,
      brief: 'Film a raw 6 AM workout clip and pre-workout shake prep using FitLife supplements.',
      status: 'open',
      country: 'Nigeria',
      city: 'Port Harcourt',
    },
  ];

  for (const c of ugcCampaigns) {
    const existing = await prisma.campaign.findFirst({ where: { name: c.name } });
    if (!existing) {
      await prisma.campaign.create({
        data: {
          organizationId: org!.id,
          ...c,
          currency: 'NGN',
          applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
          deliveryDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28),
        },
      });
    } else {
      await prisma.campaign.update({
        where: { id: existing.id },
        data: {
          category: c.category,
          deliverableType: c.deliverableType,
          budgetPerCreator: c.budgetPerCreator,
          status: 'open',
        },
      });
    }
  }
  console.log('✅ Successfully seeded UGC campaigns for Image 2 filters!');
}

seedUGC()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
