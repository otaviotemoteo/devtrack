# Design Brief — DevTrack

A personal tool that scans your GitHub activity and turns it into LinkedIn-ready content.
Hand this to Claude Design page-by-page or whole. UI copy is **Portuguese (pt-BR)** — example
strings below are the real labels to use.

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
- **Hero:** a confident headline (value prop — e.g. *"Transforme seu trabalho no GitHub em um
  perfil de LinkedIn que impressiona"*), a one-line subhead, a primary CTA button
  *"Entrar com GitHub"*. A subtle, abstract visual on the side or behind — think soft green accent
  shapes or a stylized commit-graph motif. Airy, not busy.
- **How it works:** 3–4 steps with simple icons — *Conecte o GitHub → Faça a varredura →
  A IA gera o conteúdo → Cole no LinkedIn*.
- **What you get:** preview cards of the output types (Título, Sobre, Competências, Experiências),
  hinting at the real result.
- **Trust / privacy strip:** short reassurance — *seus dados ficam auditáveis e nada técnico-sensível
  entra no texto gerado*.
- **Closing CTA + minimal footer.**

**Interactions:** smooth scroll, gentle reveal-on-scroll for each section, subtle hover on CTAs.

---

## 2. Login page

**Purpose:** a single action. No friction, no fields.

**Layout:** centered card on a clean background. Wordmark, a short line (*"Entre para começar"*),
one large **"Entrar com GitHub"** button with the GitHub mark. Below it, tiny muted microcopy about
what's accessed (*"Vamos ler seus commits e pull requests pra gerar seu conteúdo."*). A small
"← voltar" link to the landing.

**Notes:** single-role app — no email/password, no register/login tabs. Just the GitHub button.

---

## 3. Onboarding page

**Purpose:** collect the scan settings in one clean, friendly screen (not a multi-step wizard).
This is the most form-heavy page — keep it intuitive and warm.

**Layout:** centered, conversational. Title *"Vamos varrer seu GitHub"* with a short subtitle.
A single card/column holding the controls, primary button at the bottom.

**Controls (in order):**
- Toggle — *"Incluir projetos pessoais"* (default on).
- Toggle — *"Incluir contribuições em organizações"* (default on). When on, optionally reveal
  org selection as chips (or a simple *"todas as organizações"* default).
- Date range — *"De"* / *"Até"* (optional; default = todo o período). Two date inputs.
- Segmented control — *"Esse conteúdo é pra..."* → **[ Perfil global ]  [ Uma empresa específica ]**.
  When "empresa" is selected, smoothly reveal three fields: *Nome da empresa*, *Cargo*, *Período*.
- Toggle/segmented — output language: **PT / EN** (default PT).
- Primary button — **"Iniciar varredura"**.

**Interactions:** progressive disclosure (company fields appear only when chosen, with a smooth
reveal). Short helper microcopy under the less-obvious fields. Everything on one screen.

---

## 4. Scan progress page

**Purpose:** show the scan running. Keep it alive but calm — reassure, don't bore.

**Layout:** centered, minimal. A horizontal progress bar (green fill, smooth growth) with the
percentage, and a rotating status line beneath it that reflects the real stage:
*"Lendo seus repositórios..."* → *"Analisando commits e PRs..."* → *"Gerando seu conteúdo com IA..."*.
A subtle ambient animation (e.g. a soft pulsing dot or a light scanning shimmer) to signal activity.

**States:**
- **Running:** bar + percentage + status line.
- **Error:** friendly message (*"Algo deu errado na varredura."*) + a *"Tentar de novo"* button.
- **Done:** auto-redirects to results (no manual click needed).

**Notes:** no fake/placeholder content. Restrained motion, on-brand.

---

## 5. Results page

**Purpose:** present the generated content as labeled, copy-paste-ready blocks. The copy action is
the hero interaction. Highly scannable.

**Layout:** a clean single column of cards. Top: a short heading (*"Pronto! Aqui está seu conteúdo"*)
and a secondary *"Varrer de novo"* action. Each block is a card with: a clear label of **where it
goes on LinkedIn**, the generated content, and a **"Copiar"** button (with *"Copiado ✓"* feedback).

**Blocks:**
- **Título do perfil (Headline)** → single line of text.
- **Seção "Sobre"** → a paragraph.
- **Competências (Skills)** → the skills as tags/chips, with a "copy all" action.
- **Experiências** → a labeled group; one sub-card per experience showing *empresa · cargo · período*
  and a bullet list, each with its own copy button.

**Interactions:** the primary delight is "Copiar → Copiado ✓" with a brief, satisfying micro-feedback.
Generous spacing between cards so nothing feels dense. Optionally a small "onde colar isso?" hint per
block reinforcing the LinkedIn placement.

**Notes:** read-and-copy only for now (inline editing is a future feature). Keep the page focused on
getting the text out cleanly.

---

*Consistent across all pages: white/green palette, generous whitespace, rounded cards, restrained
smooth motion, pt-BR copy. Green is the accent — use it for CTAs, progress, and active states.*
