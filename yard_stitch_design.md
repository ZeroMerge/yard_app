# Yard — Stitch Design System Brief
## Generative UI Reference Document

> This document is the single source of truth for every screen Stitch generates for the Yard platform.
> Study it before producing any component. Every rule here comes from the actual codebase (Login.tsx, index.css, tailwind.config.ts) synthesised with the four reference brands below.

---

## Reference Brand Weights

| Brand | Weight | What to Take From It |
|---|---|---|
| **Stripe** | **40%** | Layout discipline, information hierarchy, confident whitespace, how data-dense UI stays breathable, stat display, table/ledger patterns, how sections separate without borders |
| **Brilliant** | **30%** | Rounded-everything philosophy, card-as-container pattern, educational card grids, clean two-column layouts, how dark panels co-exist with white panels on the same page, warm accent colours on neutral backgrounds |
| **Gumloop** | **20%** | Node/connection UI vocabulary, toolbar and sidebar patterns, how to make a functional tool feel premium, light-on-dark accent glow effects |
| **Cohere** | **10%** | Gradient mesh background treatments, how to use a single vivid accent on a near-neutral surface without it feeling garish |

---

## 1. The Three Laws (Never Break These)

1. **Zero visible borders between surfaces.** No `border` class used for structural separation. Shadow and background contrast do all the work. The only permitted border is a `border-border/50` global reset that renders at near-invisible opacity — it is not a design element.

2. **Everything is aggressively rounded.** There are no square corners in this system. The base radius token is `1rem` (16px). From there it only goes up (`rounded-xl` = 12px for smaller elements, `rounded-2xl` = 24px for cards, `rounded-full` for pills). If Stitch generates a rectangle with a sharp corner, it is wrong.

3. **Teal is the one interactive color.** Every button, active state, focus ring, progress bar, link, and highlight uses teal `#0D9488`. The only permitted secondary accent is **lemony yellow** (`hsl(38 92% 50%)`) used exclusively for financial/value display. Yellow never appears on interactive elements. Nothing else competes with these two.

---

## 2. Color Palette

### Core Semantic Tokens

```
Primary Teal:      hsl(173 80% 36%)   → #0D9488
Primary Teal (dk): hsl(173 75% 46%)   → brighter in dark mode
Lemony Yellow:     hsl(38  92% 50%)   → financial highlights only
Charcoal Dark:     hsl(220 18% 16%)   → auth panels, dark mode surfaces

Background (lt):   hsl(0   0%  100%)  → pure white
Background (dk):   hsl(222 24%  8%)   → near-black navy
Surface (lt):      hsl(210 20%  98%)  → off-white page bg
Surface-2 (lt):    hsl(210 25%  96%)  → input fields, nested panels, row hover
Surface (dk):      hsl(222 22%  11%)  → dark card bg
Surface-2 (dk):    hsl(222 20%  14%)  → dark input bg

Text primary:      hsl(220 20%  14%)  → near-black (light mode)
Text primary (dk): hsl(0   0%   98%)  → off-white (dark mode)
Text muted:        hsl(220 10%  46%)  → captions, labels, timestamps
Text muted (dk):   hsl(220 12%  68%)  → dark mode captions

Destructive:       hsl(0   72%  51%)  → red — errors and delete actions
Success:           hsl(152 68%  38%)  → emerald green
Warning/Yellow:    hsl(38  92%  50%)  → lemony yellow, value display only
```

### Teal Usage — Exact Classes
```
CTA button bg:         bg-teal-600 hover:bg-teal-700
Active nav:            bg-teal-500/10 text-teal-600 dark:text-teal-400
Active nav indicator:  bg-teal-600 dark:bg-teal-400 (4px left bar)
Icon accents:          text-teal-600 dark:text-teal-400
Input focus ring:      focus-visible:ring-teal-500
Chip/tag bg:           bg-primary/10 text-primary
Progress bar:          bg-gradient-teal (linear 135deg teal → teal-light)
Avatar initials bg:    bg-gradient-teal text-white
Status "open":         bg-teal-500/10 text-teal-600 dark:text-teal-400
Gradient text (stat):  cy-gradient-text (from-teal-600 via-teal-500 to-emerald-500)
```

