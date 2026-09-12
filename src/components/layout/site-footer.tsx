import { Container } from "@/components/layout/container";

const FOOTER_LINKS = [
  { href: "https://github.com/cleanbrain-developer", label: "GitHub" },
  { href: "/contact", label: "Contact" },
  { href: "/resume", label: "Resume" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4 py-8 text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} cleanbrain.developer</p>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
