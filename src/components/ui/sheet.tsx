"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

/**
 * A minimal shadcn-style Sheet: Radix's Dialog primitive underneath (for
 * focus trapping, Escape-to-close, and a11y wiring "for free"), restyled to
 * this repo's own tokens instead of shadcn's default palette. The first
 * Radix-based primitive in this codebase — added specifically for the
 * RelayHub Live activity drill-down (see ADR-0006's "Update"). Right-side
 * slide-in panel only; no left/top/bottom variants since nothing here needs
 * them yet.
 */
export function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm transition-opacity duration-200 data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md translate-x-0 flex-col border-l border-border bg-surface p-6 shadow-xl transition-transform duration-200 focus:outline-none data-[state=closed]:translate-x-full data-[state=open]:translate-x-0">
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function SheetTitle({ children }: { children: ReactNode }) {
  return <Dialog.Title className="text-lg font-semibold text-foreground">{children}</Dialog.Title>;
}

export function SheetDescription({ children }: { children: ReactNode }) {
  return <Dialog.Description className="mt-1 text-sm text-muted">{children}</Dialog.Description>;
}

export function SheetClose() {
  return (
    <Dialog.Close
      aria-label="Close"
      className="absolute right-4 top-4 rounded-md p-1 text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none"
    >
      ✕
    </Dialog.Close>
  );
}
