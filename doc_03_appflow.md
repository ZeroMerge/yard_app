# Document 03 — App Flow: Navigation & User Journey Map
## Yard V1 — Complete Interaction & Navigation Reference

---

## Complete Page Inventory

| Route | File | Role | Auth Required |
|-------|------|------|---------------|
| `/` | `RootAppRedirect` (inline) | Any | No (redirects based on session) |
| `/login` | `pages/Login.tsx` | Any | No |
| `/signup` | `pages/Signup.tsx` | Any | No |
| `/forgot-password` | `pages/ForgotPassword.tsx` | Any | No |
| `/reset-password` | `pages/ResetPassword.tsx` | Any | No |
| `/brand` | `pages/brand/Dashboard.tsx` | Brand | Yes |
| `/brand/campaigns` | `pages/brand/Campaigns.tsx` | Brand | Yes |
| `/brand/campaigns/new` | `pages/brand/NewCampaign.tsx` | Brand | Yes |
| `/brand/campaigns/:id` | `pages/brand/CampaignDetail.tsx` | Brand | Yes |
| `/brand/discover` | `pages/brand/Discover.tsx` | Brand | Yes |
| `/brand/budget` | `pages/brand/Budget.tsx` | Brand | Yes |
| `/brand/activity` | `pages/Activity.tsx` | Brand | Yes |
| `/creator` | `pages/creator/Dashboard.tsx` | Creator | Yes |
| `/creator/campaigns` | `pages/creator/BrowseCampaigns.tsx` | Creator | Yes |
| `/creator/campaigns/:id` | `pages/creator/CampaignDetail.tsx` | Creator | Yes |
| `/creator/submissions` | `pages/creator/Submissions.tsx` | Creator | Yes |
| `/creator/wallet` | `pages/creator/Wallet.tsx` | Creator | Yes |
| `/creator/profile` | `pages/creator/Profile.tsx` | Creator | Yes |
| `/creator/activity` | `pages/Activity.tsx` | Creator | Yes |
| `/creator/payouts` | Redirect → `/creator/wallet` | Creator | Yes |
| `/founders/console` | `pages/founders/Console.tsx` | Admin | Checked in component |
| `/admin/*` | Redirect → `/founders/console` | Any | — |
| `/index` | Redirect → `/` | Any | — |
| `*` | `pages/NotFound.tsx` | Any | No |

---

## Navigation Structure

### Layout A — AppShell (all authenticated brand/creator routes)
```
┌────────────────────────────────────────────────────────────────┐
│  DESKTOP SIDEBAR (hidden on mobile)                            │
│  ┌──────────────────────────────────┐                          │
│  │ [Logo]                           │                          │
│  │ Brand workspace / Creator workspace (role label)            │
│  │                                  │                          │
│  │ nav links (role-specific):        │                          │
│  │   Dashboard      (LayoutDashboard icon)                     │
│  │   Campaigns      (Megaphone / Compass icon)                 │
│  │   Browse/Discover (Search icon)                             │
│  │   Budget/Wallet  (Wallet icon)                              │
│  │   Submissions    (FileUp icon) [creator only]               │
│  │   Profile        (User icon) [creator only]                 │
│  │   Activity       (Activity icon)                            │
│  │                                  │                          │
│  │ [User Avatar Initial]             │                          │
│  │ User name                        │                          │
│  │ User email                       │                          │
│  │ [Sign out button]                │                          │
│  └──────────────────────────────────┘                          │
│                                                                 │
│  MAIN CONTENT (flex-1)                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ TOP BAR (desktop only, sticky, backdrop blur)            │   │
│  │                           [ThemeToggle] [NotificationsBell] │
│  │                                                          │   │
│  │ PAGE CONTENT (max-w-6xl, px-8, py-8)                    │   │
│  │  <Outlet /> wrapped in <PageTransition>                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘

MOBILE OVERLAY LAYERS:
┌─────────────────────────────────────────────────────┐
│ FIXED TOP BAR (z-40, bg-card/90, backdrop-blur)    │
│  [Logo sm] ─────────── [ThemeToggle][Bell][LogOut] │
└─────────────────────────────────────────────────────┘

PAGE CONTENT (pt-16, pb-24 to clear bars)

┌─────────────────────────────────────────────────────┐
│ FIXED BOTTOM TAB NAV (z-40, pb-safe for notch)    │
│  [Icon] [Icon] [Icon] [Icon] [Icon]               │
│  Label  Label  Label  Label  Label                 │
└─────────────────────────────────────────────────────┘
```

