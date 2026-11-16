"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TopNav } from "./top-nav";
import { SidePanel } from "./side-panel";
import { FRAME, TopCrosses } from "@/components/frame";

export type PanelContent = {
  /** Stable id so pages can tell what is selected, e.g. "parcel:-12,34". */
  id: string;
  title: string;
  body: ReactNode;
};

type ShellContextValue = {
  panel: PanelContent | null;
  openPanel: (content: PanelContent) => void;
  closePanel: () => void;
};

const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside <AppShell>");
  return ctx;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [panel, setPanel] = useState<PanelContent | null>(null);

  // Close the side panel when navigating (state adjusted during render, no effect needed).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setPanel(null);
  }

  const openPanel = useCallback((content: PanelContent) => setPanel(content), []);
  const closePanel = useCallback(() => setPanel(null), []);
  const value = useMemo(() => ({ panel, openPanel, closePanel }), [panel, openPanel, closePanel]);

  return (
    <ShellContext.Provider value={value}>
      <div className="flex h-dvh flex-col overflow-hidden bg-background">
        <TopNav pathname={pathname} />
        <div className="flex min-h-0 flex-1">
          {/* overflow-x-hidden clips the "+" marks where the frame meets the window edge. */}
          <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <div className={`${FRAME} flex flex-1 flex-col`}>
              <div className="flex flex-1 flex-col">{children}</div>
              <footer className="relative flex flex-wrap items-center justify-between gap-2 border-t border-line px-6 py-5 sm:px-10">
                <TopCrosses />
                <span className="label-mono text-subtle">LAND Explorer · Student project</span>
                <span className="text-sm text-subtle">Unofficial. Not affiliated with or endorsed by The Sandbox.</span>
              </footer>
            </div>
          </main>
          <SidePanel panel={panel} onClose={closePanel} />
        </div>
      </div>
    </ShellContext.Provider>
  );
}
