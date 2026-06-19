import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { LenisProvider } from "@/components/landing/lenis-provider";
import { Reveal } from "@/components/landing/reveal";
import { CtaButton } from "@/components/landing/cta-button";
import { CommitGraph } from "@/components/landing/commit-graph";
import { HowItWorks } from "@/components/landing/how-it-works";

const OUTPUTS = [
  { tag: "Headline", body: "A sharp one-liner that captures what you actually build." },
  { tag: "About", body: "A first-person summary that reads like you, not a résumé." },
  { tag: "Skills", body: "The technologies your work genuinely demonstrates." },
  { tag: "Experience", body: "Impact bullets per company, grounded in real commits." },
];

export function LandingPage() {
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
                <CommitGraph />
              </div>
            </Reveal>
          </div>
        </section>

        {/* How it works (scroll-synced centerpiece) */}
        <div id="how-it-works">
          <HowItWorks />
        </div>

        {/* What you get */}
        <section id="what-you-get" className="mx-auto max-w-6xl px-6 py-16">
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
                <div className="h-full rounded-card border border-border bg-bg p-6 shadow-soft transition-transform duration-300 hover:-translate-y-1">
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
                <span className="relative inline-flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green opacity-60 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green" />
                </span>
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
                <CtaButton size="lg" glow />
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