### Yellow Usage — Exact Classes
```
Financial stat value:  text-yellow-500 dark:text-yellow-400
Stat bg tint:          bg-yellow-400/10
Glow orb decoration:   bg-gradient-gold opacity-30 blur-3xl
```

### Status Color Map (StatusPill component)
```
open, completed         → bg-teal-500/10    text-teal-600 dark:text-teal-400
accepted, approved,
paid, active            → bg-emerald-500/10 text-emerald-600 dark:text-emerald-400
pending, submitted,
review, revision,
creator_payout_pending  → bg-amber-500/10   text-amber-600 dark:text-amber-400
payment_initiated       → bg-blue-500/10    text-blue-600 dark:text-blue-400
rejected, failed        → bg-rose-500/10    text-rose-600 dark:text-rose-400
draft, cancelled        → bg-neutral-500/10 text-neutral-600 dark:text-neutral-400
```

---

## 3. Border Radius — The Most Important Section

> **Stripe influence (40%):** Stripe uses a precise, consistent radius — never decorative, always structural. Every surface radius communicates its hierarchy level.
> **Brilliant influence (30%):** Brilliant rounds everything generously — cards feel soft, safe, and contained. Content lives inside pillowy containers.

### Radius Token Map

```
Base token:   --radius: 1rem  (16px)
```

| Element Type | Class | Pixels | Examples |
|---|---|---|---|
| Pills, badges, tags, toggles | `rounded-full` | 9999px | StatusPill, cy-chip, tab indicators |
| Primary cards and containers | `rounded-2xl` | 24px | cy-card, Dialogs, Sheets, role-selection cards, Drawers |
| Buttons | `rounded-xl` | 12px | ALL buttons without exception |
| Input fields | `rounded-xl` | 12px | text inputs, textareas, select triggers |
| Nav links | `rounded-xl` | 12px | sidebar nav items, bottom tab items |
| Row hover area | `rounded-xl` | 12px | cy-row, list items |
| Avatar/initials | `rounded-xl` or `rounded-2xl` | 12–24px | user avatar squares, icon containers |
| Tab list container | `rounded-2xl` | 24px | Tabs wrapping element |
| Individual tabs | `rounded-xl` | 12px | each TabsTrigger |
| Small icon bg | `rounded-lg` | ~14px | icon chip backgrounds |
| Logo icon | `rounded-xl` | 12px | icon-only logo variant |

### Rules Derived From References

**From Stripe:** Every container at every nesting level has a radius. Even a sub-panel inside a card has `rounded-xl`. Radius is not just for the outermost layer — it applies recursively.

**From Brilliant:** The card is the unit of composition. Individual cards have `rounded-2xl` and cast `shadow-soft`. Hovering a card increases its shadow to `shadow-elevated` — no border change, no color change, only shadow depth.

**From Gumloop:** Toolbars and action bars are `rounded-2xl` pill-containers, not rectangular strips. Even a search bar gets `rounded-xl` treatment.

**From Cohere:** When a gradient mesh or radial glow is used as a background decoration, it sits in a `rounded-2xl` clipping container and uses `overflow-hidden`. The gradient never bleeds past a rounded edge.

### What Is NEVER Acceptable
```
❌ rounded-none    — no square corners, ever
❌ rounded-sm      — too small, feels accidental  
❌ No radius at all — always specify a radius class
❌ rounded-md on cards — too small for a card-level element
```

---

## 4. Shadow System (Replaces Borders Entirely)

```
shadow-soft:     0 2px 14px -2px rgba(0,0,0,0.04), 0 0 1px rgba(0,0,0,0.04)
shadow-elevated: 0 12px 36px -8px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)
shadow-teal:     0 10px 30px -8px hsl(173 80% 36% / 0.35)

dark shadow-soft:     0 4px 20px -2px rgba(0,0,0,0.45)
dark shadow-elevated: 0 16px 40px -8px rgba(0,0,0,0.60)
```

### Usage Rules

