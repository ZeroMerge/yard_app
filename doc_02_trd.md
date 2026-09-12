# Document 02 — TRD: Technical Requirements Document
## Yard V1 — System Architecture & Technology Reference

---

## System Overview

Yard is a three-service system:

```
┌─────────────────────────────────────────────────────┐
│                     BROWSER / PWA                   │
│              React 18 + Vite + TypeScript            │
│                    Port 8080 (dev)                   │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP (REST)
                        │ JWT Bearer Token in Authorization header
                        ▼
┌─────────────────────────────────────────────────────┐
│                  BACKEND API (Node.js)               │
│              NestJS + Prisma + TypeScript            │
│                    Port 3000                         │
└────────────┬──────────────────────┬─────────────────┘
             │                      │
             ▼                      ▼
┌────────────────────┐  ┌─────────────────────────────┐
│  Supabase Postgres │  │  INGESTION ENGINE (Python)  │
│  (Database + Auth) │  │   FastAPI + Uvicorn          │
│  Port: Supabase    │  │   Port 8000                  │
│  hosted            │  └─────────────────────────────┘
└────────────────────┘
```

---

## Frontend

### Framework & Runtime
- **React 18** with Concurrent Mode enabled
- **Vite 5** as the bundler and dev server (HMR, fast cold starts)
- **TypeScript 5** — strict mode enabled, no `any` except in rare interop scenarios

### Routing
- **React Router DOM v6** — declarative nested routes, `<Outlet>` for AppShell layouts
- Route structure:
  - Public: `/login`, `/signup`, `/forgot-password`, `/reset-password`
  - Brand (protected, role-gated): `/brand`, `/brand/campaigns`, `/brand/campaigns/new`, `/brand/campaigns/:id`, `/brand/discover`, `/brand/budget`, `/brand/activity`
  - Creator (protected, role-gated): `/creator`, `/creator/campaigns`, `/creator/campaigns/:id`, `/creator/submissions`, `/creator/wallet`, `/creator/profile`, `/creator/activity`
  - Admin (unprotected route, auth checked in component): `/founders/console`
  - Fallback: `*` → `NotFound.tsx`

### Styling
- **Tailwind CSS v3** — utility-first, no custom CSS classes except design token overrides in `index.css`
- **Design tokens** defined as Tailwind config extensions:
  - `bg-surface`, `bg-surface-2`, `bg-card` — layered surface backgrounds
  - `bg-gradient-teal` — creator avatar gradient
  - `bg-gradient-gold` — stat highlight gradient
  - `shadow-soft`, `shadow-elevated` — card shadow presets
  - `cy-card`, `cy-row`, `cy-chip` — shared component shorthands (applied via `@apply` in CSS)
- Dark mode: class-based (`dark:` prefix), persisted to `localStorage` via `initTheme()` in `lib/theme.ts`

