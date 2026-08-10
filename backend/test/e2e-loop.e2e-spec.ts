import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';

describe('Yard V1 Transaction Loop (E2E Test - Spec §11 Definition of Done)', () => {
  let app: INestApplication;
  let brandToken: string;
  let creatorToken: string;
  let campaignId: string;
  let applicationId: string;
  let deliverableId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('Step 1: Register Brand User & Organization', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `brand_e2e_${Date.now()}@test.com`,
        password: 'Password123!',
        role: 'brand',
        name: 'Super Brand Co',
      })
      .expect(201);

    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.role).toBe('brand');
    brandToken = res.body.data.accessToken;
  });

  it('Step 2: Register Creator User & Profile', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `creator_e2e_${Date.now()}@test.com`,
        password: 'Password123!',
        role: 'creator',
        name: 'Chioma Content Creator',
      })
      .expect(201);

    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.role).toBe('creator');
    creatorToken = res.body.data.accessToken;
  });

  it('Step 3: Brand Creates & Publishes Campaign', async () => {
    // Create draft campaign
    const createRes = await request(app.getHttpServer())
      .post('/campaigns')
      .set('Authorization', `Bearer ${brandToken}`)
      .send({
        name: 'Summer Glow Campaign',
        goal: 'product_awareness',
        category: 'beauty',
        country: 'Nigeria',
        city: 'Lagos',
        brief: 'Create a 30s Reel showing product unboxing and application.',
        deliverableType: 'reel',
        quantity: 3,
        budgetPerCreator: 200000,
        currency: 'NGN',
      })
      .expect(201);

    expect(createRes.body.data.id).toBeDefined();
    expect(createRes.body.data.status).toBe('draft');
    campaignId = createRes.body.data.id;

    // Publish campaign (draft -> open)
    const publishRes = await request(app.getHttpServer())
      .patch(`/campaigns/${campaignId}/publish`)
      .set('Authorization', `Bearer ${brandToken}`)
      .expect(200);

    expect(publishRes.body.data.status).toBe('open');
  });

  it('Step 4: Creator Applies to Campaign', async () => {
    const res = await request(app.getHttpServer())
      .post(`/campaigns/${campaignId}/applications`)
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        pitch: 'I would love to review your skincare product for my 30k audience.',
      })
      .expect(201);

    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.status).toBe('pending');
    applicationId = res.body.data.id;
  });

  it('Step 5: Brand Accepts Creator Application', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/applications/${applicationId}/accept`)
      .set('Authorization', `Bearer ${brandToken}`)
      .expect(200);

    expect(res.body.data.status).toBe('accepted');
  });

  it('Step 6: Creator Submits Deliverable', async () => {
    const res = await request(app.getHttpServer())
      .post(`/applications/${applicationId}/deliverables`)
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        providerFileId: 'drive_file_reel_001',
        providerUrl: 'https://drive.google.com/file/d/drive_file_reel_001/view',
        provider: 'google_drive',
        fileType: 'video/mp4',
        fileSize: 15400000,
      })
      .expect(201);

    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.status).toBe('submitted');
    expect(res.body.data.version).toBe(1);
    deliverableId = res.body.data.id;
  });

  it('Step 7: Brand Approves Deliverable & Payment Released', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/deliverables/${deliverableId}/approve`)
      .set('Authorization', `Bearer ${brandToken}`)
      .expect(200);

    expect(res.body.data.status).toBe('approved');
  });

  it('Step 8: Verify Payment Chain & Timeline Activity', async () => {
    // Check payments for campaign
    const payRes = await request(app.getHttpServer())
      .get(`/payments/${campaignId}`)
      .set('Authorization', `Bearer ${brandToken}`)
      .expect(200);

    expect(payRes.body.data.length).toBeGreaterThan(0);
    const paidPayment = payRes.body.data.find((p: any) => p.status === 'paid');
    expect(paidPayment).toBeDefined();
    expect(paidPayment.amount).toBe(200000);

    // Check timeline activity
    const actRes = await request(app.getHttpServer())
      .get(`/campaigns/${campaignId}/activity`)
      .set('Authorization', `Bearer ${brandToken}`)
      .expect(200);

    expect(actRes.body.data.length).toBeGreaterThanOrEqual(4);
    const eventTypes = actRes.body.data.map((e: any) => e.eventType);
    expect(eventTypes).toContain('campaign_created');
    expect(eventTypes).toContain('campaign_published');
    expect(eventTypes).toContain('deliverable_submitted');
    expect(eventTypes).toContain('deliverable_approved');
    expect(eventTypes).toContain('payment_completed');
  });

  it('Step 9: Verify Webhook Processing (Flutterwave Signature)', async () => {
    const webhookRes = await request(app.getHttpServer())
      .post('/webhooks/flutterwave')
      .set('verif-hash', 'mock-flutterwave-hash')
      .send({
        event: 'charge.completed',
        data: {
          id: 998822,
          tx_ref: 'flw_tx_mock_123',
          amount: 200000,
          currency: 'NGN',
          status: 'successful',
        },
      })
      .expect(201);

    expect(webhookRes.body.data.status).toBe('acknowledged');
  });
});
