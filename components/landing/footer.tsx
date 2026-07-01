import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <Logo href="#top" />
        <div className="meta">Built on free tiers · GitHub → AI → your profile</div>
      </div>
    </footer>
  );
}
