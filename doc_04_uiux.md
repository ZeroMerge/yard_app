# Document 04 — UI/UX Design Brief (Corrected)
## Yard V1 — Visual Language, Component Design & Interaction Specification
### Source of truth: Login.tsx, Signup.tsx, index.css, tailwind.config.ts, ui-bits.tsx, AppShell.tsx

---

## The Design Thesis

Yard's visual language is defined by three non-negotiables extracted from the actual codebase:

1. **Zero border policy** — no visible dividing lines between surfaces. Depth is created with shadow, background layering, and spacing alone. The global CSS rule `* { @apply border-border/50; }` exists at 50% opacity purely as a rendering fallback — it is functionally invisible. No component actively draws a border to separate itself from others.
2. **Teal as the single primary color** — every action, active state, highlight, link, progress indicator, icon accent, and CTA uses the same teal. There is no competing accent color for interactions.
3. **Lemony yellow** — a warm, saturated lemon yellow (`hsl(38 92% 50%)`, Tailwind `warning`) is used selectively for financial highlights and premium emphasis. It does not compete with teal — it occupies a different semantic role (value / money / premium).

---

## Color System (From `index.css` + `tailwind.config.ts`)

### Light Mode Token Reference

| CSS Variable | HSL Value | What It Looks Like | Usage |
|---|---|---|---|
| `--background` | `0 0% 100%` | Pure white | Page backgrounds |
| `--foreground` | `220 20% 14%` | Near-black, cool-toned | All primary text |
| `--surface` | `210 20% 98%` | Off-white with a cool tint | Body/page surface (`bg-surface`) |
| `--surface-2` | `210 25% 96%` | Slightly more tinted off-white | Input fields, nested panels, row hovers |
| `--card` | `0 0% 100%` | Pure white | All `.cy-card` containers |
| `--card-foreground` | `220 20% 14%` | Near-black | Text inside cards |
| `--primary` | `173 80% 36%` | Teal `#0D9488` | All interactive elements, CTAs, active states, icons |
| `--primary-foreground` | `0 0% 100%` | White | Text on teal buttons |
| `--primary-glow` | `173 75% 50%` | Lighter teal | Glow effects on teal surfaces |
| `--secondary` | `220 18% 16%` | Charcoal/slate dark | Left panel on login/signup, dark button variant |
| `--secondary-foreground` | `0 0% 98%` | Off-white | Text on secondary/dark surfaces |
| `--muted` | `210 20% 96%` | Light gray | Subtle backgrounds |
| `--muted-foreground` | `220 10% 46%` | Medium gray | Captions, labels, metadata, timestamps |
| `--border` | `210 20% 94%` | Very light gray | Functionally invisible at `/50` opacity |
| `--input` | `210 20% 93%` | Same as border | Input field background at rest |
| `--ring` | `173 80% 36%` | Teal | Focus rings on all interactive elements |
| `--warning` | `38 92% 50%` | **Lemony yellow** | Financial highlights, premium value display |
| `--success` | `152 68% 38%` | Emerald green | Success states |
| `--destructive` | `0 72% 51%` | Red | Errors, delete, suspend actions |

### Dark Mode Tokens (applied via `<html class="dark">`)

| Token | Dark HSL | Visual Result |
|---|---|---|
| `--background` | `222 24% 8%` | Very dark navy-black |
| `--surface` | `222 22% 11%` | Dark navy surface |
| `--surface-2` | `222 20% 14%` | Slightly lighter dark navy |
| `--card` | `222 22% 11%` | Dark navy card (same as surface) |
| `--primary` | `173 75% 46%` | Brighter teal (for contrast on dark) |
| `--secondary` | `222 18% 18%` | Dark navy panel |
| `--muted-foreground` | `220 12% 68%` | Light gray |
| `--border` | `222 18% 16%` | Very dark, still invisible at /50 |

### Named Gradients

