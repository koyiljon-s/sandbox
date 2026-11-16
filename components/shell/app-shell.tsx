"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TopNav } from "./top-nav";
import { FRAME, TopCrosses } from "@/components/frame";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <TopNav pathname={pathname} />
      {/* overflow-x-hidden clips the "+" marks where the frame meets the window edge. */}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
        <div className={`${FRAME} flex flex-1 flex-col`}>
          <div className="flex flex-1 flex-col">{children}</div>
          <footer className="relative flex flex-wrap items-center justify-between gap-2 border-t border-line px-6 py-5 sm:px-10">
            <TopCrosses />
            <span className="label-mono text-md text-subtle">LAND Explorer · Student project</span>
            <span className="text-md text-subtle">Unofficial · Not affiliated with The Sandbox</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
