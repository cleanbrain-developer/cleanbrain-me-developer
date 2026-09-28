/** A minimal shadcn-style primitive: local component, not an installed package. */
export function Separator({ className = "" }: { className?: string }) {
  return <hr className={`border-t border-border ${className}`.trim()} />;
}
