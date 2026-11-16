import Link from "next/link";
import { NAV_ITEMS, isActive } from "@/lib/nav";
import {
  IconHexagon3d,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconX,
} from "@tabler/icons-react";
import { ThemeToggle } from "./theme-toggle";
import { NetworkBadge } from "@/components/wallet/network-badge";
import { WalletButton } from "@/components/wallet/wallet-button";

type SidebarProps = {
  pathname: string;
  collapsed: boolean;
  /** Desktop: toggles icon-only mode. */
  onToggleCollapse?: () => void;
  /** Mobile drawer: closes it. */
  onClose?: () => void;
  demoMode: boolean;
  onDemoModeChange: (value: boolean) => void;
};

export function Sidebar({
  pathname,
  collapsed,
  onToggleCollapse,
  onClose,
  demoMode,
  onDemoModeChange,
}: SidebarProps) {
  return (
    <aside
      className={`flex h-full flex-col border-r border-line bg-surface transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand + collapse control */}
      <div className={`flex h-16 items-center gap-3 border-b border-line ${collapsed ? "justify-center" : "px-4"}`}>
        {!collapsed && (
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-ink">
              <IconHexagon3d size={18} stroke={1.75} />
            </span>
            <span className="truncate text-lg font-semibold tracking-tight">LAND Explorer</span>
          </Link>
        )}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"
          >
            {collapsed ? (
              <IconLayoutSidebarLeftExpand size={20} stroke={1.75} />
            ) : (
              <IconLayoutSidebarLeftCollapse size={20} stroke={1.75} />
            )}
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"
          >
            <IconX size={20} stroke={1.75} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav aria-label="Main" className="flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ icon: NavIcon, ...item }, index) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  className={`group flex items-center gap-3 rounded-lg py-2.5 ${
                    collapsed ? "justify-center px-0" : "px-3"
                  } ${
                    active
                      ? "bg-accent-soft text-accent"
                      : "text-muted hover:bg-surface-2 hover:text-foreground"
                  }`}
                >
                  <NavIcon size={20} stroke={1.75} className="shrink-0" />
                  {!collapsed && (
                    <span className="flex min-w-0 flex-col">
                      <span className="font-medium leading-tight">
                        <span className="mr-1.5 font-mono text-xs text-subtle">0{index + 1}</span>
                        {item.label}
                      </span>
                      <span className="truncate text-xs text-subtle">{item.caption}</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Status + wallet */}
      <div className="flex flex-col gap-2 border-t border-line p-3">
        <ThemeToggle collapsed={collapsed} />
        <label
          title="Use the saved snapshot instead of live blockchain reads"
          className={`flex cursor-pointer items-center gap-2 rounded-lg py-2 text-sm text-muted hover:bg-surface-2 ${
            collapsed ? "justify-center px-0" : "px-2"
          }`}
        >
          <input
            type="checkbox"
            checked={demoMode}
            onChange={(e) => onDemoModeChange(e.target.checked)}
            className="size-4 accent-[var(--accent)]"
            aria-label="Demo mode"
          />
          {!collapsed && <span>Demo mode</span>}
        </label>

        <NetworkBadge collapsed={collapsed} />
        <WalletButton collapsed={collapsed} />
      </div>
    </aside>
  );
}