### Component Library
- **Shadcn UI** — Radix UI primitives styled with Tailwind. Components installed locally into `src/components/ui/`:
  - `accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input`, `input-otp`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toggle`, `toggle-group`, `tooltip`
- **Framer Motion** — page transitions (`PageTransition.tsx`), animated stat bars, hover lift effects on cards, spring-physics nav active indicator

### State Management & Data Fetching
- **TanStack React Query (v5)** — all server data fetching and mutation
  - `useQuery` for all reads (never `useEffect + fetch`)
  - `useMutation` for all writes; `onSuccess` always calls `queryClient.invalidateQueries`
  - Polling intervals: campaign detail = 5s, payments = 4s
  - No local `useState` copies of server data for convenience — this is explicitly prohibited in the architecture
- **No global state manager** (no Redux, Zustand, or Context for server state)
- React `useState` used only for ephemeral UI state: form field values, open/closed dialog flags, revision note text per deliverable ID

### Authentication (Frontend)
- **Supabase Auth JS SDK** — session management in `src/lib/auth.ts`
- Auth functions: `signInWithPassword`, `signUpWithPassword`, `signOut`, `getCurrentUser`, `useAuth` (hook), `useAuthReady` (hook)
- JWT stored in browser via Supabase SDK (localStorage-based)
- JWT automatically attached to every API call via `client.ts` fetch wrapper using `Authorization: Bearer <token>` header
- Role stored in Supabase user metadata (`user_metadata.role`) and decoded client-side for routing only — not a security boundary
- Route guards implemented in `AppShell.tsx`: if user is unauthenticated, redirect to `/login`; if wrong role, redirect to correct dashboard

### API Client Layer
Located in `src/api/`:
- `client.ts` — base fetch wrapper. Reads base URL from `VITE_API_URL` env var. Attaches Supabase JWT. Unwraps `{ data, error }` envelope. Throws on `error` presence. All other modules call through this.
- `auth.ts` — `register()`, `login()` → `POST /auth/register`, `POST /auth/login`
- `campaigns.ts` — `list()`, `getById(id)`, `create(payload)`, `publish(id)`, `cancel(id)` → maps to backend campaign endpoints
- `applications.ts` — `apply(campaignId, payload)`, `accept(id)`, `reject(id)`, `withdraw(id)`
- `deliverables.ts` — `submit(appId, payload)`, `approve(id)`, `requestRevision(id, { revisionNotes })`
- `activity.ts` — `getActivity(campaignId)`, `postComment(campaignId, body)`
- `files.ts` — `getAuthorizedFileUrl(campaignId, fileId)`
- `payments.ts` — `getPayments(campaignId)`
- `creators.ts` — `getMe()`, `update(id, payload)`, `list(filters?)`
- `admin.ts` — `getAuditLogs()`, `verifyCreator(id, payload)`, `suspendUser(id, payload)`

### Types
- Located in `src/api/types.ts`
- All types generated from or manually mirroring the backend Prisma schema
- Key types:
  - `User { id, email, name, role, phone, country }`
  - `Campaign { id, name, goal, category, country, city, brief, deliverableType, quantity, budgetPerCreator, currency, status, applicationDeadline, deliveryDeadline, applications?, deliverables?, payments? }`
  - `Application { id, campaignId, creatorId, source, status, pitch, createdAt, decidedAt, creator? }`
  - `Deliverable { id, applicationId, version, status, revisionNotes, file? }`
  - `Payment { id, campaignId, creatorId, amount, currency, status, provider, providerRef, createdAt }`
  - `Creator { id, userId, displayName, bio, profileImageUrl, verified, payoutAccount, socialAccounts?, categories?, languages?, locations?, rates?, stats?, portfolio? }`
  - `AuditLog { id, action, targetType, targetId, actorId, metadata, createdAt, actor? }`
  - `CampaignActivity { id, campaignId, eventType, body, createdAt }`
  - `Role = "brand" | "creator" | "admin"`

### PWA Configuration
- Service worker registered via Vite PWA plugin (`vite-plugin-pwa`)
- `manifest.json` — app name "Yard", theme color teal, display `standalone`
- `PwaInstallPrompt.tsx` — listens to `beforeinstallprompt` browser event, shows install banner on mobile
- Chrome-extension URLs filtered in service worker to prevent caching errors
- iOS `apple-mobile-web-app-capable` meta tag for full-screen standalone mode
- Bottom tab navigation bar uses `pb-safe` (env safe area inset) for notch-safe rendering on iPhone

### Environment Variables (Frontend)
```
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=<supabase project URL>
VITE_SUPABASE_ANON_KEY=<supabase anon key>
```

---

## Backend API

### Framework & Runtime
- **Node.js** (current LTS)
- **NestJS v10** — modular, decorator-driven framework. Chosen for structured dependency injection and built-in support for pipes, guards, interceptors, and filters.
- **TypeScript 5** — strict mode

### Database ORM
- **Prisma ORM** — schema-first, strongly-typed query builder
- Schema at `backend/prisma/schema.prisma`
- Prisma Client auto-generated into `node_modules/@prisma/client`
- Migrations tracked in `backend/prisma/migrations/`

### Database
- **Supabase PostgreSQL** — hosted managed Postgres with connection pooling via PgBouncer
- Connection string: `DATABASE_URL` env var pointing to Supabase Postgres with `?pgbouncer=true&connect_timeout=10`
- Session mode connection pooling — pool_size: 15 connections maximum
- Prisma connection pool: 5 connections max to stay within session pool limit

### Authentication (Backend)
- **Supabase Auth** for user identity (email/password)
- Backend does NOT issue its own JWTs — it validates the Supabase-issued JWT on every request
- JWT validation via `@nestjs/jwt` + `JwtModule.register` using the Supabase JWT secret (`SUPABASE_JWT_SECRET`)
- Custom `JwtAuthGuard` (`@nestjs/passport` `AuthGuard('jwt')`) applied globally
- Custom `JwtStrategy` decodes token, looks up user in `users` table, attaches full user object to `req.user`
- Role-based access control via custom `@Roles()` decorator and `RolesGuard`

### API Module Structure
```
backend/src/
  app.module.ts           — root module, imports all feature modules
  main.ts                 — bootstrap, CORS, global pipes, health endpoint
  common/
    filters/
      global-exception.filter.ts   — catches all unhandled exceptions, returns { data: null, error: { message } }
    interceptors/
      transform.interceptor.ts     — wraps every successful response in { data: <payload>, error: null }
    guards/
      jwt-auth.guard.ts
      roles.guard.ts
    decorators/
      current-user.decorator.ts
      roles.decorator.ts
  modules/
    auth/                 — register, login, me endpoints
    campaigns/            — CRUD + publish + cancel
    creators/             — creator profile management, refresh-stats, refresh-all
    applications/         — apply, accept, reject, withdraw
    deliverables/         — submit, approve, request-revision
    payments/             — get by campaign, Flutterwave webhook, Paystack webhook
    activity/             — get activity, post comment
    files/                — get authorized file URL
    jobs/                 — scheduled jobs (processProviderEvents, checkDeliveryDeadlines)
    audit/                — get audit logs, suspend user
    webhooks/             — ingestion webhook receiver, verify-target
    admin/                — admin-only routes
