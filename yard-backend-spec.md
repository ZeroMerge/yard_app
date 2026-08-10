# Yard V1 — Backend Engineering Specification (v2, corrected)

**What this document is:** the complete decision record for Yard's backend — every choice already made, so nothing gets re-litigated or invented mid-build. If a decision isn't here, it's out of scope for V1 by default.

**The one-sentence target (this is your actual Definition of Done, use this exact wording with your team):**
> A production deployment capable of supporting at least 100 registered brands and 300 registered creators, with multiple concurrent campaigns, creator discovery, campaign participation, deliverable submission and review, revision handling, payment processing through the selected payment provider, notifications, authentication, persistent campaign history, and audit logs.

Not "build Yard." That target. Everything else is out of scope until this works end-to-end for one real campaign, then repeats reliably.

---

## 0. The core insight the whole architecture is built on

Brands aren't buying creators — they're buying outcomes (content, attention, views). Creators are the supply side. The real workflow underneath everything you've described is:

```
Need → Campaign → Creator Matching → Content → Publication → Outcome → Payment
```

**The Campaign is the system of record.** Not the Brand, not the Creator. Every application, message, file, approval, payment, and rating belongs to a campaign_id. This is the single decision that keeps every future module (analytics, scraping, scoring, AI matching) attachable later without a rewrite — because they all just read from and write to something that already has a campaign_id on it.

Two products are hiding inside "Yard" — a marketplace ("I need creators") and campaign operations ("I'm running a campaign"). V1 builds one unified loop; don't let the team split into two efforts.

---

## 1. Stack (decided — do not re-debate this in the build)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js on Vercel | Best-supported deploy target for the framework |
| Backend | Node.js + NestJS | Structure matters more than speed of writing here — Express/Fastify only if the team explicitly wants less structure |
| ORM | Prisma | Fast iteration, plays well with AI-assisted development, schema-as-code |
| Database | PostgreSQL via Supabase | Business is highly relational; Supabase free tier is fine to start but has quota limits (500MB DB, 1GB storage, 5GB egress, 50MB max file) — don't put media in it |
| Auth | Supabase Auth (or Auth.js/Clerk) | Don't hand-roll auth |
| Backend hosting | Render | Supports long-running Node services, workers, cron. Free tier sleeps on inactivity and free Postgres expires at 30 days — this is exactly why the database lives on Supabase, not Render |
| File storage | Provider-abstracted; Google Drive is the V1 default, Cloudinary is the alternative if Yard needs to actually process/stream video | Never let this become a hard dependency — see §5 |
| Payments | Flutterwave first for V1 | Broad Nigerian payment method coverage (card, bank transfer, USSD, OPay, etc.). Paystack was compared and is a valid future/alternate provider, not a launch blocker — abstract it either way |
| Email | Resend | Easiest integration for transactional email |
| Error monitoring | Sentry | Add from day one, not later |
| Product analytics | PostHog | Add from day one, not later |
| Ingestion (deferred, but plan for it) | Apify | Cheapest path to Instagram/TikTok data without building scraper infra yourself; swappable later |

**Explicitly avoid for V1:** Kubernetes, Docker Swarm, Kafka, Elasticsearch, RabbitMQ, microservices, self-hosted Redis, self-hosted Postgres. None of these solve a problem you have at 100 brands / 300 creators. They only add operational risk before the meeting you're trying to save.

---

## 2. Bounded contexts (this is your module map — folder structure follows this exactly)

```
Identity            → Authentication, Users, Roles
Organizations       → Brands, Team Members
Creators            → Profiles, Social Accounts, Portfolio, Categories, Languages, Locations, Rates
Campaigns           → Brief, Applications, Invitations, Participants, Status
Deliverables        → Submission, Files, Review, Revisions
Payments            → Payment Request, Provider Transaction, Payout, Payment Status
Communication        → Campaign Activity (see §4.6 — not "chat")
Audit                → Immutable events
```

