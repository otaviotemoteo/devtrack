"use client";

import { useEffect, useRef } from "react";

const GAPS: { k: string; p: string }[] = [
  { k: "Gap 01", p: "Your LinkedIn reads generic." },
  { k: "Gap 02", p: "Your CV gets filtered before a human sees it." },
  { k: "Gap 03", p: "You undersell what you did." },
];

const FIXES: string[] = [
  "A profile that reflects what you build, in your voice.",
  "ATS-ready bullets and the keywords that get you through the screen.",
  "Impact framing pulled straight from your real commits.",
];

// "Why DevTrack": the radial scan hub. A verbatim port of the reference's inline
// IIFE — it measures layout and draws SVG spokes from each gap/fix card to the
// hub, then animates a scan on click. Lifecycle-managed via useEffect so it
// rebuilds on resize / font load and cleans up its listeners, timers, and the
// DOM nodes it creates on unmount.
export function WhyDevTrack() {
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const svg = board.querySelector<SVGSVGElement>("#radspokes");
    const hub = board.querySelector<HTMLButtonElement>("#radhub");
    const hint = board.querySelector<HTMLElement>("#radhint");
    if (!svg || !hub || !hint) return;
    const lbl = hub.querySelector<HTMLElement>(".lbl");
    const gaps = Array.from(board.querySelectorAll<HTMLElement>(".gcard"));
    const fixes = Array.from(board.querySelectorAll<HTMLElement>(".fcard"));
    const SVGNS = "http://www.w3.org/2000/svg";

    let gLines: SVGElement[] = [];
    let fLines: SVGElement[] = [];
    let dots: HTMLSpanElement[] = [];
    let running = false;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    function ptRel(el: HTMLElement, side: "top" | "bottom") {
      const b = board!.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - b.left,
        y: (side === "bottom" ? r.bottom : r.top) - b.top,
      };
    }

    function line(x1: number, y1: number, x2: number, y2: number, cls: string) {
      const ln = document.createElementNS(SVGNS, "line");
      ln.setAttribute("x1", String(x1));
      ln.setAttribute("y1", String(y1));
      ln.setAttribute("x2", String(x2));
      ln.setAttribute("y2", String(y2));
      ln.setAttribute("class", cls);
      svg!.appendChild(ln);
      return ln;
    }

    function build() {
      if (!board) return;
      const b = board.getBoundingClientRect();
      svg!.setAttribute("viewBox", "0 0 " + b.width + " " + b.height);
      svg!.innerHTML = "";
      gLines = [];
      fLines = [];
      dots.forEach((d) => d.remove());
      dots = [];
      if (getComputedStyle(svg!).display === "none") return;
      const hr = hub!.getBoundingClientRect();
      const hubP = {
        x: hr.left + hr.width / 2 - b.left,
        y: hr.top + hr.height / 2 - b.top,
      };
      gaps.forEach((g) => {
        const p = ptRel(g, "bottom");
        line(p.x, p.y, hubP.x, hubP.y, "base");
        gLines.push(line(p.x, p.y, hubP.x, hubP.y, "flow"));
        const d = document.createElement("span");
        d.className = "gdot";
        d.style.left = p.x + "px";
        d.style.top = p.y + "px";
        board.appendChild(d);
        dots.push(d);
      });
      fixes.forEach((f) => {
        const p = ptRel(f, "top");
        line(hubP.x, hubP.y, p.x, p.y, "base");
        fLines.push(line(hubP.x, hubP.y, p.x, p.y, "flow"));
      });
    }

    function onClick() {
      if (running) return;
      running = true;
      fixes.forEach((f) => f.classList.remove("on"));
      gLines.concat(fLines).forEach((l) => l.classList.remove("on"));
      dots.forEach((d) => d.classList.remove("lit"));
      board!.classList.add("scanning");
      hub!.classList.remove("done");
      if (lbl) lbl.textContent = "Scanning…";
      hint!.textContent = "reading commits & pull requests…";
      timers.push(
        setTimeout(() => {
          gLines.forEach((l) => l.classList.add("on"));
          dots.forEach((d) => d.classList.add("lit"));
        }, 350),
      );
      fixes.forEach((f, i) => {
        timers.push(
          setTimeout(
            () => {
              if (fLines[i]) fLines[i].classList.add("on");
              f.classList.add("on");
            },
            1100 + i * 650,
          ),
        );
      });
      timers.push(
        setTimeout(
          () => {
            board!.classList.remove("scanning");
            hub!.classList.add("done");
            if (lbl) lbl.textContent = "Scan complete — run again";
            hint!.textContent = "every gap connected to its fix ✓";
            running = false;
          },
          1100 + fixes.length * 650 + 300,
        ),
      );
    }

    build();
    window.addEventListener("resize", build);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) build();
      });
    }
    hub.addEventListener("click", onClick);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", build);
      hub.removeEventListener("click", onClick);
      timers.forEach((t) => clearTimeout(t));
      dots.forEach((d) => d.remove());
      svg.innerHTML = "";
    };
  }, []);

  return (
    <section className="bg-lp-bg-soft py-24 max-[560px]:py-[70px]">
      <div className="mx-auto max-w-[1120px] px-8 max-[560px]:px-5">
        <div className="mx-auto mb-14 max-w-[660px] text-center">
          <div className="font-lp-mono text-[12.5px] font-bold tracking-[1.8px] text-lp-green-dark uppercase">
            Why DevTrack
          </div>
          <h2 className="mt-4 text-[clamp(30px,4vw,44px)] leading-[1.08] font-extrabold tracking-[-0.02em]">
            Your work is proof. It just never gets seen.
          </h2>
          <p className="mt-4 text-[20px] leading-[1.55] text-lp-ink-soft">
            Your GitHub is full of proof — shipped features, solved problems,
            real impact. But it never reaches the places that decide your career.
          </p>
        </div>
        <div className="radboard" id="radboard" ref={boardRef}>
          <svg className="radspokes" id="radspokes" preserveAspectRatio="none" />
          <div className="radrow gaps">
            {GAPS.map((g) => (
              <div className="rcard gcard" key={g.k}>
                <span className="rk">{g.k}</span>
                <p>{g.p}</p>
              </div>
            ))}
          </div>
          <button className="radhub" id="radhub" type="button">
            <span className="radar" />
            <span className="lbl">Scan my GitHub</span>
          </button>
          <div className="radhint" id="radhint">
            click to connect your work
          </div>
          <div className="radrow fixes">
            {FIXES.map((t, i) => (
              <div className="rcard fcard" key={i}>
                <span className="ph">awaiting scan…</span>
                <div className="real">
                  <span className="rk">Fixed</span>
                  <span className="t">{t}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
