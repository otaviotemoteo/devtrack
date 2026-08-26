# Design System

The visual language and the screen-by-screen brief for DevTrack, a tool that
scans your GitHub activity and turns it into LinkedIn-ready content.

The example strings below came from the original brief, when the interface was
planned in Portuguese. It shipped in English, so read them as intent rather than
as the labels in the code: `app/` and `components/` are the source of truth for
copy.

---

## Global design language

**Vibe:** clean, modern, developer-friendly, trustworthy. Feels like a calm, well-made indie
product — not a corporate dashboard, not a flashy startup landing.

**Palette:** white / off-white backgrounds as the base, with green as the single accent color
(fresh and natural, not neon). One darker green for depth/hover, near-black for text, soft gray
for borders and muted text. Green is used sparingly — for CTAs, progress, active states, accents.

**Typography:** a clean grotesque/geometric sans for UI and body. Headings can use a slightly more
expressive weight/face for personality. Generous line-height, comfortable reading sizes.

**Shape & space:** medium rounded corners, soft and subtle shadows, lots of whitespace. Cards are
the primary container. Nothing cramped.

**Motion:** smooth and restrained. Lenis smooth-scroll on the landing; gentle fade/slide-in reveals
as sections enter; soft micro-interactions on buttons, toggles, and copy actions. No bouncy or
attention-grabbing animation.

**Authenticated shell:** onboarding, scan, and results share a minimal top bar — wordmark on the
left, user avatar + sign-out on the right. The landing and login have their own minimal layouts.

---

## 1. Landing page

**Purpose:** explain the value in seconds and drive one action: sign in with GitHub. Long,
smooth-scrolling page (Lenis).

**Structure (top to bottom):**
- **Minimal nav:** wordmark left, single "Entrar" button right.
- **Hero:** a confident headline (value prop — e.g. *"Turn your GitHub work into a LinkedIn profile that lands"*), a one-line subhead, a primary CTA button
  *"Sign in with GitHub"*. A subtle, abstract visual on the side or behind — think soft green accent
  shapes or a stylized commit-graph motif. Airy, not busy.
- **How it works:** 3–4 steps with simple icons — *Connect GitHub, run the scan, get the content, paste it into LinkedIn*.
- **What you get:** preview cards of the output types (headline, about, skills, experience),
  hinting at the real result.
- **Trust / privacy strip:** short reassurance — *your data stays auditable, and nothing technically sensitive reaches the generated text*.
- **Closing CTA + minimal footer.**

**Interactions:** smooth scroll, gentle reveal-on-scroll for each section, subtle hover on CTAs.

---

## 2. Login page

**Purpose:** a single action. No friction, no fields.

**Layout:** centered card on a clean background. Wordmark, a short line (*"Sign in to get started"*),
one large **"Sign in with GitHub"** button with the GitHub mark. Below it, tiny muted microcopy about
what's accessed (*"We will read your commits and pull requests to generate your content."*). A small
"← voltar" link to the landing.

**Notes:** single-role app — no email/password, no register/login tabs. Just the GitHub button.

---

## 3. Onboarding page

**Purpose:** collect the scan settings in one clean, friendly screen (not a multi-step wizard).
This is the most form-heavy page — keep it intuitive and warm.

**Layout:** centered, conversational. Title *"Let's scan your GitHub"* with a short subtitle.
A single card/column holding the controls, primary button at the bottom.

**Controls (in order):**
- Toggle — *"Include personal projects"* (default on).
- Toggle — *"Include organization contributions"* (default on). When on, optionally reveal
  org selection as chips (or a simple *"all organizations"* default).
- Date range — *"From"* / *"To"* (optional; defaults to the whole period). Two date inputs.
- Segmented control — *"This content is for..."* → **[ My whole profile ]  [ One specific company ]**.
  When the company option is selected, smoothly reveal three fields: *company name*, *role*, *period*.
- Toggle/segmented — output language: **PT / EN** (default PT).
- Primary button — **"Start scan"**.

**Interactions:** progressive disclosure (company fields appear only when chosen, with a smooth
reveal). Short helper microcopy under the less-obvious fields. Everything on one screen.

---

## 4. Scan progress page

**Purpose:** show the scan running. Keep it alive but calm — reassure, don't bore.

**Layout:** centered, minimal. A horizontal progress bar (green fill, smooth growth) with the
percentage, and a rotating status line beneath it that reflects the real stage:
*"Reading your repositories..."* → *"Analysing commits and PRs..."* → *"Generating your content..."*.
A subtle ambient animation (e.g. a soft pulsing dot or a light scanning shimmer) to signal activity.

**States:**
- **Running:** bar + percentage + status line.
- **Error:** friendly message (*"Something went wrong during the scan."*) + a *"Try again"* button.
- **Done:** auto-redirects to results (no manual click needed).

**Notes:** no fake/placeholder content. Restrained motion, on-brand.

---

## 5. Results page

**Purpose:** present the generated content as labeled, copy-paste-ready blocks. The copy action is
the hero interaction. Highly scannable.

**Layout:** a clean single column of cards. Top: a short heading (*"Done. Here is your content"*)
and a secondary *"Scan again"* action. Each block is a card with: a clear label of **where it
goes on LinkedIn**, the generated content, and a **"Copy"** button (with *"Copied"* feedback).

**Blocks:**
- **Headline** produces a single line of text.
- **The "About" section** produces a paragraph.
- **Competências (Skills)** → the skills as tags/chips, with a "copy all" action.
- **Experience** produces a labeled group; one sub-card per entry showing *company, role, period*
  and a bullet list, each with its own copy button.

**Interactions:** the primary delight is "Copy → Copied" with a brief, satisfying micro-feedback.
Generous spacing between cards so nothing feels dense. Optionally a small "where do I paste this?" hint per
block reinforcing the LinkedIn placement.

**Notes:** read-and-copy only for now (inline editing is a future feature). Keep the page focused on
getting the text out cleanly.

---

*Consistent across all pages: white/green palette, generous whitespace, rounded cards, restrained
smooth motion, pt-BR copy. Green is the accent — use it for CTAs, progress, and active states.*
