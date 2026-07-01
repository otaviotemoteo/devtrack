import "./landing.css";
import { LenisProvider } from "@/components/landing/lenis-provider";
import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { WhyDevTrack } from "@/components/landing/why-devtrack";
import { WhatYouGet } from "@/components/landing/what-you-get";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Auditable } from "@/components/landing/auditable";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

// Marketing landing (logged-out home). Bespoke reference design lives in
// landing.css; each section is its own component. LenisProvider keeps the
// smooth-scroll feel (and drives the HowItWorks scroll-scrub). The #how wrapper
// is the nav anchor target for our existing animated HowItWorks.
export function LandingPage() {
  return (
    <LenisProvider>
      {/* Shared GitHub icon symbol, referenced via <use href="#gh"> in the CTAs. */}
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden="true">
        <symbol id="gh" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.07.78 2.15v3.18c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"
          />
        </symbol>
      </svg>

      <div className="page">
        <Nav />
        <Hero />
        <WhyDevTrack />
        <WhatYouGet />
        <div id="how">
          <HowItWorks />
        </div>
        <Auditable />
        <Faq />
        <FinalCta />
        <Footer />
      </div>
    </LenisProvider>
  );
}
