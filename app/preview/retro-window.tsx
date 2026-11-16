import type { ReactNode } from "react";

/**
 * A classic desktop-style window: ink outline, striped title bar with a close
 * box, a centred title and a version stamp. Decorative chrome only.
 */
export function RetroWindow({
  title,
  version,
  children,
  tone,
  className = "",
}: {
  title: string;
  version?: string;
  children: ReactNode;
  /** Colour block for the whole window. */
  tone?: "dark" | "pink";
  className?: string;
}) {
  const toneClass = tone ? `tone-${tone}` : "";
  return (
    <section
      aria-label={title}
      className={`flex flex-col border border-foreground bg-background text-foreground ${toneClass} ${className}`}
    >
      <div className="relative flex h-7 shrink-0 items-center border-b border-foreground px-2">
        {/* Horizontal pinstripes, like an old window title bar. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-2 inset-y-[7px] bg-[repeating-linear-gradient(to_bottom,var(--foreground)_0_1px,transparent_1px_3px)]"
        />
        <span aria-hidden="true" className="relative z-10 size-3 border border-foreground bg-background" />
        <span className="label-mono absolute left-1/2 -translate-x-1/2 bg-background px-2 text-foreground">{title}</span>
        {version && <span className="label-mono relative z-10 ml-auto bg-background pl-2 text-muted">{version}</span>}
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
}