### Layout B — Auth pages (Login, Signup, Forgot/Reset Password)
```
┌─────────────────────────────────────────────────┐
│ LEFT PANEL (hidden on mobile, bg-secondary)    │
│  [Logo]                                        │
│  Marketing headline                            │
│  Subtext                                       │
│  Gold gradient blur decoration (bottom-right)  │
│                                                │
│ RIGHT PANEL (flex, centered)                   │
│  [Logo mobile only]                            │
│  Form content                                  │
└─────────────────────────────────────────────────┘
```

### Layout C — Founders Console (standalone full-page, no sidebar)
```
┌─────────────────────────────────────────────────┐
│ HEADER (bg-card, shadow-sm)                    │
│  [Logo] [Admin Badge] ──── [email] [LogOut]    │
│                                                │
│ MAIN (max-w-7xl, px-8, py-8)                  │
│  Stat cards row                                │
│  Action bar                                    │
│  Audit log table                               │
└─────────────────────────────────────────────────┘
```

---

## Entry Points

### First Visit (No Session)
1. User navigates to `/`
2. `RootAppRedirect` reads `useAuth()` — returns null
3. Redirect to `/login`
4. Login page renders (two-column layout: marketing left, form right)

### Returning Session (Has JWT)
1. User navigates to `/`
2. `RootAppRedirect` reads `useAuth()` — returns user object
3. If `user.role === "brand"` → redirect to `/brand`
4. If `user.role === "creator"` → redirect to `/creator`
5. If `user.role === "admin"` (no specific redirect defined) → falls to `/login`

### Wrong Role Access
1. Brand user navigates to `/creator/dashboard`
2. `AppShell` checks `allowedRole === "creator"` vs `user.role === "brand"` → mismatch
3. Redirect to `dashboardPathFor("brand")` = `/brand`

---

## Core User Journey 1: Brand Creates and Runs a Campaign

