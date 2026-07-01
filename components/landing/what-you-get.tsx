import type { CSSProperties } from "react";

// The conic-gradient score ring reads its fill from a `--p` custom property.
const ring = (p: number): CSSProperties => ({ ["--p" as string]: p }) as CSSProperties;

// Shared classes for the alternating feature cards. The mockup preview
// primitives (.screen/.mini-block/.bar/.pchip/.ba-label/.ring) stay as residual
// CSS classes — decorative repeated bits that gain nothing from utilities.
const CARD =
  "bigcard-frame relative grid grid-cols-[1.05fr_1fr] rounded-[22px] border-[1.5px] border-lp-border bg-white shadow-lp-sm max-[920px]:grid-cols-1";
const BODY = "flex flex-col justify-center px-11 py-[46px]";
const IC =
  "mb-[18px] flex h-12 w-12 items-center justify-center rounded-[13px] bg-lp-green-soft font-lp-mono text-[17px] font-bold text-lp-green-deep";
const H3 = "text-[27px] font-extrabold leading-[1.08] tracking-[-0.02em]";
const META =
  "mt-3 font-lp-mono text-[12px] font-bold tracking-[1.2px] uppercase text-lp-ink-faint";
const P = "mt-[14px] max-w-[420px] text-[16.5px] leading-[1.55] text-lp-ink-soft";
// media panel: `L` = left (normal) card, `R` = right (reversed) card
const MEDIA_L =
  "relative flex min-h-[330px] items-center justify-center overflow-hidden rounded-l-[21px] bg-lp-green-tint p-9 max-[920px]:order-[-1] max-[920px]:min-h-0 max-[920px]:rounded-t-[21px] max-[920px]:rounded-bl-none";
const MEDIA_R =
  "relative order-2 flex min-h-[330px] items-center justify-center overflow-hidden rounded-r-[21px] bg-lp-green-tint p-9 max-[920px]:order-[-1] max-[920px]:min-h-0 max-[920px]:rounded-t-[21px] max-[920px]:rounded-br-none";
const BODY_R = `${BODY} order-1 max-[920px]:order-0`;

