/** A minimal shadcn-style primitive: local component, not an installed package. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-surface-hover ${className}`.trim()} aria-hidden />;
}
