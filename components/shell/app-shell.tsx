"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { COLLAPSED_BY_DEFAULT } from "@/lib/nav";
import { Sidebar } from "./sidebar";
import { SidePanel } from "./side-panel";
import { MobileTopBar } from "./mobile-top-bar";

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

  // null = follow the route default; true/false = the user toggled it on this route.
  const [collapsedOverride, setCollapsedOverride] = useState<boolean | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [panel, setPanel] = useState<PanelContent | null>(null);

  // Reset per-route UI when navigating (state adjusted during render, no effect needed).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setCollapsedOverride(null);
    setDrawerOpen(false);
    setPanel(null);
  }

  const collapsed =
    collapsedOverride ?? COLLAPSED_BY_DEFAULT.some((route) => pathname.startsWith(route));

  const openPanel = useCallback((content: PanelContent) => setPanel(content), []);
  const closePanel = useCallback(() => setPanel(null), []);

  const value = useMemo(
    () => ({ panel, openPanel, closePanel }),
    [panel, openPanel, closePanel],
  );

  return (
    <ShellContext.Provider value={value}>
      <div className="flex h-dvh overflow-hidden bg-background">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <Sidebar
            pathname={pathname}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsedOverride(!collapsed)}
          />
        </div>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-black/60"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="relative h-full w-72 max-w-[85vw]">
              <Sidebar
                pathname={pathname}
                collapsed={false}
                onClose={() => setDrawerOpen(false)}
              />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <MobileTopBar onOpenMenu={() => setDrawerOpen(true)} />
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="flex flex-1 flex-col">{children}</div>
            <footer className="border-t border-line px-6 py-4 text-sm text-subtle">
              Unofficial student project. Not affiliated with or endorsed by The Sandbox.
            </footer>
          </main>
        </div>

        <SidePanel panel={panel} onClose={closePanel} />
      </div>
    </ShellContext.Provider>
  );
}
