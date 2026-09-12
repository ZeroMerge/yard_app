# Document 01 — PRD: Product Requirements Document
## Yard V1 — Creator Commerce Marketplace for Africa

---

## App Name
**Yard** (also referenced as CreatorYard internally)

## Tagline
*Creator marketing, without the chaos.*

---

## The Problem

Brands operating in African markets — particularly Nigeria, Ghana, Kenya, and South Africa — have no structured way to hire, brief, manage, and pay social media creators for campaigns. The current process is entirely informal:

- Brands reach out to creators via Instagram DMs or WhatsApp.
- Briefs are sent as voice notes or PDFs in chat threads.
- Deliverables are dropped in Google Drive folders with no approval workflow.
- Payments are made manually over bank transfer after lengthy back-and-forth.
- There is no contract, no audit trail, and no reputation history.

Creators suffer equally:
- Payment is delayed, sometimes indefinitely.
- There is no standard rate card or negotiation framework.
- There is no record of completed work to demonstrate credibility to new brands.
- There is no structured place to browse and apply to campaign opportunities.

Yard solves this by replacing the entire manual workflow with a structured, server-backed SaaS platform. Every step — from campaign brief creation, to creator application, to deliverable submission, to payment disbursement — is tracked, auditable, and automated.

---

## Target Users

**Primary User A — The Brand**
A marketing manager, growth lead, or founder at an African consumer brand (beauty, fashion, fintech, food & beverage, e-commerce). They have a creator marketing budget but no clean process to manage it. They typically run 2–10 campaigns per quarter, each requiring 3–10 creators. They are tech-comfortable but not technical. They use Notion, Slack, and spreadsheets today. They need a clean dashboard to post briefs, review applications, approve deliverables, and confirm payment without manually managing WhatsApp threads.

**Primary User B — The Creator**
An African social media creator (primarily Nigerian) with a following on Instagram, TikTok, or YouTube between 5,000 and 500,000 followers. They create content in niches like beauty, fashion, food, tech, lifestyle, finance, gaming, or music. They currently get hired informally and have no structured income source. They need a professional platform to discover brand campaigns, apply, submit work, and get paid reliably.

**Secondary User — The Founder / Admin**
Yard's own founding team, who need to verify creators, suspend bad actors, and monitor all platform activity from an internal console with a full, immutable audit trail.

---

## What Yard Is, Precisely

Yard is a **B2B2C SaaS marketplace** where:

1. Brands create campaign briefs specifying deliverable format (Reel, TikTok, YouTube Video, Story, Carousel), quantity of creators needed, budget per creator, target niche, country, and deadline.
2. Creators browse open briefs, view requirements, and apply with a custom pitch.
3. Brands review applications and accept/reject each creator.
4. Accepted creators upload deliverable content (via external media URL or direct provider link).
5. Brands review the deliverable and either Approve it or Request a Revision with written notes.
6. On approval, payment is automatically disbursed to the creator's NUBAN bank account via Paystack or Flutterwave without any manual action by the brand.
7. Every action (application, acceptance, rejection, deliverable submission, approval, payment state change) is logged to an immutable audit trail visible to the founders.

---

## Core Value Proposition

For Brands: Run creator campaigns end-to-end without a single WhatsApp message. Post a brief, pick your creators, approve the video, done.

For Creators: Find paid brand deals, submit content professionally, and receive direct bank transfers automatically — no chasing payments.

For the Platform: A complete, auditable transaction record on every campaign cycle.

---

## Features — Must Have (V1)

### Authentication & Onboarding
- Email/password registration with Supabase Auth
- Role selection at signup: Brand or Creator
- Email verification before account activation
- Role-specific onboarding forms capturing different data per role
  - Brand: Business name, contact name, work email, phone, country, industry, company size
  - Creator: Full name, email, phone, country, city, primary platform, creator category (niche)
- JWT-based session management, role-based route guarding
- Forgot password / reset password via email link

### Brand Workspace
- Dashboard showing: active campaigns count, total budget allocated, pending applications count, creators engaged count
- Quick-action cards linking to Create Campaign, Discover Creators, Budget & Payouts
- Live list of the brand's 6 most recent campaigns with status badges
- Sidebar panel showing pending applicants across all campaigns (linked to campaign detail)
- Campaign list page (all campaigns, with status filter: draft, open, in_progress, review, completed, cancelled)
- Campaign cards showing: category chip, status pill, campaign name, brief excerpt, deliverable format, slot count, total budget
- New Campaign form collecting: Campaign Title, Brief & Creative Requirements (textarea), Currency (NGN/USD), Budget Per Creator (number), Creator Slots (1–50), Niche/Category (dropdown), Deliverable Format (reel, tiktok, youtube_video, story, carousel), Target Country, Delivery Deadline (date picker)
- Campaign created in "draft" status; brand must explicitly publish it (PATCH /campaigns/:id/publish) to open it to creators
- Campaign Detail page with tabbed navigation:
  - **Overview & Brief tab**: Full brief text, campaign goal, category, country, delivery deadline
  - **Applicants tab**: List of all creator applications with creator name, pitch text, application date, status pill. Accept and Reject action buttons (only enabled when status is "pending")
  - **Deliverables tab**: All submitted deliverables with version number, file type, external media link, status pill. Approve button and Request Revision with text field (only enabled when status is "submitted")
  - **Payments tab**: Transaction ledger per payment — status, amount, currency, provider, provider reference, timestamp
  - **Activity tab**: Chronological event timeline plus comment input box (post comment to campaign)