| Name | Definition | Usage |
|---|---|---|
| `--gradient-teal` | `linear-gradient(135deg, hsl(173 80% 36%), hsl(173 75% 48%))` | Avatar initials, progress bars, stat highlights (`bg-gradient-teal`) |
| `--gradient-hero` | Dual radial-gradient (teal glow top-right + bottom-left) | Page-level hero background decorations |
| `bg-gradient-gold` | Currently aliased to `--gradient-teal` | Used where lemony yellow will replace teal gradient (in progress) |

> **Note on Lemony Yellow:** The `--warning` token (`hsl(38 92% 50%)`) is where lemony yellow lives. As the user introduces it, it replaces the teal gradient in financial stat cards (`tone="gold"` on `<Stat>`). The Tailwind class will be `text-yellow-400` / `bg-yellow-400/10` or the `--warning` token. Do not use it for interactive elements — it is purely for value display and premium decoration.

### Shadow System

| Class | CSS Value | Usage |
|---|---|---|
| `shadow-soft` | `0 2px 14px -2px rgba(0,0,0,0.04), 0 0 1px rgba(0,0,0,0.04)` | All `.cy-card` at rest — barely perceptible |
| `shadow-elevated` | `0 12px 36px -8px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)` | Dialogs, hovered cards, dropdowns |
| `shadow-teal` | `0 10px 30px -8px hsl(173 80% 36% / 0.35)` | Teal-glowing buttons or special CTA treatments |
| Dark `shadow-soft` | `0 4px 20px -2px rgba(0,0,0,0.45)` | Cards in dark mode — deeper because dark bg |
| Dark `shadow-elevated` | `0 16px 40px -8px rgba(0,0,0,0.6)` | Dialogs and elevated elements in dark mode |

Shadows replace borders. If a surface needs to feel distinct from what's behind it, use shadow. Never draw a line.

---

## Typography

### Font Stack (from `tailwind.config.ts` + `index.css`)

| Role | Font | Tailwind Class | Usage |
|---|---|---|---|
| Display / Headings | **Fraunces** (serif-variable, expressive) → fallback Inter Tight | `font-display` | Page titles, stat numbers, campaign names, card headings, logo wordmark support |
| Body / UI | **Inter Tight** → Inter → system-ui | (default, no class needed) | All body text, labels, navigation labels, table content, captions |
| Numeric / Mono | **JetBrains Mono** | `font-mono` / `font-numeric` | Transaction IDs, audit log UUIDs, references, financial amounts where tabular alignment matters |

> **Fraunces** is a variable font with a strong personality — optical-size and weight axes. At `font-extrabold` it reads commanding and premium. This is the character of the Yard brand in text.

### Letter Spacing
- Headings: `tracking-tight` — `letter-spacing: -0.025em` (applied globally to `h1–h4` in `index.css`)
- Status pill labels: `tracking-wide` — slightly expanded for legibility at small sizes
- Stat labels: `tracking-wider uppercase` — all-caps, expanded tracking for data labels

### Type Scale

| Element | Size | Weight | Class |
|---|---|---|---|
| Page title (PageHeader) | 2xl mobile / 3xl desktop | Extrabold | `font-display text-2xl md:text-3xl font-extrabold tracking-tight` |
| Card heading / section heading | lg | Bold | `font-display text-lg font-bold` |
| Campaign name on card | lg | Bold | `font-display text-lg font-bold` |
| Stat value | 2xl mobile / 3xl desktop | Extrabold | `font-display text-2xl md:text-3xl font-extrabold` |
| Budget/money amount | sm | Extrabold | `font-display font-extrabold text-sm` |
| Body / description | sm | Normal (400) | `text-sm text-foreground` |
| Brief excerpt | sm | Normal, muted | `text-sm text-muted-foreground line-clamp-2` |
| Caption / metadata | xs | Medium (500) | `text-xs text-muted-foreground font-medium` |
| Input label | sm | Semibold | `text-sm font-semibold` |
| Status pill text | xs | Semibold | `text-xs font-semibold capitalize tracking-wide` |
| Stat label (above number) | xs | Semibold, uppercase | `text-xs font-semibold uppercase tracking-wider text-muted-foreground` |

