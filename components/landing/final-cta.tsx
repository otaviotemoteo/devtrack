import Link from "next/link";

// Closing CTA band.
export function FinalCta() {
  return (
    <section className="bg-lp-bg-green py-24 text-center max-[560px]:py-[70px]">
      <div className="mx-auto max-w-[1120px] px-8 max-[560px]:px-5">
        <h2 className="mx-auto mb-[30px] max-w-[720px] text-[clamp(30px,4.2vw,46px)] leading-[1.08] font-extrabold tracking-[-0.02em]">
          Ready to make your work speak for itself?
        </h2>
        <Link
          href="/login"
          className="inline-flex cursor-pointer items-center gap-[10px] rounded-[12px] border-2 border-transparent bg-lp-green px-7 py-4 text-[18px] font-bold text-white shadow-[0_6px_18px_rgba(47,158,90,0.28)] [transition:transform_0.12s_ease,box-shadow_0.2s_ease,background_0.2s_ease] hover:-translate-y-px hover:bg-lp-green-dark hover:shadow-[0_10px_24px_rgba(47,158,90,0.34)]"
        >
          <svg className="h-[19px] w-[19px] shrink-0">
            <use href="#gh" />
          </svg>
          Sign in with GitHub
        </Link>
      </div>
    </section>
  );
}