| State | Shadow |
|---|---|
| Card at rest | `shadow-soft` |
| Card on hover | `shadow-elevated` (transition: all 200ms) |
| Dialog/Modal | `shadow-elevated` always |
| Sidebar | `shadow-sm` (standard Tailwind, softer separation) |
| Mobile bottom nav | `shadow-elevated` (prominent, floats above content) |
| Teal CTA button | `shadow-sm` at rest, consider `shadow-teal` on hover for hero CTAs |
| Input field | No shadow — background contrast does the work |

---

## 5. Typography System

### Font Stack
```
Display / Headings: Fraunces (variable serif, expressive)
                    → fallback: 'Inter Tight', serif
Body / UI:          'Inter Tight' → Inter → system-ui → sans-serif
Numeric / Mono:     'JetBrains Mono' → ui-monospace → monospace
```

> **Stripe influence:** Stripe uses a system sans-serif with aggressive tracking-tight on headings and extreme weight contrast (light body, extrabold display). Apply the same: regular weight for body, extrabold for stats and titles.
> **Brilliant influence:** Brilliant uses a slightly humanist serif for hero headings, creating warmth in what could otherwise be a cold dashboard. Fraunces fills this role for Yard — use it for all `<h1>–<h3>` and stat numbers.

### Global Heading Rules
```css
h1, h2, h3, h4 {
  font-family: 'Fraunces', 'Inter Tight', serif;
  letter-spacing: -0.025em;  /* tracking-tight */
  font-weight: 700;
}
```

### Type Scale

| Element | Size | Weight | Tracking | Class |
|---|---|---|---|---|
| Page title | text-2xl / text-3xl | 800 (extrabold) | -0.025em | `font-display text-2xl md:text-3xl font-extrabold tracking-tight` |
| Section heading | text-xl | 700 (bold) | -0.025em | `font-display text-xl font-bold` |
| Card heading | text-lg | 700 | -0.025em | `font-display text-lg font-bold` |
| Stat number | text-2xl / text-3xl | 800 | -0.025em | `font-display text-2xl md:text-3xl font-extrabold` |
| Campaign/item name | text-lg | 700 | -0.025em | `font-display text-lg font-bold` |
| Budget/money | text-sm / text-base | 800 | 0 | `font-display font-extrabold` |
| Body paragraph | text-sm | 400 | 0 | `text-sm text-foreground` |
| Muted caption | text-xs | 500 | 0 | `text-xs text-muted-foreground font-medium` |
| Input label | text-sm | 600 | 0 | `text-sm font-semibold` |
| Button text | text-sm | 600 | 0 | `font-semibold` |
| Status pill | text-xs | 600 | +0.025em | `text-xs font-semibold capitalize tracking-wide` |
| Stat label | text-xs | 600 | +0.05em | `text-xs font-semibold uppercase tracking-wider text-muted-foreground` |
| Navigation label | text-sm | 500 / 600 active | 0 | `text-sm font-medium` |
| Mono/IDs | text-xs | 700 | 0 | `font-mono text-xs font-bold` |

---

## 6. Spacing & Layout

### Page Layout
```
Max content width:   max-w-6xl (desktop workspace pages)
Admin console max:   max-w-7xl
Horizontal padding:  px-4 (mobile) / px-8 (desktop)
Vertical padding:    py-4 (mobile) / py-8 (desktop)
```

### Grid Patterns (from Stripe's discipline)

**Stripe influence:** Stripe never uses more than 4 columns of equal-width content. Information hierarchy comes from column-span ratios (2:1, 3:1) not more columns. Apply the same ratio-thinking.

```
Stat row:            grid-cols-2 md:grid-cols-4  gap-4
Campaign cards:      grid-cols-1 md:grid-cols-2  gap-5
Creator cards:       grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-5
Form rows:           grid-cols-1 sm:grid-cols-2 or sm:grid-cols-3  gap-4
Dashboard split:     lg:grid-cols-3  (main: lg:col-span-2, side: 1 col)
Quick actions:       grid-cols-1 sm:grid-cols-3  gap-4
```

### Internal Spacing