Deferred modules — the schema should leave room for these, V1 does not implement them:
```
Analytics Engine · Scraping/Ingestion Engine · YardScore · Recommendation Engine · Fraud Engine · Advanced Reporting · AI Matching
```

Rule: these are modules that attach to the system above, not prerequisites for it. If someone on the team wants to start on scoring or scraping before the transaction loop works, that's the wrong order — stop them.

---

## 3. What NOT to build in V1 (say this explicitly to whoever's coding, including the AI)

**Creators cannot, in V1:**
create their own campaigns · manage teams · sell arbitrary services · negotiate custom contracts · build public storefronts · run analytics dashboards · define their own scoring rules.

**Brands cannot, in V1:**
run a CRM · email marketing · social scheduling · a content calendar · ad management · AI campaign generation · influencer forecasting.

**The system does not, in V1:**
hold escrow (see §6 — Yard orchestrates payment, it does not custody funds) · run real-time scraping (daily/weekly scheduled refresh only, never triggered by someone opening a profile) · calculate a creator score (collect the raw observations that would let you calculate one later) · run comment-pod/fraud graph analysis · attempt cross-platform AI matching.

If it's not in the loop in §0, it's not V1.

---

## 4. Database Schema (PostgreSQL, via Prisma)

Conventions: UUID PKs, snake_case tables, `created_at`/`updated_at` everywhere, every domain table carries `campaign_id` where it applies — nothing floats free of the aggregate root.

### 4.1 Identity & Organizations
```sql
users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,               -- null if using Supabase Auth/OAuth only
  role TEXT NOT NULL CHECK (role IN ('brand','creator','admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

organizations (              -- a Brand's company/workspace
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

organization_members (       -- team members under a brand's org, not just one owner
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','member')),
  UNIQUE(organization_id, user_id)
);
```

### 4.2 Creators — structured tables, not a JSON blob
The doc is explicit on this: use relational tables for anything you'll query or filter on. JSON is for genuinely flexible metadata only, not for category/location/language/rate — those need indexes and filters.

```sql
creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  display_name TEXT NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  verified BOOLEAN DEFAULT false,
  payout_account JSONB,        -- provider-agnostic: {bank_code, account_number, account_name}
  created_at TIMESTAMPTZ DEFAULT now()
);

creator_social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id),
  platform TEXT NOT NULL,          -- lookup table below, not a hardcoded enum
  handle TEXT NOT NULL,
  profile_url TEXT NOT NULL,
  UNIQUE(creator_id, platform)
);

platforms (                        -- lookup table, not hardcoded — new platforms are a row, not a migration
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL        -- 'instagram','tiktok','youtube','facebook','x'
);

creator_categories (
  creator_id UUID NOT NULL REFERENCES creators(id),
  category TEXT NOT NULL,          -- beauty, fashion, food, tech, lifestyle, finance, fitness, entertainment, other
  PRIMARY KEY (creator_id, category)
);

creator_languages (
  creator_id UUID NOT NULL REFERENCES creators(id),
  language TEXT NOT NULL,
  PRIMARY KEY (creator_id, language)
);

creator_locations (
  creator_id UUID NOT NULL REFERENCES creators(id),
  country TEXT NOT NULL,
  city TEXT
);

creator_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id),
  deliverable_type TEXT NOT NULL,  -- reel, post, story, video
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN'
);

creator_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id),
  file_id UUID REFERENCES files(id),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.3 Campaigns — the aggregate root
```sql
campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  goal TEXT NOT NULL,              -- product_awareness, content_creation, product_review, sales_promotion, event_promotion
  category TEXT NOT NULL,          -- same set as creator_categories
  country TEXT NOT NULL,
  city TEXT,
  brief TEXT NOT NULL,
  deliverable_type TEXT NOT NULL,
  quantity INT NOT NULL,           -- how many creators/deliverables needed
  budget_per_creator NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','open','in_progress','review','completed','cancelled','closed')),
  application_deadline TIMESTAMPTZ,
  delivery_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

