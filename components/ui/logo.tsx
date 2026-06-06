import Link from "next/link";

interface LogoProps {
  /** Render only the mark, no wordmark. */
  markOnly?: boolean;
  href?: string;
  className?: string;
}

export function Logo({ markOnly = false, href = "/", className = "" }: LogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-green text-white shadow-soft">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          {/* "D" as a soft play mark */}
          <path
            d="M8 6.5c0-.6.66-.96 1.16-.64l8.2 5.3a.76.76 0 0 1 0 1.28l-8.2 5.3A.76.76 0 0 1 8 17.5V6.5Z"
            fill="currentColor"
          />
        </svg>
      </span>
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