```

### API Endpoints (Complete List)

#### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | None | Create brand or creator account |
| POST | `/auth/login` | None | Sign in, return JWT |
| GET | `/auth/me` | JWT | Return current authenticated user |

#### Campaigns
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/campaigns` | JWT | List campaigns (scoped by role) |
| POST | `/campaigns` | JWT (brand) | Create new campaign in draft |
| GET | `/campaigns/:id` | JWT | Get campaign detail (full aggregate) |
| PATCH | `/campaigns/:id/publish` | JWT (brand, owner) | Publish draft → open |
| PATCH | `/campaigns/:id/cancel` | JWT (brand, owner) | Cancel campaign |

#### Applications
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/campaigns/:id/applications` | JWT (creator) | Apply to campaign with pitch |
| PATCH | `/applications/:id/accept` | JWT (brand, owner) | Accept pending application |
| PATCH | `/applications/:id/reject` | JWT (brand, owner) | Reject pending application |
| PATCH | `/applications/:id/withdraw` | JWT (creator, owner) | Withdraw own application |

#### Deliverables
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/applications/:id/deliverables` | JWT (creator, accepted) | Submit deliverable (file ref) |
| PATCH | `/deliverables/:id/approve` | JWT (brand) | Approve deliverable, trigger payout |
| PATCH | `/deliverables/:id/request-revision` | JWT (brand) | Request revision with notes |

#### Activity
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/campaigns/:id/activity` | JWT | Get activity timeline |
| POST | `/campaigns/:id/activity` | JWT | Post comment to timeline |

#### Files
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/campaigns/:campaignId/files/:fileId` | JWT | Get authorized file URL (membership checked) |

