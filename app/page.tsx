import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { LenisProvider } from "@/components/landing/lenis-provider";
import { Reveal } from "@/components/landing/reveal";

function GitHubMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.85 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.79.62-3.38-1.37-3.38-1.37-.46-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.4 9.4 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function CtaButton({ size = "md" }: { size?: "md" | "lg" }) {
  const pad = size === "lg" ? "px-7 py-3.5 text-base" : "px-6 py-3";
  return (
    <Link
      href="/login"
      className={`inline-flex items-center gap-2.5 rounded-btn bg-green font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-green-dark ${pad}`}
    >
      <GitHubMark className="h-5 w-5" />
      Sign in with GitHub
    </Link>
  );
}

const STEPS = [
  { n: 1, title: "Connect GitHub", body: "Sign in once. We read your commits and pull requests — nothing is written back." },
  { n: 2, title: "Run the scan", body: "Pick your sources and time range. DevTrack analyzes your real activity." },
  { n: 3, title: "AI writes your content", body: "Impact-focused copy, tuned for a global profile or a specific company." },
  { n: 4, title: "Paste into LinkedIn", body: "Copy each block into the matching field. You stay in control of every word." },
];

const OUTPUTS = [
  { tag: "Headline", body: "A sharp one-liner that captures what you actually build." },
  { tag: "About", body: "A first-person summary that reads like you, not a résumé." },
  { tag: "Skills", body: "The technologies your work genuinely demonstrates." },
  { tag: "Experience", body: "Impact bullets per company, grounded in real commits." },
];

export default function LandingPage() {
  return (
    <LenisProvider>
      <div className="min-h-screen bg-bg">
        {/* Header */}
        <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Logo />
          <Link
            href="/login"
            className="rounded-btn border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-bg-soft"
          >
            Sign in
          </Link>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <p className="eyebrow mb-5">github → linkedin</p>
              <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl">
                Turn your GitHub work into a LinkedIn profile that stands out
              </h1>
              <p className="mt-6 max-w-md text-lg text-ink-soft">
                DevTrack reads your real commits and pull requests, then writes
                copy-paste-ready LinkedIn content — headline, about, skills and
                experience.
              </p>
              <div className="mt-9">
                <CtaButton size="lg" />
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card border border-border bg-bg-soft shadow-soft">
                <CommitGraphMotif />
              </div>
            </Reveal>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-border bg-bg-soft">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <Reveal>
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
                How it works
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <Reveal key={step.n} delay={i * 80}>
                  <div className="h-full rounded-card border border-border bg-bg p-6 shadow-soft">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-green-soft font-mono text-sm font-medium text-green-dark">
                      {step.n}
                    </span>
                    <h3 className="mt-5 text-[17px] font-semibold text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* What you get */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
              What you get
            </h2>
            <p className="mt-2 text-ink-soft">
              Copy-paste-ready blocks for your profile.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {OUTPUTS.map((out, i) => (
              <Reveal key={out.tag} delay={i * 80}>
                <div className="h-full rounded-card border border-border bg-bg p-6 shadow-soft">
                  <span className="inline-flex items-center gap-2 rounded-chip bg-green-soft px-3 py-1 text-sm font-medium text-green-dark">
                    <span className="h-1.5 w-1.5 rounded-full bg-green" />
                    {out.tag}
                  </span>
                  <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                    {out.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Trust strip */}
          <Reveal delay={120}>
            <div className="mt-6 flex items-center gap-4 rounded-card border border-green/20 bg-green-soft px-6 py-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-green/40">
                <span className="h-2.5 w-2.5 rounded-full bg-green" />
              </span>
              <div>
                <p className="font-semibold text-ink">Your data stays auditable</p>
                <p className="text-sm text-ink-soft">
                  Every scan stores the exact config, the raw data collected, and
                  the prompt + model used to generate your content.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-border bg-bg-soft">
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            <Reveal>
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Ready to level up your profile?
              </h2>
              <div className="mt-8 flex justify-center">
                <CtaButton size="lg" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Footer */}
        <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Logo />
          <p className="text-sm text-ink-soft">
            Built on free tiers · GitHub → AI → LinkedIn
          </p>
        </footer>
      </div>
    </LenisProvider>
  );
}

/** Abstract commit-graph motif for the hero. */
function CommitGraphMotif() {
  const nodes = [
    { x: 60, y: 200 },
    { x: 140, y: 150 },
    { x: 220, y: 210 },
    { x: 300, y: 120 },
    { x: 300, y: 250 },
    { x: 390, y: 90 },
    { x: 400, y: 180 },
    { x: 470, y: 230 },
  ];
  const edges = [
    [0, 1],
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 5],
    [3, 6],
    [6, 7],
    [4, 7],
  ];
  return (
    <svg
      viewBox="0 0 520 340"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="var(--color-green)"
          strokeOpacity="0.35"
          strokeWidth="2"
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="13" fill="var(--color-green-soft)" />
          <circle cx={n.x} cy={n.y} r="6" fill="var(--color-green)" />
        </g>
      ))}
    </svg>
  );
}
