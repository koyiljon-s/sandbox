"use client";

import { useEffect } from "react";
import type { PanelContent } from "./app-shell";
import { Icon } from "./icons";

/**
 * Context details for the current selection.
 * Large screens: a right-hand column. Smaller screens: a bottom sheet.
 */
export function SidePanel({ panel, onClose }: { panel: PanelContent | null; onClose: () => void }) {
  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, onClose]);

  if (!panel) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="fixed inset-0 z-30 bg-black/50 lg:hidden"
      />
      <aside
        aria-label={panel.title}
        className="fixed inset-x-0 bottom-0 z-40 flex max-h-[70dvh] flex-col border-t border-line bg-surface lg:static lg:z-auto lg:h-full lg:max-h-none lg:w-80 lg:shrink-0 lg:border-t-0 lg:border-l xl:w-96"
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line px-5">
          <h2 className="truncate text-lg font-semibold">{panel.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{panel.body}</div>
      </aside>
    </>
  );
}
