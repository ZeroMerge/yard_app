import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const targetEmail = process.argv[2];
  
  if (!targetEmail) {
    console.error("Please provide a user email. Usage: npx ts-node prisma/seed-test-account.ts <email>");
    process.exit(1);
  }

  console.log(`Seeding mock states for user: ${targetEmail}`);

  const user = await prisma.user.findUnique({
    where: { email: targetEmail }
  });

  if (!user) {
    console.error(`User with email ${targetEmail} not found. Please log in once to create the account.`);
    process.exit(1);
  }

  if (user.role !== 'creator') {
    console.error(`User ${targetEmail} is a ${user.role}, not a creator.`);
    process.exit(1);
  }

  let creator = await prisma.creator.findFirst({
    where: { userId: user.id }
  });

  if (!creator) {
    creator = await prisma.creator.create({
      data: {
        userId: user.id,
        displayName: 'Test Creator',
      }
    });
  }

  // 1. Ensure Brand & Org exist
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const brandUser = await prisma.user.upsert({
    where: { email: 'brand_states@yard.com' },
    update: {},
    create: { email: 'brand_states@yard.com', passwordHash, role: 'brand', status: 'active' },
  });

  let org = await prisma.organization.findFirst({ where: { name: 'State Test Org' } });
  if (!org) {
    org = await prisma.organization.create({
      data: { name: 'State Test Org', members: { create: { userId: brandUser.id, role: 'owner' } } },
    });
  }

  // Helper to create basic campaign
  const createCampaign = async (name: string, status: string, deliveryDeadline?: Date) => {
    return prisma.campaign.create({
      data: {
        organizationId: org!.id,
        name,
        goal: 'content_creation',
        category: 'lifestyle',
        country: 'Nigeria',
        brief: 'Test brief for ' + name,
        deliverableType: 'reel',
        quantity: 1,
        budgetPerCreator: 150000,
        status,
        deliveryDeadline,
      }
    });
  };

  // Clean existing applications and deliverables for this creator
  console.log("Cleaning existing test states for this creator...");
  await prisma.application.deleteMany({ where: { creatorId: creator.id } });

  console.log("Seeding new states...");

  // STATE: Applied but no active work (Opportunities / Discover state)
  const campApplied = await createCampaign('Fenty Beauty - Summer Gloss', 'open');
  await prisma.application.create({ data: { campaignId: campApplied.id, creatorId: creator.id, status: 'pending', source: 'applied' } });

  // STATE: Invited by a brand
  const campInvited = await createCampaign('Zuri Beauty - Glow Drops Launch', 'open');
  await prisma.application.create({ data: { campaignId: campInvited.id, creatorId: creator.id, status: 'pending', source: 'invited' } });

  // STATE: Accepted into a campaign (no deliverable due yet)
  const campInProgress = await createCampaign('Adidas Originals - Streetwear Lagos', 'in_progress', new Date(Date.now() + 14 * 86400000));
  await prisma.application.create({ data: { campaignId: campInProgress.id, creatorId: creator.id, status: 'accepted', source: 'applied' } });

  // STATE: Submitted work — waiting for review
  const campSubmitted = await createCampaign('Spotify Africa - Afrobeats Rising', 'in_progress');
  const appSubmitted = await prisma.application.create({ data: { campaignId: campSubmitted.id, creatorId: creator.id, status: 'accepted' } });
  
  // Dummy file for deliverable
  const dummyFile = await prisma.file.create({
    data: { uploadedBy: brandUser.id, provider: 'local', providerFileId: 'dummy', status: 'active' }
  });

  await prisma.deliverable.create({ data: { campaignId: campSubmitted.id, applicationId: appSubmitted.id, fileId: dummyFile.id, status: 'submitted' } });

  // STATE: Brand requests a revision
  const campRevision = await createCampaign('Nike Africa - Run Lagos', 'in_progress');
  const appRevision = await prisma.application.create({ data: { campaignId: campRevision.id, creatorId: creator.id, status: 'accepted' } });
  await prisma.deliverable.create({ data: { campaignId: campRevision.id, applicationId: appRevision.id, fileId: dummyFile.id, status: 'revision_requested', revisionNotes: 'Please adjust the audio balancing and resubmit.' } });

  // STATE: Work is approved (Payment processing)
  const campApproved = await createCampaign('Gucci West Africa - FW26', 'in_progress');
  const appApproved = await prisma.application.create({ data: { campaignId: campApproved.id, creatorId: creator.id, status: 'accepted' } });
  await prisma.deliverable.create({ data: { campaignId: campApproved.id, applicationId: appApproved.id, fileId: dummyFile.id, status: 'approved' } });
  await prisma.payment.create({ data: { campaignId: campApproved.id, applicationId: appApproved.id, amount: 150000, provider: 'manual', status: 'payment_initiated' } });

  // STATE: Completed everything
  const campCompleted = await createCampaign('Bolt Nigeria - Safety First', 'closed');
  const appCompleted = await prisma.application.create({ data: { campaignId: campCompleted.id, creatorId: creator.id, status: 'accepted' } });
  await prisma.deliverable.create({ data: { campaignId: campCompleted.id, applicationId: appCompleted.id, fileId: dummyFile.id, status: 'approved' } });
  await prisma.payment.create({ data: { campaignId: campCompleted.id, applicationId: appCompleted.id, amount: 150000, provider: 'manual', status: 'paid' } });

  // Ensure there are some completely open campaigns for the discover page
  await createCampaign('Samsung Africa - Galaxy Z Fold', 'open');
  await createCampaign('Bolt Ghana - New Riders', 'open');

  console.log('Seeding complete! You can now log into the frontend with this account to see the populated Work pipeline and Campaigns.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