```
Brand logs in
  └── POST /auth/login
  └── JWT stored via Supabase SDK
  └── Navigate to /brand

/brand (Dashboard)
  └── GET /campaigns (background, polled)
  └── Stat row renders: Active Campaigns, Total Allocated, Pending Applications, Creators Engaged
  └── Active campaigns list (slice first 6)
  └── Pending applicants panel (slice first 6)
  └── Quick Action cards: [Create Campaign] [Discover Creators] [Budget & Payouts]

Click "New Campaign" (CTA button in header or quick action card)
  └── Navigate to /brand/campaigns/new

/brand/campaigns/new (NewCampaign form)
  └── Fill Campaign Title (text input)
  └── Fill Brief & Creative Requirements (textarea)
  └── Set Currency (Select: NGN / USD)
  └── Set Budget Per Creator (number input, min 1000)
  └── Set Creator Slots (number input, 1–50)
  └── Set Niche/Category (Select: Beauty, Fashion, Tech, Lifestyle, Travel, Food, Finance, Fitness)
  └── Set Deliverable Format (Select: reel, tiktok, youtube_video, story, carousel)
  └── Set Target Country (text input, default "Nigeria")
  └── Set Delivery Deadline (date input)
  └── Click "Publish Campaign Brief"
      └── useMutation → POST /campaigns
      └── On success: invalidate ["campaigns"], toast "Campaign brief created successfully!", navigate to /brand/campaigns/:id

/brand/campaigns/:id (CampaignDetail — newly created, status: "draft")
  └── Header shows: Campaign name, CATEGORY • Country • Format: deliverableType
  └── Status pill: "draft"
  └── Action button: "Publish Campaign" (only visible when status === "draft")
  └── Stats row: Total Budget, Per Creator, Creator Slots, Applicants (0)
  └── Tabs: Overview & Brief | Applicants (0) | Deliverables (0) | Payments (0) | Activity (0)
  └── Click "Publish Campaign"
      └── useMutation → PATCH /campaigns/:id/publish
      └── On success: invalidate ["campaign", id], toast "Campaign published to creators!", status pill changes to "open"

Status now "open" — creators can see and apply to this campaign

Wait for applications...
  └── Campaign detail polls every 5 seconds (refetchInterval: 5000)
  └── Applicants tab count updates live

Applicants tab shows creator applications
  └── Each row: Creator display name, status pill, pitch text, application date
  └── If status === "pending": shows [Accept] and [Reject] buttons
  └── Click "Accept"
      └── useMutation → PATCH /applications/:id/accept
      └── On success: invalidate ["campaign", id], toast "Application accepted! Campaign moved to in_progress."
      └── Application status pill changes to "accepted"
      └── Campaign status changes to "in_progress"
  └── Click "Reject"
      └── useMutation → PATCH /applications/:id/reject
      └── On success: invalidate ["campaign", id], toast "Application rejected."
      └── Application status pill changes to "rejected"

Creator submits deliverable...
  └── Deliverables tab count increments (polled every 5 seconds)

Deliverables tab shows submitted content
  └── Each row: "Deliverable Version 1 (video/mp4)", status pill "submitted", [View Uploaded Media] link
  └── If status === "submitted": shows
      └── [Approve & Release Payout] button
      └── Revision note input + [Request Revision] button
  └── Click "Approve & Release Payout"
      └── useMutation → PATCH /deliverables/:id/approve
      └── On success: invalidate ["campaign", id] + ["payments", id], toast "Deliverable approved! Payout initiated."
      └── Deliverable status → "approved"
      └── Payment created automatically by backend, status → "payment_initiated"
  └── Alternatively, type revision note + click "Request Revision"
      └── Validation: if note is empty → toast.error "Please provide revision instructions."
      └── useMutation → PATCH /deliverables/:id/request-revision with { revisionNotes: text }
      └── Deliverable status → "revision_requested"
      └── Creator sees revision notes in their Submissions page

Payments tab (polls every 4 seconds)
  └── Each row: [STATUS] amount via provider (Ref: ref) — timestamp
  └── Status progresses automatically: payment_initiated → payment_confirmed → creator_payout_pending → paid
  └── Frontend simply re-renders as poll returns new status

Activity tab
  └── Chronological log of all events on this campaign
  └── Comment input at bottom: type comment, press Enter or click "Post"
      └── useMutation → POST /campaigns/:id/activity with body text
      └── On success: invalidate ["activity", id], clear input, toast "Comment posted to campaign activity timeline."
```

---

## Core User Journey 2: Creator Discovers and Works a Campaign

