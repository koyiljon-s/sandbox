"use client";

import Link from "next/link";
import { useState } from "react";
import { IconArrowRight, IconHexagon3d, IconMenu2, IconX } from "@tabler/icons-react";
import { NAV_ITEMS, isActive } from "@/lib/nav";
import { AnimatedLetters } from "@/components/animated-letters";
import { FRAME } from "@/components/frame";

export function TopNav({ pathname }: { pathname: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu when the route changes.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  return (
    <header className="relative z-40 shrink-0 border-b border-line bg-background">
      <div className={`${FRAME} flex h-16 items-center gap-8 px-6 sm:px-10`}>
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex size-8 items-center justify-center bg-foreground text-background">
            <IconHexagon3d size={18} stroke={1.75} />
          </span>
          <span className="text-lg font-semibold tracking-[-0.03em]">LAND Explorer</span>
        </Link>

        {/* Desktop links */}
        <nav aria-label="Main" className="hidden flex-1 md:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flip block px-3.5 py-1.5 text-[15px] tracking-[-0.01em] ${
                      active ? "bg-foreground text-background" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <AnimatedLetters text={item.label} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Link
          href="/land"
          className="group ml-auto hidden items-center gap-2 bg-accent px-4 py-2 text-[15px] font-medium text-accent-ink hover:bg-accent-strong sm:flex"
        >
          Explore the map
          <IconArrowRight size={16} stroke={2} className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="ml-auto flex size-10 items-center justify-center text-foreground hover:bg-surface-2 sm:ml-0 md:hidden"
        >
          {menuOpen ? <IconX size={20} stroke={1.75} /> : <IconMenu2 size={20} stroke={1.75} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav aria-label="Main" className="absolute inset-x-0 top-full border-b border-line bg-background md:hidden">
          <ul className="flex flex-col p-3">
            {NAV_ITEMS.map((item, i) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-baseline gap-3 px-3 py-3 text-2xl font-medium tracking-[-0.03em] ${
                      active ? "text-accent" : "text-foreground hover:bg-surface-2"
                    }`}
                  >
                    <span className="label-mono text-subtle">0{i + 1}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
