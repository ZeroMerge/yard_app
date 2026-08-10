# Yard V1 — Frontend Engineering Specification (v2, corrected)

**What this document is:** the decision record for fixing the `frontend` prototype so it consumes `yard-backend-spec-v2.md` exactly as written — same entity names, same endpoints, same field names, same state machines. Nowhere in this document does the frontend invent a route the backend doesn't have. Where the backend spec genuinely has no endpoint for something the UI needs, that's called out explicitly in §9 as a backend gap to close — not quietly worked around on the frontend.

---

## 0. What to keep, unchanged

Do not rebuild these:
- React 18 + Vite + TypeScript + Tailwind + Shadcn UI + Framer Motion + TanStack Query — correct stack, keep it.
- Route inventory: `/brand` (Dashboard, Campaigns, New Campaign, Campaign Details, Discover Creators, Budget & Activity), `/creator` (Dashboard, Browse Campaigns, Submissions, Wallet & Profile), `/founders/console` (Admin), plus marketing pages.
- The Shadcn component design system.
- The existing partial Supabase Auth integration under `src/integrations/supabase` — extend it, don't replace it.

**The only thing being replaced is the data layer** — `mockData.ts`, `useDB.ts`, and any component that mutates local state directly instead of calling the API.

---

## 1. The core violation, stated once

Clicking "Approve" in `Console.tsx` or `Dashboard.tsx` today updates a local array in the browser. No two brands see the same data, refreshing loses state, and there is no server-side validation of a status transition. **No component may mutate campaign/application/deliverable/payment state directly. Every state transition is a call to an endpoint that exists in backend spec §8, and the UI only ever reflects what the server returns.**

---

## 2. Data layer replacement — mapped 1:1 to backend spec §8, nothing added

```
/src/api
  client.ts          — fetch wrapper, attaches Supabase JWT, unwraps { data, error } envelope
  auth.ts            — register, login          → POST /auth/register, POST /auth/login
  campaigns.ts       — list, create, publish, cancel
                        → GET /campaigns, POST /campaigns,
                          PATCH /campaigns/:id/publish, PATCH /campaigns/:id/cancel
  applications.ts    — apply, accept, reject, withdraw
                        → POST /campaigns/:id/applications,
                          PATCH /applications/:id/accept|reject|withdraw
  deliverables.ts    — submit, approve, requestRevision
                        → POST /applications/:id/deliverables,
                          PATCH /deliverables/:id/approve|request-revision
  activity.ts        — getActivity, postComment
                        → GET /campaigns/:id/activity, POST /campaigns/:id/activity
  files.ts           — getAuthorizedFileUrl
                        → GET /campaigns/:id/files/:fileId
  payments.ts        — getPayments
                        → GET /payments/:campaign_id
  admin.ts           — getAuditLogs
                        → GET /admin/audit-logs
```

Every function here calls an endpoint that is **literally present** in backend spec §8. If a screen needs something not on that list, it goes in §9 (Backend Gaps) — it does not get a client-side workaround (a hidden filter over an oversized payload, a locally-computed aggregate, a fake success state). That workaround is exactly the pattern that produced `mockData.ts` in the first place.

### 2.1 `types.ts` becomes generated, not hand-maintained
Once the Prisma schema from backend spec §4 exists, generate frontend types from it rather than hand-copying field names into a separate `types.ts`. A hand-maintained duplicate is how the frontend silently drifts from the backend — which is the root cause you're fixing right now.

### 2.2 React Query discipline
Every read is a `useQuery`; every write is a `useMutation` that invalidates the relevant query key on success. No component keeps a parallel `useState` copy of server data "for convenience" — that's the seed of the next mock-data problem.

---

## 3. Screen-by-screen — only endpoints that exist in backend spec §8

