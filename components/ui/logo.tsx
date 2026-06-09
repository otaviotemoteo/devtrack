import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  /** Render only the mark, no wordmark. */
  markOnly?: boolean;
  href?: string;
  className?: string;
}

export function Logo({ markOnly = false, href = "/", className = "" }: LogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/images/logo.svg"
        alt="DevTrack"
        width={32}
        height={32}
        className="h-8 w-8 object-contain"
        unoptimized
      />
      {!markOnly && (
        <span className="font-display text-lg font-bold tracking-tight text-ink">
          DevTrack
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label="DevTrack home">
        {content}
      </Link>
    );
  }
  return content;
}