```
Creator signs up at /signup
  └── Step 1: Role selection cards — [Brand] or [Creator]
  └── Click "Creator" card — card highlights with border-primary + bg-primary/5
  └── Click "Continue as Creator"
  └── Step 2: Creator form
      └── Full name (text)
      └── Email (text)
      └── Password (min 8 chars)
      └── Phone (text)
      └── Country (Select dropdown: Nigeria, Ghana, Kenya, South Africa, etc.)
      └── City (text)
      └── Primary platform (Select: Instagram, TikTok, YouTube, X, Facebook, LinkedIn, Twitch, Threads)
      └── Creator category (Select: Beauty, Fashion, Tech, Lifestyle, Food, Travel, Fitness, Finance, Gaming, Music, Education, Parenting)
  └── Click "Create account"
      └── Validation: all required fields present (fullName, city, primaryPlatform, niche, country, phone)
      └── signUpWithPassword() called → POST /auth/register
      └── If email confirmation required: show email verification screen
          └── MailCheck icon + "Verify your email" heading
          └── "We sent a confirmation link to {email}..."
          └── [Go to sign in] button → navigate to /login
      └── If auto-confirmed: navigate to /creator

Creator logs in at /login
  └── Email + password form
  └── signInWithPassword() → POST /auth/login
  └── On success: toast "Welcome back, {firstName}", navigate to /creator

/creator (Creator Dashboard)
  └── GET /campaigns (filtered to creator's own applications by backend)
  └── GET /creators/me
  └── Stats: Total Applications, Active Campaigns, Pending Review, Account Standing (Verified/Active)
  └── If onboarding incomplete (< 4 of 4 steps):
      └── Shows animated onboarding checklist card with progress bar
      └── 4 steps:
          1. "Complete your creator bio" — done when profile.bio length > 10 → link to /creator/profile
          2. "Set your per-deliverable rates" — done when profile.rates.length > 0 → link to /creator/profile
          3. "Add NUBAN payout details" — done when profile.payoutAccount exists → link to /creator/wallet
          4. "Apply to your first campaign" — done when myApps.length > 0 → link to /creator/campaigns
      └── Each step: CheckCircle2 (done) or Circle (pending) + label + hover arrow
  └── Applications list: each row = campaign name, category, status pill → click navigates to /creator/campaigns/:id
  └── Reputation panel: campaigns completed, revisions requested, network standing

Click "Browse open briefs →" or navigate to /creator/campaigns
  └── GET /campaigns (all open campaigns)
  └── Grid of campaign cards:
      └── Category chip (top left)
      └── Status pill (top right)
      └── Campaign name (clickable link → /creator/campaigns/:id)
      └── Format: deliverableType • Location: country
      └── Brief excerpt (3 lines, line-clamp)
      └── Budget per creator (prominent, NGN)
      └── "per approved deliverable" subtext
      └── [Apply to Brief] button

Click "Apply to Brief" on a campaign card
  └── Dialog opens (stays anchored to that campaign card's state)
  └── Dialog title: "Apply to {campaign.name}"
  └── Instruction text: "Tell the brand about your proposed creative hook, camera format, and audience alignment."
  └── Pitch textarea (rows 5): "Pitch your angle. How will you bring this brief to life for your audience?"
  └── [Submit Application] button (disabled if pitch is empty or mutation is pending)
  └── Click Submit
      └── useMutation → POST /campaigns/:id/applications { pitch, source: "applied" }
      └── On success: invalidate ["campaigns"], toast "Application submitted directly to the brand!", close dialog, clear pitch

Creator waits for brand response...
  └── Returns to /creator dashboard → application shows status "pending"
  └── Brand accepts → creator's application status → "accepted"
  └── Creator navigates to /creator/submissions

/creator/submissions (Submissions page)
  └── Filters campaigns where creator has accepted or pending application
  └── Shows cards for each eligible campaign:
      └── Campaign name, deliverable format, payout amount
      └── If status "accepted": [Submit Deliverable] button
      └── If status "pending" only (not accepted): "Application Pending Review" amber badge (no upload button)
      └── Past deliverables listed: version number, revision notes (if any in amber text), file link, status pill

Click "Submit Deliverable"
  └── Dialog opens for that campaign's accepted application
  └── Dialog title: "Submit Content for {campaign.name}"
  └── Media URL input: "Video / Deliverable Media URL (Google Drive / Cloudinary)"
  └── Notes textarea (rows 3): "Creator notes or submission details..."
  └── [Submit to Brand] button (disabled if URL empty or mutation pending)
  └── Click Submit
      └── useMutation → POST /applications/:id/deliverables {
            provider: "google_drive",
            providerFileId: "gdrive_{timestamp}_{random}",
            providerUrl: url,
            fileType: "video/mp4",
            fileSize: 15728640
          }
      └── On success: invalidate ["campaigns"], toast "Deliverable submitted for brand review!", close dialog

If brand requests revision:
  └── Deliverable card shows amber text: Brand Revision Notes: "{revision note text}"
  └── Creator submits new deliverable (Submit Deliverable button still available)
  └── New submission creates Deliverable v2

Brand approves:
  └── Deliverable status → "approved"
  └── Payment automatically initiated by backend
  └── Creator navigates to /creator/wallet

/creator/wallet (Wallet page)
  └── Stats: Lifetime Earnings, Pending Transfers, Completed Payouts, Payment Rail
  └── NUBAN Payout Account form (left column):
      └── Bank Code / Name input (placeholder: "058 (GTBank) or 033 (UBA)")
      └── Account Number (NUBAN) input (placeholder: "0123456789")
      └── Account Name input (disabled, shows creator display name)
      └── [Save Payout Details] button
      └── Click Save → form.onSubmit → toast "NUBAN Payout details saved!" (currently local, needs PATCH /creators/me integration)
  └── Payout Disbursements list (right column, 2/3 width):
      └── Each row: campaign name, date, provider, amount, status pill
      └── Status badge changes as payment progresses through state machine
```

