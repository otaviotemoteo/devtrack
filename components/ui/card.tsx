interface CardProps {
  children: React.ReactNode;
  className?: string;
  soft?: boolean;
}

export function Card({ children, className = "", soft = false }: CardProps) {
  return (
    <div
      className={`rounded-card border border-border ${
        soft ? "bg-bg-soft" : "bg-bg"
      } shadow-soft ${className}`}
    >
      {children}
    </div>
  );
}