| Screen | Backend endpoint used | Notes |
|---|---|---|
| Brand: Campaigns / New Campaign | `POST /campaigns`, `PATCH /campaigns/:id/publish` | Form fields must match backend spec §4.3 exactly: `name`, `goal`, `category`, `country`, `city`, `brief`, `deliverable_type`, `quantity`, `budget_per_creator`, `currency`, `application_deadline`, `delivery_deadline`. Don't collect a field the schema doesn't have |
| Brand: Campaign Details — accept/reject applicant | `PATCH /applications/:id/accept`, `PATCH /applications/:id/reject` | Button only enabled when `application.status === 'pending'` (backend spec §6) |
| Brand: Campaign Details — review deliverable | `PATCH /deliverables/:id/approve`, `PATCH /deliverables/:id/request-revision` | Only enabled when `deliverable.status === 'submitted'` |
| Brand: Campaign Details — view applications/deliverables | `GET /campaigns` returns the campaign; applications and deliverables are nested/fetched as part of that response per the campaign aggregate in backend spec §0/§4 — confirm the exact response shape with the backend before wiring, don't assume a shape |
| Brand: Budget & Activity | `GET /campaigns/:id/activity` | This *is* the activity log — don't build a second one. Payment state for the "budget" view comes from `GET /payments/:campaign_id` |
| Creator: Browse Campaigns | `GET /campaigns` (backend spec §8 already scopes this to open campaigns for a creator role — no query params needed on the frontend for that scoping) | Any additional filtering (category, platform, location) has no backend endpoint yet — see §9 |
| Creator: Dashboard | `GET /campaigns` (own applications' campaigns) | No dedicated summary/aggregate endpoint exists — compute simple counts client-side from the list response only; don't build a parallel local store to do it |
| Creator: Submissions | `POST /applications/:id/deliverables` | File is uploaded to the provider first (§4), then this call sends only the file reference, per backend spec §4.4 |
| Campaign Activity feed (shared, both roles) | `GET /campaigns/:id/activity`, `POST /campaigns/:id/activity` | One feed, rendered on both Brand Campaign Details and Creator Submissions — do not build two |
| Founders Console: audit trail | `GET /admin/audit-logs` | This exists. Approve/suspend/verify actions do not have endpoints yet — see §9, do not fake them client-side |
| Marketing pages | none | Leave untouched, out of scope for this fix |

---

## 4. File uploads — matches backend spec §5 exactly

```
1. Creator selects a file in the browser.
2. Frontend uploads directly to the configured FileProvider (Google Drive via Shared Drive +
   delegated OAuth for V1) — file bytes never pass through the Node API.
3. Provider returns a reference.
4. Frontend calls POST /applications/:id/deliverables with
   { provider, provider_file_id, provider_url, file_type, file_size } — the exact fields
   on the `files` table in backend spec §4.4. No extra fields, no renamed fields.
5. To display a file back (brand reviewing a deliverable), call
   GET /campaigns/:id/files/:fileId — never render a stored raw URL directly.
   The backend's membership check is what makes this safe; a frontend-only check is not
   a substitute (backend spec §9 — file access is server-enforced, not link-based).
```

---

## 5. Payment status — read-only, always, matches backend spec §4.5/§6

- The frontend never sets or infers a payment status locally.
- `GET /payments/:campaign_id` is the only source for what to display.
- Render exactly the states in backend spec §6: `unpaid`, `payment_initiated`, `payment_confirmed`, `creator_payout_pending`, `paid`, `failed`, `retry` — no invented intermediate UI states.
- After a brand approves a deliverable, poll `GET /payments/:campaign_id` (short refetch interval via React Query) rather than assume success — the real confirmation comes from Flutterwave's webhook asynchronously, and the frontend has no visibility into that except by re-fetching.

---

## 6. Authentication

- Extend the existing Supabase Auth integration; JWT attaches to every request in `client.ts`.
- Frontend routes by `role` (`brand`/`creator`/`admin`) for UX redirect only. This is not a security boundary — the backend enforces role checks independently (backend spec §9). Treat the frontend guard as navigation convenience, never as access control.

---

## 7. What NOT to fix first

1. Data layer (§2) — nothing else matters until this is real.
2. The Campaign → Application → Deliverable → Payment loop screens (Brand + Creator) — this is the V1 loop from backend spec §0/§11.
3. Auth wiring (§6).
4. File upload flow (§4).
5. Admin console audit log view (§3) — the parts of it with real endpoints only; leave the rest per §9.
6. Marketing pages — untouched, not this fix's job.

Don't let the AI spend the hour polishing the Blog Editor or building a Discover Creators filter UI against data that doesn't exist server-side yet. That's the same mistake in a different shape — a lot of visible surface area sitting on nothing real underneath.

---

## 8. Definition of Done for this fix

A brand can log in, create a campaign through the real form, see a creator's application arrive from a second session (proving it's server-backed), accept it, see the creator's real uploaded deliverable, approve it, and watch the payment section move through its real states as the webhook fires — with zero references to `mockData.ts` or `useDB.ts` left for Campaign, Application, Deliverable, Payment, or Activity. Wallet fields, Discover Creators filtering, and full Admin actions are not required for this fix to count as done — they depend on the gaps below being closed first.

---

## 9. Backend Gaps — endpoints the frontend needs that don't exist in backend spec §8 yet

These are not invented by the frontend. They're flagged here so whoever owns the backend spec adds them using its own conventions (`{ data, error }` envelope, same auth middleware, same state-machine discipline) before the frontend screens that depend on them get built out:

- **Creator profile:** `GET /creators/:id`, `PATCH /creators/:id` — needed for Wallet & Profile. Backend spec §4.2 already has the schema (`creators`, `creator_social_accounts`, `creator_categories`, `creator_languages`, `creator_locations`, `creator_rates`, `creator_portfolio`); only the API routes are missing.
- **Creator discovery/search:** `GET /creators?category=&country=&language=&min_followers=` — needed for Brand: Discover Creators. Without server-side filtering, that screen cannot ship correctly (backend spec §4.2 explicitly warns against shipping unfiltered arrays to the browser once creator count grows).
- **Organization/dashboard summary:** either a dedicated `GET /organizations/:id/summary`, or confirmation that the Brand Dashboard should compute its counts client-side from `GET /campaigns` alone. Needs a decision, not an assumption.
- **Admin actions:** `PATCH /users/:id/suspend`, `PATCH /creators/:id/verify` (or equivalent) — needed for Founders Console. Backend spec §1 already defines the Admin role's permissions; the routes just aren't listed in §8 yet. Each must write an `audit_logs` row with a `reason` field, per backend spec §4.9.

Until these exist, the corresponding frontend screens should show a clear "not yet connected" state rather than a fake one — that's the honest version of "not done yet," and it's a lot cheaper to fix than another mock-data layer.