| Context | Gap/Padding | Class |
|---|---|---|
| Card padding (standard) | 24px | `p-6` |
| Card padding (form) | 32px | `p-8` |
| Card padding (compact) | 20px | `p-5` |
| Card padding (list container) | 24px | `p-6` |
| List item row | 16px all sides | `p-4` |
| Nav link | 10px vertical, 14px horizontal | `py-2.5 px-3.5` |
| Between stat label and value | 6px | `gap-1.5` |
| Between form groups | 24px | `space-y-6` |
| Between form fields | 8px | `space-y-2` |
| Between list rows | none (spacing comes from row padding + hover bg) | `space-y-0` or `space-y-1` |
| Between sections on page | 24–32px | `mt-6` / `mt-8` |
| PageHeader bottom | 32px | `mb-8` |

### Brilliant-Influenced Composition Rule
Cards group related content. A section of the page = a card. You do not mix content from different semantic domains into one card. Campaign info lives in one card. Payment info lives in another. The card boundary IS the concept boundary.

---

## 7. Component Anatomy

### `.cy-card` — The Primary Surface
```css
bg-card          /* white (light) or dark-navy hsl(222 22% 11%) */
rounded-2xl      /* 24px — always */
shadow-soft      /* shadow only, never border */
transition-all   /* 200ms for hover state */
duration-200
```
Hover state (interactive cards): `hover:shadow-elevated`
No border class. Never.

### `.cy-row` — List/Table Row
```css
p-4              /* 16px padding all sides */
rounded-xl       /* 12px — rows are also rounded */
hover:bg-surface-2 dark:hover:bg-surface
transition-colors
```
Rows are separated by **spacing alone** — no divider lines between rows.

### `.cy-chip` — Category/Tag
```css
inline-flex items-center gap-1.5
rounded-full     /* full pill */
px-3 py-1
text-xs font-semibold
bg-primary/10    /* teal at 10% opacity */
text-primary     /* teal text */
transition-colors
```

### `.cy-stat` — KPI Card
```
cy-card p-6 flex flex-col gap-1.5
```
Structure:
```
<span>  LABEL TEXT (xs, semibold, uppercase, wider tracking, muted-foreground)
<span>  VALUE NUMBER (display font, 2xl-3xl, extrabold, foreground or gradient)
<span>  hint text (xs, muted/80, optional)
```
`tone="gold"` → value gets `cy-gradient-text` (teal gradient) → will become lemony yellow

### `<StatusPill>`
```css
inline-flex items-center
rounded-full     /* full pill — never rounded-xl or less */
px-3 py-1
text-xs font-semibold capitalize tracking-wide
```
+ status-specific color (see color map above)

### Buttons
All buttons: `rounded-xl` — not rounded-full, not rounded-lg, not rounded-2xl. `rounded-xl` only.

```
Primary CTA:
  bg-teal-600 hover:bg-teal-700
  text-white font-semibold
  rounded-xl px-5
  shadow-sm
  transition-colors

Auth CTA (dark):
  bg-secondary text-secondary-foreground hover:bg-secondary/90
  rounded-xl w-full
  (used only on login/signup pages)

Ghost secondary:
  variant="ghost" rounded-xl

Ghost destructive:
  variant="ghost" rounded-xl
  hover:bg-rose-500/10 hover:text-rose-600

Destructive confirm:
  bg-rose-600 hover:bg-rose-700 text-white rounded-xl

Loading state:
  disabled + text → "Creating..." / "Submitting..."
  OR disabled + <Loader2 className="h-4 w-4 animate-spin" />
```

### Inputs & Selects
```css
rounded-xl       /* 12px — same as buttons */
h-11             /* 44px height — comfortable touch target */
bg-surface-2 dark:bg-surface  /* color-contrast shape, no border */
border-0         /* explicit zero border */
focus-visible:ring-teal-500  /* teal focus ring only */
```
Textarea: same minus `h-11`, explicit `rows` attribute.
Select trigger: same class pattern.
All inputs have `<Label htmlFor>` always.

### Dialog (Modal)
```css
rounded-2xl      /* 24px — card level */
border-0         /* no border */
shadow-elevated  /* prominent shadow */
```
Title: `font-display text-xl font-bold`
Footer: right-aligned button row

