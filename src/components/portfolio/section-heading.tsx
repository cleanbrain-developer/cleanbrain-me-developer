export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="font-mono text-xs uppercase tracking-wider text-accent">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      {description ? <p className="mt-2 text-muted">{description}</p> : null}
    </div>
  );
}