---

## Border Radius System (`--radius: 1rem` = 16px)

This is the heart of the aesthetic. Everything is rounded. Nothing is square.

| Level | Token / Class | Pixel Equivalent | Used For |
|---|---|---|---|
| Maximum rounded | `rounded-full` | 9999px | Status pills, chips, badges, toggle switches, avatar circle variants |
| Primary surface | `rounded-2xl` | 24px | `.cy-card` containers, dialogs, sheets, the signup role-selection cards |
| Secondary interactive | `rounded-xl` | 12px | All buttons, all input fields, select triggers, nav links, row hover surfaces (`.cy-row`), tab lists |
| Small elements | `rounded-lg` | `calc(var(--radius) - 2px)` = 14px | Internal elements within cards, image thumbnails |

> The tailwind config sets `rounded-lg = var(--radius)` = 16px, `rounded-md = 14px`, `rounded-sm = 12px`. These override Tailwind defaults, meaning **even `rounded-lg` is very rounded**. There are no sharp corners in this system.

**Zero border policy enforcement:** `.cy-card` definition in `index.css`:
```css
.cy-card {
  @apply bg-card rounded-2xl shadow-[var(--shadow-soft)] transition-all duration-200;
}
```
No `border` class. No `ring`. No `divide`. Shadow does all the work.

---

## Core Component Specifications

### `.cy-card` — Primary Container
```css
bg-card rounded-2xl shadow-[var(--shadow-soft)] transition-all duration-200
```
- White in light mode, dark navy (`hsl(222 22% 11%)`) in dark mode
- No border class — shadow creates elevation
- `transition-all duration-200` for hover state transitions
- Elevated variant: `.cy-card-elevated` → `shadow-[var(--shadow-elevated)]`

### `.cy-stat` — Stat Card
```css
cy-card p-6 flex flex-col gap-1
```
- Inherits `.cy-card`
- Inner structure: `<span>` label (xs, uppercase, muted) + `<span>` value (display font, 3xl, extrabold) + optional hint
- `tone="gold"` applies `cy-gradient-text` (teal gradient) to value — will become lemony yellow when `--warning` token is wired to it

### `.cy-chip` — Category/Tag Chip
```css
inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-primary/10 text-primary transition-colors
```
- Teal background at 10% opacity + teal text
- Used for: category labels ("beauty", "fashion"), niche tags
- Pill-shaped (`rounded-full`)

### `.cy-row` — List Item Row
```css
p-4 rounded-xl hover:bg-surface-2 dark:hover:bg-surface transition-colors
```
- No border between rows — space between rows is the separator
- Hover reveals background color change (off-white → slightly more tinted)

### `<StatusPill>` — Status Badge
```css
inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize tracking-wide
```
Color mapping (background at 10% opacity + matching text):

| Status | Background | Text |
|---|---|---|
| `open`, `completed` | `bg-teal-500/10` | `text-teal-600 dark:text-teal-400` |
| `accepted`, `approved`, `paid`, `active` | `bg-emerald-500/10` | `text-emerald-600 dark:text-emerald-400` |
| `draft`, `cancelled` | `bg-neutral-500/10` | `text-neutral-600 dark:text-neutral-400` |
| `pending`, `submitted`, `review`, `revision_requested`, `creator_payout_pending` | `bg-amber-500/10` | `text-amber-600 dark:text-amber-400` |
| `payment_initiated` | `bg-blue-500/10` | `text-blue-600 dark:text-blue-400` |
| `rejected`, `failed` | `bg-rose-500/10` | `text-rose-600 dark:text-rose-400` |

### `<PageHeader>` — Page Title Block
```tsx
// motion.div: initial opacity:0 y:6 → animate opacity:1 y:0, duration:0.3
<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
  <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
  <p className="text-muted-foreground text-sm mt-1">
  {action} // right-aligned CTA slot
```