### Tabs
```
TabsList:    bg-surface-2 dark:bg-surface p-1 rounded-2xl border-0
TabsTrigger: rounded-xl (each individual tab)
```

---

## 8. Layout Patterns by Page Type

### Auth Pages (Login / Signup)
```
Learned from: Stripe (40%) — confidence, restraint on the right panel
              Brilliant (30%) — dark left panel warmth

Layout: min-h-screen grid md:grid-cols-2

LEFT PANEL (desktop only, hidden mobile):
  bg-secondary (charcoal dark)
  text-secondary-foreground
  flex flex-col justify-between p-10
  → Logo top
  → Marketing headline (font-display text-3xl font-bold) + subtext, bottom
  → Decorative glow orb: absolute -bottom-32 -right-32 h-96 w-96
    rounded-full bg-gradient-gold opacity-30 blur-3xl
    (Stripe-style: one ambient decoration, not multiple)

RIGHT PANEL:
  flex items-center justify-center p-6 md:p-10
  → max-w-md form content
  → No card wrapping — form is directly on background
  → Auth button: dark (bg-secondary), not teal
```

### Dashboard Pages
```
Learned from: Stripe (40%) — stat row at top, preview list below
              Brilliant (30%) — card grid composition

Structure (top → bottom):
1. PageHeader (motion.div fade-in, h1 + optional subtitle + CTA slot)
2. Stat row: grid-cols-2 md:grid-cols-4 gap-4
3. Quick action cards OR feature content (mt-6)
4. Main content split: lg:grid-cols-3 gap-6 mt-8
   - Primary content: lg:col-span-2 cy-card
   - Sidebar panel: 1-col cy-card
```

### List / Marketplace Pages
```
Learned from: Stripe (40%) — clean card grid, no clutter
              Brilliant (30%) — hover lift, card as discovery unit

Structure:
1. PageHeader
2. Optional filter bar (cy-card p-4, grid with inputs)
3. Card grid (md:grid-cols-2 or lg:grid-cols-3, gap-5)

Each card:
  cy-card p-6 block hover:shadow-elevated transition-all group
  → Top: chip (left) + status pill (right)
  → Name (font-display, hover:text-teal-600 dark:hover:text-teal-400)
  → Metadata (xs, muted)
  → Brief excerpt (sm, muted, line-clamp-3)
  → Bottom border-t border-border/30: budget (extrabold) + CTA

Motion: initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
        delay: i * 0.04 per card
        whileHover={{ y:-3 }}
```

### Detail / Tabbed Pages
```
Learned from: Stripe (40%) — tabs that feel like sub-navigation, not buttons

Structure:
1. Back link (sm, muted, ← arrow)
2. PageHeader (name + metadata + action buttons in action slot)
3. Stat row (4 columns)
4. Tabs (rounded-2xl container, rounded-xl individual tabs)
5. Tab content: cy-card p-6 per tab (one card per tab, not multiple)
```

### Form Pages
```
Learned from: Stripe (40%) — single-column, max-w-3xl, clear visual flow

Structure:
1. PageHeader
2. cy-card p-8 max-w-3xl form container
   → Form groups: space-y-6
   → Each field: Label + Input (space-y-2)
   → Field rows: grid sm:grid-cols-2 gap-4 or grid sm:grid-cols-3 gap-4
   → Footer (pt-4 border-t border-border/30):
     [Cancel] ghost + [Primary Action] teal, right-aligned (flex justify-end)
```

### Admin Console (Standalone)
```
Learned from: Stripe (40%) — full-page admin dashboard, no sidebar

Structure (no AppShell — own layout):
1. Header: bg-card shadow-sm, max-w-7xl, h-16
   Logo + badge | spacer | email + logout
2. main: max-w-7xl px-8 py-8
3. Stat row: grid-cols-2 md:grid-cols-4
4. Action bar: heading + button cluster (right)
5. Audit table: cy-card p-6, cy-row rows
```

---

## 9. Navigation System

