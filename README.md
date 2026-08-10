# Yard V1 — The Operating System for African Creator Marketing

[![NestJS](https://img.shields.io/badge/Backend-NestJS%2010-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%206-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-Supabase%20Postgres-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/Mobile-Progressive%20Web%20App-5A0FC8?style=flat&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

**CreatorYard** is the unified operating platform connecting fast-growing brands with vetted African creators. It replaces fragmented WhatsApp chats and manual bank transfers with structured campaign briefs, deliverable version management, instant automated escrow payouts (Paystack & Flutterwave), and verified creator analytics.

---

## 🏗️ Architecture & Monorepo Structure

```
yard_app/
├── backend/                  # NestJS 10 Modular Enterprise API
│   ├── prisma/
│   │   └── schema.prisma     # 18 relational models with strict PostgreSQL types
│   ├── src/
│   │   ├── common/           # Prisma service, JWT & Roles guards, filters, interceptors
│   │   ├── modules/
│   │   │   ├── auth/         # Multi-role authentication (Brand, Creator, Admin)
│   │   │   ├── creators/     # Creator profile, discovery filters & verification
│   │   │   ├── campaigns/    # Campaign lifecycle state machine
│   │   │   ├── applications/ # Application review & acceptance flow
│   │   │   ├── deliverables/ # Versioned file submission, review & revision loop
│   │   │   ├── payments/     # Dual-gateway escrow & payout pipelines (Paystack/Flw)
│   │   │   ├── activity/     # Unified campaign activity stream & audit trail
│   │   │   ├── files/        # Google Drive & Cloudinary storage providers
│   │   │   ├── audit/        # Immutable admin moderation audit logs
│   │   │   └── jobs/         # Scheduled payment reconciliation CRON
│   │   └── main.ts           # Entry point with BigInt JSON serialization
│   └── test-e2e-stress.mjs   # 21-suite E2E integration & concurrency benchmark
│
├── frontend/                 # React 18 + Vite PWA Desktop & Mobile Client
│   ├── public/
│   │   ├── manifest.json     # PWA standalone manifest with maskable icons
│   │   └── sw.js             # Service worker with cache-first asset strategy
│   └── src/
│       ├── components/       # AppShell, Logo, ThemeToggle, PwaInstallPrompt
│       ├── pages/
│       │   ├── brand/        # Dashboard, Brief Creator, Discover, Budget, Activity
│       │   ├── creator/      # Dashboard, Browse Briefs, Submissions, Wallet, Profile
│       │   └── founders/     # Moderation Console & Audit Trail
│       ├── lib/              # Auth context, reactive theming, PWA install hooks
│       └── App.tsx           # Straight-ahead SaaS workspace routing
│
├── yard_brand_assets/        # Official brand iconography, logos & guidelines
├── yard flow.md              # Complete end-to-end product architecture & user flows
├── yard-backend-spec.md      # Backend specifications & state machine guarantees
└── yard-frontend-spec.md     # Frontend design system & component hierarchy
```

---

## ⚡ Core Features & State Machines

### 1. Multi-Role Identity & Onboarding
- **Brand Workspace**: Create organizations, fund campaigns, review creator pitches, manage deliverable revisions, release milestones.
- **Creator Workspace**: Browse verified briefs, submit pitches, upload deliverable files with version tracking, receive automated bank payouts.
- **Founders / Admin Console**: Immutable audit logging (`audit_logs`), manual creator verification badges, and account moderation.

### 2. Campaign & Deliverable State Engine
```
Draft ──► Open ──► In Progress ──► Review ──► Completed
                        │              │
                        ▼              ▼
                 Submit Deliverable   Request Revision
                        │              ▲
                        ▼              │
                     Approved ─────────┘
                        │
                        ▼
                Automated Payout Trigger
```

### 3. Fintech Payment Pipeline
- **Escrow Integrity**: Payments model tracks `unpaid` $\rightarrow$ `payment_initiated` $\rightarrow$ `creator_payout_pending` $\rightarrow$ `paid`.
- **Payment Providers**: Multi-provider adapters for **Paystack** and **Flutterwave**.
- **Webhook Ingestion**: Idempotent webhook ingestion recording into `provider_events`.

### 4. Mobile PWA & Responsive Design System
- **Progressive Web App**: Installable to Android and iOS home screens with offline app-shell caching.
- **Mobile-First UX**: Frosted-glass bottom navigation (`pb-safe`) designed for one-handed mobile use.
- **Clean Aesthetic**: Light mode default with reactive dark mode toggle, borderless cards with soft ambient elevation shadows (`#0D9488` teal accent).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **yarn**
- **PostgreSQL**: PostgreSQL database (or Supabase instance)

### 1. Backend Setup

```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env

# Generate Prisma Client & push schema
npx prisma generate
npx prisma db push

# Build & Run Backend
npm run build
npm run start
```
*Backend API will run on `http://localhost:3000` (Health Check: `http://localhost:3000/health`).*

---

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start Vite Dev Server
npm run dev
```
*Frontend client will run on `http://localhost:8080` (or `http://localhost:8081`).*

---

## 🧪 Automated E2E API Stress Testing

The backend includes a comprehensive 21-step integration and concurrency test suite:

```bash
cd backend
node test-e2e-stress.mjs
```

### Stress Test Verification Matrix
```
====================================================
⚡ STARTING YARD V1 FULL-SUITE E2E API STRESS TEST ⚡
====================================================
⏳ Testing: Health Check Endpoint (GET /health).......................... ✅ PASS
⏳ Testing: Register Brand (POST /auth/register)......................... ✅ PASS
⏳ Testing: Register Creator (POST /auth/register)....................... ✅ PASS
⏳ Testing: Register Admin (POST /auth/register)......................... ✅ PASS
⏳ Testing: Login Verification (POST /auth/login)........................ ✅ PASS
⏳ Testing: Get Creator Me & Update Profile (GET & PATCH /creators/me)... ✅ PASS
⏳ Testing: Discover Creators by Category (GET /creators?category=beauty) ✅ PASS
⏳ Testing: Create Campaign Draft (POST /campaigns)...................... ✅ PASS
⏳ Testing: Publish Campaign State Machine (PATCH /campaigns/:id/publish) ✅ PASS
⏳ Testing: Creator Apply to Brief (POST /campaigns/:id/applications).... ✅ PASS
⏳ Testing: Brand Accept Application (PATCH /applications/:id/accept).... ✅ PASS
⏳ Testing: Creator Submit Deliverable v1 (POST /deliverables)........... ✅ PASS
⏳ Testing: Brand Request Revision (PATCH /deliverables/:id/request-rev). ✅ PASS
⏳ Testing: Creator Submit Deliverable v2 (POST /deliverables)........... ✅ PASS
⏳ Testing: Brand Approve Deliverable & Trigger Payment.................. ✅ PASS
⏳ Testing: Query Payment State Machine Ledger (GET /payments/:id)....... ✅ PASS
⏳ Testing: Paystack Webhook Ingestion & Idempotency..................... ✅ PASS
⏳ Testing: Unified Campaign Activity Timeline........................... ✅ PASS
⏳ Testing: Admin Verify Creator & Audit Trail........................... ✅ PASS
⏳ Testing: Admin Moderation User Suspension............................. ✅ PASS
⏳ Testing: High-Concurrency Pooler Stress (50 Parallel Requests)........ ✅ PASS
====================================================
📊 SUMMARY: 21 PASSED / 0 FAILED (100% PRODUCTION READY)
====================================================
```

---

## 📄 License
Proprietary — © 2026 ZeroMerge / CreatorYard. All rights reserved.
