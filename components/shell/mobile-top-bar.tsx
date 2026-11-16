import Link from "next/link";
import { Icon } from "./icons";

export function MobileTopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 md:hidden">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"
      >
        <Icon name="menu" />
      </button>
      <Link href="/" className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md bg-accent text-accent-ink">
          <Icon name="logo" width={16} height={16} />
        </span>
        <span className="font-semibold tracking-tight">LAND Explorer</span>
      </Link>
    </header>
  );
}