### Desktop Sidebar
```
w-64 shrink-0 bg-card
shadow-sm (right-side only)
NO border-r — shadow separates from content
flex flex-col

Top: px-6 py-6 → Logo + role label (11px, uppercase, wider, muted)
Nav: flex-1 px-3 py-4 space-y-1.5
     Each link: rounded-xl px-3.5 py-2.5 text-sm
     Active: bg-teal-500/10 text-teal-600 font-semibold + motion.span (4px teal bar, left edge)
     Inactive: text-muted-foreground hover:bg-surface-2
Bottom: p-4 m-3 bg-surface-2 rounded-2xl
        Avatar (rounded-xl, gradient-teal) + name + email + logout icon
```

### Mobile Top Bar
```
fixed top-0 z-40 bg-card/90 backdrop-blur shadow-sm
pt-safe (notch clearance)
px-4 py-3: Logo sm + [theme] [bell] [logout]
```

### Mobile Bottom Tabs
```
fixed bottom-0 z-40
bg-card/95 backdrop-blur-md shadow-elevated
border-t border-border/40  ← ONLY permitted "border" in the mobile nav
pb-safe (home indicator clearance)

Each tab: rounded-xl, flex-col, icon + truncated label
Active:   text-teal-600, icon bg-teal-500/10 rounded-xl
Inactive: text-muted-foreground
```

---

## 10. Decorative Language

### What Stripe Gives Us (40%)
- **Ambient glow orbs** — single, large, blurred radial gradient circles used as background decoration (not shapes, not elements). Always `absolute`, always `blur-3xl` or `blur-[200px]`, always low opacity (0.12–0.30). They imply light, not geometry.
- **Clean section rhythm** — each section of a page is visually separate through spacing alone. No rule lines, no `<hr>`, no dividers between sections.
- **Data confidence** — numbers are big, bold, and always in the display font. Small supporting context text appears below or beside, never competing.

### What Brilliant Gives Us (30%)
- **The card IS the section** — if content belongs together, it lives in one rounded card. Content from different domains gets its own card. Mixing is forbidden.
- **Warm left panels** — when a dark panel exists alongside a light content area, the dark panel carries personality (texture, glows, headline copy). The light side is clean and functional.
- **Interactive discovery cards** — cards in a browse/marketplace view lift on hover (`y: -3px`), suggesting interactivity through motion, not color change.

### What Gumloop Gives Us (20%)
- **Toolbar pill containers** — action rows and filter bars are contained in their own `cy-card` with `rounded-2xl`, not bare rows.
- **Icon container chips** — icons get their own `rounded-xl` background tint (`bg-teal-500/10`) so they feel anchored, not floating.
- **Functional elegance** — complex tools (forms with many fields, submission dialogs) stay uncluttered because each group is in its own visual zone with breathing room.

### What Cohere Gives Us (10%)
- **Gradient mesh as ambiance** — `--gradient-hero` (dual radial teal glows) applied at page level as a `background` on the main container. It is subtle (opacity 0.12 at most). Pages that feel important get the hero gradient; utility pages do not.
- **Vivid accent, neutral stage** — the one vivid color (teal or yellow) pops because everything around it is pure neutral. Do not add additional colors to "make it interesting." Restraint IS the interesting.

---

## 11. Motion & Animation

```
Page transition:      opacity 0→1, y 8→0, duration 300ms
PageHeader:           opacity 0→1, y 6→0, duration 300ms
Stat card entry:      opacity 0→1, y 8→0, duration 350ms, ease [0.22,1,0.36,1]
Stat card hover:      y -2px (whileHover)
List item stagger:    opacity 0→1, y 6→0, delay: i * 40ms
Campaign card hover:  y -3px (whileHover)
Nav active indicator: spring, stiffness 380, damping 30 (layoutId shared element)
Progress bar fill:    width 0→n%, duration 600ms, ease [0.22,1,0.36,1]
Auth hero text:       opacity 0→1, y 8→0, duration 500ms
```

Rules:
- Animations communicate location or confirm state. Never purely decorative.
- No bounce, no overshoot on non-spring animations.
- `ease: [0.22, 1, 0.36, 1]` is the default easing curve — decelerating, natural.
- Spring physics only for the nav indicator (needs to feel physical and anchored).