- Publish Campaign action (draft → open)
- Cancel Campaign action (any pre-completed status)
- Discover Creators page: search by name/bio text + filter by category dropdown; creator cards showing avatar initial, display name, location, bio excerpt, primary niche chip, rate per reel chip, campaigns completed, revisions count, Invite to Campaign button
- Budget & Payouts page (linked from sidebar)

### Creator Workspace
- Dashboard showing: total applications count, active campaigns count, pending review count, account standing (Verified / Active)
- Onboarding checklist (shown until all 4 steps complete): Complete creator bio, Set per-deliverable rates, Add NUBAN payout details, Apply to first campaign
- Animated progress bar showing onboarding completion %
- Application list showing all the creator's applications with campaign name, category, and status pill
- Reputation & Standing panel showing: campaigns completed, revisions requested, network tier label
- Browse Campaigns page: grid of open campaign cards (category chip, status pill, campaign name, deliverable format, country, brief excerpt, budget per creator, Apply to Brief button)
- Apply modal (Dialog): pitch textarea + Submit Application button (calls POST /campaigns/:id/applications)
- Campaign Detail (read-only): shows full brief, goal, requirements, status — creator sees their own application status
- Submissions page: shows all campaigns where creator has an accepted or pending application. Per campaign card: campaign name, deliverable format, budget, Submit Deliverable button (only for accepted status). Submitting opens a dialog: media URL input + creator notes textarea + Submit to Brand button. Past submissions listed per campaign with version number, revision notes (if any), file link, and status pill
- Wallet page: lifetime earnings stat, pending transfers stat, completed payouts stat, payment rail label; NUBAN payout account form (bank code, account number, account name [read-only]); payout disbursement list showing campaign name, date, provider, amount, status pill

### Founders / Admin Console
- Separate full-page layout (no sidebar, custom header with logo + admin badge + logout button)
- Stats: total immutable audit events count, admin session status, security mode label, traceability label
- Action buttons: Verify Creator (dialog: creator UUID input + reason input + Confirm & Write Audit Event) and Suspend User (dialog: user UUID input + suspension reason + Confirm Suspension button)
- Full audit log table: event action, target type, target ID, actor email, metadata JSON, timestamp

### Global Layout & Navigation
- AppShell wrapper for all authenticated routes
- Desktop: fixed 256px left sidebar with Logo, role label, nav links with animated active indicator, user avatar panel at bottom with name, email, sign-out button
- Desktop top bar: ThemeToggle (dark/light) + NotificationsBell
- Mobile: fixed top bar (logo, theme toggle, notifications, logout) + fixed bottom tab navigation bar
- PWA install prompt component (mobile)
- Framer Motion page transitions on route changes
- Sonner toast notifications for all state-change events
- Skeleton / loading states on all data-fetched pages
- Empty states on all zero-data scenarios

### Payment State Machine
Seven possible states tracked in real-time:
1. `unpaid` — deliverable not yet approved
2. `payment_initiated` — brand approved, payout triggered to provider
3. `payment_confirmed` — provider confirmed receipt
4. `creator_payout_pending` — funds in transit to creator bank
5. `paid` — creator received funds
6. `failed` — payment failed, manual retry required
7. `retry` — system retrying after failure

Frontend polls payments endpoint every 4 seconds and re-renders status badge automatically.

---

## Features — Nice to Have (V2+)

- Creator discovery with advanced server-side filters: min followers, language, platform, location
- Organization/brand team management (multiple brand members under one org)
- Campaign analytics: view count, engagement rate, reach estimates per deliverable
- Ingestion engine integration: sync creator social stats automatically from platform APIs
- Creator portfolio section: upload past campaign examples with images/videos
- In-platform messaging (campaign-scoped threaded chat, real-time)
- Meeting scheduler / kick-off call booking within campaign detail
- Campaign brief templates (reuse previous briefs as starting points)
- PDF contract generation per accepted creator
- Multi-currency invoicing (USD, GHS, KES)
- Stripe payment rail support (international brands)
- AI-powered creator matching (suggest best-fit creators based on campaign brief keywords)
- Creator reputation scoring algorithm combining internal data (completion rate, revision rate, repeat hires) with external signals (social follower counts)
- Mobile app (React Native) wrapping the existing PWA logic
- Email + push notifications

