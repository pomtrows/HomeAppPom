export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-surface border border-line rounded-card p-5 ${className}`}
    >
      {children}
    </div>
  );
}
