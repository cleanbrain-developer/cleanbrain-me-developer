import Link from "next/link";

interface RelatedLink {
  label: string;
  href: string;
}

export function RelatedLinks({ links }: { links: RelatedLink[] }) {
  if (links.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">See it in:</span>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-foreground"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