---

## Explicitly Out of Scope for V1

- Real-time WebSocket chat (activity feed is polled, not live)
- Social media platform API integration (OAuth or data sync with Instagram, TikTok, YouTube)
- AI or ML-based creator recommendations or scoring
- Escrow held by Yard itself (payments flow through Paystack/Flutterwave directly)
- PDF contract generation
- Native mobile app (iOS/Android store submission)
- Marketing website / landing page
- Creator search by follower count (requires scraping engine, not built in V1)
- Multi-org / team accounts for brands (single owner per org in V1)
- Content scheduling or calendar integration

---

## User Stories

### Brand User Stories
- As a brand, I want to sign up and immediately choose my workspace type (Brand) so that I am routed to the correct dashboard.
- As a brand, I want to create a campaign brief with a title, creative requirements, budget per creator, number of slots, deliverable format, and deadline so that creators know exactly what I need.
- As a brand, I want to save my campaign as a draft before publishing so that I can review and edit it before creators see it.
- As a brand, I want to publish my draft campaign so that it becomes visible to eligible creators who can apply.
- As a brand, I want to see all creator applications for my campaign — including their name, pitch, and application date — so that I can evaluate who to accept.
- As a brand, I want to accept or reject individual creator applications so that I control who works on my campaign.
- As a brand, I want to view a submitted deliverable (video link) and either approve it or request a revision with written notes so that I control final content quality.
- As a brand, I want payment to be automatically disbursed to the creator upon my approval so that I don't have to manually initiate bank transfers.
- As a brand, I want to see the real-time payment status (pending, in transit, paid) for every deliverable I've approved so that I have financial transparency.
- As a brand, I want to cancel a campaign if plans change so that no further creator applications are accepted.
- As a brand, I want to search and browse creator profiles filtered by niche/category so that I can proactively discover and invite relevant creators.
- As a brand, I want to post comments on a campaign's activity timeline so that I can communicate updates to all involved creators.
- As a brand, I want a dashboard overview of my active campaigns, pending applications, total budget allocated, and engaged creator count so that I always know my campaign health at a glance.

### Creator User Stories
- As a creator, I want to sign up with my name, email, phone, country, city, primary platform, and niche category so that my profile is discoverable by brands.
- As a creator, I want to browse all open brand campaigns with their brief, budget, format, and location so that I can find briefs that match my content style.
- As a creator, I want to apply to a campaign by writing a custom pitch so that the brand understands my creative angle.
- As a creator, I want to see the status of all my applications (pending, accepted, rejected) so that I know where I stand with each brand.
- As a creator, I want to submit my deliverable by pasting a media URL (Google Drive link) and adding notes so that the brand can review my content.
- As a creator, I want to see the brand's revision notes when they request changes so that I know exactly what to fix in my resubmission.
- As a creator, I want to see my payout amount, transfer status, and payment history so that I have full financial visibility.
- As a creator, I want to update my NUBAN bank account details so that payouts are sent to the correct account.
- As a creator, I want to update my profile bio, display name, rate per reel, and social handles so that my profile accurately reflects my current positioning.
- As a creator, I want an onboarding checklist on my dashboard showing what's incomplete so that I know exactly what to do next to maximize my discoverability.
- As a creator, I want to see my reputation stats (campaigns completed, revisions requested, tier) so that I can understand my standing on the platform.

### Admin / Founder User Stories
- As a founder, I want to see a full immutable audit log of every significant action on the platform so that I can investigate disputes and monitor system integrity.
- As a founder, I want to verify a creator profile by entering their UUID and a justification reason so that verified creators appear as trusted to brands.
- As a founder, I want to suspend a user account by entering their UUID and a suspension reason so that bad actors are removed from the platform.

---

## Success Metrics

**Transaction Metrics (Core Business)**
- 1 complete campaign cycle (brief → application → acceptance → deliverable → approval → payout) in first 30 days
- 10 complete campaign cycles in first 90 days
- 100 creator accounts created in first 90 days
- 20 brand accounts created in first 90 days

**Engagement Metrics**
- Creator onboarding checklist completion rate > 60%
- Application-to-acceptance rate > 25%
- Deliverable first-submission approval rate > 50%

**Financial Metrics**
- Total campaign budget transacted: ₦5,000,000 within 90 days
- Payment failure rate < 5%
- Average time from deliverable approval to creator bank receipt < 24 hours

**Quality Metrics**
- Zero manual bank transfers initiated by the founding team (payments fully automated)
- Zero state changes that bypass the server (no client-side state mutations without API confirmation)
