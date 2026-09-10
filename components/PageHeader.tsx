import Link from "next/link";

export function PageHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex items-center gap-3 mb-5">
      <Link
        href="/"
        className="w-11 h-11 border border-line rounded-[12px] flex items-center justify-center text-fg no-underline text-2xl flex-shrink-0 hover:bg-surface-2 transition-colors"
        aria-label="Retour"
      >
        ‹
      </Link>
      <h1 className="font-display text-[22px] tracking-[-0.02em]">{title}</h1>
      {right && <div className="ml-auto text-xs text-muted">{right}</div>}
    </header>
  );
}
