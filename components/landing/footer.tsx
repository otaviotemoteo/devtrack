import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="border-t border-lp-border py-[30px]">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-5 px-8 max-[560px]:px-5">
        <Logo href="#top" />
        <div className="font-lp-mono text-[13px] text-lp-ink-faint">
          Built on free tiers · GitHub → AI → your profile
        </div>
      </div>
    </footer>
  );
}