#### Payments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/payments/:campaignId` | JWT | Get payment ledger for campaign |
| POST | `/webhooks/flutterwave` | None (signature verified) | Flutterwave payment webhook |
| POST | `/payments/webhook/flutterwave` | None | (Alias) |
| POST | `/webhooks/paystack` | None (signature verified) | Paystack payment webhook |
| POST | `/payments/webhook/paystack` | None | (Alias) |

#### Creators
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/creators` | JWT | List all creators (brand discovery) |
| GET | `/creators/me` | JWT (creator) | Get own creator profile |
| PATCH | `/creators/me` | JWT (creator) | Update own creator profile |
| PATCH | `/creators/:id/verify` | JWT (admin) | Verify a creator profile |
| GET | `/creators/:id` | JWT | Get specific creator profile |
| POST | `/creators/:id/refresh-stats` | JWT (admin) | Trigger stats refresh from ingestion engine |
| POST | `/creators/:id/refresh-all` | JWT (admin) | Trigger full refresh dispatch for all platforms |

#### Webhooks
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/webhooks/ingestion` | HMAC signature | Receive result from ingestion engine |
| GET | `/webhooks/verify-target` | None | Health check for webhook target verification |

#### Admin
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/audit-logs` | JWT (admin) | Get full immutable audit log |
| PATCH | `/users/:id/suspend` | JWT (admin) | Suspend a user account |

#### Health
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | None | Service health check |
| GET | `/` | None | Root (returns platform name + version) |

### CORS Configuration
```typescript
app.enableCors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:8081', 'http://127.0.0.1:8081'],
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Accept, Authorization, x-yard-signature, x-yard-timestamp',
});
```

### Response Envelope
All API responses use a consistent wrapper:
- Success: `{ data: <payload>, error: null }`
- Error: `{ data: null, error: { message: string, statusCode: number } }`

### Background Jobs (Scheduler)
Uses `@nestjs/schedule` (`@nestjs/cron`):
- `processProviderEvents()` — runs every 10 minutes. Processes unprocessed `providerEvent` rows (from ingestion engine webhook). Retries up to max retries, marks dead-letter after threshold.
- `checkDeliveryDeadlines()` — runs every hour. Finds campaigns where delivery deadline has passed but status is not completed/cancelled. Logs overdue events to audit trail.
- `reconcilePendingPayments()` — runs every 10 minutes. Finds payments stuck in `payment_initiated` for > 5 minutes with no terminal status. Queries payment provider API to reconcile.

### Environment Variables (Backend)
```
DATABASE_URL=postgresql://...supabase.co:5432/postgres?pgbouncer=true&connect_timeout=10
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key>
SUPABASE_JWT_SECRET=<jwt secret from supabase dashboard>
JWT_SECRET=<same as supabase jwt secret>
PORT=3000
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-...
PAYSTACK_SECRET_KEY=sk_test_...
YARD_WEBHOOK_SECRET=<random 32-char hex for ingestion engine HMAC>
INGESTION_ENGINE_URL=http://localhost:8000
```

---

## Ingestion Engine

### Framework & Runtime
- **Python 3.11+**
- **FastAPI** — ASGI-based REST framework
- **Uvicorn** — ASGI server
- **Pydantic v2** — request/response validation

### Purpose
A standalone microservice that:
- Receives job requests from the NestJS backend (via HTTP POST)
- Fetches creator stats from social media platform APIs or scrapers
- Posts results back to the backend via webhook (`POST /webhooks/ingestion`)
- Signs all webhook payloads with HMAC-SHA256 using shared `YARD_WEBHOOK_SECRET`

### Entry Point
```
ingestion_engine/api/main.py
Runs: python -m uvicorn api.main:app --port 8000 --host 0.0.0.0
```

### Environment Variables (Ingestion Engine)
```
YARD_BACKEND_URL=http://localhost:3000
YARD_WEBHOOK_SECRET=<shared with backend>
INSTAGRAM_API_KEY=<if applicable>
TIKTOK_API_KEY=<if applicable>
```

---

## Infrastructure & Deployment

### Development
- All three services run locally simultaneously:
  - Frontend: `npx vite --port 8080 --host`
  - Backend: `node dist/src/main.js` (after `npm run build`)
  - Ingestion: `python -m uvicorn api.main:app --port 8000 --host 0.0.0.0`

### Production Targets (planned, not yet deployed)
- Frontend: **Vercel** — automatic deploys from `main` branch, Vite build output
- Backend: **Railway** or **Fly.io** — Dockerized Node.js process
- Ingestion Engine: **Railway** or **Fly.io** — Dockerized Python process
- Database: **Supabase hosted PostgreSQL** — managed, includes Auth, Storage, and Edge Functions

### Version Control
- GitHub repository: `https://github.com/ZeroMerge/yard_app.git`
- Branch: `main`
- `.gitignore`: excludes `node_modules/`, `dist/`, `.env`, `__pycache__/`, `ingestion_engine/` (excluded from pushes per user requirement)

