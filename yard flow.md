I think you're now asking the right question.

You're no longer asking, "What features do we build?"

You're asking, **"What is the smallest system that proves Yard deserves to exist, without preventing us from building the larger vision?"**

That's the right way to think.

The mistake I think many founders make is building the future on day one. The opposite mistake is building an MVP that's so simplistic it has to be rewritten from scratch. What you want is an MVP that is **architecturally extensible** but **functionally minimal**.

The three engines you mentioned are actually interesting, but I wouldn't build any of them first.

* Analytics engine.  
* Scraping engine.  
* Reputation/Scoring engine.

These are **competitive moats**, not **MVP requirements**.

An MVP exists to answer one question:

> **Will a brand pay to run a creator campaign through Yard instead of their current process?**

If the answer is no, none of the engines matter.

---

### **I would think of Yard in layers.**

The first layer isn't technology.

It's the **market transaction**.

Can a brand successfully hire a creator through Yard?

That's the business.

Everything else exists to improve that transaction.

So I'd draw the system like this:

Campaign Marketplace  
│  
├── Campaigns  
├── Creators  
├── Brands  
├── Deliverables  
├── Payments  
└── Support

Everything else hangs off this.

---

Then the second layer is intelligence.

Analytics  
Recommendations  
Reputation  
Fraud Detection  
Insights

Notice these don't create transactions.

They improve transactions.

---

Then the third layer is automation.

Scrapers  
API Sync  
AI Matching  
Auto Verification  
Auto Analytics

Again, they reduce manual work.

They are not the business.

---

This leads to what I think your V1 should actually prove.

Imagine a single campaign.

A skincare company joins Yard.

They post:

> Need five beauty creators.

Creators apply.

Brand chooses five.

Creators upload videos.

Brand approves.

Payment is released.

Campaign ends.

That single successful loop is your MVP.

If you can repeat that 100 times, you've built something valuable.

---

Now let's talk about your scraping idea.

I would actually delay it.

Not because it's a bad idea.

Because scraping is expensive to maintain.

Instagram changes its frontend.

TikTok changes selectors.

Rate limits.

CAPTCHAs.

Legal questions.

Everything breaks.

If you only have 300 creators...

I'd rather ask creators to connect their accounts where APIs exist, or even submit profile links initially.

Could some analytics be manual at first?

Absolutely.

That's acceptable in an MVP.

The user doesn't care whether a human or an algorithm calculated something, as long as the output is useful.

---

The reputation algorithm is another example.

I don't think you need a sophisticated algorithm.

You need a **credible reputation system**.

Those are different.

Your first version could simply record:

* Campaigns completed.  
* On-time delivery rate.  
* Revision rate.  
* Brand rating.  
* Payment disputes.  
* Repeat hires.

Those are already valuable signals.

Later, your machine learning or scoring algorithm can sit on top of that history.

If you build the algorithm first, you'll have no data.

---

One thing you said caught my attention:

> "We are going to determine if someone can be loyal by looking at analytics."

I'd be very careful with that assumption.

Analytics can tell you things like:

* audience growth,  
* engagement,  
* posting consistency,  
* content categories.

They generally cannot reliably infer whether someone will honor a contract or be "loyal." Those behaviors are much better predicted by platform-specific history: missed deadlines, completed jobs, repeat clients, dispute frequency, responsiveness. I would avoid designing the system around claims that your data cannot support.

---

Here's the MVP I would build.

### **Core Objects**

Six core objects:

* Brand  
* Creator  
* Campaign  
* Application  
* Deliverable  
* Payment

If those six objects exist, Yard exists.

Everything else references one of them.

---

### **Core Workflow**

One campaign.

Brand creates campaign.

↓

Creators apply (or are invited).

↓

Brand selects creators.

↓

Creators deliver content.

↓

Brand approves or requests revisions.

↓

Payment is released.

↓

Campaign closes.

That is the entire product.

---

### **Everything else becomes a module.**

Instead of baking features into the core, attach them.

Campaign  
│  
├── Messaging  
├── Contracts  
├── Calendar  
├── Analytics  
├── AI Matching  
├── Escrow  
├── Reputation  
├── Reporting  
└── Notifications

Each module can evolve independently.

That is the "Frankenstein" idea you're describing, but I'd call it a **modular architecture**. The campaign remains the stable core, while intelligence and integrations are replaceable components.

I think your biggest architectural decision should be this:

> **The campaign is the source of truth.**

Every action—applications, messages, files, approvals, payments, ratings, analytics—should belong to a campaign. If you make the campaign your central aggregate, you can add scraping, AI scoring, payment providers, or analytics engines years later without changing the fundamental structure of the system. That is the kind of architecture that tends to survive product evolution rather than forcing a complete rewrite.

Understood. I'll optimize for a different role.

Going forward, I'll approach this as if I'm a senior engineer/product architect reviewing a system design with you. That means:

\* I'll decompose problems into first principles.  
\* I'll identify assumptions, constraints, risks, and tradeoffs.  
\* I'll point out where reasoning is weak or unsupported.  
\* I'll propose alternative architectures or strategies.  
\* I'll distinguish facts from hypotheses.  
\* I'll avoid trying to reassure or persuade you emotionally.

Now, let's apply that to Yard.

\---

\#\# Current Objective

You're trying to answer:

\> \*\*What is the minimum architecture that can evolve into the long-term vision without requiring a rewrite?\*\*

This is not an MVP feature question. It's an architectural boundary question.

\---

\#\# Long-term vision (based on everything we've discussed)

Yard eventually becomes an infrastructure layer for creator commerce in Africa.

Potential capabilities include:

\* Creator discovery  
\* Campaign management  
\* Reputation  
\* Payments  
\* Analytics  
\* AI matching  
\* Creator identity  
\* Reporting  
\* Fraud detection  
\* Cross-platform analytics  
\* Recommendation engine

These are \*\*capabilities\*\*, not the core domain.

\---

\#\# First Principle

A useful question is:

\> \*\*If every advanced feature disappeared tomorrow, what must still exist for Yard to function?\*\*

The answer defines the core domain.

Current candidate:

