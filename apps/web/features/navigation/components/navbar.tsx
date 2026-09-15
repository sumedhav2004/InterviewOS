"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mark } from "@/features/branding";


const navigationItems = [
  { label: "Product", href: "#product" },
  { label: "Solutions", href: "#solutions" },
  { label: "Resources", href: "#resources" },
  { label: "Pricing", href: "#pricing" },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <nav
        className={cn(
          "mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto]",
          "items-center rounded-lg border px-3 py-2",
          "transition-all duration-300",
          "sm:grid-cols-[auto_1fr_auto]",
          scrolled
            ? "border-border bg-background/80 shadow-xl backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <a
          href="#top"
          className="flex min-w-0 items-center gap-2 font-semibold"
        >
          <Mark />
          <span>InterviewOS</span>
        </a>

        <div className="hidden items-center justify-center gap-8 text-sm text-muted-foreground md:flex">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>

          <Button size="sm">
            Get started
            <ArrowUpRight />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-label="Open menu"
        >
          <Menu />
        </Button>
      </nav>
    </header>
  );
}