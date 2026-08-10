# Yard V1 — Frontend Real Data Layer Migration

This document records the completed migration of the **Yard Frontend** from client-side mock data (`mockData.ts` / `useDB.ts`) to the production **Yard V1 Backend Platform API** (`/src/api/`), strictly following [yard-frontend-spec.md](file:///d:/dev/Yard/yard-frontend-spec.md).

---

## 1. Zero Client-Side Mock Data Mutation

* **Previous State**: Actions like "Approve" in `Console.tsx`, `Dashboard.tsx`, or `CampaignDetail.tsx` updated a local browser array in `mockData.ts`. Refreshing the page reset the state, and no real server validation occurred.
* **Current State**: **Every state transition is a real HTTP call to a validated backend endpoint** (`/campaigns/:id/publish`, `/applications/:id/accept`, `/deliverables/:id/approve`, etc.). Zero local arrays are mutated directly in components.

---

## 2. API Client Architecture (`/src/api/`)

```
src/api/
├── types.ts          # Aligned 1:1 with backend Prisma schema §4 (Campaign, Application, Deliverable, Payment, Activity, etc.)
├── client.ts         # Base fetch wrapper, JWT header attachment (Authorization: Bearer <token>), { data, error } unwrapping
├── auth.ts           # POST /auth/register, POST /auth/login, GET /auth/me
├── campaigns.ts      # GET /campaigns, POST /campaigns, PATCH /campaigns/:id/publish, PATCH /campaigns/:id/cancel
├── applications.ts   # POST /campaigns/:id/applications, PATCH /applications/:id/accept|reject|withdraw
├── deliverables.ts   # POST /applications/:id/deliverables, PATCH /deliverables/:id/approve|request-revision
├── activity.ts       # GET /campaigns/:id/activity, POST /campaigns/:id/activity
├── files.ts          # GET /campaigns/:id/files/:fileId (authorization-gated)
├── payments.ts       # GET /payments/:campaign_id (read-only state machine ledger)
├── admin.ts          # GET /admin/audit-logs
├── creators.ts       # GET /creators, GET /creators/:id, GET /creators/me
└── index.ts          # Re-exports all API modules and types
```

---

## 3. Screen-by-Screen Implementation

| Screen | Server Endpoint Called | React Query Hook |
|---|---|---|
| **Brand: Campaigns** | `GET /campaigns` | `useQuery({ queryKey: ['campaigns'], queryFn: campaignsApi.list })` |
| **Brand: New Campaign** | `POST /campaigns` | `useMutation({ mutationFn: campaignsApi.create })` |
| **Brand: Campaign Details** | `GET /campaigns/:id`, `PATCH /applications/:id/accept`, `PATCH /deliverables/:id/approve` | `useQuery`, `useMutation` invalidating `['campaign', id]` |
| **Brand: Budget & Payouts** | `GET /payments/:campaign_id` | `useQuery({ queryKey: ['payments', id], queryFn: paymentsApi.getPayments })` |
| **Brand: Discover Creators** | `GET /creators?category=` | `useQuery({ queryKey: ['creators', category], queryFn: creatorsApi.list })` |
| **Creator: Browse Briefs** | `GET /campaigns`, `POST /campaigns/:id/applications` | `useQuery`, `useMutation` calling `applicationsApi.apply` |
| **Creator: Deliverables** | `POST /applications/:id/deliverables` | `useMutation({ mutationFn: deliverablesApi.submit })` |
| **Creator: Profile** | `GET /creators/me` | `useQuery({ queryKey: ['creator_me'], queryFn: creatorsApi.getMe })` |
| **Creator: Wallet** | `GET /creators/me`, `GET /payments/:campaign_id` | `useQuery` displaying Paystack NUBAN details & disbursements |
| **Founders: Console** | `GET /admin/audit-logs` | `useQuery({ queryKey: ['audit-logs'], queryFn: adminApi.getAuditLogs })` |
| **Activity Timeline** | `GET /campaigns/:id/activity`, `POST /campaigns/:id/activity` | `useQuery`, `useMutation` calling `activityApi.postComment` |

---

## 4. State Machine Discipline

The UI now strictly renders and respects server state machines:
* **Campaign**: `draft` → `open` → `in_progress` → `review` → `completed` / `cancelled`
* **Application**: `pending` → `accepted` | `rejected` | `withdrawn`
* **Deliverable**: `submitted` (v1) → `revision_requested` → `submitted` (v2) → `approved`
* **Payment State Chain**: `unpaid` → `payment_initiated` → `creator_payout_pending` → `paid` / `failed` (read-only from backend).