\`\`\`  
Brand  
Creator  
Campaign  
Deliverable  
Approval  
Payment  
\`\`\`

Everything else appears to be an extension.

\---

\#\# Domain Model

Instead of thinking about pages or APIs, define the business entities.

For example:

\`\`\`  
Brand

Creator

Campaign

Application

Deliverable

Revision

Approval

Payment

Conversation

Attachment

Notification  
\`\`\`

Now ask:

\> Which of these cannot be removed?

If removing an entity means Yard no longer works, it's part of the core.

\---

\#\# Proposed Layering

Rather than feature-first, I'd organize the system by dependency.

\`\`\`  
Layer 1  
Core Business Domain

Layer 2  
Business Workflows

Layer 3  
Supporting Services

Layer 4  
Intelligence

Layer 5  
External Integrations  
\`\`\`

That gives something like:

\`\`\`  
Core  
├── Brand  
├── Creator  
├── Campaign  
├── Deliverable  
└── Payment

Workflow  
├── Discovery  
├── Review  
├── Approval  
└── Payout

Services  
├── Notifications  
├── File Storage  
├── Messaging  
└── Audit Logs

Intelligence  
├── Reputation  
├── Recommendations  
├── Analytics  
└── Fraud Detection

Integrations  
├── Instagram  
├── TikTok  
├── YouTube  
├── Payment Providers  
└── Email  
\`\`\`

Notice that every upper layer depends on the lower layers—not the other way around.

\---

\#\# Scraping Engine

Current assumption:

\> "We'll need a robust scraping engine."

This should be treated as a hypothesis, not a requirement.

Questions to answer first:

\* Which data is unavailable through official APIs?  
\* Which data is essential for the MVP?  
\* Which platforms explicitly prohibit scraping?  
\* What is the maintenance cost when platforms change their frontend?

Only after answering those should scraping become a core investment.

\---

\#\# Analytics Engine

Current assumption:

\> "We'll build our own algorithm."

Break that down.

Algorithms require:

\`\`\`  
Raw Data  
↓

Normalization

↓

Feature Extraction

↓

Scoring

↓

Decision  
\`\`\`

Before discussing algorithms, define the inputs.

Example:

Instagram

\`\`\`  
Followers

Engagement

Posting Frequency

Reach

Comments

Audience Geography  
\`\`\`

Then ask:

Which of these are available?

Which are reliable?

Which can legally be collected?

\---

\#\# Reputation

Current hypothesis:

\> Reputation should be generated from analytics.

Alternative hypothesis:

\`\`\`  
External Reputation

\+

Internal Reputation

\=

Yard Reputation  
\`\`\`

External

\* Social metrics  
\* Audience  
\* Growth

Internal

\* Completed campaigns  
\* Response time  
\* Delivery rate  
\* Disputes  
\* Repeat hires

This separation allows the reputation system to evolve independently.

\---

\#\# Architectural Principle

One thing I'd enforce early:

No feature should own business data.

Example:

Bad

\`\`\`  
Analytics stores creator score.  
\`\`\`

Better

\`\`\`  
Creator exists.

Analytics reads Creator.

Analytics computes Score.

Creator references latest Score.  
\`\`\`

The business entity remains the source of truth.

\---

\#\# What I'd Work On Next

I would stop discussing features temporarily.

Instead, define the bounded contexts.

Possible contexts:

\`\`\`  
Identity

Campaigns

Discovery

Payments

Reputation

Analytics

Communication

Administration  
\`\`\`

Then ask:

\* What data does each context own?  
\* What events does it publish?  
\* What events does it consume?

That exercise usually reveals whether the architecture will remain modular as the product grows.

I think this is the level of discussion that will produce a durable system design. Rather than deciding "what feature comes next," we identify the stable business concepts first, then let features emerge from those concepts.

Good. I think we're now at the point where we should stop inventing features and start defining constraints. Good architecture is mostly the result of good constraints.

I would divide the discovery into six areas. I don't need all the answers immediately, but these are the questions that determine the MVP.

---

## **1\. Customer & Workflow (highest priority)**

This determines whether we're building the right product.

Walk me through one real campaign from beginning to end.

Not an ideal one—a real one that Gideon is managing manually today.

For example:

* How does a brand first contact him?  
* What information does he collect?  
* How does he find creators?  
* How many creators are usually shortlisted?  
* How are creators contacted?  
* How are deliverables submitted? (WhatsApp, Drive, Email?)  
* How are revisions handled?  
* How is approval communicated?  
* How is payment made?  
* What is the last thing that happens before everyone considers the campaign "finished"?

I want the exact operational workflow.

---

## **2\. Marketplace Model**

This changes the entire architecture.

How are creators matched?

Possible models:

**A. Open marketplace**

Brand posts campaign.

Creators apply.

---

**B. Invite only**

Brand searches creators.

Brand sends invitations.

---

**C. Hybrid**

Brand posts.

Creators apply.

Brand also invites creators.

I suspect this is the right model, but I want to confirm.

---

## **3\. Payment Model**

You already mentioned not holding escrow yourselves.

I want to understand the flow.

For example:

Brand deposits money where?

↓

Who confirms funds?

↓

When does work start?

↓

Who authorizes release?

↓

Who actually transfers money?

↓

What happens if approval never comes?

This affects the payment domain.

---

## **4\. Creator Profile**

What information makes a creator useful?

Forget analytics.

Imagine a brand opening a profile.

What should they immediately know?

Examples:

* Platforms  
* Audience size  
* Niches  
* Languages  
* Country  
* Rates  
* Previous campaigns  
* Portfolio  
* Response rate  
* Completion rate

We should define the canonical creator profile before thinking about scoring.

---

## **5\. Campaign Object**

This is probably the most important object in the system.

What does a campaign contain?

Off the top of my head:

Campaign  
├── Brand  
├── Budget  
├── Currency  
├── Objective  
├── Deliverables  
├── Timeline  
├── Status  
├── Selected Creators  
├── Files  
├── Messages  
├── Payments  
└── Analytics

I want us to verify every field.

---

## **6\. Resources & Constraints**

This determines what is realistic.

I'd like to know:

### **Team**

Who is actually building the MVP?

Only you?

Anyone else writing production code?

---

### **Design**

Will there be Figma?

Or code-first UI?

---

### **Infrastructure**

What stack are you planning?

For example:

Frontend:  
React / Next.js?

Backend:  
Go?  
Node?  
Python?

Database:  
Postgres?

Authentication:  
Clerk?  
Supabase?  
Auth.js?

Storage:  
S3?  
Cloudinary?

Payments:  
Flutterwave?  
Paystack?  
Stripe?

Deployment:  
Vercel?  
Railway?  
Hetzner?  
AWS?

NoSQL?  
SQL?

---

### **Time**

Realistically,

How many engineering hours can you commit every week?

Not optimistic.

Actual.

---

### **Money**

Current budget?

Can you pay for APIs?

Can you pay for hosting?

Can you pay for managed services?

Or should everything initially stay within free tiers?

---

## **Something I'd like us to define early**

I want to identify the **system of record**.

Every mature SaaS has one.

Examples:

GitHub

System of record \= Repository

Not pull requests.

---

Stripe

System of record \= Payment Intent

---

Linear

System of record \= Issue

---

For Yard, I currently think it's the **Campaign**.

Everything hangs off it.

Campaign  
│  
├── Applications  
├── Creator Selection  
├── Messages  
├── Files  
├── Deliverables  
├── Reviews  
├── Payments  
├── Ratings  
└── Audit Logs

If that's true, then almost every service becomes "campaign-centric," which is a strong architectural property because it minimizes cross-domain coupling.

I'd like to verify that before we design anything else. If we discover another object is actually the center of the business, it will change how we model the entire system.

This changes my understanding of Yard significantly.

The product I had in mind was closer to an influencer management platform like Aspire or GRIN. What you've described is closer to a managed creator marketplace for SMEs. That distinction matters because it changes what the core product should optimize.

The most important observation is that \*\*brands are not buying creators\*\*. They are buying outcomes—attention, views, and content that performs. Creators are simply the supply side that delivers those outcomes. That means the primary customer is the SME, not the creator.

Another important observation is that Gideon is currently acting as the "operating system." He isn't just introducing people. He's performing several business functions manually:

\* Customer acquisition.  
\* Campaign qualification.  
\* Creator sourcing.  
\* Trust filtering.  
\* Creator matching.  
\* Relationship management.  
\* Taking a commission.

If Yard disappeared today, Gideon could continue operating with WhatsApp. That means the current business is a \*\*service\*\*, not yet a software product.

That isn't a problem. In fact, many successful marketplaces start this way. But it means the MVP should automate Gideon before trying to replace him.

\---

Here's what I now think the central object is.

I previously suggested the Campaign. After hearing the workflow, I think the Campaign is still the center, but it should be thought of differently.

Instead of

\`\`\`  
Brand  
↓

Creator  
↓

Payment  
\`\`\`

the flow is actually

\`\`\`  
Need

↓

Campaign

↓

Creator Matching

↓

Content

↓

Publication

↓

Outcome

↓

Payment  
\`\`\`

Notice that "video" is not actually the deliverable.

The deliverable is \*\*a published creator post\*\*.

That is an important distinction.

\---

Something else became obvious.

There are actually two completely different products hiding inside Yard.

Product One:

Marketplace

"I need creators."

Product Two:

Campaign Operations

"I'm already running a creator campaign."

Most startups try to build both immediately.

I would not.

\---

If I were modeling the business today, I'd separate them.

\`\`\`  
Discovery

↓

Campaign

↓

Execution

↓

Measurement

↓

Payment  
\`\`\`

Every future feature belongs to one of these five.

Not thirty features.

Five domains.

\---

Another thing I noticed is that revisions are probably not a core concept yet.

Why?

Because revisions are simply one state transition.

\`\`\`  
Submitted

↓

Needs Changes

↓

Submitted

↓

Approved  
\`\`\`

Instead of building a "revision engine," build a generic workflow engine where a deliverable changes state.

That becomes reusable forever.

\---

The same applies to messaging.

Don't build "chat."

Build "activity."

\`\`\`  
Campaign Timeline

09:00 Creator invited

09:30 Creator accepted

10:00 Brief updated

14:00 Draft uploaded

15:20 Feedback requested

17:00 Approved

17:15 Payment initiated  
\`\`\`

Comments become events attached to the timeline.

Files become events.

Status changes become events.

Payments become events.

That gives you one chronological record instead of several disconnected systems.

\---

Here's the biggest product insight from your explanation.

The SME doesn't actually care about "finding creators."

They care about this:

\> "I need five videos about my product by Friday."

Finding creators is just one step.

That suggests Yard should eventually feel less like LinkedIn and more like placing an order.

\---

One thing I'd challenge is the emphasis on analytics and scoring as an early investment.

From the workflow you described, Gideon is matching creators based on experience and intuition, not algorithms.

That means your current competitive advantage isn't analytics.

It's judgment.

The software should first capture Gideon's judgment before trying to replace it.

For example, instead of a complex reputation algorithm, start with structured metadata:

\* Beauty  
\* Food  
\* Tech  
\* Comedy  
\* Speaks Yoruba  
\* Speaks Hausa  
\* Fast turnaround  
\* Good with product demos  
\* Reliable  
\* Repeat hire by three brands

Those attributes will likely outperform a sophisticated scoring algorithm in the early stages because they're directly useful for matching.

\---

The next area I'd investigate isn't engineering—it's the economics.

Specifically:

\* What is the average campaign value?  
\* What percentage does Yard earn?  
\* How many creators are typically involved per campaign?  
\* How often does an SME return to run another campaign?  
\* What is the average creator payout?  
\* What is the biggest operational bottleneck today—finding creators, coordinating them, approvals, or collecting payments?

Those answers will tell us where software creates the most leverage. The MVP should automate the largest bottleneck, not necessarily the most technically interesting part. That's how we keep the first version small while leaving room for the layered architecture we've already started defining.

I think we should stop thinking about "what backend do we use?" and instead define the \*\*engineering platform\*\*. Every decision should make the MVP faster while leaving a clean migration path.

For Yard, I would not optimize for "perfect architecture." I would optimize for "replaceable architecture."

This is the stack I would start with.

| Layer             | Choice                                                           | Why                                            |  
| \----------------- | \---------------------------------------------------------------- | \---------------------------------------------- |  
| Frontend          | Next.js                                                          | Good ecosystem, deploys easily, SSR if needed. |  
| Backend           | Node.js \+ NestJS (or Express/Fastify if you want less structure) | Fits your current learning path.               |  
| Database          | PostgreSQL                                                       | The business is highly relational.             |  
| ORM               | Prisma                                                           | Fast iteration with AI-assisted development.   |  
| Authentication    | Better Auth/Auth.js or Clerk                                     | Don't build auth yourself.                     |  
| Storage           | Cloudinary initially                                             | Don't store media yourself.                    |  
| Email             | Resend                                                           | Very easy integration.                         |  
| Payments          | Flutterwave first                                                | Local market fit.                              |  
| Queue             | Upstash Redis later                                              | Only when background jobs appear.              |  
| Monitoring        | Sentry                                                           | Add from day one.                              |  
| Product Analytics | PostHog                                                          | Add from day one.                              |

\---

One thing I would change from your plan is Render.

Render is fine for development, but its free tier has two limitations that matter:

\* Free web services spin down after inactivity, so users experience cold starts.  
\* The free PostgreSQL database expires after 30 days unless upgraded. (\[Render\]\[1\])

I would \*\*not\*\* use Render's free Postgres for Yard because you don't want your development database disappearing after a month.

Instead I'd separate compute from data.

\`\`\`text  
Next.js  
        │  
        ▼  
Render

        │  
        ▼

Supabase PostgreSQL

        │  
        ▼

Cloudinary  
\`\`\`

Supabase's free tier gives you a managed PostgreSQL database, authentication if you choose to use it, and storage, though free projects pause after inactivity and have quota limits. (\[Supabase\]\[2\])

\---

The biggest engineering decision I think you should make before writing any code is your repository structure.

I wouldn't organize by controllers.

I wouldn't organize by APIs.

I'd organize by business domains.

Something like:

\`\`\`text  
src/

identity/

brands/

creators/

campaigns/

applications/

deliverables/

payments/

analytics/

notifications/

shared/  
\`\`\`

Every folder owns:

\* controllers  
\* services  
\* DTOs  
\* database models  
\* validation  
\* tests

That means when Reputation becomes an engine later, it simply becomes another domain.

\---

I also think we should define what \*\*doesn't exist\*\* in MVP v1.

For example:

❌ No recommendation engine

❌ No scraping engine

❌ No creator score

❌ No AI matching

❌ No fraud detection

❌ No automated campaign optimization

Those become empty modules later, not half-built systems today.

\---

The database is another place where I'd make one important rule.

Every table should answer one question.

Instead of:

\`\`\`  
creator\_scores  
\`\`\`

Ask:

"What generated this score?"

If multiple systems can generate scores later, make it:

\`\`\`  
score\_runs

score\_rules

creator\_metrics

creator\_snapshots  
\`\`\`

This prevents repainting the schema when the analytics engine arrives.

\---

One thing I would begin immediately—even before coding—is writing the event list.

Not code.

Events.

For example:

\`\`\`text  
CampaignCreated

CreatorInvited

CreatorAccepted

DeliverableSubmitted

RevisionRequested

DeliverableApproved

PaymentInitiated

PaymentCompleted

CampaignCompleted  
\`\`\`

Those events become:

\* audit logs  
\* notifications  
\* activity timeline  
\* analytics  
\* webhooks

You write them once, and four different systems consume them.

\---

Finally, I'd create a "Decision Log." Every architectural decision should have a one-line rationale.

For example:

| Decision                | Reason                                                 |  
| \----------------------- | \------------------------------------------------------ |  
| PostgreSQL              | Campaign data is relational.                           |  
| Cloudinary              | Don't own media storage.                               |  
| Flutterwave             | Nigerian payouts first.                                |  
| Prisma                  | Faster iteration.                                      |  
| Event-based activity    | One source for notifications, timeline, and auditing.  |  
| Campaign-centric domain | Everything in Yard revolves around campaign execution. |

Over time this becomes as valuable as the codebase itself, because it records \*why\* the system was designed the way it was. That makes future changes much easier to evaluate instead of relying on memory or intuition.

\[1\]: https://render-www.onrender.com/docs/free?utm\_source=chatgpt.com "Deploy for Free – Render Docs"  
\[2\]: https://supabase.com/pricing?utm\_source=chatgpt.com "Pricing & Fees | Supabase"

I think we should separate the infrastructure into three categories:

1\. \*\*Core infrastructure\*\* (must exist on day one)  
2\. \*\*Operational infrastructure\*\* (added when needed)  
3\. \*\*Intelligence infrastructure\*\* (future)

That way we don't overbuild.

\#\# Phase 1 — Core Infrastructure (MVP)

This is what I'd actually deploy.

| Component         | Choice              | Reason                                  |  
| \----------------- | \------------------- | \--------------------------------------- |  
| Frontend          | Vercel              | Excellent for Next.js.                  |  
| Backend API       | Render              | Simple Git deployment for Node.js APIs. |  
| Database          | Supabase PostgreSQL | Best free PostgreSQL option.            |  
| Object Storage    | Cloudinary          | Don't store videos yourself.            |  
| Email             | Resend              | Very easy integration.                  |  
| Monitoring        | Sentry              | Catch production errors immediately.    |  
| Product Analytics | PostHog             | Understand user behavior.               |

Render is still a good choice for the API because it supports long-running Node.js services, background workers, and cron jobs as the project grows. The main drawback is that free services sleep after inactivity and free databases are temporary, which is why I'd keep the database on Supabase instead. (\[Render\]\[1\])

\---

\# Phase 2 — Operational Infrastructure

These solve operational problems.

\#\# Background Jobs

Eventually you'll need things like:

\* sending emails  
\* syncing creator analytics  
\* cleaning old data  
\* retrying failed payments

Don't run these inside HTTP requests.

Use a queue.

Good options:

\* Upstash Redis  
\* BullMQ  
\* Trigger.dev

I would not add them until background processing actually becomes necessary.

\---

\#\# Cron Jobs

You'll eventually have jobs like:

Every hour

\`\`\`  
Sync Instagram data  
\`\`\`

Every night

\`\`\`  
Generate creator statistics  
\`\`\`

Every morning

\`\`\`  
Send reminder emails  
\`\`\`

Render supports cron jobs, and Cloudflare Workers with Cron Triggers are also strong free options for lightweight scheduled tasks. (\[Render\]\[2\])

\---

\# Phase 3 — Intelligence Infrastructure

This is where your long-term vision lives.

Instead of building one huge "analytics engine," I'd split it.

\`\`\`text  
Analytics

├── Collectors  
├── Normalizers  
├── Metrics  
├── Reputation  
├── Recommendation  
└── Reports  
\`\`\`

Notice each one can evolve independently.

\---

\# Scraping

I actually want to challenge one assumption.

You said:

\> "Scraping is one thing we cannot run away from."

I don't think that's completely true.

Instead, define three data sources.

\`\`\`text  
Official APIs

↓

User Connected Accounts

↓

Scraping  
\`\`\`

Always use the highest-quality source available.

For example:

Instagram Graph API (when possible)

↓

Creator uploads report

↓

Scraper

Scraping should be the last option because:

\* it breaks frequently,  
\* platform HTML changes,  
\* rate limits increase,  
\* legal and policy risks are higher.

That doesn't mean you won't scrape—it means scraping becomes one connector, not the foundation of the platform.

\---

\# File Storage

Never store creator videos on your backend.

\`\`\`text  
Creator

↓

Cloudinary

↓

URL

↓

Database stores only metadata  
\`\`\`

The database should know \*about\* the file, not \*contain\* the file.

\---

\# Observability

One thing many startups forget:

You need to know why something failed.

I'd add these before launch.

\`\`\`  
Sentry  
\`\`\`

Errors.

\`\`\`  
PostHog  
\`\`\`

User behaviour.

\`\`\`  
Structured Logs  
\`\`\`

Every request.

These three together solve most production debugging.

\---

\# Infrastructure I'd Avoid

For the first MVP, I would deliberately avoid:

\* Kubernetes  
\* Docker Swarm  
\* Kafka  
\* Elasticsearch  
\* RabbitMQ  
\* Microservices  
\* Self-hosted Redis  
\* Self-hosted PostgreSQL

They add operational complexity without solving a problem you have today.

\---

\#\# The Architecture I'd Aim For

\`\`\`text  
Users  
    │  
    ▼  
Next.js (Vercel)  
    │  
    ▼  
Node.js API (Render)  
    │  
    ├──────────────► Supabase (PostgreSQL)  
    │  
    ├──────────────► Cloudinary (Media)  
    │  
    ├──────────────► Flutterwave (Payments)  
    │  
    ├──────────────► Resend (Emails)  
    │  
    ├──────────────► PostHog (Product Analytics)  
    │  
    └──────────────► Sentry (Error Monitoring)  
\`\`\`

This gives you a production-grade foundation with minimal operational overhead. As Yard grows, you can add queues, scheduled jobs, analytics pipelines, and scraping services without replacing the core architecture—the API remains the orchestrator while specialized components are added around it.

\[1\]: https://render-www.onrender.com/docs/free?utm\_source=chatgpt.com "Deploy for Free – Render Docs"  
\[2\]: https://render.com/docs/render-vs-vercel-comparison?utm\_source=chatgpt.com "Render vs Vercel – Render Docs"

Yes. That gives us a much cleaner engineering target.

Don't define the MVP as "the features Yard has." Define it as:

\> \*\*Yard must reliably support 100 brands and 300 creators executing real campaigns and payments without you manually operating every transaction.\*\*

That is a capacity-and-workflow target, not a feature checklist.

I would therefore design the first production version around the smallest complete transaction loop:

\`\`\`text  
Brand  
  ↓  
Create campaign  
  ↓  
Find / invite creators  
  ↓  
Creator accepts  
  ↓  
Campaign executes  
  ↓  
Creator submits deliverable  
  ↓  
Brand reviews  
  ↓  
Approve / request revision  
  ↓  
Payment initiated  
  ↓  
Payment completed  
  ↓  
Campaign closed  
\`\`\`

Everything necessary to make that loop reliable belongs in V1. Everything outside it is questionable.

For 100 brands and 300 creators, I would define the core entities as:

\`\`\`text  
User  
├── Brand Profile  
└── Creator Profile

Campaign  
├── Applications / Invitations  
├── Selected Creators  
├── Deliverables  
├── Revisions  
├── Messages  
├── Payments  
└── Activity / Audit Log  
\`\`\`

The important thing is that \*\*one creator can participate in many campaigns, and one brand can run many campaigns\*\*. Do not model the relationship as a direct Brand → Creator relationship. The Campaign is the transaction boundary.

For example:

\`\`\`text  
Brand A  
   │  
   ├── Campaign 1 ── Creator 4  
   ├── Campaign 2 ── Creator 7  
   └── Campaign 3 ── Creator 4  
\`\`\`

That structure will matter later when you introduce creator history, repeat campaigns, reputation, analytics, and recommendations.

\#\#\# What the 100 brands actually need

They don't need the entire Yard vision.

They need to be able to:

\`\`\`text  
Sign up  
   ↓  
Create workspace  
   ↓  
Create campaign  
   ↓  
Describe what they want  
   ↓  
Set budget  
   ↓  
Set creator requirements  
   ↓  
See suitable creators  
   ↓  
Invite / select creators  
   ↓  
Manage campaign  
   ↓  
Review submissions  
   ↓  
Approve / request changes  
   ↓  
Pay  
   ↓  
See campaign history  
\`\`\`

There should also be basic account management, notifications, and an auditable campaign history.

You don't need sophisticated AI matching yet. A filter system is enough.

Something like:

\`\`\`text  
Category  
Location  
Platform  
Audience size  
Language  
Rate  
Availability  
\`\`\`

That can eventually become:

\`\`\`text  
Discovery Engine  
        ↓  
Matching Engine  
        ↓  
Recommendation Engine  
\`\`\`

without changing the underlying Creator entity.

\#\#\# What the 300 creators need

Creators have a much smaller workflow:

\`\`\`text  
Sign up  
   ↓  
Create profile  
   ↓  
Add social accounts  
   ↓  
Add portfolio  
   ↓  
Set categories / location  
   ↓  
Discover campaigns  
   ↓  
Apply  
   ↓  
Accept campaign  
   ↓  
Submit deliverable  
   ↓  
Receive feedback  
   ↓  
Resubmit if necessary  
   ↓  
Get paid  
   ↓  
See campaign/payment history  
\`\`\`

The creator profile should therefore be treated as persistent infrastructure.

Don't make the creator enter the same information every time they apply.

\#\#\# The thing I would absolutely not build yet

I would not build your sophisticated creator-scoring system for this version.

You can create the data structures necessary for it without implementing the intelligence.

For example:

\`\`\`text  
Creator  
   │  
   ├── Social Accounts  
   ├── Social Metrics  
   ├── Campaign History  
   ├── Deliverable History  
   ├── Payment History  
   └── Reputation Data  
\`\`\`

Then later:

\`\`\`text  
Analytics Engine  
       ↓  
Metrics  
       ↓  
Scoring Engine  
       ↓  
YardScore  
\`\`\`

The architecture is ready for it, but the MVP doesn't depend on it.

\#\#\# The 100 × 300 problem

There is an important distinction here.

\*\*100 brands \+ 300 creators does not mean 30,000 simultaneous users.\*\*

Your real engineering capacity question is:

\> How many concurrent campaigns, submissions, files, API requests, and payment events do we expect?

For example, suppose eventually:

\`\`\`text  
100 brands  
300 creators

20 active campaigns  
5 creators per campaign  
100 creator submissions/week  
\`\`\`

That's not a particularly demanding workload for a normal Node.js \+ PostgreSQL architecture.

Even substantially higher traffic can be handled by that architecture if you keep the application stateless and move heavy work into background jobs.

The difficult part isn't raw CPU capacity.

The difficult parts are:

\*\*Payments.\*\*

A payment must be idempotent. You cannot accidentally pay a creator twice because a webhook was delivered twice.

\*\*Files.\*\*

Video uploads shouldn't pass through your Render server. Upload directly to your storage provider and store metadata/URLs in PostgreSQL.

\*\*Background processing.\*\*

Analytics synchronization, email, notifications, scraping, and similar operations shouldn't block API requests.

\*\*Database consistency.\*\*

Campaign state and payment state need proper transactions and constraints.

\*\*Auditability.\*\*

You need to know who changed what and when.

That matters much more than whether Render can handle 300 creators.

\#\#\# Therefore, I would set your V1 architecture around these bounded components

\`\`\`text  
YARD V1

Identity  
│  
├── Authentication  
├── Users  
└── Roles

Organizations  
│  
├── Brands  
└── Team Members

Creators  
│  
├── Profiles  
├── Social Accounts  
├── Portfolio  
└── Metrics

Campaigns  
│  
├── Brief  
├── Applications  
├── Invitations  
├── Participants  
└── Status

Deliverables  
│  
├── Submission  
├── Files  
├── Review  
└── Revisions

Payments  
│  
├── Payment Request  
├── Provider Transaction  
├── Payout  
└── Payment Status

Communication  
│  
├── Comments  
├── Notifications  
└── Campaign Activity

Audit  
│  
└── Immutable Events  
\`\`\`

Then these are future modules:

\`\`\`text  
Analytics Engine  
Scraping Engine  
Recommendation Engine  
YardScore  
Fraud Detection  
Advanced Reporting  
\`\`\`

They connect to the V1 system rather than being prerequisites for it.

\#\#\# Your actual definition of "done"

I would make the 3.5% agreement's technical deliverable much more precise than "build Yard."

The meaningful technical milestone is something close to:

\> A production deployment capable of supporting at least 100 registered brands and 300 registered creators, with multiple concurrent campaigns, creator discovery, campaign participation, deliverable submission and review, revision handling, payment processing through the selected payment provider, notifications, authentication, persistent campaign history, and audit logs.

And then separately define what \*\*isn't included\*\*.

Otherwise "build the startup" becomes an unlimited obligation.

The next engineering exercise should therefore be a \*\*V1 capability matrix\*\*: every capability above gets classified as \`Required\`, \`Required infrastructure\`, \`Manual for beta\`, or \`Deferred\`. Once we have that matrix, we can turn it directly into the database schema, API boundaries, folder structure, deployment architecture, and coding sequence.

Yes. Now we can make this concrete.

The first thing I would change is the assumption that we need to decide every possible feature before coding. We need to decide the exact capabilities that make one complete Yard transaction possible, then make those capabilities robust enough for the 100-brand/300-creator target.

For V1, I would define the product around five states:

\`\`\`text  
DISCOVER  
    ↓  
MATCH  
    ↓  
EXECUTE  
    ↓  
APPROVE  
    ↓  
PAY  
\`\`\`

Everything else supports those states.

\#\#\# What a brand should be able to configure

When a brand creates a campaign, I would keep the initial form surprisingly small.

\`\`\`text  
Campaign  
│  
├── Campaign name  
├── Goal  
├── Category  
├── Location  
├── Platforms  
├── Creator requirements  
├── Deliverables  
├── Quantity  
├── Budget  
├── Deadline  
└── Brief  
\`\`\`

The important question is what each field actually means.

For "Goal", don't give them twenty marketing options. Start with perhaps:

\`\`\`text  
Product awareness  
Content creation  
Product review  
Sales / promotion  
Event promotion  
\`\`\`

For "Category":

\`\`\`text  
Beauty  
Fashion  
Food  
Tech  
Lifestyle  
Finance  
Fitness  
Entertainment  
Other  
\`\`\`

This becomes useful later for creator matching.

For location, because Yard is African-first, the data model should support:

\`\`\`text  
Country  
City  
\`\`\`

not just "Africa."

For platforms:

\`\`\`text  
Instagram  
TikTok  
YouTube  
Facebook  
X  
\`\`\`

But the database should not assume these are the only platforms. Use a platform table/entity so you can add others later.

For creator requirements, start with things that are objectively filterable:

\`\`\`text  
Creator category  
Country  
City  
Platform  
Minimum audience  
Maximum audience  
Language  
Budget/rate  
\`\`\`

Don't make "engagement quality" a required setting yet. That's something the future analytics system can calculate.

\#\#\# The creator discovery screen

This is where the MVP needs to provide actual value.

A brand should be able to say:

\> "I need 3 Nigerian beauty creators on Instagram, preferably Lagos, with 10k–100k followers."

Yard should return:

\`\`\`text  
Creator  
Category  
Location  
Platform  
Audience  
Rate  
Portfolio  
Previous Yard campaigns  
Availability  
\`\`\`

And eventually:

\`\`\`text  
YardScore  
Engagement  
Audience quality  
Completion rate  
Average campaign performance  
\`\`\`

But those last metrics can initially be absent.

The critical thing is that your creator database needs structured fields from day one. Don't put everything into one giant JSON column simply because it's easier with AI-assisted development.

Use relational tables for things you'll query.

For example:

\`\`\`text  
creators  
social\_accounts  
creator\_categories  
creator\_languages  
creator\_locations  
creator\_portfolio  
creator\_rates  
\`\`\`

Then JSON can handle genuinely flexible metadata.

That gives you the object model you're talking about without turning the database into an unsearchable document store.

\#\#\# What a creator should be able to do

For V1:

\`\`\`text  
Create account  
        ↓  
Create profile  
        ↓  
Connect/add social accounts  
        ↓  
Add portfolio  
        ↓  
Set categories  
        ↓  
Set location  
        ↓  
Set rate  
        ↓  
View campaigns  
        ↓  
Apply  
        ↓  
Accept invitation  
        ↓  
View brief  
        ↓  
Submit content  
        ↓  
Receive revision request  
        ↓  
Resubmit  
        ↓  
See approval  
        ↓  
See payment  
\`\`\`

That's enough.

I would NOT initially let creators:

\* create their own campaigns  
\* manage teams  
\* sell arbitrary services  
\* negotiate complex contracts  
\* create complicated service packages  
\* build public storefronts  
\* run analytics dashboards  
\* create their own scoring rules

Those aren't necessary to prove the transaction.

\#\#\# What a brand should NOT be able to do initially

A brand doesn't need to build an enormous marketing operation inside Yard.

Don't build:

\`\`\`text  
CRM  
Email marketing  
Social scheduling  
Content calendar  
Ad management  
Advanced reporting  
AI campaign generation  
Influencer forecasting  
\`\`\`

Yard should remain focused on the creator campaign transaction.

\---

\#\# The payment decision

I would not make "escrow" an MVP assumption yet.

There are actually three possible models:

\`\`\`text  
Model A

Brand → Creator directly  
Yard records payment  
\`\`\`

Simplest technically, but Yard has less control.

\`\`\`text  
Model B

Brand → Payment Provider  
             ↓  
        Creator payout  
\`\`\`

Yard orchestrates the payment but doesn't hold the money itself.

\`\`\`text  
Model C

Brand → Yard-controlled escrow  
             ↓  
        Creator payout  
\`\`\`

This is the most complicated model because you're moving toward actually holding customer funds and taking on additional regulatory/compliance obligations.

For V1, \*\*Model B is the direction I would investigate first\*\*, not Model C.

For Nigeria, Paystack currently supports transfers to Nigerian bank accounts and provides a Transfers API; its published Nigerian transfer fees are ₦10, ₦25, or ₦50 depending on transfer amount, and qualifying transfers of ₦10,000+ also have a ₦50 stamp duty. (\[Paystack\]\[1\])

That doesn't mean Paystack is automatically the correct provider. We should compare it with Flutterwave and determine exactly how the money flows, who is merchant of record, whether split payments are appropriate, how refunds work, and what happens when a creator disputes an approval.

That should be resolved before production payments.

\---

\#\# Files: I would NOT build the Google Drive architecture you described yet

Your idea is technically possible, but there's an important distinction.

You could have a Yard-owned Google Workspace/Drive and organize files like:

\`\`\`text  
Yard Drive  
│  
├── Brand A  
│   ├── Campaign 001  
│   │   ├── Brief  
│   │   ├── Assets  
│   │   └── Deliverables  
│  
└── Brand B  
    └── Campaign 002  
\`\`\`

The Google Drive API supports programmatic file management and shared drives. However, Google's current documentation specifically says service accounts don't have their own Drive storage quota and cannot own files; they need shared drives or OAuth on behalf of a human user. Google also currently imposes upload/storage-related quotas, including a 750 GB/day upload limit for Workspace users. (\[Google for Developers\]\[2\])

So the architecture should be:

\`\`\`text  
Yard Database  
      │  
      │ stores metadata  
      ↓  
File record  
      │  
      ├── provider  
      ├── provider\_file\_id  
      ├── filename  
      ├── mime\_type  
      ├── size  
      └── access information  
\`\`\`

Then:

\`\`\`text  
provider \= google\_drive  
\`\`\`

today.

Later:

\`\`\`text  
provider \= cloudinary  
provider \= s3  
provider \= other  
\`\`\`

That is the correct abstraction.

Do not make your database depend directly on Google Drive.

For video specifically, Cloudinary is also viable. Its current free plan provides 25 monthly credits, where credits cover storage, bandwidth, and transformations; it also supports video upload, transcoding and adaptive streaming. (\[Cloudinary\]\[3\])

For your initial 100-brand/300-creator target, I'd actually prefer \*\*external storage owned by Yard only if Yard needs to display/process the video\*\*. If Yard only needs to collect a deliverable and let the brand review it, Google Drive links can keep V1 considerably cheaper.

\---

\#\# The actual V1 feature boundary

This is where I would draw the line.

\`\`\`text  
YARD V1  
│  
├── Identity  
│   ├── Authentication  
│   ├── Brand accounts  
│   ├── Creator accounts  
│   └── Roles  
│  
├── Creator  
│   ├── Profile  
│   ├── Social accounts  
│   ├── Categories  
│   ├── Location  
│   ├── Languages  
│   ├── Rates  
│   └── Portfolio  
│  
├── Campaign  
│   ├── Create campaign  
│   ├── Brief  
│   ├── Budget  
│   ├── Requirements  
│   ├── Creator discovery  
│   ├── Invitations  
│   └── Applications  
│  
├── Execution  
│   ├── Campaign acceptance  
│   ├── Deliverable submission  
│   ├── Review  
│   ├── Revision  
│   └── Approval  
│  
├── Payment  
│   ├── Payment request  
│   ├── Provider  
│   ├── Payment status  
│   ├── Creator payout  
│   └── Transaction history  
│  
└── Infrastructure  
    ├── Notifications  
    ├── Audit logs  
    ├── File references  
    └── Background jobs  
\`\`\`

Then these remain outside V1:

\`\`\`text  
Scraping Engine  
Analytics Engine  
YardScore  
Recommendation Engine  
Fraud Engine  
Advanced Reporting  
AI Matching  
\`\`\`

But the V1 schema should already make room for them.

That is the distinction I think you're looking for: \*\*we don't build the future, but we also don't architect the present in a way that prevents the future.\*\*

The next thing I'd do is turn this into a literal \*\*V1 database model\*\*: tables, relationships, primary keys, foreign keys, enums, and which fields are required versus optional. Once that exists, we can derive the Node.js modules and API endpoints directly from it instead of generating backend code blindly with AI.

\[1\]: https://paystack.com/docs/transfers/?utm\_source=chatgpt.com "Transfers | Paystack Developer Documentation"  
\[2\]: https://developers.google.com/workspace/drive/api/guides/about-shareddrives?utm\_source=chatgpt.com "Shared drives overview  |  Google Drive  |  Google for Developers"  
\[3\]: https://cloudinary.com/documentation/billing\_and\_plans?utm\_source=chatgpt.com "Cloudinary Billing and Plans Overview | Documentation"

Yes. With the clarification that you are choosing the simpler payment model and that the storage provider should be replaceable, I would structure V1 around a very specific principle:

\*\*Yard owns the workflow and the records. Third parties own the heavy infrastructure.\*\*

That gives you a system that can handle the initial 100 brands / 300 creators without forcing you to prematurely build payment infrastructure, video infrastructure, analytics infrastructure, or a scraping platform.

The architecture I would use is roughly:

\`Frontend → Node.js API → PostgreSQL/Supabase → external providers\`

with separate modules underneath the API:

\`Auth\`  
\`Organizations\`  
\`Campaigns\`  
\`Creators\`  
\`Applications\`  
\`Deliverables\`  
\`Reviews\`  
\`Payments\`  
\`Files\`  
\`Notifications\`  
\`Analytics\`  
\`Audit\`

The important part is that these are modules, not necessarily separate servers. At your current scale, putting every "engine" into a separate deployment would add complexity without giving you meaningful benefits. Keep the code modular first; split infrastructure later when load or reliability actually demands it.

\#\#\# 1\. Your Google Drive idea is technically possible

Your idea of using Google Drive as the temporary file layer is workable, but I would modify one important part.

Don't make the Drive file itself the application's source of truth.

Supabase should store something like:

\`\`\`text  
file  
 ├── id  
 ├── campaign\_id  
 ├── uploaded\_by  
 ├── provider \= "google\_drive"  
 ├── provider\_file\_id  
 ├── provider\_url  
 ├── file\_type  
 ├── file\_size  
 ├── status  
 └── created\_at  
\`\`\`

Then Yard knows:

\> "Campaign 123 has deliverable file 456."

It doesn't care whether file 456 currently lives in Google Drive, Cloudinary, S3, or another provider.

That is exactly the abstraction you were describing earlier.

Later you can change:

\`provider \= google\_drive\`

to:

\`provider \= cloudinary\`

without redesigning the campaign system.

Google Drive's API is capable of handling this scale from a raw quota perspective. Google currently allows users up to 750 GB/day of uploads and files can be up to 5 TB, subject to account/storage conditions. (\[Google for Developers\]\[1\])

There is one important implementation detail: if you're using a service account, Google says service accounts don't have their own Drive storage quota. You would therefore want a Shared Drive or OAuth-based ownership model rather than simply creating a service account and expecting it to own unlimited files. (\[Google for Developers\]\[2\])

For V1, I would therefore use a dedicated Google Workspace/Shared Drive arrangement if the budget allows it.

\#\#\# 2\. Don't use an "open Google Drive"

This part needs correction.

You don't want:

\> "Here is our Google Drive link; anybody can access it."

You want Yard to control access.

The application should know who is allowed to see a particular file.

For example:

\`\`\`text  
Brand  
   ↓  
Campaign  
   ↓  
Brief assets  
   ↓  
Creator  
   ↓  
Deliverable  
\`\`\`

A creator assigned to Campaign A should be able to access Campaign A's files.

That permission should come from Yard's authorization layer, not from the fact that somebody happens to possess a Google Drive URL.

So your API does something like:

\`\`\`text  
GET /campaigns/:id/files/:fileId  
\`\`\`

Yard checks:

\`\`\`text  
Is this user part of this campaign?  
        ↓  
       YES  
        ↓  
Generate/return authorized provider access  
\`\`\`

That gives you the ability to change the storage provider later without changing the user's experience.

\#\#\# 3\. Supabase should remain the source of truth

I agree with your choice of Supabase/PostgreSQL.

But don't put large videos into the database.

PostgreSQL stores the relationships and metadata.

For example:

\`\`\`text  
campaign  
creator  
brand  
application  
deliverable  
payment  
file  
review  
revision  
audit\_event  
\`\`\`

Then the relationships tell the story.

A simplified campaign could look like:

\`\`\`text  
Campaign  
 ├── Brand  
 ├── Brief  
 ├── Budget  
 ├── Creators  
 │    ├── Creator A  
 │    ├── Creator B  
 │    └── Creator C  
 │  
 ├── Deliverables  
 │    ├── Video A  
 │    ├── Video B  
 │    └── Video C  
 │  
 ├── Reviews  
 ├── Revisions  
 ├── Payment  
 └── Audit history  
\`\`\`

That is much more important than whether you use Google Drive or Cloudinary.

Supabase's current free tier gives you 500 MB of database storage, 1 GB of file storage and 5 GB egress, with a 50 MB maximum file size on free Storage. (\[Supabase\]\[3\])

So your decision to avoid putting campaign videos into Supabase Storage makes sense.

\#\#\# 4\. Payment: your Option B is much better for V1

If by Option B you mean:

\> Brand pays through the payment provider → Yard records the transaction → creator confirms/receives payment → Yard tracks the state.

I would use that for V1 rather than attempting to build an escrow system.

The payment state should be treated as a state machine:

\`\`\`text  
UNPAID  
   ↓  
PAYMENT\_INITIATED  
   ↓  
PAYMENT\_CONFIRMED  
   ↓  
CREATOR\_PAYOUT\_PENDING  
   ↓  
PAID  
\`\`\`

With failure paths:

\`\`\`text  
PAYMENT\_INITIATED  
        ↓  
      FAILED  
\`\`\`

and:

\`\`\`text  
CREATOR\_PAYOUT\_PENDING  
        ↓  
      FAILED  
        ↓  
     RETRY  
\`\`\`

The critical thing is that \*\*you never determine payment status from the frontend\*\*.

The payment provider's webhook should update your database.

For example:

\`\`\`text  
Flutterwave  
     ↓  
Webhook  
     ↓  
Yard API  
     ↓  
Verify transaction  
     ↓  
PostgreSQL  
     ↓  
Payment \= successful  
\`\`\`

Flutterwave currently supports multiple Nigerian payment methods, including card, bank transfer, account, USSD, NQR, OPay and others, so it can cover a reasonable Nigerian V1 payment surface. (\[Flutterwave API docs\]\[4\])

Flutterwave also has marketplace-style split payments, but that introduces additional merchant/subaccount responsibility and dispute/chargeback implications. Their documentation explicitly says marketplace owners are responsible for vetting merchants and disputes/chargebacks can be logged against the marketplace account. (\[Flutterwave API docs\]\[5\])

That is precisely why I would \*\*not\*\* make split/escrow mechanics part of your first engineering target.

Build the payment abstraction now.

Implement the complicated financial architecture later.

\#\#\# 5\. The most important abstraction you should create now

Don't build:

\`\`\`text  
FlutterwavePayment  
\`\`\`

everywhere throughout the codebase.

Build:

\`\`\`text  
PaymentService  
\`\`\`

Then underneath it:

\`\`\`text  
PaymentService  
      ↓  
FlutterwaveProvider  
\`\`\`

Later:

\`\`\`text  
PaymentService  
      ↓  
FlutterwaveProvider  
PaystackProvider  
OtherProvider  
EscrowProvider  
\`\`\`

Same principle for files:

\`\`\`text  
FileService  
      ↓  
GoogleDriveProvider  
\`\`\`

Later:

\`\`\`text  
FileService  
      ↓  
GoogleDriveProvider  
CloudinaryProvider  
S3Provider  
\`\`\`

And analytics:

\`\`\`text  
AnalyticsService  
      ↓  
InstagramProvider  
YouTubeProvider  
TikTokProvider  
\`\`\`

Later:

\`\`\`text  
AnalyticsService  
      ↓  
API Provider  
Scraper Provider  
Manual Provider  
\`\`\`

This is the "Frankenstein" architecture you were describing, but done deliberately rather than randomly.

The core Yard system doesn't know how the outside world works.

It knows what it needs.

\#\#\# 6\. For the 100 brands / 300 creators target, you don't need a scraping engine yet

This is one place where I would push back on your earlier thinking.

You need an \*\*analytics interface\*\*, not an analytics scraping engine.

For V1:

\`\`\`text  
Creator  
   ↓  
Analytics Provider  
   ↓  
Instagram/YouTube/etc.  
   ↓  
Normalized analytics  
   ↓  
Creator profile  
\`\`\`

Your database might store:

\`\`\`text  
creator\_analytics  
 ├── followers  
 ├── engagement\_rate  
 ├── average\_views  
 ├── average\_likes  
 ├── average\_comments  
 ├── audience\_location  
 ├── platform  
 ├── measured\_at  
 └── source  
\`\`\`

The source could initially be:

\`\`\`text  
API  
\`\`\`

or:

\`\`\`text  
manual  
\`\`\`

or even:

\`\`\`text  
imported  
\`\`\`

Then later:

\`\`\`text  
scraper  
\`\`\`

becomes another provider.

That means your future scraping engine doesn't require you to redesign Creator.

This is important because scraping social platforms is not simply an engineering problem. Access restrictions, authentication, rate limits, platform terms, anti-bot mechanisms and API availability can change. You don't want the entire Yard architecture dependent on your ability to scrape Instagram tomorrow.

\#\#\# 7\. The V1 creator system should therefore be deliberately boring

A creator should be able to:

Create account → complete profile → connect/submit social accounts → enter basic information → become available to brands → receive campaign invitation/application → accept campaign → receive brief → submit deliverable → receive revision request → resubmit → get approved → get paid.

That's basically it.

You don't need YardScore v1 to be an elaborate AI reputation algorithm.

You need enough information to answer:

\> "Can this creator reasonably fit this campaign?"

So your first discovery filters can be things like:

\`\`\`text  
Platform  
Category  
Location  
Audience size  
Average views  
Rate/budget  
Content type  
Language  
Creator status  
\`\`\`

Then you can add your more sophisticated scoring system later.

\#\#\# 8\. The brand V1 is similarly small

A brand should be able to:

Create account → create campaign → define requirements → set budget → find/receive creators → shortlist → select creators → send brief → review submission → request revision → approve → initiate payment → see campaign history.

Notice what isn't here:

No complex CRM.

No enormous reporting dashboard.

No AI recommendation engine.

No advanced reputation algorithm.

No sophisticated escrow system.

No enterprise permissions.

No massive analytics suite.

Those are V2/V3 concerns.

\#\#\# 9\. The actual V1 transaction you are trying to prove

This is the most important thing.

You aren't really trying to prove that Yard has 50 features.

You're trying to prove this:

\`\`\`text  
Brand  
  ↓  
Creates campaign  
  ↓  
Finds creator  
  ↓  
Selects creator  
  ↓  
Creator accepts  
  ↓  
Brand sends brief  
  ↓  
Creator submits work  
  ↓  
Brand reviews  
  ↓  
Revision if necessary  
  ↓  
Brand approves  
  ↓  
Payment occurs  
  ↓  
Creator receives payment  
  ↓  
Campaign closes  
  ↓  
Yard retains permanent record  
\`\`\`

If that entire loop works reliably for 100 brands and 300 creators, you have a legitimate V1.

Everything else should attach itself to that loop.

That should become the central node of your architecture.

\#\#\# 10\. Your infrastructure can remain surprisingly small

For the first version, I would target:

\*\*Frontend:\*\* your existing frontend stack/Vercel.

\*\*Backend:\*\* Node.js/TypeScript API.

\*\*Database:\*\* Supabase PostgreSQL.

\*\*Authentication:\*\* Supabase Auth.

\*\*File provider:\*\* Google Drive initially.

\*\*Payments:\*\* Flutterwave initially.

\*\*Background jobs:\*\* a small job mechanism rather than immediately creating a distributed queue system.

\*\*Hosting:\*\* Render or equivalent for the Node backend.

\*\*Analytics:\*\* API/manual provider initially.

\*\*Notifications:\*\* email \+ possibly WhatsApp later.

\*\*Logging/audit:\*\* PostgreSQL initially.

The important architectural decision isn't "which provider is best?"

It is:

\*\*Can every external dependency be replaced without rewriting Yard's core business logic?\*\*

If yes, you're building the right abstraction.

And there is one correction to your original idea that I would make now: don't optimize the architecture for 100 brands and 300 creators as though that is a huge infrastructure problem. It isn't. The difficult part is the correctness of the campaign/payment/file/state relationships. Your target volume is small enough that a well-designed Node.js application with PostgreSQL can comfortably handle the workload. The architecture should be designed for replaceability and correctness, not premature distributed scaling.

That gives us a very clean next engineering step: define the \*\*V1 domain model and state machines\*\* before writing the Node.js code. Once those are correct, the folder structure, PostgreSQL schema, API routes, authentication boundaries and provider interfaces can all be derived from them.

\[1\]: https://developers.google.com/workspace/drive/api/guides/limits?utm\_source=chatgpt.com "Usage limits  |  Google Drive  |  Google for Developers"  
\[2\]: https://developers.google.com/workspace/drive/api/guides/about-shareddrives?utm\_source=chatgpt.com "Shared drives overview  |  Google Drive  |  Google for Developers"  
\[3\]: https://supabase.com/pricing?utm\_source=chatgpt.com "Pricing & Fees | Supabase"  
\[4\]: https://developer.flutterwave.com/v3.0/docs/payment-methods?utm\_source=chatgpt.com "Payment Methods"  
\[5\]: https://developer.flutterwave.com/v3.0.0/docs/split-payments?utm\_source=chatgpt.com "Split Payments"

Yes. Given the MVP target you have now defined — roughly 300 creators, 100 brands, campaigns actually moving from brief → creator → delivery → payment — I would not build a proprietary scraping engine first.

The correct architecture is to make scraping a replaceable infrastructure layer.

The important distinction is:

\`Social platform/API/scraper → ingestion adapter → normalized creator data → analytics engine → creator score\`

Your application should never care whether the data came from Instagram API, Apify, your own Playwright worker, or another provider.

For example:

\`\`\`text  
Creator  
   │  
   ├── Instagram  
   ├── TikTok  
   └── YouTube  
        │  
        ▼  
┌─────────────────────────┐  
│ Data Source Adapter     │  
│                         │  
│ API / Apify / Scraper   │  
└────────────┬────────────┘  
             ▼  
┌─────────────────────────┐  
│ Raw Data Store           │  
│ profiles                 │  
│ posts                    │  
│ comments                 │  
│ metrics                  │  
│ snapshots                │  
└────────────┬────────────┘  
             ▼  
┌─────────────────────────┐  
│ Normalization Engine     │  
│                         │  
│ platform-specific data   │  
│ → Yard data model        │  
└────────────┬────────────┘  
             ▼  
┌─────────────────────────┐  
│ Analytics Engine         │  
│                         │  
│ engagement               │  
│ consistency              │  
│ audience signals         │  
│ content performance      │  
│ campaign history         │  
└────────────┬────────────┘  
             ▼  
┌─────────────────────────┐  
│ Yard Creator Score       │  
└─────────────────────────┘  
\`\`\`

That is the structure I would lock in now.

\#\#\# 1\. What I found for scraping

There are already several services that can give you the infrastructure instead of forcing you to build proxy rotation, browser automation, CAPTCHA handling, retries, etc.

Apify is probably the most interesting one for your MVP. Its free plan currently includes $5 of platform usage, and it has ready-made Instagram scrapers. Its Instagram scraper can collect profiles, posts, reels, comments, mentions, hashtags, etc. (\[Apify\]\[1\])

There are also individual Apify Instagram actors that are quite inexpensive. One current actor, for example, charges per profile/post/comment rather than requiring a large monthly subscription. (\[Apify\]\[2\])

\[Apify Instagram Scraper\](https://apify.com/apify/instagram-scraper?utm\_source=chatgpt.com)

Bright Data is the more production-oriented option. Its Web Scraper API currently gives 5,000 records/month free, with no credit card required, and handles things such as proxy management, browser rendering and CAPTCHA solving. Paid usage starts around $1.50/1,000 successful records. (\[Bright Data\]\[3\])

\[Bright Data Web Scraper API\](https://brightdata.com/products/web-scraper?utm\_source=chatgpt.com)

ScrapingBee is another option, but I wouldn't choose it as the primary system for Yard right now. Its free allowance is only a 1,000-credit trial and its paid plans start considerably higher. (\[ScrapingBee\]\[4\])

\[ScrapingBee\](https://www.scrapingbee.com?utm\_source=chatgpt.com)

You can also build your own scraper using Playwright/Scrapy/etc. That software itself is free, but the expensive part isn't the code. It's the infrastructure around it: proxies, browser sessions, IP rotation, anti-bot handling, retries, monitoring and maintaining the scraper when platforms change. Bright Data and Apify are essentially selling you that infrastructure. (\[Bright Data\]\[5\])

\#\#\# 2\. What I would actually use for Yard V1

I would use:

\`Node.js \+ Supabase/PostgreSQL \+ Render \+ Apify\`

with your own ingestion layer in between.

Something like:

\`\`\`text  
                    YARD  
                      │  
             ┌────────▼────────┐  
             │ Creator Service │  
             └────────┬────────┘  
                      │  
              "Refresh creator"  
                      │  
             ┌────────▼────────┐  
             │ Ingestion API   │  
             └────────┬────────┘  
                      │  
              ┌───────┴────────┐  
              │                │  
         Instagram          TikTok  
              │                │  
          Apify/API        API/Apify  
              │                │  
              └───────┬────────┘  
                      ▼  
              Raw Social Data  
                      │  
                      ▼  
               Normalizer  
                      │  
                      ▼  
                 Supabase  
                      │  
          ┌───────────┴───────────┐  
          ▼                       ▼  
    Analytics Engine        Creator Profile  
          │  
          ▼  
      Yard Score  
\`\`\`

This gives you something important:

\*\*You are not building Yard around Apify.\*\*

You are building Yard around your own data model.

Apify is simply one provider feeding that model.

If Apify becomes expensive, you replace it.

If Meta gives you better API access, you plug that in.

If you eventually build your own scraper, you plug that in.

If Bright Data becomes more economical at scale, you plug that in.

The rest of Yard doesn't change.

\#\#\# 3\. Do NOT build the "comment pod hunter" yet

This is one place where I would push back on the previous architecture.

The comment-pod analysis sounds impressive, but it is not necessary to prove your V1.

For 300 creators, you don't need:

\`\`\`text  
millions of comments  
        ↓  
graph database  
        ↓  
cross-creator interaction graph  
        ↓  
community detection  
        ↓  
pod probability  
\`\`\`

That is a later analytics subsystem.

For V1, I would collect the raw information necessary to make it possible later.

For example:

\`\`\`text  
creator  
post  
post\_timestamp  
comment  
commenter\_username  
comment\_timestamp  
like\_count  
comment\_count  
view\_count  
\`\`\`

Then later:

\`\`\`text  
Comment Network Engine  
        ↓  
Interaction Graph  
        ↓  
Repeated commenter patterns  
        ↓  
Pod probability  
\`\`\`

The key is that \*\*the database schema preserves the possibility without requiring the algorithm today.\*\*

That's exactly the "future-proof without overbuilding" principle you've been describing.

\#\#\# 4\. The scraper should not calculate the score

This is another architectural boundary I would make now.

Don't do this:

\`\`\`text  
Instagram scraper  
      ↓  
calculate creator score  
      ↓  
save score  
\`\`\`

Do this:

\`\`\`text  
Instagram  
   ↓  
Ingestion  
   ↓  
Raw observations  
   ↓  
Normalized data  
   ↓  
Analytics  
   ↓  
Score  
\`\`\`

Why?

Because your scoring formula will change.

Today:

\`\`\`text  
Score \=  
30% engagement  
30% consistency  
20% audience quality  
20% campaign history  
\`\`\`

Six months later it might become:

\`\`\`text  
Score \=  
20% engagement  
20% audience quality  
20% content performance  
20% reliability  
20% campaign results  
\`\`\`

You should be able to recalculate every creator without scraping Instagram again.

That means the score is a \*\*derived entity\*\*, not your source of truth.

\#\#\# 5\. Your database should therefore distinguish observations from conclusions

For example:

\`\`\`text  
creator  
creator\_platform  
social\_profile  
social\_post  
social\_comment  
social\_metric\_snapshot  
creator\_metric  
creator\_score  
score\_version  
\`\`\`

The important one is \`social\_metric\_snapshot\`.

Imagine:

\`\`\`text  
creator\_id: 123  
platform: instagram  
followers: 18400  
following: 923  
posts: 412  
captured\_at: 2026-08-07  
source: apify  
\`\`\`

Then a month later:

\`\`\`text  
creator\_id: 123  
platform: instagram  
followers: 19700  
following: 930  
posts: 428  
captured\_at: 2026-09-07  
source: apify  
\`\`\`

Now you have history.

You can calculate growth.

You can calculate consistency.

You can calculate velocity.

You can detect changes.

And you can eventually train better models.

\#\#\# 6\. The scraper should operate as jobs

Don't have your Node API directly sit there scraping Instagram.

Use:

\`\`\`text  
API  
 │  
 ▼  
Create scraping job  
 │  
 ▼  
Queue  
 │  
 ▼  
Worker  
 │  
 ▼  
Apify / API / scraper  
 │  
 ▼  
Webhook  
 │  
 ▼  
Ingestion processor  
 │  
 ▼  
Supabase  
\`\`\`

For example:

\`\`\`text  
POST /creators/:id/refresh  
\`\`\`

doesn't scrape.

It creates:

\`\`\`text  
scrape\_job  
{  
  creator\_id,  
  platform,  
  job\_type,  
  status: "queued"  
}  
\`\`\`

Then the worker handles it.

That becomes extremely useful later because you can have:

\`\`\`text  
profile\_refresh  
post\_refresh  
comment\_refresh  
analytics\_refresh  
campaign\_verification  
\`\`\`

all using the same job infrastructure.

\#\#\# 7\. For your 300 creators, you don't need real-time scraping

This is another important correction.

You said earlier that you wanted real-time creator analytics.

I would not make that a V1 requirement.

For 300 creators, something like this is sufficient:

\`\`\`text  
Profile metrics       → daily  
Posts                 → daily  
Recent post metrics   → daily  
Comments              → selectively  
Deep analysis         → weekly  
Campaign-related data → event-triggered  
\`\`\`

When a brand opens a creator profile, you show the latest known data.

You don't suddenly scrape Instagram because someone opened the profile.

That would be expensive, slow and fragile.

Instead:

\`\`\`text  
          Scheduler  
              │  
       ┌──────┴──────┐  
       ▼             ▼  
  Creator 1       Creator 2  
       │             │  
       ▼             ▼  
     Refresh       Refresh  
       │             │  
       └──────┬──────┘  
              ▼  
          Supabase  
              │  
              ▼  
         Brand dashboard  
\`\`\`

\#\#\# 8\. And this changes what your MVP actually needs

Your V1 analytics engine does not need to be:

\> "The most advanced African creator intelligence engine."

It needs to answer a much smaller question:

\> "Can Yard help an SME find a creator who is likely to deliver what they paid for?"

So I would initially collect:

\`\`\`text  
IDENTITY  
\- username  
\- display name  
\- profile URL  
\- profile image  
\- bio  
\- location  
\- category

AUDIENCE  
\- followers  
\- following  
\- follower growth  
\- audience size

CONTENT  
\- recent posts  
\- post type  
\- caption  
\- timestamp  
\- views  
\- likes  
\- comments  
\- shares where available

PERFORMANCE  
\- average views  
\- average likes  
\- average comments  
\- engagement rate  
\- posting frequency

YARD HISTORY  
\- campaigns completed  
\- campaigns cancelled  
\- delivery history  
\- approval history  
\- payment history  
\- disputes

MANUAL  
\- niche  
\- location  
\- rate  
\- verified status  
\`\`\`

That's enough to build a useful first creator marketplace.

\#\#\# 9\. The platform APIs still matter

One correction to the assumption that "we can't get APIs, therefore scraping everything."

Don't throw away official APIs where they are legitimately available.

For example, TikTok's Research API provides public account/content data, but access is restricted to qualifying researchers in eligible regions/organizations, so it shouldn't be treated as a general commercial API you can simply depend on. (\[TikTok for Developers\]\[6\])

So your architecture should allow:

\`\`\`text  
                    Creator  
                       │  
             ┌─────────┴─────────┐  
             │                   │  
       Official API          Scraper  
             │                   │  
             └─────────┬─────────┘  
                       ▼  
                 Normalizer  
                       ▼  
                    Yard  
\`\`\`

The source is irrelevant to the rest of the system.

\#\#\# 10\. The three engines I'd define now

Based on everything you've told me, I would stop thinking about "one giant scraping engine."

Define three independent systems.

\*\*Engine 1 — Ingestion Engine\*\*

Its only job:

\> Get external data into Yard.

\`\`\`text  
Instagram  
TikTok  
YouTube  
Creator submissions  
Campaign results  
\`\`\`

No scoring.

No business logic.

\*\*Engine 2 — Analytics Engine\*\*

Its job:

\> Turn observations into metrics.

\`\`\`text  
average views  
engagement rate  
growth  
posting frequency  
content distribution  
historical performance  
audience signals  
\`\`\`

Later:

\`\`\`text  
comment network  
fraud detection  
brand safety  
loyalty  
price recommendation  
\`\`\`

\*\*Engine 3 — Decision Engine\*\*

Its job:

\> Turn metrics into something Yard can act on.

For example:

\`\`\`text  
Creator Score  
        ↓  
Campaign matching  
        ↓  
Recommended creators  
        ↓  
Risk indicators  
        ↓  
Suggested price  
\`\`\`

That separation is important.

\#\#\# 11\. The first version of the "Frankenstein" is actually good

I would intentionally build this:

\`\`\`text  
                 YARD V1  
                    │  
       ┌────────────┼────────────┐  
       │            │            │  
    Supabase      Render       Apify  
       │            │            │  
       │        Node.js API      │  
       │            │            │  
       └────────────┼────────────┘  
                    │  
             Ingestion Layer  
                    │  
             Analytics Layer  
                    │  
              Yard Database  
                    │  
          ┌─────────┴─────────┐  
          ▼                   ▼  
      Brand App           Creator App  
\`\`\`

Then the future can become:

\`\`\`text  
                    YARD  
                     │  
          ┌──────────┴──────────┐  
          │                     │  
   Official APIs          Yard Scrapers  
          │                     │  
          └──────────┬──────────┘  
                     ▼  
              Ingestion Engine  
                     │  
             Analytics Engine  
                     │  
       ┌─────────────┼─────────────┐  
       ▼             ▼             ▼  
  Trust Score    Match Engine   Pricing  
       │             │             │  
       └─────────────┼─────────────┘  
                     ▼  
               Campaign Engine  
                     │  
             Payment/Settlement  
                     │  
                   Yard  
\`\`\`

That is the architecture I would build toward.

And there is one major principle I would put into the codebase from day one:

\*\*Never let a third-party provider's data format become Yard's internal data format.\*\*

Apify returns one JSON structure. Meta returns another. TikTok returns another. Your own scraper will return another.

Normalize all of them into your own schema.

That is what will let you replace the Frankenstein pieces later without rebuilding the body.

For the immediate 300-creator/100-brand target, I would therefore spend engineering effort on the actual transaction loop and a modest ingestion/analytics foundation—not on building the sophisticated scraping moat yet. Apify's current free/low-volume economics make it suitable for proving that layer before you commit to maintaining your own scraper infrastructure. (\[Apify\]\[1\])

\[1\]: https://apify.com/pricing?utm\_source=chatgpt.com "Apify pricing \- plans for data collection at any scale · Apify"  
\[2\]: https://apify.com/automation-lab/instagram-scraper?utm\_source=chatgpt.com "Instagram Scraper: Posts, Reels, Profiles & Hashtags · Apify"  
\[3\]: https://brightdata.com/pricing/web-scraper?utm\_source=chatgpt.com "Web Scraper API Pricing Plans"  
\[4\]: https://www.scrapingbee.com/pricing/?utm\_source=chatgpt.com "Pricing \- ScrapingBee Web Scraping API"  
\[5\]: https://brightdata.com/blog/web-data/best-free-web-scrapers?utm\_source=chatgpt.com "Best Free Web Scrapers in 2026: Ranked and Tested"  
\[6\]: https://developers.tiktok.com/products/research-api/?utm\_source=chatgpt.com "Research API | TikTok for Developers"

Yes. Based on everything you've laid out, I think we now have enough information to define and start building the MVP.

But I would make one distinction: we have enough to start engineering, not enough to say every architectural decision is final. Some parts should deliberately remain replaceable.

The three major engines you've been circling around are:

1. **Ingestion / Scraping Engine**  
   * Gets creator data from APIs, scraping providers, or eventually your own scrapers.  
   * Stores raw observations.  
   * Should be replaceable by source.  
2. **Analytics / Intelligence Engine**  
   * Turns raw data into metrics.  
   * Engagement, views, consistency, audience signals, content performance, creator history, etc.  
   * Later this can contain the more advanced things: pod detection, loyalty, brand-safety analysis, pricing intelligence, and your Yard Score.  
3. **Workflow / Campaign Engine**  
   * This is actually the most important engine for V1.  
   * Brand creates campaign → creators are found/shortlisted → creator accepts → brief/deliverables → submission → revision → approval → payment.  
   * This is what turns Yard from a creator database into a transaction platform.

Then there are supporting systems rather than separate "core engines":

* Authentication and roles  
* Brand/creator workspaces  
* Campaign and deliverable data  
* Messaging/notifications  
* File/link management  
* Payment integration  
* Audit logs  
* Background jobs  
* Admin/moderation  
* Reporting  
* Database/storage  
* Monitoring

And we have already made several useful V1 decisions:

* **PostgreSQL/Supabase** for the primary database.  
* **Node.js** for the backend.  
* **Render** as the initial backend hosting environment.  
* External providers can handle scraping initially.  
* Social data should be normalized into Yard's own schema.  
* Files should be provider-independent.  
* Payments should use an external payment provider rather than Yard becoming the payment/escrow infrastructure itself.  
* Historical records such as payments, campaigns, reputation/history and audit logs should be immutable or strongly protected from deletion.  
* The system should be componentized so future engines can be added without restructuring the entire application.  
* V1 does not need the full proprietary scoring/scraping intelligence system.

The remaining work is therefore not "what is Yard?" anymore.

It is:

**What exactly must exist for 100 brands and 300 creators to successfully complete a campaign from beginning to end?**

That is the next engineering question.

I would now stop expanding the feature list and create the V1 system specification in this order:

1\. Actors & permissions  
        ↓  
2\. Core entities / database model  
        ↓  
3\. Campaign lifecycle  
        ↓  
4\. Creator lifecycle  
        ↓  
5\. Payment lifecycle  
        ↓  
6\. File/deliverable lifecycle  
        ↓  
7\. Notifications  
        ↓  
8\. Background jobs  
        ↓  
9\. Analytics/ingestion interfaces  
        ↓  
10\. Admin & failure handling  
        ↓  
11\. Infrastructure  
        ↓  
12\. MVP feature cut

Once those are defined, you should be able to go from the specification directly into your AI-assisted coding workflow.

The important part is that we **do not need to finish the three engines before launching**. We need to define their interfaces now, implement only the minimum required pieces, and leave the sophisticated parts as replaceable modules.

So yes: **we are at the point where we can stop conceptualizing Yard and start turning it into an actual V1 engineering specification.**