---

## Core User Journey 3: Founder Verifies a Creator

```
Founder navigates to /founders/console
  └── Not behind AppShell — has its own full-page layout

If not logged in:
  └── Restricted Area card: ShieldAlert icon, "Please sign in with administrator credentials.", [Sign in] button → /login

If logged in:
  └── GET /admin/audit-logs (TanStack Query)
  └── Stats row: audit event count, admin session status, security mode, traceability

Admin action bar:
  └── [Verify Creator] button (teal) → opens Dialog
  └── [Suspend User] button (ghost, red hover) → opens Dialog

Verify Creator Dialog:
  └── Creator UUID input (placeholder: "Creator UUID...")
  └── Audit reason input (placeholder: "Audit reason / justification...")
  └── [Confirm & Write Audit Event] button (disabled if UUID empty)
  └── Click Confirm
      └── useMutation → PATCH /creators/:id/verify { verified: true, reason }
      └── On success: invalidate ["audit-logs"], toast "Creator successfully verified with immutable audit log!", close dialog

Suspend User Dialog:
  └── User UUID input (placeholder: "User UUID...")
  └── Suspension reason input (placeholder: "Suspension reason (e.g. Terms violation)...")
  └── [Confirm Suspension] button (rose-600)
  └── Click Confirm
      └── useMutation → PATCH /users/:id/suspend { suspended: true, reason }
      └── On success: invalidate ["audit-logs"], toast "User account suspended with audit event recorded!", close dialog

Audit log table:
  └── Each row:
      └── Action badge (monospace, teal bg): e.g. "CREATOR_VERIFIED"
      └── Target type uppercase: e.g. "CREATOR"
      └── Target ID + Actor email (truncated)
      └── Metadata JSON display (if present)
      └── Timestamp (locale string)
```

---

## Auth Flow (Complete)

```
/signup
  Step 1: Role Selection
  ├── [Brand card] — Building2 icon, "Run campaigns & hire creators"
  └── [Creator card]  - Each card: `rounded-xl border p-5` — icon (top), bold title, xs muted description
  - **Selected card**: `border-primary bg-primary/5 shadow-soft` — teal border used here intentionally as a **selection indicator** (not a structural separator), teal-tinted bg, soft shadow lift
  - **Unselected card**: `border-border hover:border-primary/40` — the border at rest is invisible (border-border at /50 opacity); it becomes 40% teal on hover
  [Continue as Brand/Creator] → Step 2: Form

  Step 2: Form (role-specific fields)
  Brand fields: business name, contact name, work email, password, phone, country, industry, company size
  Creator fields: full name, email, password, phone, country, city, primary platform, creator category
  [Create account] → signUpWithPassword()

  If email confirmation needed:
  └── Email verification screen:
      MailCheck icon (green)
      "Verify your email" heading
      "We sent a confirmation link to {email}" message
      [Go to sign in] → /login
      "Didn't get it? Check your spam folder."

  If auto-confirmed (dev):
  └── Navigate directly to role dashboard

/login
  Email input (type=email, autocomplete=email)
  Password input (type=password, autocomplete=current-password)
  "Forgot password?" link → /forgot-password (inline, right of password label)
  [Sign in] button → signInWithPassword()
  Error handling:
  ├── "not confirmed" / "email not" in message → "Please verify your email address first..."
  ├── "Invalid" in message → "Incorrect email or password."
  └── Other → show raw message
  Success: navigate to dashboardPathFor(user.role)

/forgot-password
  Email input
  [Send reset link] button
  Success state: confirmation message shown

/reset-password
  New password input + confirm password input
  Token read from URL (Supabase magic link)
  [Update password] button
```

---

## Modal & Overlay Interactions

