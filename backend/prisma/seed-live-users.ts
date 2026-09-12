import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CREATOR_USER_ID = 'b0a5e9dd-4367-44b9-b5aa-7bb618dda95a';
const CREATOR_EMAIL = 'jaelrealm@gmail.com';

const BRAND_USER_ID = '27a06bb9-0177-437c-a54d-e6a6d3df69e1';
const BRAND_EMAIL = 'useyard.dev@gmail.com';

async function main() {
  console.log('🚀 Starting realistic live database seed for:');
  console.log(`- Creator: ${CREATOR_EMAIL} [${CREATOR_USER_ID}]`);
  console.log(`- Brand:   ${BRAND_EMAIL} [${BRAND_USER_ID}]`);

  // 1. Verify and Fetch the Users
  const creatorUser = await prisma.user.findUnique({
    where: { id: CREATOR_USER_ID },
  });
  if (!creatorUser) {
    throw new Error(`Creator user ${CREATOR_USER_ID} (${CREATOR_EMAIL}) not found in database!`);
  }

  const brandUser = await prisma.user.findUnique({
    where: { id: BRAND_USER_ID },
  });
  if (!brandUser) {
    throw new Error(`Brand user ${BRAND_USER_ID} (${BRAND_EMAIL}) not found in database!`);
  }

  // 2. Ensure Platforms Exist
  console.log('📦 Ensuring standard platforms exist...');
  const platformNames = ['instagram', 'tiktok', 'youtube', 'x'];
  const platforms: Record<string, string> = {};
  for (const name of platformNames) {
    const p = await prisma.platform.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    platforms[name] = p.id;
  }

  // 3. Upsert / Enrich Creator Profile
  console.log('✨ Enriching Creator profile for Joel Abundant...');
  let creator = await prisma.creator.findFirst({
    where: { userId: creatorUser.id },
  });

  const creatorData = {
    displayName: 'Joel Abundant',
    bio: 'Lead Tech & Lifestyle Creator based in Lagos. Specializing in high-converting SaaS walkthroughs, product unboxings, and fintech integrations. 120k+ combined audience.',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    verified: true,
    payoutAccount: {
      bank_name: 'Guaranty Trust Bank (GTBank)',
      bank_code: '058',
      account_number: '0429184729',
      account_name: 'Joel Abundant O.',
      currency: 'NGN',
      recipient_code: 'RCP_live_89172401',
    },
  };

  if (!creator) {
    creator = await prisma.creator.create({
      data: {
        userId: creatorUser.id,
        ...creatorData,
      },
    });
  } else {
    creator = await prisma.creator.update({
      where: { id: creator.id },
      data: creatorData,
    });
  }

  // 4. Update Creator Metadata (Socials, Rates, Categories, Stats, Score)
  console.log('📊 Updating Creator social accounts, rates, stats, and scores...');
  
  // Clean prior creator sub-records to prevent duplicates
  await prisma.creatorCategory.deleteMany({ where: { creatorId: creator.id } });
  await prisma.creatorCategory.createMany({
    data: [
      { creatorId: creator.id, category: 'Tech & Gadgets' },
      { creatorId: creator.id, category: 'Fintech & SaaS' },
      { creatorId: creator.id, category: 'Lifestyle' },
    ],
  });

  await prisma.creatorLanguage.deleteMany({ where: { creatorId: creator.id } });
  await prisma.creatorLanguage.createMany({
    data: [
      { creatorId: creator.id, language: 'English' },
      { creatorId: creator.id, language: 'Nigerian Pidgin' },
    ],
  });

  await prisma.creatorLocation.deleteMany({ where: { creatorId: creator.id } });
  await prisma.creatorLocation.create({
    data: { creatorId: creator.id, country: 'Nigeria', city: 'Lagos' },
  });

  // Rates
  await prisma.creatorRate.deleteMany({ where: { creatorId: creator.id } });
  await prisma.creatorRate.createMany({
    data: [
      { creatorId: creator.id, deliverableType: 'Instagram Reel (60s)', amount: 250000, currency: 'NGN' },
      { creatorId: creator.id, deliverableType: 'TikTok Video (9:16)', amount: 200000, currency: 'NGN' },
      { creatorId: creator.id, deliverableType: 'YouTube Dedicated Review', amount: 450000, currency: 'NGN' },
      { creatorId: creator.id, deliverableType: 'X (Twitter) Viral Thread + Video', amount: 150000, currency: 'NGN' },
    ],
  });

  // Social Accounts
  await prisma.creatorSocialAccount.deleteMany({ where: { creatorId: creator.id } });
  await prisma.creatorSocialAccount.createMany({
    data: [
      { creatorId: creator.id, platform: 'instagram', handle: 'joelabundant', profileUrl: 'https://instagram.com/joelabundant' },
      { creatorId: creator.id, platform: 'tiktok', handle: 'joelabundant_tech', profileUrl: 'https://tiktok.com/@joelabundant_tech' },
      { creatorId: creator.id, platform: 'youtube', handle: 'JoelAbundantTV', profileUrl: 'https://youtube.com/@JoelAbundantTV' },
      { creatorId: creator.id, platform: 'x', handle: 'joelabundant', profileUrl: 'https://x.com/joelabundant' },
    ],
  });

  // Social Metric Snapshots
  await prisma.socialMetricSnapshot.deleteMany({ where: { creatorId: creator.id } });
  await prisma.socialMetricSnapshot.createMany({
    data: [
      {
        creatorId: creator.id,
        platform: 'instagram',
        followers: 45200,
        following: 580,
        posts: 214,
        engagementRate: 4.85,
        source: 'manual',
        capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
      {
        creatorId: creator.id,
        platform: 'tiktok',
        followers: 88400,
        following: 210,
        posts: 145,
        engagementRate: 6.20,
        source: 'manual',
        capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
      {
        creatorId: creator.id,
        platform: 'youtube',
        followers: 16800,
        following: 45,
        posts: 62,
        engagementRate: 7.10,
        source: 'manual',
        capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
    ],
  });

  // Creator Stats
  await prisma.creatorStats.upsert({
    where: { creatorId: creator.id },
    update: {
      campaignsCompleted: 8,
      campaignsCancelled: 0,
      onTimeDeliveries: 8,
      lateDeliveries: 0,
      revisionsRequested: 1,
      disputes: 0,
      repeatHires: 5,
    },
    create: {
      creatorId: creator.id,
      campaignsCompleted: 8,
      campaignsCancelled: 0,
      onTimeDeliveries: 8,
      lateDeliveries: 0,
      revisionsRequested: 1,
      disputes: 0,
      repeatHires: 5,
    },
  });

  // Creator Score
  await prisma.creatorScore.deleteMany({ where: { creatorId: creator.id } });
  await prisma.creatorScore.create({
    data: {
      creatorId: creator.id,
      score: 96.5,
      scoreVersion: 'v1.0-bayesian',
      calculatedAt: new Date(),
    },
  });

  // 5. Enrich Brand Organization
  console.log('🏢 Enriching Brand Organization for Yard Class...');
  let orgMember = await prisma.organizationMember.findFirst({
    where: { userId: brandUser.id },
    include: { organization: true },
  });

  let orgId = orgMember?.organizationId;
  if (!orgId) {
    const newOrg = await prisma.organization.create({
      data: {
        name: 'Yard Technologies',
        website: 'https://useyard.dev',
        industry: 'Fintech & Creator Economy',
        members: {
          create: {
            userId: brandUser.id,
            role: 'owner',
          },
        },
      },
    });
    orgId = newOrg.id;
  } else {
    await prisma.organization.update({
      where: { id: orgId },
      data: {
        name: 'Yard Technologies',
        website: 'https://useyard.dev',
        industry: 'Fintech & Creator Economy',
      },
    });
  }

  // 6. Clean Existing Campaigns for this Brand Org and Applications for this Creator
  console.log('🧹 Cleaning old test campaigns and applications...');
  await prisma.application.deleteMany({
    where: {
      OR: [
        { creatorId: creator.id },
        { campaign: { organizationId: orgId } },
      ],
    },
  });
  await prisma.campaign.deleteMany({
    where: { organizationId: orgId },
  });

  // 7. Seed Real Deliverable Files
  const file1 = await prisma.file.create({
    data: {
      uploadedBy: creatorUser.id,
      provider: 'cloudinary',
      providerFileId: 'yard_mvp/deliverables/del_launch_reel',
      providerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      fileType: 'video/mp4',
      fileSize: BigInt(18420000),
      status: 'active',
    },
  });

  const file2 = await prisma.file.create({
    data: {
      uploadedBy: creatorUser.id,
      provider: 'cloudinary',
      providerFileId: 'yard_mvp/deliverables/del_app_walkthrough',
      providerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      fileType: 'video/mp4',
      fileSize: BigInt(24500000),
      status: 'active',
    },
  });

  const file3 = await prisma.file.create({
    data: {
      uploadedBy: creatorUser.id,
      provider: 'cloudinary',
      providerFileId: 'yard_mvp/deliverables/del_fintech_security',
      providerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      fileType: 'video/mp4',
      fileSize: BigInt(15200000),
      status: 'active',
    },
  });

  // Portfolio items
  await prisma.creatorPortfolio.deleteMany({ where: { creatorId: creator.id } });
  await prisma.creatorPortfolio.createMany({
    data: [
      { creatorId: creator.id, title: 'Yard Brand Launch Teaser (Top Performer - 340k Views)', fileId: file1.id },
      { creatorId: creator.id, title: 'How I Manage Creator Payouts with Instant Escrow', fileId: file2.id },
      { creatorId: creator.id, title: 'Fintech Product Deep Dive: Zero Latency Transfers', fileId: file3.id },
    ],
  });

  // 8. Create 5 Linked Real Life Deals between Yard Technologies and Joel Abundant
  console.log('🤝 Creating 5 interconnected Brand-Creator campaigns & deals...');

  // DEAL 1: Completed & Paid
  // Status: closed / completed, deliverable approved, payment paid out
  const camp1 = await prisma.campaign.create({
    data: {
      organizationId: orgId,
      name: 'Yard Creator Showcase: Ecosystem Keynote Reel',
      goal: 'Brand Awareness & High-Intent Signups',
      category: 'Fintech & SaaS',
      country: 'Nigeria',
      city: 'Lagos',
      brief: 'Produce a punchy 60-second Instagram Reel introducing the Yard Creator Operating System. Showcase the automated escrow payment feature and fast rate cards.',
      deliverableType: 'Instagram Reel (60s)',
      quantity: 1,
      budgetPerCreator: 250000,
      currency: 'NGN',
      status: 'closed',
      applicationDeadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
      deliveryDeadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      platforms: {
        create: [{ platformId: platforms['instagram'] }, { platformId: platforms['x'] }],
      },
      requirements: {
        create: [{ minFollowers: 25000, category: 'Tech & Gadgets', country: 'Nigeria', language: 'English' }],
      },
    },
  });

  const app1 = await prisma.application.create({
    data: {
      campaignId: camp1.id,
      creatorId: creator.id,
      source: 'applied',
      status: 'accepted',
      pitch: 'Excited to showcase the automated escrow workflow! I will record from my studio with dual-angle 4K.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18),
      decidedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 17),
    },
  });

  await prisma.deliverable.create({
    data: {
      campaignId: camp1.id,
      applicationId: app1.id,
      fileId: file1.id,
      status: 'approved',
      version: 1,
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    },
  });

  await prisma.payment.create({
    data: {
      campaignId: camp1.id,
      applicationId: app1.id,
      amount: 250000,
      currency: 'NGN',
      provider: 'paystack',
      providerRef: 'TRF_yrd_live_091823901',
      status: 'paid',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    },
  });

  await prisma.campaignActivity.createMany({
    data: [
      {
        campaignId: camp1.id,
        actorId: creatorUser.id,
        eventType: 'DELIVERABLE_SUBMITTED',
        body: 'Joel submitted version 1 of the Keynote Reel for brand review.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
      },
      {
        campaignId: camp1.id,
        actorId: brandUser.id,
        eventType: 'DELIVERABLE_APPROVED',
        body: 'Yard approved the deliverable without modifications.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      },
      {
        campaignId: camp1.id,
        actorId: brandUser.id,
        eventType: 'PAYMENT_DISBURSED',
        body: '₦250,000 disbursed to Joel Abundant via Paystack instant settlement.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
      },
    ],
  });

  // DEAL 2: Approved & Payout Processing
  // Status: in_progress / review, deliverable approved, payment initiated
  const camp2 = await prisma.campaign.create({
    data: {
      organizationId: orgId,
      name: 'Yard Mobile V1 Beta: Creator Walkthrough',
      goal: 'App Downloads & Beta Community Onboarding',
      category: 'Fintech & SaaS',
      country: 'Nigeria',
      city: 'Lagos',
      brief: 'Record a TikTok/Reels style vertical walkthrough demonstrating how creators can send invoices, track deals, and receive instant disbursements.',
      deliverableType: 'TikTok Video (9:16)',
      quantity: 2,
      budgetPerCreator: 350000,
      currency: 'NGN',
      status: 'in_progress',
      applicationDeadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      deliveryDeadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      platforms: {
        create: [{ platformId: platforms['tiktok'] }, { platformId: platforms['instagram'] }],
      },
      requirements: {
        create: [{ minFollowers: 30000, category: 'Fintech & SaaS', country: 'Nigeria' }],
      },
    },
  });

  const app2 = await prisma.application.create({
    data: {
      campaignId: camp2.id,
      creatorId: creator.id,
      source: 'applied',
      status: 'accepted',
      pitch: 'My TikTok audience loves app teardowns. Will show the exact UI and click-through flow.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
      decidedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
    },
  });

  await prisma.deliverable.create({
    data: {
      campaignId: camp2.id,
      applicationId: app2.id,
      fileId: file2.id,
      status: 'approved',
      version: 1,
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
  });

  await prisma.payment.create({
    data: {
      campaignId: camp2.id,
      applicationId: app2.id,
      amount: 350000,
      currency: 'NGN',
      provider: 'paystack',
      providerRef: 'TRF_init_beta_walkthrough',
      status: 'payment_initiated',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10),
    },
  });

  await prisma.campaignActivity.createMany({
    data: [
      {
        campaignId: camp2.id,
        actorId: creatorUser.id,
        eventType: 'DELIVERABLE_SUBMITTED',
        body: 'Vertical walkthrough video uploaded for review.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
      {
        campaignId: camp2.id,
        actorId: brandUser.id,
        eventType: 'DELIVERABLE_APPROVED',
        body: 'Deliverable approved! Automated payment processing initiated.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      },
    ],
  });

  // DEAL 3: Submitted & In Review (Awaiting Brand Review / Revision)
  // Status: in_progress, deliverable submitted
  const camp3 = await prisma.campaign.create({
    data: {
      organizationId: orgId,
      name: 'Fintech Security & Instant Settlement Campaign',
      goal: 'Trust & Credibility',
      category: 'Fintech & SaaS',
      country: 'Nigeria',
      city: 'Lagos',
      brief: 'Highlight Yard Bank-Grade Escrow protection and instant payouts for high-earning digital creators in Africa.',
      deliverableType: 'Instagram Reel (60s)',
      quantity: 1,
      budgetPerCreator: 200000,
      currency: 'NGN',
      status: 'in_progress',
      applicationDeadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      deliveryDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      platforms: {
        create: [{ platformId: platforms['instagram'] }],
      },
      requirements: {
        create: [{ minFollowers: 20000, country: 'Nigeria' }],
      },
    },
  });

  const app3 = await prisma.application.create({
    data: {
      campaignId: camp3.id,
      creatorId: creator.id,
      source: 'applied',
      status: 'accepted',
      pitch: 'I have had issues with client ghosting in the past. This message is authentic and directly hits creator pain points.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      decidedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
  });

  await prisma.deliverable.create({
    data: {
      campaignId: camp3.id,
      applicationId: app3.id,
      fileId: file3.id,
      status: 'submitted',
      version: 1,
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    },
  });

  await prisma.campaignActivity.create({
    data: {
      campaignId: camp3.id,
      actorId: creatorUser.id,
      eventType: 'DELIVERABLE_SUBMITTED',
      body: 'Joel submitted final cut for the Instant Settlement Campaign. Ready for brand sign-off.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    },
  });

  // DEAL 4: Accepted / Active Work In Progress (Deliverable Due Soon)
  // Status: in_progress, creator working on draft
  const camp4 = await prisma.campaign.create({
    data: {
      organizationId: orgId,
      name: 'Yard Q4 Creator Blitz: Black Friday & Cyber Week',
      goal: 'Seasonal Sales & Creator Onboarding',
      category: 'Fintech & SaaS',
      country: 'Nigeria',
      city: 'Lagos',
      brief: 'Produce a comprehensive YouTube dedicated video exploring the future of African creator monetization, featuring Yard as the central workspace.',
      deliverableType: 'YouTube Dedicated Review',
      quantity: 3,
      budgetPerCreator: 450000,
      currency: 'NGN',
      status: 'in_progress',
      applicationDeadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      deliveryDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6), // due in 6 days
      platforms: {
        create: [{ platformId: platforms['youtube'] }, { platformId: platforms['x'] }],
      },
      requirements: {
        create: [{ minFollowers: 15000, country: 'Nigeria', category: 'Tech & Gadgets' }],
      },
    },
  });

  const app4 = await prisma.application.create({
    data: {
      campaignId: camp4.id,
      creatorId: creator.id,
      source: 'applied',
      status: 'accepted',
      pitch: 'Planning a 10-minute deep dive comparing manual invoicing vs Yard automated contracts and escrow.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      decidedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    },
  });

  await prisma.campaignActivity.create({
    data: {
      campaignId: camp4.id,
      actorId: brandUser.id,
      eventType: 'APPLICATION_ACCEPTED',
      body: 'Yard Technologies accepted Joel Abundant for the Black Friday Blitz.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    },
  });

  // DEAL 5: Direct Brand Invitation (Opportunity Stage)
  // Status: open, creator invited, pending creator response
  const camp5 = await prisma.campaign.create({
    data: {
      organizationId: orgId,
      name: 'Yard Annual Brand Ambassador 2026',
      goal: 'Long-term Ambassador Partnership',
      category: 'Fintech & SaaS',
      country: 'Nigeria',
      city: 'Lagos',
      brief: 'Exclusive ambassador role for top tech and creator economy thought leaders. 4 monthly deliverables across Instagram, TikTok, and X.',
      deliverableType: 'Ambassador Package',
      quantity: 1,
      budgetPerCreator: 600000,
      currency: 'NGN',
      status: 'open',
      applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      deliveryDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      platforms: {
        create: [{ platformId: platforms['instagram'] }, { platformId: platforms['tiktok'] }, { platformId: platforms['youtube'] }, { platformId: platforms['x'] }],
      },
      requirements: {
        create: [{ minFollowers: 40000, country: 'Nigeria' }],
      },
    },
  });

  await prisma.application.create({
    data: {
      campaignId: camp5.id,
      creatorId: creator.id,
      source: 'invited',
      status: 'pending',
      pitch: 'Direct brand invitation from Yard Technologies to join our 2026 Ambassador cohort.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
  });

  await prisma.campaignActivity.create({
    data: {
      campaignId: camp5.id,
      actorId: brandUser.id,
      eventType: 'CREATOR_INVITED',
      body: 'Yard Technologies invited Joel Abundant to the Annual Brand Ambassador program.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
  });

  console.log('✅ All 5 brand deals successfully linked between:');
  console.log(`- Brand: Yard Technologies (useyard.dev@gmail.com)`);
  console.log(`- Creator: Joel Abundant (jaelrealm@gmail.com)`);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
