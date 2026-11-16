import Link from "next/link";
import { IconHexagon3d, IconMenu2 } from "@tabler/icons-react";

export function MobileTopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 md:hidden">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"
      >
        <IconMenu2 size={20} stroke={1.75} />
      </button>
      <Link href="/" className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md bg-accent text-accent-ink">
          <IconHexagon3d size={16} stroke={1.75} />
        </span>
        <span className="font-semibold tracking-tight">LAND Explorer</span>
      </Link>
    </header>
  );
}
