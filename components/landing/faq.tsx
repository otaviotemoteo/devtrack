// FAQ: native <details> accordion; the +/× marker and open state are pure CSS
// (.qa-plus in landing.css). Copy lives in a plain array so apostrophes need no
// JSX entity escaping.
const FAQ: { q: string; a: string }[] = [
  {
    q: "Does DevTrack change my GitHub or post to my profile?",
    a: "No. Read-only access, nothing written back. You copy and paste — you control every word.",
  },
  {
    q: "What is ATS optimization, and how does the CV feature help?",
    a: "Most companies filter résumés by keywords before a human reads them. We surface those keywords and rewrite weak bullets into impact statements so you get through the screen.",
  },
  {
    q: "Do you edit my LinkedIn for me?",
    a: "No — LinkedIn doesn't allow third-party apps to edit profiles. We generate copy-paste-ready content and show you exactly where each block goes.",
  },
  {
    q: "How does the LinkedIn audit read my profile?",
    a: "You upload your official LinkedIn data export — free, no scraping. An optional profile-URL path exists for advanced use.",
  },
  {
    q: "Does it work with private and organization repos?",
    a: "Yes. You pick exactly which repos to include — personal, private, and org repos are all supported.",
  },
  {
    q: "Does it make things up?",
    a: "No. Everything is grounded in your real commits and PRs. If the work isn't there, we won't claim it.",
  },
  {
    q: "Is my data private?",
    a: "Yes — it's a single-user tool and your data is yours, with a full auditable trail.",
  },
  {
    q: "Is it free?",
    a: "Yes — DevTrack runs entirely on free infrastructure.",
  },
];

export function Faq() {
  return (
    <section className="bg-lp-bg-soft py-24 max-[560px]:py-[70px]">
      <div className="mx-auto max-w-[1120px] px-8 max-[560px]:px-5">
        <div className="mx-auto mb-14 max-w-[660px] text-center">
          <div className="font-lp-mono text-[12.5px] font-bold tracking-[1.8px] text-lp-green-dark uppercase">
            Questions
          </div>
          <h2 className="mt-4 text-[clamp(30px,4vw,44px)] leading-[1.08] font-extrabold tracking-[-0.02em]">
            FAQ
          </h2>
        </div>
        <div className="mx-auto max-w-[800px]">
          {FAQ.map((item) => (
            <details className="border-b border-lp-border" key={item.q}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-1 py-[22px] text-[18.5px] font-bold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="qa-plus" />
              </summary>
              <div className="max-w-[680px] px-1 pb-6 text-[16.5px] leading-[1.6] text-lp-ink-soft">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