### Buttons
All buttons use `rounded-xl`. No exceptions.

| Variant | Classes | Usage |
|---|---|---|
| Primary CTA | `bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-5 shadow-sm` | Create, Publish, Accept, Approve, Submit |
| Auth button | `bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl` | Sign in, Continue (dark charcoal button) |
| Ghost | `variant="ghost" rounded-xl` | Secondary actions, Cancel |
| Ghost destructive | `variant="ghost" rounded-xl hover:bg-rose-500/10 hover:text-rose-600` | Reject, Suspend |
| Confirm destructive | `bg-rose-600 hover:bg-rose-700 text-white rounded-xl` | Confirm suspension |
| Loading state | Same as primary, `disabled`, text replaced with "Creating..." / "Submitting..." or `<Loader2 className="animate-spin" />` |

### Inputs & Selects
All use this base class pattern:
```
rounded-xl h-11 bg-surface-2 dark:bg-surface border-0 focus-visible:ring-teal-500
```
- `border-0` — no visible border
- `bg-surface-2` / `dark:bg-surface` — slightly tinted background creates form field shape without a line
- `h-11` (44px) — comfortable touch target
- Focus: teal ring only, no border change
- Textarea: same but no `h-11`, explicit `rows` prop
- Select trigger: same class pattern

---

## Login Page Design Specification (The Source of Truth)

The Login page (`Login.tsx`) establishes the master aesthetic. Every other page inherits from this reference.

### Layout
Two-column split, `min-h-screen grid md:grid-cols-2 bg-background`:

**Left Panel (desktop only, `hidden md:flex`):**
- Background: `bg-secondary` = dark charcoal `hsl(220 18% 16%)`
- Text: `text-secondary-foreground` = off-white
- Contains:
  - Logo (top, `tone="light"`)
  - Marketing copy (bottom, z-10): `font-display text-3xl font-bold` headline + `text-secondary-foreground/70` subtext paragraph
  - Decorative blur circle: `absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-gold opacity-30 blur-3xl` — a soft, glowing orb in the bottom-right corner creating warmth and depth without a border

**Right Panel:**
- Background: inherits `bg-background` = white / dark-navy
- `flex items-center justify-center p-6 md:p-10`
- Content constrained to `max-w-md`
- Contains:
  - Logo (mobile only — hidden on desktop because desktop sees left panel logo)
  - `h1` — "Sign in" (`font-display text-2xl font-bold`)
  - Subtext: "Welcome back to CreatorYard." (`text-muted-foreground text-sm mt-1`)
  - Form with `space-y-4 mt-6`:
    - Email `<Label>` + `<Input>` (email, autocomplete=email, placeholder "you@brand.co")
    - Password row: `flex items-center justify-between` with "Password" label left + "Forgot password?" right (xs, muted, underline on hover)
    - Password `<Input>` (password, autocomplete=current-password, placeholder "••••••••")
    - Submit button: `w-full bg-secondary text-secondary-foreground hover:bg-secondary/90` — the full-width dark button
    - Loading: `<Loader2 className="h-4 w-4 animate-spin" />` replaces text
  - Footer: "No account? Create one" (`text-sm text-muted-foreground` + `font-medium` link to `/signup`)

### What This Tells Us About the Design System
From studying the login page specifically:
1. **The CTA button on auth pages is dark** (`bg-secondary` = charcoal), not teal. Teal is used for app-internal CTAs (dashboard, campaigns, etc.) but the auth flow uses the secondary dark aesthetic.
2. **No card wrapping the form** — the form sits directly on the white/dark background with no card shadow around it. The form IS the page.
3. **The left panel is the only place the dark charcoal `--secondary` color appears as a full surface.** Everywhere else in the app it's white/off-white (light) or navy (dark).
4. **The decorative glow orb** (blurred gradient circle) is the only decorative element. It is not a border, not a line, not a shape — it is light.
5. **Labels use `font-semibold text-sm`** — this is the standard throughout.
6. **Link inline with label** (Forgot password?) is `text-xs text-muted-foreground` at rest, `hover:text-foreground underline-offset-4 hover:underline` on hover.