---

## 12. Dark Mode

All dark variants use Tailwind `dark:` prefix. Class-driven only — never `@media (prefers-color-scheme)`.

Key pairs always written together in JSX:
```
bg-surface-2   dark:bg-surface      → input fields
text-teal-600  dark:text-teal-400   → all teal accent text
text-emerald-600 dark:text-emerald-400
text-amber-600   dark:text-amber-400
text-rose-600    dark:text-rose-400
bg-card          → auto-switches via CSS variable
bg-card/90       → backdrop elements (mobile bars)
```

Dark mode shadows are significantly deeper (rgba opacity goes from 0.04–0.06 → 0.45–0.60).

---

## 13. Accessibility Baseline

- Every `<input>` and `<textarea>` has `<Label htmlFor>` — no exceptions
- Icon-only interactive elements have `aria-label`
- Focus rings: teal, always visible, never suppressed
- Color is never the sole status indicator — text always accompanies color
- `autocomplete` attributes on all auth form fields
- `touch-action: manipulation` and `-webkit-tap-highlight-color: transparent` globally applied (removes mobile tap delay and flash)

---

## 14. What Stitch Must Never Generate

```
❌ Any border used as a structural separator (only shadow, background contrast, spacing)
❌ Square or sharp corners — EVERYTHING is rounded, minimum rounded-xl for interactive elements
❌ rounded-full on buttons (buttons are rounded-xl, pills are rounded-full)
❌ Multiple accent colors competing — only teal for interaction, only yellow for value
❌ Teal on financial highlights — that's yellow's domain
❌ Yellow on interactive elements — that's teal's domain
❌ Inter as display font — display font is Fraunces
❌ Light-weight or normal-weight heading text — headings are always bold or extrabold
❌ Divider lines or <hr> between list rows — spacing is the divider
❌ Shadow AND border together — pick one (shadow wins every time)
❌ Cards without rounded-2xl — if it's a card, it gets rounded-2xl
❌ Input fields with visible borders — border-0 always, use bg-surface-2 for shape
❌ More than two accent colors — teal + yellow. That's the entire palette for accents.
❌ Decorative elements that are shapes — all decorations are blurred glow orbs (light), never geometric shapes
```

---

## 15. Quick Token Reference Card

```
PRIMARY_TEAL:     #0D9488 / hsl(173 80% 36%)
PRIMARY_TEAL_DK:  hsl(173 75% 46%)
LEMONY_YELLOW:    hsl(38 92% 50%)
CHARCOAL:         hsl(220 18% 16%)
CARD_LIGHT:       #FFFFFF
CARD_DARK:        hsl(222 22% 11%)
SURFACE_LIGHT:    hsl(210 20% 98%)
SURFACE_2_LIGHT:  hsl(210 25% 96%)
SURFACE_DARK:     hsl(222 22% 11%)
SURFACE_2_DARK:   hsl(222 20% 14%)
TEXT_LIGHT:       hsl(220 20% 14%)
TEXT_DARK:        hsl(0 0% 98%)
TEXT_MUTED:       hsl(220 10% 46%)
TEXT_MUTED_DK:    hsl(220 12% 68%)

RADIUS_CARD:      24px  (rounded-2xl)
RADIUS_BUTTON:    12px  (rounded-xl)
RADIUS_INPUT:     12px  (rounded-xl)
RADIUS_PILL:      9999px (rounded-full)
RADIUS_ICON_BG:   12px  (rounded-xl) or 24px (rounded-2xl) for larger containers

SHADOW_SOFT:      0 2px 14px -2px rgba(0,0,0,0.04), 0 0 1px rgba(0,0,0,0.04)
SHADOW_ELEVATED:  0 12px 36px -8px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)
SHADOW_TEAL:      0 10px 30px -8px hsl(173 80% 36% / 0.35)

FONT_DISPLAY:     Fraunces, 'Inter Tight', serif
FONT_BODY:        'Inter Tight', Inter, system-ui, sans-serif
FONT_MONO:        'JetBrains Mono', ui-monospace, monospace
```