| Trigger | Component | Contents | Dismiss |
|---------|-----------|----------|---------|
| "Apply to Brief" | `Dialog` | Campaign name, pitch textarea, Submit button | Click outside, ESC, or Dialog auto-close on success |
| "Submit Deliverable" | `Dialog` | Campaign name, URL input, notes textarea, Submit button | Click outside, ESC, or Dialog auto-close on success |
| "Verify Creator" (admin) | `Dialog` | Creator UUID input, reason input, Confirm button | Click outside, ESC, or auto-close on success |
| "Suspend User" (admin) | `Dialog` | User UUID input, reason input, Confirm button (rose) | Click outside, ESC, or auto-close on success |

---

## Redirect Logic

| Condition | Redirect To |
|-----------|-------------|
| Unauthenticated user visits any `/brand/*` or `/creator/*` route | `/login` |
| Brand user visits any `/creator/*` route | `/brand` |
| Creator user visits any `/brand/*` route | `/creator` |
| Any user visits `/` | `/brand` (if brand), `/creator` (if creator), `/login` (if no session) |
| `POST /campaigns` success | `/brand/campaigns/:newId` |
| `POST /auth/login` success | `/brand` or `/creator` based on role |
| Sign out button | `/` → resolves to `/login` |
| Creator visits `/creator/payouts` | `/creator/wallet` |
| Any `/admin/*` path | `/founders/console` |
| Any unmatched path | `NotFound.tsx` |

---

## Empty States

| Page | Empty State Component | Message | Action |
|------|-----------------------|---------|--------|
| Brand /campaigns | `<Empty>` | "No campaigns created yet — Create your first campaign brief in under a minute..." | [Create Campaign] → `/brand/campaigns/new` |
| Brand Dashboard campaigns list | Inline div | "No campaigns yet." | [Create one now] link |
| Brand Dashboard pending applicants | Inline div | "You're all caught up." | — |
| Brand CampaignDetail applicants tab | Inline div | "No applications received yet." | — |
| Brand CampaignDetail deliverables tab | Inline div | "No deliverables submitted yet." | — |
| Brand CampaignDetail payments tab | Inline div | "No payments initiated yet. Payouts trigger automatically upon deliverable approval." | — |
| Creator /campaigns | Inline div (card) | "No open campaigns at the moment. Check back soon!" | — |
| Creator Submissions | `<Empty>` | "No active campaign applications yet — Browse open campaigns, apply to briefs..." | — |
| Creator Submissions (per campaign) | Inline div | "No deliverables submitted for this campaign yet." | — |
| Creator Wallet payouts | `<Empty>` | "No payouts recorded yet — Once your deliverable is approved by a brand, payouts disburse automatically." | — |
| Admin Console audit logs | Inline div | "No audit logs recorded yet." | — |

---

## Loading States

| Page | Loading Indicator |
|------|--------------------|
| AppShell auth check | Full-screen `<Loader2 className="animate-spin">` |
| Brand /campaigns | Inline text: "Loading campaigns from server..." |
| Brand Campaign Detail | Inline text: "Loading campaign from server..." |
| Creator /campaigns | Inline text: "Loading open campaigns from server..." |
| Creator Submissions | Inline text: "Loading active campaigns..." |
| Admin Console audit logs | Inline text: "Loading immutable audit trail..." |
| All action buttons (mutations pending) | Button text changes to "Publishing..." / "Submitting..." / "Creating..." / etc. and button is `disabled` |

---

## Error States

| Trigger | Handling |
|---------|---------|
| API request returns error | Toast (Sonner) shows error message |
| Campaign not found (404) | `<Empty title="Campaign not found">` with [Back to campaigns] button |
| Auth error "not confirmed" | Toast: "Please verify your email address first." |
| Auth error "Invalid" | Toast: "Incorrect email or password." |
| Duplicate email on signup | Toast: "An account with this email already exists." |
| Revision requested without note | Toast.error: "Please provide revision instructions." |
| Deliverable submission with empty URL | Submit button disabled until URL has content |
| Application submission with empty pitch | Submit button disabled until pitch has content |
| Global unhandled exception | `GlobalExceptionFilter` returns `{ data: null, error: { message } }`, `client.ts` throws, React Query surfaces error |