---

## Signup Page Design Specification

Same two-column layout as login. Left panel: "Set up your workspace in under a minute."

### Three-State Flow
Managed by `step` + `pendingEmail` state. All three states render in the same right panel (`max-w-md`, centered):

**State 1: Role Selection (`step === "role"`)**
- Heading: "Create your account" (`font-display text-2xl font-bold`)
- Subtext: "Pick how you want to use CreatorYard." (sm, muted)
- Role card grid (`grid grid-cols-2 gap-3 mt-6`):
  - Each card: `text-left rounded-xl border p-5 transition-all`
  - **Selected card**: `border-primary bg-primary/5 shadow-soft` — teal border + teal tinted background + soft shadow
  - **Unselected card**: `border-border hover:border-primary/40` — subtle border, 40% teal on hover
  - > **Note:** This is the ONLY place in the app where cards have a visible border by design — it is used intentionally as a selection indicator, not as a structural separator. The selection state communicates which role is chosen.
  - Inside card: Icon (6×6, teal when selected / muted otherwise) + bold title + xs muted description
- "Continue as Brand/Creator" button (dark `bg-secondary` button)
- "Already have an account? Sign in" link (sm, muted)

**State 2: Registration Form (`step === "form"`)**
- Back button: "← Change role" (sm, muted, hover foreground)
- Role-specific heading: "Brand account" / "Creator account"
- Role-specific subtext
- Form with `space-y-3`:
  - All inputs: standard pattern (`rounded-xl h-11` etc)
  - Grid layouts for paired fields (`grid grid-cols-2 gap-3`)
  - Select dropdowns: `rounded-xl` trigger, all categories and countries as options
  - Submit button: `w-full bg-secondary text-secondary-foreground`
  - Footer: Terms + Privacy links (11px text, center, underlined links)

**State 3: Email Verification (`pendingEmail !== null`)**
- `text-center py-10`
- `MailCheck` icon in `bg-primary/10 rounded-full` circle — teal-tinted circle, teal icon
- "Verify your email" heading
- Message with email address bolded
- "Go to sign in" → `/login` button (default primary button)
- "Didn't get it? Check your spam folder." (xs, muted)

---

## Lemony Yellow — Specification

`hsl(38 92% 50%)` — a warm, saturated amber-yellow. Think: lemon zest, saffron, sunrise. Not pastel, not neon.

**Where it is used / will be used:**
- `tone="gold"` on `<Stat>` components — financial highlight numbers (Lifetime Earnings, Total Allocated)
- The decorative glow orb on the auth left panel: `bg-gradient-gold opacity-30 blur-3xl` — this warmth is the yellow showing through the teal
- Future: `bg-yellow-400/10 text-yellow-600 dark:text-yellow-400` for premium badges or pricing labels

**Where it is NEVER used:**
- Buttons (buttons are teal or dark charcoal)
- Navigation (teal only)
- Status pills (those have their own semantic color system)
- Text (only used in large display numbers or as background tint)

**Tailwind classes to use:**
- Text: `text-yellow-500 dark:text-yellow-400`
- Background tint: `bg-yellow-400/10`
- Gradient (replacing bg-gradient-gold): `background: linear-gradient(135deg, hsl(38 92% 50%), hsl(44 95% 55%))`

---

## Animation & Motion System

### Philosophy
Animations serve the user's spatial understanding, not aesthetics. Every animation either:
- Confirms a state change (toast, button loading)
- Communicates location (page transition, nav indicator)
- Reveals content without jarring the eye (stagger fade)

### Page Transitions (`PageTransition.tsx`)
Applied to `<Outlet>` in `AppShell.tsx` via `<PageTransition>` wrapper:
```js
initial: { opacity: 0, y: 8 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.3 } // 300ms
```

