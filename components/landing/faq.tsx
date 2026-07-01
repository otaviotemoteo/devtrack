// FAQ: native <details> accordion; the +/× marker and open state are pure CSS.
// Copy lives in a plain array so apostrophes need no JSX entity escaping.
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
    <section className="sec sec-soft">
      <div className="wrap">
        <div className="sec-head">
          <div className="eyebrow">Questions</div>
          <h2>FAQ</h2>
        </div>
        <div className="faq">
          {FAQ.map((item) => (
            <details className="qa" key={item.q}>
              <summary>
                {item.q}
                <span className="plus" />
              </summary>
              <div className="ans">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
