import type { CSSProperties } from "react";

// The conic-gradient score ring reads its fill from a `--p` custom property.
const ring = (p: number): CSSProperties => ({ ["--p" as string]: p }) as CSSProperties;

// "What you get" (#what): four alternating feature cards, each with a mockup
// preview in the media panel and copy in the body.
export function WhatYouGet() {
  return (
    <section className="sec" id="what">
      <div className="wrap">
        <div className="sec-head">
          <div className="eyebrow">Features</div>
          <h2>What you get</h2>
          <p className="lead">From your real work — copy-paste ready.</p>
        </div>
        <div className="bigcards">
          {/* LinkedIn content */}
          <div className="bigcard">
            <div className="media pcb-dots">
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
            <div className="body">
              <div className="ic">in</div>
              <h3>LinkedIn content</h3>
              <div className="meta">Headline · About · Skills · Experience</div>
              <p>
                Headline, about, skills, and experience — copy-paste ready, in
                your voice.
              </p>
            </div>
          </div>

          {/* CV improvements (reversed) */}
          <div className="bigcard rev">
            <div className="media pcb-dots">
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
                  <div className="ba-label" style={{ color: "var(--ink-faint)" }}>
                    before
                  </div>
                  <div className="bar" style={{ width: "82%" }} />
                  <div
                    className="ba-label"
                    style={{ color: "var(--green-dark)", marginTop: 11 }}
                  >
                    after ✦
                  </div>
                  <div className="bar g" />
                  <div className="bar g" style={{ width: "56%", marginTop: 6 }} />
                </div>
              </div>
            </div>
            <div className="body">
              <div className="ic">✓</div>
              <h3>CV improvements</h3>
              <div className="meta">Score · Before→After · Keywords</div>
              <p>
                A score, before→after bullet rewrites, and the keywords
                you&apos;re missing. Stop getting filtered by ATS.
              </p>
            </div>
          </div>

          {/* LinkedIn audit */}
          <div className="bigcard">
            <div className="media pcb-dots">
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
                    <div className="mini-tag" style={{ color: "var(--ink-faint)" }}>
                      your score
                    </div>
                    <div className="bar" style={{ width: "72%", marginTop: 8 }} />
                    <div className="bar" style={{ width: "50%", marginTop: 6 }} />
                  </div>
                </div>
                <div className="mini-block">
                  <div className="ba-label" style={{ color: "var(--ink-faint)" }}>
                    headline now
                  </div>
                  <div className="bar" style={{ width: "74%", marginTop: 5 }} />
                  <div
                    className="ba-label"
                    style={{ color: "var(--green-dark)", marginTop: 9 }}
                  >
                    improved ✦
                  </div>
                  <div className="bar g" style={{ marginTop: 5 }} />
                </div>
              </div>
            </div>
            <div className="body">
              <div className="ic">◎</div>
              <h3>LinkedIn audit</h3>
              <div className="meta">Score · Gaps · Improved profile</div>
              <p>
                See what&apos;s underselling you, with concrete fixes and an
                improved profile, scored.
              </p>
            </div>
          </div>

          {/* Grounded (reversed) */}
          <div className="bigcard rev">
            <div className="media pcb-dots">
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
                    style={{ fontFamily: "var(--mono)" }}
                    fontSize={11}
                    fill="#5f6863"
                  >
                    commit a1f3c
                  </text>
                  <text
                    x="196"
                    y="26"
                    style={{ fontFamily: "var(--mono)" }}
                    fontSize={11}
                    fill="#237a45"
                  >
                    your bullet
                  </text>
                </svg>
              </div>
            </div>
            <div className="body">
              <div className="ic">{"</>"}</div>
              <h3>Grounded in real work</h3>
              <div className="meta">Commit · PR · Traceable</div>
              <p>
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