### `<PageHeader>` Entrance
```js
initial={{ opacity: 0, y: 6 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}
```

### `<Stat>` Card Entrance
```js
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
whileHover={{ y: -2 }}
```
Hover lift `-2px` + `hover:shadow-elevated` gives the card a physical presence.

### List Item Stagger
Campaign cards, application rows, creator cards — each animates in with index-based delay:
```js
initial={{ opacity: 0, y: 6 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: i * 0.04 }} // 40ms per item
```

### Campaign Card Hover Lift
```js
whileHover={{ y: -3 }}
```
Gives cards a slight float on hover, suggesting they're interactive.

### Active Nav Indicator (Desktop Sidebar)
```jsx
<motion.span
  layoutId="active-pill"
  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-teal-600 dark:bg-teal-400"
  transition={{ type: "spring", stiffness: 380, damping: 30 }}
/>
```
A 4px wide teal bar springs between active nav items. `layoutId` ensures it animates as one shared element.

### Onboarding Progress Bar
```js
initial={{ width: 0 }}
animate={{ width: `${(completedCount / steps.length) * 100}%` }}
transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
```
Teal gradient fill, animated from 0 on mount.

### Auth Page Hero Text
```js
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
```

---

## Dark / Light Mode

### Toggle
`ThemeToggle.tsx` — button with sun/moon icon. Toggles `dark` class on `<html>`, persists to `localStorage`.

### Implementation
- `initTheme()` reads `localStorage("yard-theme")` first → falls back to `prefers-color-scheme`
- All dark variants use Tailwind `dark:` prefix
- CSS variables swap entirely between `:root` and `.dark` definitions in `index.css`
- **No media query-based dark mode** — always class-driven for user control

### Key Dark Mode Pairs in Use
| Light | Dark | Element |
|---|---|---|
| `bg-surface-2` | `dark:bg-surface` | Input fields |
| `text-teal-600` | `dark:text-teal-400` | Teal accent text (brighter in dark for contrast) |
| `text-emerald-600` | `dark:text-emerald-400` | Status "accepted/paid" |
| `text-amber-600` | `dark:text-amber-400` | Status "pending/submitted" |
| `bg-card` (white) | `dark:bg-card` (navy `#0e1320`) | Card surfaces |

---

## Navigation Design

### Desktop Sidebar (≥ md breakpoint)
Source: `AppShell.tsx`

```
<aside className="hidden md:flex w-64 shrink-0 flex-col bg-card shadow-sm">
```
- `w-64` = 256px
- `bg-card` = white (light) / dark navy (dark)
- `shadow-sm` = very subtle right-side shadow separating sidebar from content
- **No border between sidebar and content** — shadow only

Top area: `px-6 py-6`
- `<Logo>` — image asset (light/dark variant auto-selected via `useTheme()`)
- Role label: `mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground`

Nav area: `flex-1 px-3 py-4 space-y-1.5`
Each `<NavLink>`:
```
group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200
```
- Active: `bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold shadow-sm`
- Inactive: `text-muted-foreground hover:bg-surface-2 hover:text-foreground`
- Active indicator: Framer Motion `<motion.span layoutId="active-pill">` — 4px wide, teal, rounded right edge, absolute positioned left edge of the link

User panel (bottom): `p-4 m-3 bg-surface-2 dark:bg-surface rounded-2xl`
- Avatar initial circle: `h-9 w-9 rounded-xl bg-gradient-teal text-white`
- Name: `text-sm font-bold truncate text-foreground`
- Email: `text-xs text-muted-foreground truncate`
- Sign out: icon button (`LogOut` lucide icon), muted → foreground on hover