---

## Key Libraries (Complete Reference)

### Frontend (`frontend/package.json`)
```
react@18, react-dom@18
react-router-dom@6
@tanstack/react-query@5
tailwindcss@3
framer-motion
@supabase/supabase-js
lucide-react            — icon library
sonner                  — toast notifications
class-variance-authority (cva) — component variant API (used by Shadcn)
clsx, tailwind-merge    — class merging utilities
@radix-ui/*             — Shadcn primitive foundations
vite-plugin-pwa         — PWA service worker and manifest
```

### Backend (`backend/package.json`)
```
@nestjs/core, @nestjs/common, @nestjs/platform-express
@nestjs/config
@nestjs/jwt, @nestjs/passport, passport, passport-jwt
@nestjs/schedule
@prisma/client
class-validator, class-transformer  — DTO validation
flutterwave-node-v3                 — Flutterwave SDK
paystack (npm package)              — Paystack integration
axios                               — HTTP client for ingestion engine calls
```

### Ingestion Engine (`ingestion_engine/requirements.txt`)
```
fastapi
uvicorn[standard]
pydantic
httpx                   — async HTTP client
python-dotenv
```

---

## Technical Constraints

1. **No wildcard CORS with credentials** — `origin: '*'` breaks browser cookie/auth behavior when `credentials: true`. Origin must be explicitly listed.
2. **Prisma + PgBouncer session mode** — Prisma does not support PgBouncer transaction mode without `pgbouncer=true` in the connection string and limited pool size. Pool exhaustion (`EMAXCONNSESSION`) occurs when too many backend instances are running simultaneously — kill stale processes before starting new ones.
3. **File bytes never touch the Node backend** — creators upload directly to the storage provider (Google Drive or Cloudinary). The backend only stores the file reference metadata.
4. **State machine is enforced server-side** — the frontend never calculates or assumes a status transition. Every status pill on the UI reflects what the server last returned.
5. **BigInt serialization** — Prisma returns BigInt for certain numeric fields. `(BigInt.prototype as any).toJSON = function() { return Number(this); }` is applied in `main.ts` to prevent JSON serialization errors.
6. **PWA chrome-extension URL filtering** — the service worker must filter out `chrome-extension://` URLs before attempting to cache them, or Metamask and similar browser extensions cause `Failed to execute 'put' on 'Cache'` errors.
7. **Mobile-first layout** — the AppShell renders bottom tab navigation on mobile (< md breakpoint) and a left sidebar on desktop (≥ md breakpoint). Both are simultaneously present in the DOM; CSS controls which is visible. The main content area has `pt-16 pb-24` on mobile to account for fixed top and bottom bars.
8. **Polling, not WebSockets** — the campaign detail page polls every 5 seconds and payments poll every 4 seconds. There is no WebSocket connection in V1.
9. **No mock data** — there is no `mockData.ts` or `useDB.ts` in the working codebase. All data comes from the backend API. Any component that renders data must go through React Query.
10. **NUBAN payments** — all creator payouts in V1 are Nigerian bank account transfers (NUBAN format). Non-NGN campaigns are supported in schema but payout to non-Nigerian accounts is not tested.
