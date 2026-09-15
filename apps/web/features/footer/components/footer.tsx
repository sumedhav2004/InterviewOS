import { Mark } from '@/features/branding';
import React from 'react'

type Props = {}
const productLinks = [
  { label: "Product", href: "#product" },
  { label: "Solutions", href: "#solutions" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "#resources" },
  { label: "Documentation", href: "#documentation" },
  { label: "Changelog", href: "#changelog" },
];

const companyLinks = [
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
  { label: "Privacy", href: "#privacy" },
  { label: "Terms", href: "#terms" },
];

export function Footer() {
  return (
    <footer
      id="resources"
      className="border-t border-border px-4 py-14 sm:px-6"
    >
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1fr_auto_auto]">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <Mark />
            <span>InterviewOS</span>
          </div>

          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            The modern workspace for technical interviews.
          </p>
        </div>

        <div>
          <p className="mb-4 font-mono text-[9px] text-muted-foreground">
            PRODUCT
          </p>

          <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
            {productLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 font-mono text-[9px] text-muted-foreground">
            COMPANY
          </p>

          <div className="grid gap-3 text-sm">
            {companyLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl items-center justify-between border-t border-border pt-6 font-mono text-[9px] text-muted-foreground">
        <span>© 2026 InterviewOS</span>
        <span>Built for better signals.</span>
      </div>
    </footer>
  );
}