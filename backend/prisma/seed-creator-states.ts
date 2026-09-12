import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding creator states...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Ensure Brand & Org exist for the campaigns
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
        budgetPerCreator: 100000,
        status,
        deliveryDeadline,
      }
    });
  };

  // Helper to create a creator with a specific state
  const createCreator = async (email: string, name: string, fullySetup: boolean) => {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, passwordHash, role: 'creator', status: 'active' },
    });
    
    let creator = await prisma.creator.findFirst({ where: { userId: user.id } });
    if (!creator) {
      creator = await prisma.creator.create({
        data: {
          userId: user.id,
          displayName: name,
          bio: fullySetup ? 'Fully setup bio' : null,
          socialAccounts: fullySetup ? { create: [{ platform: 'instagram', handle: 'handle', profileUrl: 'url' }] } : undefined,
          rates: fullySetup ? { create: [{ deliverableType: 'reel', amount: 50000, currency: 'NGN' }] } : undefined,
          locations: fullySetup ? { create: { country: 'Nigeria', city: 'Lagos' } } : undefined,
        }
      });
    }
    return creator;
  };

  // STATE 1: Brand-new creator
  await createCreator('creator.1.new@yard.com', 'State 1: New', false);

  // STATE 2: Partially completed profile (Bio, but no rates/socials)
  const c2 = await createCreator('creator.2.partial@yard.com', 'State 2: Partial', false);
  await prisma.creator.update({ where: { id: c2.id }, data: { bio: 'I have a bio but no rates' } });

  // STATE 3: Fully set up but has never applied
  await createCreator('creator.3.ready@yard.com', 'State 3: Ready', true);

  // STATE 4: Applied but no active work
  const c4 = await createCreator('creator.4.applied@yard.com', 'State 4: Applied', true);
  const camp4 = await createCampaign('Campaign 4: Applied', 'open');
  await prisma.application.create({ data: { campaignId: camp4.id, creatorId: c4.id, status: 'pending', source: 'applied' } });

  // STATE 5: Invited by a brand
  const c5 = await createCreator('creator.5.invited@yard.com', 'State 5: Invited', true);
  const camp5 = await createCampaign('Campaign 5: Invited', 'open');
  await prisma.application.create({ data: { campaignId: camp5.id, creatorId: c5.id, status: 'pending', source: 'invited' } });

  // STATE 6: Accepted into a campaign (no deliverable due yet)
  const c6 = await createCreator('creator.6.accepted@yard.com', 'State 6: Accepted', true);
  const camp6 = await createCampaign('Campaign 6: In Progress', 'in_progress', new Date(Date.now() + 14 * 86400000));
  await prisma.application.create({ data: { campaignId: camp6.id, creatorId: c6.id, status: 'accepted', source: 'applied' } });

  // STATE 7: Deliverable due
  const c7 = await createCreator('creator.7.due@yard.com', 'State 7: Due Soon', true);
  const camp7 = await createCampaign('Campaign 7: Due Tomorrow', 'in_progress', new Date(Date.now() + 86400000));
  await prisma.application.create({ data: { campaignId: camp7.id, creatorId: c7.id, status: 'accepted', source: 'applied' } });

  // STATE 8: Submitted work — waiting for review
  const c8 = await createCreator('creator.8.submitted@yard.com', 'State 8: Submitted', true);
  const camp8 = await createCampaign('Campaign 8: Submitted', 'in_progress');
  const app8 = await prisma.application.create({ data: { campaignId: camp8.id, creatorId: c8.id, status: 'accepted' } });
  
  // Dummy file for deliverable
  const dummyFile = await prisma.file.create({
    data: { uploadedBy: brandUser.id, provider: 'local', providerFileId: 'dummy', status: 'active' }
  });

  await prisma.deliverable.create({ data: { campaignId: camp8.id, applicationId: app8.id, fileId: dummyFile.id, status: 'submitted' } });

  // STATE 9: Brand requests a revision
  const c9 = await createCreator('creator.9.revision@yard.com', 'State 9: Revision', true);
  const camp9 = await createCampaign('Campaign 9: Revision', 'in_progress');
  const app9 = await prisma.application.create({ data: { campaignId: camp9.id, creatorId: c9.id, status: 'accepted' } });
  await prisma.deliverable.create({ data: { campaignId: camp9.id, applicationId: app9.id, fileId: dummyFile.id, status: 'revision_requested', revisionNotes: 'Please fix lighting.' } });

  // STATE 10: Work is approved (Payment processing)
  const c10 = await createCreator('creator.10.approved@yard.com', 'State 10: Approved', true);
  const camp10 = await createCampaign('Campaign 10: Approved', 'in_progress');
  const app10 = await prisma.application.create({ data: { campaignId: camp10.id, creatorId: c10.id, status: 'accepted' } });
  await prisma.deliverable.create({ data: { campaignId: camp10.id, applicationId: app10.id, fileId: dummyFile.id, status: 'approved' } });
  await prisma.payment.create({ data: { campaignId: camp10.id, applicationId: app10.id, amount: 100000, provider: 'manual', status: 'payment_initiated' } });

  // STATE 11: Completed everything and has no current work
  const c11 = await createCreator('creator.11.completed@yard.com', 'State 11: Completed', true);
  const camp11 = await createCampaign('Campaign 11: Closed', 'closed');
  const app11 = await prisma.application.create({ data: { campaignId: camp11.id, creatorId: c11.id, status: 'accepted' } });
  await prisma.deliverable.create({ data: { campaignId: camp11.id, applicationId: app11.id, fileId: dummyFile.id, status: 'approved' } });
  await prisma.payment.create({ data: { campaignId: camp11.id, applicationId: app11.id, amount: 100000, provider: 'manual', status: 'paid' } });

  // STATE 12: Pro creator with multiple campaigns
  const c12 = await createCreator('creator.12.pro@yard.com', 'State 12: Pro', true);
  
  const camp12A = await createCampaign('Campaign A: Revision', 'in_progress');
  const app12A = await prisma.application.create({ data: { campaignId: camp12A.id, creatorId: c12.id, status: 'accepted' } });
  await prisma.deliverable.create({ data: { campaignId: camp12A.id, applicationId: app12A.id, fileId: dummyFile.id, status: 'revision_requested', revisionNotes: 'Fix audio' } });

  const camp12B = await createCampaign('Campaign B: Due Friday', 'in_progress', new Date(Date.now() + 2 * 86400000));
  await prisma.application.create({ data: { campaignId: camp12B.id, creatorId: c12.id, status: 'accepted' } });

  const camp12C = await createCampaign('Campaign C: Paid', 'closed');
  const app12C = await prisma.application.create({ data: { campaignId: camp12C.id, creatorId: c12.id, status: 'accepted' } });
  await prisma.deliverable.create({ data: { campaignId: camp12C.id, applicationId: app12C.id, fileId: dummyFile.id, status: 'approved' } });
  await prisma.payment.create({ data: { campaignId: camp12C.id, applicationId: app12C.id, amount: 100000, provider: 'manual', status: 'paid' } });

  console.log('Creator states seeded successfully.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
