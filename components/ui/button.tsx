import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-btn font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none";

const sizes = {
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const variants = {
  primary: "bg-green text-white shadow-soft hover:bg-green-dark",
  secondary: "bg-bg text-ink border border-border hover:bg-bg-soft",
  ghost: "bg-transparent text-ink-soft hover:text-ink hover:bg-bg-soft",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
