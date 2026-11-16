"use client";

import { useLayoutEffect } from "react";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";
import { Icon } from "./icons";

function readStoredTheme(): Theme | null {
  try {
    const t = localStorage.getItem(THEME_STORAGE_KEY);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
}

/**
 * The current theme lives only on <html data-theme>, never in React state, so
 * server and client render identical markup. The icon and label switch via CSS.
 */
export function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  // React's dev-mode remount clears the attribute the inline script set; re-apply it.
  useLayoutEffect(() => {
    const stored = readStoredTheme();
    if (stored) document.documentElement.setAttribute("data-theme", stored);
  }, []);

  function toggle() {
    const current = document.documentElement.getAttribute("data-theme");
    const next: Theme = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage unavailable (private window etc.): the switch still works for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light or dark theme"
      title="Toggle light / dark theme"
      className={`flex items-center gap-2 rounded-lg py-2 text-sm text-muted hover:bg-surface-2 hover:text-foreground ${
        collapsed ? "justify-center px-0" : "px-2"
      }`}
    >
      <Icon name="moon" width={18} height={18} className="shrink-0 dark:hidden" />
      <Icon name="sun" width={18} height={18} className="hidden shrink-0 dark:block" />
      {!collapsed && (
        <>
          <span className="dark:hidden">Dark mode</span>
          <span className="hidden dark:inline">Light mode</span>
        </>
      )}
    </button>
  );
}