campaign_platforms (               -- which platforms this campaign targets
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  platform_id UUID NOT NULL REFERENCES platforms(id),
  PRIMARY KEY (campaign_id, platform_id)
);

campaign_requirements (            -- objectively filterable creator requirements
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  min_followers INT,
  category TEXT,
  country TEXT,
  language TEXT
);

applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  creator_id UUID NOT NULL REFERENCES creators(id),
  source TEXT NOT NULL DEFAULT 'applied' CHECK (source IN ('applied','invited')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','rejected','withdrawn')),
  pitch TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  decided_at TIMESTAMPTZ,
  UNIQUE(campaign_id, creator_id)
);
```

### 4.4 Deliverables & Files
Files are metadata-only in Postgres. The actual bytes never touch your backend — upload straight to the provider, store the reference.

```sql
files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  provider TEXT NOT NULL,           -- 'google_drive' | 'cloudinary' | 's3'
  provider_file_id TEXT NOT NULL,
  provider_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','deleted')),
  created_at TIMESTAMPTZ DEFAULT now()
);

deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  application_id UUID NOT NULL REFERENCES applications(id),
  file_id UUID NOT NULL REFERENCES files(id),
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted','revision_requested','approved','rejected')),
  revision_notes TEXT,
  version INT NOT NULL DEFAULT 1,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
```

### 4.5 Payments — append-only, state-machine driven, webhook-only status changes
```sql
payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  application_id UUID NOT NULL REFERENCES applications(id),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  provider TEXT NOT NULL,           -- 'flutterwave' | 'paystack'
  provider_ref TEXT,
  status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (status IN ('unpaid','payment_initiated','payment_confirmed','creator_payout_pending','paid','failed','retry')),
  parent_payment_id UUID REFERENCES payments(id),   -- chains state transitions, never mutate a row in place
  created_at TIMESTAMPTZ DEFAULT now()
);

