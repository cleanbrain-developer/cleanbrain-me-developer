import Link from "next/link";
import { Container } from "@/components/layout/container";
import { VisitorBadge } from "@/components/layout/visitor-badge";

const NAV_ITEMS = [
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/lab", label: "Live Lab" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/architecture", label: "Architecture" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-mono text-sm font-semibold tracking-tight text-foreground"
            >
              cleanbrain.developer
            </Link>
            <VisitorBadge />
          </div>
          <nav aria-label="Primary" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </header>
  );
}
