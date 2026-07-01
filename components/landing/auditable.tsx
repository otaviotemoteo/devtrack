// Auditable strip: the concentric-ring radar + the "your data stays auditable" copy.
export function Auditable() {
  return (
    <section className="py-24 max-[560px]:py-[70px]">
      <div className="mx-auto max-w-[1120px] px-8 max-[560px]:px-5">
        <div className="flex items-center gap-7 rounded-[22px] border border-lp-green-soft bg-lp-bg-green px-10 py-[38px] shadow-lp-sm max-[560px]:flex-col max-[560px]:items-center max-[560px]:text-center">
          <div className="radar">
            <span />
            <span />
            <span />
          </div>
          <div>
            <h3 className="text-[22px] leading-[1.08] font-bold tracking-[-0.02em]">
              Your data stays auditable
            </h3>
            <p className="mt-2 max-w-[720px] text-[16px] text-lp-ink-soft">
              Every scan and analysis stores the exact config, the raw data
              collected, and the prompt + model used to generate your content.
              It&apos;s your data — nothing is hidden.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