### Mobile Top Bar (< md breakpoint)
```
fixed top-0 inset-x-0 z-40 bg-card/90 backdrop-blur shadow-sm pt-safe
```
- `bg-card/90` = 90% opaque white/navy + backdrop blur
- `pt-safe` = `env(safe-area-inset-top)` — iPhone notch safe
- Content: `flex items-center justify-between px-4 py-3`
  - Logo (size="sm", `h-6`)
  - Right cluster: `ThemeToggle` + `NotificationsBell` + `LogOut` ghost button

### Mobile Bottom Tab Navigation (< md breakpoint)
```
md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md shadow-elevated border-t border-border/40 pb-safe
```
- `bg-card/95` = 95% opaque card background + aggressive blur
- `shadow-elevated` = prominent shadow above the bar
- `border-t border-border/40` — very faint top line (40% opacity border = barely visible)
- `pb-safe` = home indicator safe area
- Tabs: `flex items-center justify-around px-2 py-2`
  - Each tab: `flex flex-col items-center justify-center py-1 px-2 rounded-xl min-w-[56px]`
  - Icon in `p-1 rounded-xl` div (active: `bg-teal-500/10`)
  - Label: first word only, `text-[10px] mt-0.5 tracking-tight truncate max-w-[70px]`
  - Active: `text-teal-600 dark:text-teal-400 font-bold`
  - Inactive: `text-muted-foreground hover:text-foreground`

### Page Content Clearance (Mobile)
```
main: pt-16 pb-24 (mobile) / md:pt-0 md:pb-8 (desktop)
```
- `pt-16` = 64px clears the fixed top bar
- `pb-24` = 96px clears the fixed bottom tab bar

---

## Logo System

Source: `Logo.tsx` — the logo is an **image asset**, not SVG code.

| Mode | Asset |
|---|---|
| Light mode | `/brand/yard_main_logo_whitebg.png` (wordmark) / `/brand/yard_icon_whitebg.png` (icon only) |
| Dark mode | `/brand/yard_main_logo_blackbg.png` (wordmark) / `/brand/yard_icon_blackbg.png` (icon only) |

Selected automatically via `useTheme()` — no manual `tone` prop needed. Icon variant uses `rounded-xl shadow-sm`.

---

## Accessibility

- All `<Input>` components have associated `<Label htmlFor>` — always
- Icon-only buttons (sign out, theme toggle, notifications): `aria-label` attribute required
- Focus rings: teal, visible in both modes via `--ring` token
- Color is never the sole status indicator — every `<StatusPill>` includes text (`status.replace(/_/g, " ")`)
- Form autocomplete attributes always present (`email`, `new-password`, `current-password`, `name`, `tel`, `organization`, `address-level2`)
- `-webkit-tap-highlight-color: transparent` set globally — removes the mobile blue tap flash
- `touch-action: manipulation` set globally — removes the 300ms tap delay on mobile

---

## What Was Wrong in the Previous Document (Changes Made)

The previous Document 04 contained several errors now corrected:

| Previous Incorrect Statement | Correct Reality |
|---|---|
| "Design system derives from all pages" | Design system derives from Login.tsx and Signup.tsx only. All other pages inherit from these. |
| "`.cy-card` has `border border-border/40`" | `.cy-card` has NO border class. Only `shadow-[var(--shadow-soft)]`. |
| "border-0 on inputs is the exception" | `border-0` is the rule. Zero border policy. Input shape comes from `bg-surface-2` contrast. |
| "Gold = warm yellow-orange gradient" | Gold currently aliases to teal gradient in `index.css`. Lemony yellow (`--warning`) is being introduced separately. |
| "Display font is Inter" | Display font is **Fraunces** (serif-variable). Body is Inter Tight. Numbers are JetBrains Mono. |
| "`--radius: 8px` throughout" | `--radius: 1rem` = 16px. Tailwind `rounded-xl` = 12px, `rounded-2xl` = 24px. |
| "Auth button is teal" | Auth page buttons are dark charcoal (`bg-secondary`). Teal buttons are in-app only. |
| "Logo is SVG code" | Logo is a `.png` image asset, selected by theme. |
