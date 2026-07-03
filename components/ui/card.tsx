interface CardProps {
  children: React.ReactNode;
  className?: string;
  soft?: boolean;
  id?: string;
}

export function Card({ children, className = "", soft = false, id }: CardProps) {
  return (
    <div
      id={id}
      className={`rounded-card border border-border ${
        soft ? "bg-bg-soft" : "bg-bg"
      } shadow-soft ${className}`}
    >
      {children}
    </div>
  );
}
