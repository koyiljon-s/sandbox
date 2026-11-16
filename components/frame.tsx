import type { ReactNode } from "react";

/**
 * The visible page frame: one centred column whose left and right edges are
 * drawn as lines, from the nav down to the footer. Use FRAME for any element
 * that must line up with those rails.
 */
export const FRAME = "mx-auto w-full max-w-[1320px] border-x border-line";

/** A small "+" drawn where a section line meets a rail. Decorative only. */
export function Cross({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute z-10 size-[11px] ${className}`}>
      <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-line-strong" />
      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-line-strong" />
    </span>
  );
}

/** Crosses on both top corners of a positioned (relative) block. */
export function TopCrosses() {
  return (
    <>
      <Cross className="-top-[6px] -left-[6px]" />
      <Cross className="-top-[6px] -right-[6px]" />
    </>
  );
}

/**
 * A full-width band of the page: a top rule with "+" marks at the rails,
 * a padded heading, then full-bleed content (usually a CellGrid).
 */
export function FramedSection({
  label,
  title,
  lead,
  children,
  divider = true,
  tone,
}: {
  label?: string;
  title?: string;
  lead?: ReactNode;
  children?: ReactNode;
  /** The first band under the nav already has the nav's line above it. */
  divider?: boolean;
  /** Full-width colour band (see .tone-* in globals.css). */
  tone?: "dark" | "pink";
}) {
  const toneClass = tone ? `tone-${tone} bg-background text-foreground` : "";
  return (
    <section className={`relative ${divider ? "border-t border-line" : ""} ${toneClass}`}>
      <TopCrosses />
      {(label || title || lead) && (
        <div className="flex max-w-3xl flex-col gap-3 px-6 pt-12 pb-10 sm:px-10">
          {label && <p className="label-mono text-subtle">{label}</p>}
          {title && <h2 className="display text-4xl sm:text-5xl">{title}</h2>}
          {lead && <p className="text-lg text-muted">{lead}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * Cells that share 1px borders, like a table, instead of floating cards.
 * The lines are the background showing through 1px gaps; give each cell a
 * background (bg-background or bg-surface).
 */
export function CellGrid({ className, children }: { className: string; children: ReactNode }) {
  return <div className={`grid gap-px border-t border-line bg-line ${className}`}>{children}</div>;
}
