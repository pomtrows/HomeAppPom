import Link from "next/link";

export function WidgetCard({
  href,
  title,
  subtitle,
  children,
}: {
  href: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group block bg-surface border border-line rounded-card p-5 no-underline relative overflow-hidden transition-colors hover:border-white/15"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-display text-lg text-fg leading-tight">{title}</h2>
        <span className="text-muted text-2xl leading-none group-hover:text-fg transition-colors">
          ›
        </span>
      </div>
      {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
      {children && <div className="mt-3">{children}</div>}
    </Link>
  );
}