provider_events (                    -- every inbound webhook lands here first, unprocessed
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  received_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);
```
**Non-negotiable:** payment status is never set from the frontend and never set synchronously inside a request handler. Only the webhook processor, reading from `provider_events`, may transition a payment's status — and it must be idempotent (a webhook delivered twice must not create a duplicate payout).

### 4.6 Communication — activity, not chat
Don't build a chat system. Build one append-only timeline per campaign; comments, file uploads, status changes, and payment events are all just rows in the same table.

```sql
campaign_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  actor_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL,   -- 'creator_invited','creator_accepted','brief_updated','file_uploaded','revision_requested','approved','payment_initiated','comment', ...
  body TEXT,                  -- populated for comment-type events
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```
This gives you one chronological record per campaign instead of separate messaging/notification/status systems that all have to be stitched back together later.

### 4.7 Reputation — raw counters only, no algorithm
```sql
creator_stats (
  creator_id UUID PRIMARY KEY REFERENCES creators(id),
  campaigns_completed INT DEFAULT 0,
  campaigns_cancelled INT DEFAULT 0,
  on_time_deliveries INT DEFAULT 0,
  late_deliveries INT DEFAULT 0,
  revisions_requested INT DEFAULT 0,
  disputes INT DEFAULT 0,
  repeat_hires INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.8 Analytics/Ingestion — schema exists now, engine does not
This is the part most likely to get skipped and cause a rewrite later if it's skipped. Build these tables now even though nothing populates or reads them yet in V1 — this is what lets you add scraping/scoring in six months without re-architecting.

```sql
social_metric_snapshot (      -- append-only time series, never overwritten
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id),
  platform TEXT NOT NULL,
  followers INT,
  following INT,
  posts INT,
  engagement_rate NUMERIC(5,2),
  captured_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL          -- 'apify' | 'api' | 'manual'
);

creator_score (                 -- derived entity — recalculable, never the source of truth
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id),
  score NUMERIC(5,2),
  score_version TEXT NOT NULL,  -- e.g. 'v1-engagement30-consistency30-audience20-history20'
  calculated_at TIMESTAMPTZ DEFAULT now()
);

scrape_job (                    -- ingestion runs as queued jobs, never inline in a request
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id),
  platform TEXT NOT NULL,
  job_type TEXT NOT NULL,       -- profile_refresh, post_refresh, comment_refresh, analytics_refresh
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```
Key principle: the scraper never calculates a score. It writes raw observations to `social_metric_snapshot`. A separate (future) analytics job reads snapshots and writes to `creator_score`. This is what lets the scoring formula change six months from now without re-scraping anyone.

### 4.9 Audit
```sql
audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```
Every admin action and every state transition on campaigns/applications/deliverables/payments writes here. Nothing in `payments`, `deliverables`, `applications`, or `audit_logs` is ever `DELETE`d — status changes only.

---

## 5. Provider Abstraction Layer — the actual architectural spine

This is the single rule that determines whether the system survives changing a vendor. **Nothing outside `/providers/` ever imports a third-party SDK.** Three services, three interfaces:

```typescript
// /providers/payments/PaymentProvider.ts
interface PaymentProvider {
  initiateCharge(amount: number, currency: string, metadata: object): Promise<{ ref: string; checkoutUrl: string }>;
  verifyCharge(ref: string): Promise<{ status: 'success'|'failed'; amount: number }>;
  payout(accountDetails: object, amount: number): Promise<{ ref: string; status: string }>;
  refund(ref: string, amount: number): Promise<{ ref: string; status: string }>;
}
// V1 implementation: FlutterwaveProvider. PaystackProvider can be added later without touching PaymentService.

// /providers/files/FileProvider.ts
interface FileProvider {
  upload(fileBuffer: Buffer, meta: object): Promise<{ ref: string; url: string }>;
  getUrl(ref: string): Promise<string>;
  delete(ref: string): Promise<void>;
}
// V1 implementation: GoogleDriveProvider (Shared Drive + OAuth delegation — a bare service account
// has no storage quota of its own and cannot own files). CloudinaryProvider is the swap-in if Yard
// needs to actually stream/process video rather than just collect and review links.

// /providers/analytics/AnalyticsProvider.ts
interface AnalyticsProvider {
  fetchProfile(handle: string, platform: string): Promise<RawProfileData>;
  fetchRecentPosts(handle: string, platform: string): Promise<RawPostData[]>;
}
// Not implemented in V1. Defined now so the ingestion job (§4.8/§7) has somewhere to plug in
// Apify, an official API, or a future in-house scraper without touching the Creator module.
```

**File access rule:** never expose "anyone with the link." Access is granted by Yard's own authorization layer, not by possession of a URL:
```
GET /campaigns/:id/files/:fileId
  → is this user part of this campaign?
      → yes → generate/return authorized provider access
      → no  → 403
```

**Payment provider rule:** do not build Flutterwave's marketplace split-payment feature into V1. Their own docs make the marketplace owner responsible for vetting sub-merchants and liable for disputes/chargebacks logged against the main account — that's a real operational liability you don't need yet. Collect into Yard's own balance via `initiateCharge`, then push a manual `payout()` to the creator. This is "Model B": Yard orchestrates the payment, it does not custody funds as escrow (that's Model C — deliberately out of scope, it adds regulatory obligations you don't need for V1).

---

## 6. State Machines

### Campaign
```
draft → open → in_progress → review → completed → closed
                    ↓
                cancelled (from any non-terminal state)
```

### Application
```
pending → accepted
pending → rejected
pending → withdrawn
```

### Deliverable
```
submitted → approved (triggers payment release)
submitted → revision_requested → submitted (version += 1)
submitted → rejected
```

### Payment
```
unpaid → payment_initiated → payment_confirmed → creator_payout_pending → paid
payment_initiated → failed
creator_payout_pending → failed → retry
```
Every transition is a new row (`parent_payment_id` chains history) — never `UPDATE` a payment's status column in place. The current status is the latest row in the chain.

---

## 7. Background Jobs (separate worker process — never inline in a request handler)

| Job | Trigger | Action |
|---|---|---|
| `processProviderEvents` | queue/poll | Reads unprocessed `provider_events`, transitions payment/deliverable state, idempotent |
| `checkDeliveryDeadlines` | hourly cron | Flags campaigns past deadline with pending deliverables |
| `releaseApprovedPayments` | on deliverable approval | Calls `PaymentProvider.payout()`, inserts new payment row |
| `updateCreatorStats` | on campaign completion/cancellation | Increments `creator_stats` counters |
| `refreshCreatorProfile` (deferred, schema-ready) | scheduled — daily for profile/posts, weekly for deep analysis, never on-demand from a profile view | Creates a `scrape_job` row; a worker picks it up, calls `AnalyticsProvider`, writes to `social_metric_snapshot` |
| `sendNotifications` | queue-driven | Email via Resend for application accepted, deliverable reviewed, payment released |

The `POST /creators/:id/refresh` endpoint, when it exists, never scrapes synchronously — it only ever creates a `scrape_job` row and returns immediately.

---

## 8. API Contract (V1 surface)

```
POST   /auth/register
POST   /auth/login

GET    /campaigns                          (brand: own; creator: open only; admin: all)
POST   /campaigns                          (brand)
PATCH  /campaigns/:id/publish              (draft → open)
PATCH  /campaigns/:id/cancel

POST   /campaigns/:id/applications         (creator applies)
PATCH  /applications/:id/accept            (brand)
PATCH  /applications/:id/reject            (brand)
PATCH  /applications/:id/withdraw          (creator)

POST   /applications/:id/deliverables      (creator submits — file already uploaded to provider first)
PATCH  /deliverables/:id/approve           (brand → triggers payment job)
PATCH  /deliverables/:id/request-revision  (brand)

GET    /campaigns/:id/activity             (unified timeline, see §4.6)
POST   /campaigns/:id/activity             (comment-type event only)

GET    /campaigns/:id/files/:fileId        (authorization-gated, see §5)

GET    /payments/:campaign_id
POST   /webhooks/flutterwave               (unauthenticated, signature-verified, writes to provider_events only)

GET    /admin/audit-logs
```

Every response: `{ "data": ..., "error": null }` or `{ "data": null, "error": { "code": "...", "message": "..." } }`. Raw provider payloads (Flutterwave/Google/Apify JSON) never reach the client — always normalized first.

---

## 9. Security

- Passwords via bcrypt/argon2 if not delegating fully to Supabase Auth.
- Short-lived JWT + refresh rotation.
- Authorization checked in application code, not solely relied on from Supabase RLS — RLS as defense-in-depth, not the only gate.
- Webhook signature verification (`verif-hash` for Flutterwave) before writing to `provider_events`.
- File access always through the campaign-membership check in §5 — never a bare shareable link.
- Idempotency keys on `POST /campaigns/:id/applications` and any payment-initiating call.

---

## 10. Folder structure

```
/src
  /identity
  /organizations
  /creators
  /campaigns
  /applications
  /deliverables
  /payments
  /activity
  /audit
  /providers
    /payments      (PaymentProvider.ts, FlutterwaveProvider.ts)
    /files         (FileProvider.ts, GoogleDriveProvider.ts, CloudinaryProvider.ts)
    /analytics     (AnalyticsProvider.ts — interface only in V1)
  /jobs            (separate entrypoint from the API server)
  /middleware
  /db              (Prisma schema, migrations)
```
Organize by business domain, not by controller/route type. No module imports another module's internals directly.

---

## 11. Definition of Done — the exact loop to demo

Register a brand → create an org → create a campaign → publish it → a creator applies → brand accepts → creator uploads a deliverable to the file provider and submits it → brand approves → payment job fires → Flutterwave payout confirmed via webhook → campaign closes → `creator_stats` updated → full trail exists in `campaign_activity` and `audit_logs`.

If that loop works once, end to end, against sandbox Flutterwave and a real file provider — ship it. Scraping, scoring, AI matching, advanced reporting: modules for later, not blockers now.