// "What you get" (#what): four alternating feature cards, each with a mockup
// preview in the media panel and copy in the body.
export function WhatYouGet() {
  return (
    <section id="what" className="py-24 max-[560px]:py-[70px]">
      <div className="mx-auto max-w-[1120px] px-8 max-[560px]:px-5">
        <div className="mx-auto mb-14 max-w-[660px] text-center">
          <div className="font-lp-mono text-[12.5px] font-bold tracking-[1.8px] text-lp-green-dark uppercase">
            Features
          </div>
          <h2 className="mt-4 text-[clamp(30px,4vw,44px)] leading-[1.08] font-extrabold tracking-[-0.02em]">
            What you get
          </h2>
          <p className="mt-4 text-[20px] leading-[1.55] text-lp-ink-soft">
            From your real work — copy-paste ready.
          </p>
        </div>
        <div className="mx-auto flex max-w-[1000px] flex-col gap-10">
          {/* LinkedIn content */}
          <div className={CARD}>
            <div className={MEDIA_L}>
              <div className="screen">
                <div className="mini-block">
                  <div className="mini-tag">headline</div>
                  <div className="bar" style={{ width: "88%", marginTop: 6 }} />
                </div>
                <div className="mini-block">
                  <div className="mini-tag">about</div>
                  <div className="bar" style={{ marginTop: 6 }} />
                  <div className="bar" style={{ marginTop: 5 }} />
                  <div className="bar" style={{ width: "60%", marginTop: 5 }} />
                </div>
                <div className="mini-block">
                  <div className="mini-tag">skills</div>
                  <div
                    className="row"
                    style={{ marginTop: 8, flexWrap: "wrap", gap: 6 }}
                  >
                    <span className="pchip">react</span>
                    <span className="pchip">node</span>
                    <span className="pchip">graphql</span>
                    <span className="pchip">ci/cd</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={BODY}>
              <div className={IC}>in</div>
              <h3 className={H3}>LinkedIn content</h3>
              <div className={META}>Headline · About · Skills · Experience</div>
              <p className={P}>
                Headline, about, skills, and experience — copy-paste ready, in
                your voice.
              </p>
            </div>
          </div>

          {/* CV improvements (reversed) */}
          <div className={CARD}>
            <div className={MEDIA_R}>
              <div
                className="screen"
                style={{ display: "flex", gap: 18, alignItems: "center", maxWidth: 380 }}
              >
                <div className="ring lg" style={ring(72)}>
                  <i>
                    <b>72</b>
                    <s>/100</s>
                  </i>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="ba-label" style={{ color: "var(--color-lp-ink-faint)" }}>
                    before
                  </div>
                  <div className="bar" style={{ width: "82%" }} />
                  <div
                    className="ba-label"
                    style={{ color: "var(--color-lp-green-dark)", marginTop: 11 }}
                  >
                    after ✦
                  </div>
                  <div className="bar g" />
                  <div className="bar g" style={{ width: "56%", marginTop: 6 }} />
                </div>
              </div>
            </div>
            <div className={BODY_R}>
              <div className={IC}>✓</div>
              <h3 className={H3}>CV improvements</h3>
              <div className={META}>Score · Before→After · Keywords</div>
              <p className={P}>
                A score, before→after bullet rewrites, and the keywords
                you&apos;re missing. Stop getting filtered by ATS.
              </p>
            </div>
          </div>

          {/* LinkedIn audit */}
          <div className={CARD}>
            <div className={MEDIA_L}>
              <div className="screen">
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <div className="ring lg" style={ring(64)}>
                    <i>
                      <b>64</b>
                      <s>/100</s>
                    </i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="mini-tag" style={{ color: "var(--color-lp-ink-faint)" }}>
                      your score
                    </div>
                    <div className="bar" style={{ width: "72%", marginTop: 8 }} />
                    <div className="bar" style={{ width: "50%", marginTop: 6 }} />
                  </div>
                </div>
                <div className="mini-block">
                  <div className="ba-label" style={{ color: "var(--color-lp-ink-faint)" }}>
                    headline now
                  </div>
                  <div className="bar" style={{ width: "74%", marginTop: 5 }} />
                  <div
                    className="ba-label"
                    style={{ color: "var(--color-lp-green-dark)", marginTop: 9 }}
                  >
                    improved ✦
                  </div>
                  <div className="bar g" style={{ marginTop: 5 }} />
                </div>
              </div>
            </div>
            <div className={BODY}>
              <div className={IC}>◎</div>
              <h3 className={H3}>LinkedIn audit</h3>
              <div className={META}>Score · Gaps · Improved profile</div>
              <p className={P}>
                See what&apos;s underselling you, with concrete fixes and an
                improved profile, scored.
              </p>
            </div>
          </div>

          {/* Grounded (reversed) */}
          <div className={CARD}>
            <div className={MEDIA_R}>
              <div
                className="screen"
                style={{
                  maxWidth: 380,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 150,
                }}
              >
                <svg viewBox="0 0 300 150" width="100%">
                  <path
                    d="M40 110 C40 50, 200 90, 250 36"
                    fill="none"
                    stroke="#dfeee5"
                    strokeWidth="3"
                  />
                  <path
                    d="M40 110 C40 50, 200 90, 250 36"
                    fill="none"
                    stroke="#2f9e5a"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="6 9"
                    style={{ animation: "flow 1.6s linear infinite" }}
                  />
                  <circle cx="40" cy="110" r="10" fill="#fff" stroke="#2f9e5a" strokeWidth="3" />
                  <circle cx="150" cy="78" r="6" fill="#2f9e5a" />
                  <circle cx="250" cy="36" r="12" fill="#2f9e5a" />
                  <text
                    x="22"
                    y="135"
                    style={{ fontFamily: "var(--font-lp-mono)" }}
                    fontSize={11}
                    fill="#5f6863"
                  >
                    commit a1f3c
                  </text>
                  <text
                    x="196"
                    y="26"
                    style={{ fontFamily: "var(--font-lp-mono)" }}
                    fontSize={11}
                    fill="#237a45"
                  >
                    your bullet
                  </text>
                </svg>
              </div>
            </div>
            <div className={BODY_R}>
              <div className={IC}>{"</>"}</div>
              <h3 className={H3}>Grounded in real work</h3>
              <div className={META}>Commit · PR · Traceable</div>
              <p className={P}>
                No buzzwords, no invented claims. Every line traces back to an
                actual commit or PR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
