export function FocusAreaGrid({ items }: { items: string[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
