import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const CREATOR_USER_ID = 'b0a5e9dd-4367-44b9-b5aa-7bb618dda95a';
const CREATOR_EMAIL = 'jaelrealm@gmail.com';

const BRAND_USER_ID = '27a06bb9-0177-437c-a54d-e6a6d3df69e1';
const BRAND_EMAIL = 'useyard.dev@gmail.com';

async function main() {
  console.log('🌟 Commencing Ultimate Production Seeding Flow...');
  console.log(`- Target Creator: ${CREATOR_EMAIL} [${CREATOR_USER_ID}]`);
  console.log(`- Target Brand:   ${BRAND_EMAIL} [${BRAND_USER_ID}]`);

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Ensure Target Users Exist
  const creatorUser = await prisma.user.findUnique({ where: { id: CREATOR_USER_ID } });
  if (!creatorUser) throw new Error(`Creator ${CREATOR_USER_ID} not found in Supabase!`);

  const brandUser = await prisma.user.findUnique({ where: { id: BRAND_USER_ID } });
  if (!brandUser) throw new Error(`Brand ${BRAND_USER_ID} not found in Supabase!`);

  // 2. Ensure Platforms
  console.log('📱 Seeding platforms...');
  const platformNames = ['instagram', 'tiktok', 'youtube', 'x', 'facebook'];
  const platforms: Record<string, string> = {};
  for (const name of platformNames) {
    const p = await prisma.platform.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    platforms[name] = p.id;
  }

  // 3. Update & Deepen Creator Profile (Joel Abundant)
  console.log('👤 Deepening Creator profile for Joel Abundant...');
  let joel = await prisma.creator.findFirst({ where: { userId: creatorUser.id } });
  const joelData = {
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
  if (!joel) {
    joel = await prisma.creator.create({ data: { userId: creatorUser.id, ...joelData } });
  } else {
    joel = await prisma.creator.update({ where: { id: joel.id }, data: joelData });
  }

  // Joel Categories
  await prisma.creatorCategory.deleteMany({ where: { creatorId: joel.id } });
  await prisma.creatorCategory.createMany({
    data: [
      { creatorId: joel.id, category: 'tech' },
      { creatorId: joel.id, category: 'finance' },
      { creatorId: joel.id, category: 'lifestyle' },
    ],
  });

  // Joel Languages & Location
  await prisma.creatorLanguage.deleteMany({ where: { creatorId: joel.id } });
  await prisma.creatorLanguage.createMany({
    data: [
      { creatorId: joel.id, language: 'English' },
      { creatorId: joel.id, language: 'Nigerian Pidgin' },
    ],
  });
  await prisma.creatorLocation.deleteMany({ where: { creatorId: joel.id } });
  await prisma.creatorLocation.create({
    data: { creatorId: joel.id, country: 'Nigeria', city: 'Lagos' },
  });

  // Joel Rate Cards
  await prisma.creatorRate.deleteMany({ where: { creatorId: joel.id } });
  await prisma.creatorRate.createMany({
    data: [
      { creatorId: joel.id, deliverableType: 'Instagram Reel (60s)', amount: 250000, currency: 'NGN' },
      { creatorId: joel.id, deliverableType: 'TikTok Video (9:16)', amount: 200000, currency: 'NGN' },
      { creatorId: joel.id, deliverableType: 'YouTube Dedicated Review', amount: 450000, currency: 'NGN' },
      { creatorId: joel.id, deliverableType: 'X (Twitter) Viral Thread', amount: 150000, currency: 'NGN' },
    ],
  });

  // Joel Social Accounts
  await prisma.creatorSocialAccount.deleteMany({ where: { creatorId: joel.id } });
  await prisma.creatorSocialAccount.createMany({
    data: [
      { creatorId: joel.id, platform: 'instagram', handle: 'joelabundant', profileUrl: 'https://instagram.com/joelabundant' },
      { creatorId: joel.id, platform: 'tiktok', handle: 'joelabundant_tech', profileUrl: 'https://tiktok.com/@joelabundant_tech' },
      { creatorId: joel.id, platform: 'youtube', handle: 'JoelAbundantTV', profileUrl: 'https://youtube.com/@JoelAbundantTV' },
      { creatorId: joel.id, platform: 'x', handle: 'joelabundant', profileUrl: 'https://x.com/joelabundant' },
    ],
  });

  // Joel Multi-Snapshot History (Past 3 months for growth charts)
  await prisma.socialMetricSnapshot.deleteMany({ where: { creatorId: joel.id } });
  await prisma.socialMetricSnapshot.createMany({
    data: [
      { creatorId: joel.id, platform: 'instagram', followers: 38200, following: 540, posts: 190, engagementRate: 4.4, source: 'manual', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60) },
      { creatorId: joel.id, platform: 'instagram', followers: 42100, following: 560, posts: 202, engagementRate: 4.6, source: 'manual', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
      { creatorId: joel.id, platform: 'instagram', followers: 45200, following: 580, posts: 214, engagementRate: 4.85, source: 'manual', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
      { creatorId: joel.id, platform: 'tiktok', followers: 71000, following: 190, posts: 120, engagementRate: 5.8, source: 'manual', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60) },
      { creatorId: joel.id, platform: 'tiktok', followers: 88400, following: 210, posts: 145, engagementRate: 6.2, source: 'manual', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
      { creatorId: joel.id, platform: 'youtube', followers: 12400, following: 40, posts: 50, engagementRate: 6.8, source: 'manual', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60) },
      { creatorId: joel.id, platform: 'youtube', followers: 16800, following: 45, posts: 62, engagementRate: 7.1, source: 'manual', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
    ],
  });

  // Joel Stats & Bayesian Score
  await prisma.creatorStats.upsert({
    where: { creatorId: joel.id },
    update: {
      campaignsCompleted: 12,
      campaignsCancelled: 0,
      onTimeDeliveries: 12,
      lateDeliveries: 0,
      revisionsRequested: 1,
      disputes: 0,
      repeatHires: 6,
    },
    create: {
      creatorId: joel.id,
      campaignsCompleted: 12,
      campaignsCancelled: 0,
      onTimeDeliveries: 12,
      lateDeliveries: 0,
      revisionsRequested: 1,
      disputes: 0,
      repeatHires: 6,
    },
  });

  await prisma.creatorScore.deleteMany({ where: { creatorId: joel.id } });
  await prisma.creatorScore.create({
    data: {
      creatorId: joel.id,
      score: 97.2,
      scoreVersion: 'v1.0-bayesian',
      calculatedAt: new Date(),
    },
  });

  // 4. Ensure Brand Organization (Yard Technologies)
  console.log('🏢 Enriching Yard Technologies brand organization...');
  let orgMember = await prisma.organizationMember.findFirst({
    where: { userId: brandUser.id },
    include: { organization: true },
  });

  let yardOrgId = orgMember?.organizationId;
  if (!yardOrgId) {
    const newOrg = await prisma.organization.create({
      data: {
        name: 'Yard Technologies',
        website: 'https://useyard.dev',
        industry: 'Fintech & Creator Economy',
        members: { create: { userId: brandUser.id, role: 'owner' } },
      },
    });
    yardOrgId = newOrg.id;
  } else {
    await prisma.organization.update({
      where: { id: yardOrgId },
      data: {
        name: 'Yard Technologies',
        website: 'https://useyard.dev',
        industry: 'Fintech & Creator Economy',
      },
    });
  }

  // 5. Seed Diverse Creators for Discovery (Beauty, Fashion, Food, Fitness, Finance)
  console.log('🌈 Seeding diverse verified creators across niches for Discovery...');
  const discoveryCreatorsData = [
    {
      email: 'amaka.okafor@creators.ng',
      name: 'Amaka Okafor',
      category: 'beauty',
      bio: 'Lagos-based clean skincare & luxury beauty reviewer. Trusted by Sephora Africa and Glow Beauty. 48k IG followers.',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
      city: 'Lagos',
      rate: 180000,
      platform: 'instagram',
      handle: 'amaka_beauty',
    },
    {
      email: 'chioma.adeyemi@creators.ng',
      name: 'Chioma Adeyemi',
      category: 'fashion',
      bio: 'High-fashion editorial model & African streetwear curator. Forbes 30 Under 30 nominee. 62k community.',
      avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80',
      city: 'Lagos',
      rate: 220000,
      platform: 'instagram',
      handle: 'chioma_style',
    },
    {
      email: 'tunde.balogun@creators.ng',
      name: 'Tunde Balogun',
      category: 'finance',
      bio: 'Chartered financial analyst breaking down wealth building, stock portfolios, and fintech tools for Gen-Z Nigerians.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      city: 'Abuja',
      rate: 300000,
      platform: 'youtube',
      handle: 'TundeFinanceTV',
    },
    {
      email: 'chef.femi@creators.ng',
      name: 'Chef Femi Adeleke',
      category: 'food',
      bio: 'Culinary artist and gourmet street food explorer. Creator of Viral Jollof Teardowns. 85k TikTok foodies.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      city: 'Lagos',
      rate: 160000,
      platform: 'tiktok',
      handle: 'cheffemi_eats',
    },
    {
      email: 'sandra.fitness@creators.ng',
      name: 'Coach Sandra Okon',
      category: 'fitness',
      bio: 'Certified wellness coach, marathon runner, and HIIT workout specialist. Inspiring 35k active Africans.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      city: 'Port Harcourt',
      rate: 140000,
      platform: 'instagram',
      handle: 'sandra_fitlife',
    },
    {
      email: 'zainab.bello@creators.ng',
      name: 'Zainab Bello',
      category: 'lifestyle',
      bio: 'Luxury travel, tech nomad vlogger, and boutique hotel reviewer documenting African hidden gems.',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
      city: 'Abuja',
      rate: 280000,
      platform: 'youtube',
      handle: 'ZainabJourneys',
    },
  ];

  const otherCreators: any[] = [];
  for (const cData of discoveryCreatorsData) {
    const user = await prisma.user.upsert({
      where: { email: cData.email },
      update: {},
      create: {
        email: cData.email,
        passwordHash,
        role: 'creator',
        status: 'active',
      },
    });

    let creator = await prisma.creator.findFirst({ where: { userId: user.id } });
    if (!creator) {
      creator = await prisma.creator.create({
        data: {
          userId: user.id,
          displayName: cData.name,
          bio: cData.bio,
          profileImageUrl: cData.avatar,
          verified: true,
          payoutAccount: {
            bank_name: 'Access Bank',
            bank_code: '044',
            account_number: '1092837461',
            account_name: cData.name,
          },
        },
      });
    }

    await prisma.creatorCategory.deleteMany({ where: { creatorId: creator.id } });
    await prisma.creatorCategory.create({
      data: { creatorId: creator.id, category: cData.category },
    });

    await prisma.creatorLocation.deleteMany({ where: { creatorId: creator.id } });
    await prisma.creatorLocation.create({
      data: { creatorId: creator.id, country: 'Nigeria', city: cData.city },
    });

    await prisma.creatorRate.deleteMany({ where: { creatorId: creator.id } });
    await prisma.creatorRate.create({
      data: { creatorId: creator.id, deliverableType: `${cData.category} Reel`, amount: cData.rate, currency: 'NGN' },
    });

    await prisma.creatorSocialAccount.deleteMany({ where: { creatorId: creator.id } });
    await prisma.creatorSocialAccount.create({
      data: { creatorId: creator.id, platform: cData.platform, handle: cData.handle, profileUrl: `https://${cData.platform}.com/${cData.handle}` },
    });

    otherCreators.push(creator);
  }

  // 6. Clean Old Applications & Campaigns for Yard Technologies and Joel
  console.log('🧹 Clearing old test campaigns & applications...');
  await prisma.application.deleteMany({
    where: {
      OR: [
        { creatorId: joel.id },
        { campaign: { organizationId: yardOrgId } },
      ],
    },
  });
  await prisma.campaign.deleteMany({ where: { organizationId: yardOrgId } });

  // 7. Seed Media Files for Deliverables and Portfolio
  console.log('📁 Creating media files...');
  const createTestFile = async (name: string, url: string) => {
    return prisma.file.create({
      data: {
        uploadedBy: creatorUser.id,
        provider: 'cloudinary',
        providerFileId: `yard_mvp/deliverables/${name}`,
        providerUrl: url,
        fileType: 'video/mp4',
        fileSize: BigInt(22500000),
        status: 'active',
      },
    });
  };

  const fileKeynote = await createTestFile('keynote_reel', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const fileWalkthrough = await createTestFile('app_walkthrough', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4');
  const fileSecurity = await createTestFile('fintech_security', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4');
  const fileDevTools = await createTestFile('dev_tools_demo', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4');
  const fileBlitz = await createTestFile('blitz_draft', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4');

  // Joel Portfolio
  await prisma.creatorPortfolio.deleteMany({ where: { creatorId: joel.id } });
  await prisma.creatorPortfolio.createMany({
    data: [
      { creatorId: joel.id, title: 'Yard Brand Launch Teaser (340k Views across IG & TikTok)', fileId: fileKeynote.id },
      { creatorId: joel.id, title: 'How I Manage Creator Payouts with Instant Escrow', fileId: fileWalkthrough.id },
      { creatorId: joel.id, title: 'Fintech Product Deep Dive: Zero Latency Transfers', fileId: fileSecurity.id },
      { creatorId: joel.id, title: 'Full Stack API Automation in 60 Seconds', fileId: fileDevTools.id },
    ],
  });

  // 8. Seed 7 Core Interconnected Brand Deals for Yard Technologies
  console.log('🤝 Seeding 7 comprehensive Brand Deals for Yard Technologies...');

  // DEAL 1: Completed & Paid (Lifetime Earnings)
  const camp1 = await prisma.campaign.create({
    data: {
      organizationId: yardOrgId,
      name: 'Yard Creator Showcase: Ecosystem Keynote Reel',
      goal: 'Brand Awareness & Signups',
      category: 'tech',
      country: 'Nigeria',
      city: 'Lagos',
      brief: 'Produce a punchy 60-second Instagram Reel introducing the Yard Creator Operating System. Highlight instant escrow payments and digital contract signing.',
      deliverableType: 'Instagram Reel (60s)',
      quantity: 1,
      budgetPerCreator: 250000,
      currency: 'NGN',
      status: 'closed',
      applicationDeadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25),
      deliveryDeadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      platforms: { create: [{ platformId: platforms['instagram'] }, { platformId: platforms['x'] }] },
      requirements: { create: [{ minFollowers: 25000, category: 'tech', country: 'Nigeria', language: 'English' }] },
    },
  });

  const app1 = await prisma.application.create({
    data: {
      campaignId: camp1.id,
      creatorId: joel.id,
      source: 'applied',
      status: 'accepted',
      pitch: 'Excited to showcase the automated escrow workflow! I will record from my studio with dual-angle 4K.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22),
      decidedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
    },
  });

  await prisma.deliverable.create({
    data: {
      campaignId: camp1.id,
      applicationId: app1.id,
      fileId: fileKeynote.id,
      status: 'approved',
      version: 1,
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
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
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
    },
  });

  await prisma.campaignActivity.createMany({
    data: [
      { campaignId: camp1.id, actorId: brandUser.id, eventType: 'CAMPAIGN_CREATED', body: 'Yard Technologies created campaign brief.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25) },
      { campaignId: camp1.id, actorId: creatorUser.id, eventType: 'APPLICATION_SUBMITTED', body: 'Joel Abundant applied with pitch.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22) },
      { campaignId: camp1.id, actorId: brandUser.id, eventType: 'APPLICATION_ACCEPTED', body: 'Application accepted by Yard Technologies.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20) },
      { campaignId: camp1.id, actorId: creatorUser.id, eventType: 'DELIVERABLE_SUBMITTED', body: 'Deliverable video v1 uploaded.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12) },
      { campaignId: camp1.id, actorId: brandUser.id, eventType: 'DELIVERABLE_APPROVED', body: 'Deliverable approved by brand.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10) },
      { campaignId: camp1.id, actorId: brandUser.id, eventType: 'PAYMENT_DISBURSED', body: '₦250,000 paid to Joel Abundant via Paystack.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9) },
    ],
  });

  // DEAL 2: Approved & Payout Processing (Escrow)
  const camp2 = await prisma.campaign.create({
    data: {
      organizationId: yardOrgId,
      name: 'Yard Mobile V1 Beta: Creator Walkthrough',
      goal: 'App Downloads & Beta Community Onboarding',
      category: 'tech',
      country: 'Nigeria',
      city: 'Lagos',
      brief: 'Record a TikTok/Reels style vertical walkthrough demonstrating how creators can send invoices, track deals, and receive instant disbursements on Yard Mobile.',
      deliverableType: 'TikTok Video (9:16)',
      quantity: 2,
      budgetPerCreator: 350000,
      currency: 'NGN',
      status: 'in_progress',
      applicationDeadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      deliveryDeadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      platforms: { create: [{ platformId: platforms['tiktok'] }, { platformId: platforms['instagram'] }] },
      requirements: { create: [{ minFollowers: 30000, category: 'tech', country: 'Nigeria' }] },
    },
  });

  const app2 = await prisma.application.create({
    data: {
      campaignId: camp2.id,
      creatorId: joel.id,
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
      fileId: fileWalkthrough.id,
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

  // Also add another applicant creator to camp2 (Amaka Okafor pending review)
  await prisma.application.create({
    data: {
      campaignId: camp2.id,
      creatorId: otherCreators[0].id,
      source: 'applied',
      status: 'pending',
      pitch: 'Would love to review Yard Mobile from a beauty business owner perspective!',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
    },
  });

  // DEAL 3: Submitted & In Review (Deliverable Review Queue)
  const camp3 = await prisma.campaign.create({
    data: {
      organizationId: yardOrgId,
      name: 'Fintech Security & Instant Settlement Campaign',
      goal: 'Trust & Brand Credibility',
      category: 'finance',
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
      platforms: { create: [{ platformId: platforms['instagram'] }] },
      requirements: { create: [{ minFollowers: 20000, country: 'Nigeria' }] },
    },
  });

  const app3 = await prisma.application.create({
    data: {
      campaignId: camp3.id,
      creatorId: joel.id,
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
      fileId: fileSecurity.id,
      status: 'submitted',
      version: 1,
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    },
  });

  // DEAL 4: Action Required -> Revision Requested!
  // Populates the "Action Required" filter on creator Work page!
  const camp4 = await prisma.campaign.create({
    data: {
      organizationId: yardOrgId,
      name: 'Yard Developer APIs: Webhook & Ingestion Demo',
      goal: 'Developer Adoption',
      category: 'tech',
      country: 'Nigeria',
      city: 'Lagos',
      brief: 'Walk developers through the Yard NestJS backend webhooks and Python scraping ingestion bridge.',
      deliverableType: 'YouTube Dedicated Review',
      quantity: 1,
      budgetPerCreator: 400000,
      currency: 'NGN',
      status: 'in_progress',
      applicationDeadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
      deliveryDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      platforms: { create: [{ platformId: platforms['youtube'] }] },
      requirements: { create: [{ minFollowers: 15000, category: 'tech' }] },
    },
  });

  const app4 = await prisma.application.create({
    data: {
      campaignId: camp4.id,
      creatorId: joel.id,
      source: 'applied',
      status: 'accepted',
      pitch: 'Full code walkthrough in VS Code showing how fast webhooks trigger payout state changes.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      decidedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    },
  });

  await prisma.deliverable.create({
    data: {
      campaignId: camp4.id,
      applicationId: app4.id,
      fileId: fileDevTools.id,
      status: 'revision_requested',
      revisionNotes: 'Awesome demo! Please trim the terminal introduction by 4 seconds and add on-screen subtitles for the HMAC secret verification step.',
      version: 1,
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
  });

  // DEAL 5: Active Production (Due Soon)
  const camp5 = await prisma.campaign.create({
    data: {
      organizationId: yardOrgId,
      name: 'Yard Q4 Creator Blitz: Black Friday & Cyber Week',
      goal: 'Seasonal Sales & Creator Signups',
      category: 'tech',
      country: 'Nigeria',
      city: 'Lagos',
      brief: 'Comprehensive YouTube video exploring the future of African creator monetization, featuring Yard as the central operating system.',
      deliverableType: 'YouTube Dedicated Review',
      quantity: 3,
      budgetPerCreator: 450000,
      currency: 'NGN',
      status: 'in_progress',
      applicationDeadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      deliveryDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
      platforms: { create: [{ platformId: platforms['youtube'] }, { platformId: platforms['x'] }] },
      requirements: { create: [{ minFollowers: 15000, country: 'Nigeria', category: 'tech' }] },
    },
  });

  const app5 = await prisma.application.create({
    data: {
      campaignId: camp5.id,
      creatorId: joel.id,
      source: 'applied',
      status: 'accepted',
      pitch: 'Planning a 10-minute deep dive comparing manual invoicing vs Yard automated contracts and escrow.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      decidedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    },
  });

  // Also add Tunde Balogun and Chioma Adeyemi as applicants to camp5 (Multi-creator representation!)
  await prisma.application.create({
    data: {
      campaignId: camp5.id,
      creatorId: otherCreators[2].id, // Tunde Balogun (Finance)
      source: 'applied',
      status: 'pending',
      pitch: 'Can provide a detailed financial breakdown of creator revenue retention using Yard.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14),
    },
  });
  await prisma.application.create({
    data: {
      campaignId: camp5.id,
      creatorId: otherCreators[1].id, // Chioma Adeyemi (Fashion)
      source: 'applied',
      status: 'accepted',
      pitch: 'Will highlight how fashion creators handle brand brand retainers smoothly.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
      decidedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    },
  });

  // DEAL 6: Direct Brand Invitation (Opportunity Tab)
  const camp6 = await prisma.campaign.create({
    data: {
      organizationId: yardOrgId,
      name: 'Yard Annual Brand Ambassador 2026',
      goal: 'Long-term Ambassador Partnership',
      category: 'lifestyle',
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
      platforms: { create: [{ platformId: platforms['instagram'] }, { platformId: platforms['tiktok'] }, { platformId: platforms['youtube'] }, { platformId: platforms['x'] }] },
      requirements: { create: [{ minFollowers: 40000, country: 'Nigeria' }] },
    },
  });

  await prisma.application.create({
    data: {
      campaignId: camp6.id,
      creatorId: joel.id,
      source: 'invited',
      status: 'pending',
      pitch: 'Direct brand invitation from Yard Technologies to join our 2026 Ambassador cohort.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
  });

  // DEAL 7: Draft Campaign (Tests Draft status filter & editing)
  const camp7 = await prisma.campaign.create({
    data: {
      organizationId: yardOrgId,
      name: 'Yard Pan-African Expansion: Kenya & Ghana Roadshow',
      goal: 'Market Expansion',
      category: 'tech',
      country: 'Kenya',
      city: 'Nairobi',
      brief: 'Launch campaign for East African tech creators expanding across borders.',
      deliverableType: 'Video Reel',
      quantity: 4,
      budgetPerCreator: 300000,
      currency: 'NGN',
      status: 'draft',
      platforms: { create: [{ platformId: platforms['instagram'] }] },
    },
  });

  // 9. Seed Marketplace Campaigns from other Verified African Brands (Chowdeck, PiggyVest, Kuda, AltSchool)
  // Ensures /creator/campaigns search bar & filters ("Video Reels", "UGC / Creator", "High Payout") are 100% active!
  console.log('🛍️ Seeding Open Marketplace campaigns from top African brands...');
  const marketplaceBrands = [
    {
      email: 'partnerships@piggyvest.com',
      orgName: 'PiggyVest Tech Global',
      industry: 'Fintech & Savings',
      campaign: {
        name: 'PiggyVest SafeLock Savings Challenge (Q4)',
        category: 'finance',
        deliverableType: 'Instagram Reel (60s)',
        budgetPerCreator: 320000,
        quantity: 3,
        brief: 'Create an engaging Reel sharing your discipline strategy for saving toward year-end festivities using SafeLock.',
      },
    },
    {
      email: 'creators@chowdeck.com',
      orgName: 'Chowdeck Logistics Ltd',
      industry: 'Food Delivery & Quick Commerce',
      campaign: {
        name: 'Chowdeck Midnight Cravings UGC Series',
        category: 'food',
        deliverableType: 'TikTok Video (9:16)',
        budgetPerCreator: 180000,
        quantity: 5,
        brief: 'Order late-night suya, burgers, or pasta on Chowdeck and film an authentic unboxing reaction within 30 minutes.',
      },
    },
    {
      email: 'growth@kuda.com',
      orgName: 'Kuda Microfinance Bank',
      industry: 'Digital Banking',
      campaign: {
        name: 'Kuda Zero-Fee Transfers Challenge',
        category: 'finance',
        deliverableType: 'Instagram Reel (60s)',
        budgetPerCreator: 220000,
        quantity: 4,
        brief: 'Split lunch bills with 3 friends at a restaurant and show the zero-fee transfer alert in real-time.',
      },
    },
    {
      email: 'community@altschoolafrica.com',
      orgName: 'AltSchool Africa',
      industry: 'EdTech & Software Engineering',
      campaign: {
        name: 'AltSchool: Zero to Software Engineer UGC',
        category: 'tech',
        deliverableType: 'TikTok Video (9:16)',
        budgetPerCreator: 150000,
        quantity: 3,
        brief: 'Record a Day in the Life of a remote African developer and encourage young talent to enroll in diploma programs.',
      },
    },
  ];

  for (const mb of marketplaceBrands) {
    const brandU = await prisma.user.upsert({
      where: { email: mb.email },
      update: {},
      create: {
        email: mb.email,
        passwordHash,
        role: 'brand',
        status: 'active',
      },
    });

    let mOrg = await prisma.organization.findFirst({ where: { name: mb.orgName } });
    if (!mOrg) {
      mOrg = await prisma.organization.create({
        data: {
          name: mb.orgName,
          industry: mb.industry,
          members: { create: { userId: brandU.id, role: 'owner' } },
        },
      });
    }

    // Upsert the open campaign
    let existingCamp = await prisma.campaign.findFirst({ where: { name: mb.campaign.name } });
    if (!existingCamp) {
      await prisma.campaign.create({
        data: {
          organizationId: mOrg.id,
          name: mb.campaign.name,
          goal: 'Brand Growth',
          category: mb.campaign.category,
          country: 'Nigeria',
          city: 'Lagos',
          brief: mb.campaign.brief,
          deliverableType: mb.campaign.deliverableType,
          quantity: mb.campaign.quantity,
          budgetPerCreator: mb.campaign.budgetPerCreator,
          currency: 'NGN',
          status: 'open',
          applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
          deliveryDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28),
          platforms: { create: [{ platformId: platforms['instagram'] }, { platformId: platforms['tiktok'] }] },
          requirements: { create: [{ minFollowers: 10000, country: 'Nigeria' }] },
        },
      });
    }
  }

  console.log('🎉 Ultimate Seeding Flow successfully completed!');
}

main()
  .catch((err) => {
    console.error('❌ Error during ultimate seeding:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
