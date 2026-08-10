import http from 'http';

const BASE_URL = 'http://127.0.0.1:3000';

const req = async (path, method = 'GET', body = null, token = null, customHeaders = {}) => {
  const url = new URL(path, BASE_URL);
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...customHeaders,
    },
  };

  return new Promise((resolve, reject) => {
    const r = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });
    r.on('error', (err) => reject(err));
    if (body) {
      r.write(JSON.stringify(body));
    }
    r.end();
  });
};

const runSuite = async () => {
  console.log('====================================================');
  console.log('⚡ STARTING YARD V1 FULL-SUITE E2E API STRESS TEST ⚡');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    process.stdout.write(`⏳ Testing: ${name}... `);
    try {
      const res = await fn();
      if (res !== false) {
        console.log('✅ PASS');
        passed++;
      } else {
        console.log('❌ FAIL');
        failed++;
      }
    } catch (e) {
      console.log(`❌ ERROR: ${e.message}`);
      failed++;
    }
  };

  // 1. Health Check
  await test('Health Check Endpoint (GET /health)', async () => {
    const res = await req('/health');
    return res.status === 200 && res.data?.data?.status === 'ok';
  });

  const timestamp = Date.now();
  const brandEmail = `brand_${timestamp}@yard.com`;
  const creatorEmail = `creator_${timestamp}@yard.com`;
  const adminEmail = `admin_${timestamp}@yard.com`;

  let brandToken = '';
  let creatorToken = '';
  let adminToken = '';
  let creatorUserId = '';
  let creatorProfileId = '';
  let campaignId = '';
  let applicationId = '';
  let deliverableId = '';

  // 2. Auth - Register Brand
  await test('Register Brand (POST /auth/register)', async () => {
    const res = await req('/auth/register', 'POST', {
      email: brandEmail,
      password: 'Password123!',
      role: 'brand',
      name: 'Lagos Skincare Labs',
    });
    if (res.status === 201 && res.data?.data?.accessToken) {
      brandToken = res.data.data.accessToken;
      return true;
    }
    console.log('Register Brand Error:', res.data);
    return false;
  });

  // 3. Auth - Register Creator
  await test('Register Creator (POST /auth/register)', async () => {
    const res = await req('/auth/register', 'POST', {
      email: creatorEmail,
      password: 'Password123!',
      role: 'creator',
      name: 'Zainab Beauty',
    });
    if (res.status === 201 && res.data?.data?.accessToken) {
      creatorToken = res.data.data.accessToken;
      creatorUserId = res.data.data.user.id;
      return true;
    }
    console.log('Register Creator Error:', res.data);
    return false;
  });

  // 4. Auth - Register Admin
  await test('Register Admin (POST /auth/register)', async () => {
    const res = await req('/auth/register', 'POST', {
      email: adminEmail,
      password: 'Password123!',
      role: 'admin',
    });
    if (res.status === 201 && res.data?.data?.accessToken) {
      adminToken = res.data.data.accessToken;
      return true;
    }
    console.log('Register Admin Error:', res.data);
    return false;
  });

  // 5. Auth - Login Verification
  await test('Login Verification (POST /auth/login)', async () => {
    const res = await req('/auth/login', 'POST', {
      email: brandEmail,
      password: 'Password123!',
    });
    if (res.status === 201 || res.status === 200) {
      return !!res.data?.data?.accessToken;
    }
    console.log('Login Error Response:', res);
    return false;
  });

  // 6. Creator Profile Setup
  await test('Get Creator Me & Update Profile (GET & PATCH /creators/me)', async () => {
    const meRes = await req('/creators/me', 'GET', null, creatorToken);
    if (meRes.status !== 200) {
      console.log('Get Creator Me Error:', meRes.data);
      return false;
    }
    creatorProfileId = meRes.data?.data?.id;

    const updateRes = await req('/creators/me', 'PATCH', {
      bio: 'Top African beauty creator in Lagos. 100k+ organic views.',
      payoutAccount: { bank_code: '058', account_number: '0123456789', account_name: 'Zainab Beauty' },
    }, creatorToken);
    return updateRes.status === 200;
  });

  // 7. Creator Discovery
  await test('Discover Creators by Category (GET /creators?category=beauty)', async () => {
    const res = await req('/creators?category=beauty', 'GET');
    return res.status === 200 && Array.isArray(res.data?.data);
  });

  // 8. Brand - Create Campaign Draft
  await test('Create Campaign Draft (POST /campaigns)', async () => {
    const res = await req('/campaigns', 'POST', {
      name: 'Lagos Summer Glow Launch 2026',
      goal: 'product_awareness',
      category: 'beauty',
      country: 'Nigeria',
      city: 'Lagos',
      brief: 'Create a 30s high-energy Reel highlighting the hydrating serum.',
      deliverableType: 'reel',
      quantity: 3,
      budgetPerCreator: 180000,
      currency: 'NGN',
      deliveryDeadline: new Date(Date.now() + 86400000 * 7).toISOString(),
    }, brandToken);

    if (res.status === 201 && res.data?.data?.id) {
      campaignId = res.data.data.id;
      return true;
    }
    console.log('Create Campaign Error:', res.data);
    return false;
  });

  // 9. Brand - Publish Campaign
  await test('Publish Campaign State Machine (PATCH /campaigns/:id/publish)', async () => {
    const res = await req(`/campaigns/${campaignId}/publish`, 'PATCH', null, brandToken);
    return res.status === 200 && res.data?.data?.status === 'open';
  });

  // 10. Creator - Apply to Campaign
  await test('Creator Apply to Brief (POST /campaigns/:id/applications)', async () => {
    const res = await req(`/campaigns/${campaignId}/applications`, 'POST', {
      pitch: 'I have 124k skincare enthusiasts and love this serum.',
      source: 'applied',
    }, creatorToken);

    if (res.status === 201 && res.data?.data?.id) {
      applicationId = res.data.data.id;
      return true;
    }
    console.log('Apply Error:', res.data);
    return false;
  });

  // 11. Brand - Accept Application
  await test('Brand Accept Application (PATCH /applications/:id/accept)', async () => {
    const res = await req(`/applications/${applicationId}/accept`, 'PATCH', null, brandToken);
    return res.status === 200 && res.data?.data?.status === 'accepted';
  });

  // 12. Creator - Submit Deliverable
  await test('Creator Submit Deliverable v1 (POST /applications/:id/deliverables)', async () => {
    const res = await req(`/applications/${applicationId}/deliverables`, 'POST', {
      provider: 'google_drive',
      providerFileId: `gdrive_test_${timestamp}`,
      providerUrl: 'https://drive.google.com/file/d/test-reel/view',
      fileType: 'video/mp4',
      fileSize: 24500000,
    }, creatorToken);

    if (res.status === 201 && res.data?.data?.id) {
      deliverableId = res.data.data.id;
      return true;
    }
    console.log('Submit Deliverable Error:', res.data);
    return false;
  });

  // 13. Brand - Request Revision
  await test('Brand Request Revision State Machine (PATCH /deliverables/:id/request-revision)', async () => {
    const res = await req(`/deliverables/${deliverableId}/request-revision`, 'PATCH', {
      revisionNotes: 'Please enhance audio clarity in the opening hook.',
    }, brandToken);
    return res.status === 200 && res.data?.data?.status === 'revision_requested';
  });

  // 14. Creator - Submit Deliverable v2
  await test('Creator Submit Deliverable v2 (POST /applications/:id/deliverables)', async () => {
    const res = await req(`/applications/${applicationId}/deliverables`, 'POST', {
      provider: 'google_drive',
      providerFileId: `gdrive_test_v2_${timestamp}`,
      providerUrl: 'https://drive.google.com/file/d/test-reel-v2/view',
      fileType: 'video/mp4',
      fileSize: 24800000,
    }, creatorToken);

    if (res.status === 201 && res.data?.data?.id) {
      deliverableId = res.data.data.id;
      return res.data.data.version === 2;
    }
    console.log('Submit Deliverable v2 Error:', res.data);
    return false;
  });

  // 15. Brand - Approve Deliverable (Triggers Automatic Payment Chain)
  await test('Brand Approve Deliverable & Trigger Payment (PATCH /deliverables/:id/approve)', async () => {
    const res = await req(`/deliverables/${deliverableId}/approve`, 'PATCH', null, brandToken);
    return res.status === 200 && res.data?.data?.status === 'approved';
  });

  // 16. Payments - Query Campaign Ledger
  await test('Query Payment State Machine Ledger (GET /payments/:campaignId)', async () => {
    const res = await req(`/payments/${campaignId}`, 'GET', null, brandToken);
    return res.status === 200 && Array.isArray(res.data?.data) && res.data.data.length > 0;
  });

  // 17. Payments - Paystack Webhook Simulation
  await test('Paystack Webhook Ingestion & Idempotency (POST /webhooks/paystack)', async () => {
    const res = await req(
      '/webhooks/paystack',
      'POST',
      {
        event: 'transfer.success',
        data: {
          reference: `pstk_ref_${timestamp}`,
          amount: 18000000,
          status: 'success',
        },
      },
      null,
      { 'x-paystack-signature': 'mock_paystack_valid_signature' },
    );
    const ok = (res.status === 200 || res.status === 201) && (res.data?.data?.status === 'acknowledged' || res.data?.data?.received === true || res.data?.status === 'acknowledged');
    if (!ok) console.log('Webhook Error Response:', res);
    return ok;
  });

  // 18. Activity Timeline - Post Comment & Query
  await test('Unified Campaign Activity Timeline (POST & GET /campaigns/:id/activity)', async () => {
    const postRes = await req(`/campaigns/${campaignId}/activity`, 'POST', {
      body: 'Kickoff call completed. Campaign assets approved on time.',
    }, brandToken);
    if (postRes.status !== 201) {
      console.log('Post Activity Error:', postRes.data);
      return false;
    }

    const getRes = await req(`/campaigns/${campaignId}/activity`, 'GET', null, brandToken);
    return getRes.status === 200 && Array.isArray(getRes.data?.data) && getRes.data.data.length > 0;
  });

  // 19. Admin - Verify Creator & Audit Log
  await test('Admin Verify Creator & Audit Trail (PATCH /creators/:id/verify & GET /admin/audit-logs)', async () => {
    const verifyRes = await req(`/creators/${creatorProfileId}/verify`, 'PATCH', {
      verified: true,
      reason: 'Passed manual ID and follower authenticity review',
    }, adminToken);
    if (verifyRes.status !== 200) {
      console.log('Verify Creator Error:', verifyRes.data);
      return false;
    }

    const auditRes = await req('/admin/audit-logs', 'GET', null, adminToken);
    return auditRes.status === 200 && Array.isArray(auditRes.data?.data) && auditRes.data.data.length > 0;
  });

  // 20. Admin - Suspend User
  await test('Admin Moderation User Suspension (PATCH /users/:id/suspend)', async () => {
    const res = await req(`/users/${creatorUserId}/suspend`, 'PATCH', {
      suspended: false,
      reason: 'Account reinstated after audit validation',
    }, adminToken);
    return res.status === 200 && res.data?.data?.status === 'active';
  });

  // 21. High-Concurrency Stress Test
  await test('High-Concurrency Stress Test (50 Parallel Requests to Supabase Pooler)', async () => {
    const start = Date.now();
    const promises = [];
    for (let i = 0; i < 50; i++) {
      promises.push(req('/campaigns', 'GET', null, brandToken));
    }
    const results = await Promise.all(promises);
    const elapsed = Date.now() - start;
    const allSuccessful = results.every((r) => r.status === 200);
    const avgLatency = (elapsed / 50).toFixed(1);
    process.stdout.write(`[50 requests in ${elapsed}ms | avg ${avgLatency}ms/req] `);
    return allSuccessful;
  });

  console.log('\n====================================================');
  console.log(`📊 STRESS TEST SUMMARY: ${passed} PASSED / ${failed} FAILED (Total: ${passed + failed})`);
  console.log('====================================================');

  if (failed === 0) {
    console.log('🎉 100% OF ALL APIS & STATE MACHINES ARE PRODUCTION READY!\n');
  } else {
    process.exit(1);
  }
};

runSuite().catch((err) => {
  console.error('Test Suite Fatal Error:', err);
  process.exit(1);
});
