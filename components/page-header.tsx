import type { ReactNode } from "react";
import { TopCrosses } from "@/components/frame";

type PageHeaderProps = {
  step?: string;
  title: string;
  description: ReactNode;
  /** The concept this page demonstrates, shown as a caption to point at while presenting. */
  shows?: string;
  actions?: ReactNode;
};

export function PageHeader({ step, title, description, shows, actions }: PageHeaderProps) {
  return (
    <header className="relative flex flex-col gap-4 border-b border-line px-6 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-10">
      <TopCrosses />
      <div className="flex max-w-2xl flex-col gap-2">
        {step && <p className="label-mono text-accent">{step}</p>}
        <h1 className="display text-5xl sm:text-6xl">{title}</h1>
        <p className="text-lg text-muted">{description}</p>
        {shows && (
          <p className="mt-1 inline-flex w-fit items-center gap-2 border border-line bg-surface px-3 py-1 text-sm text-muted">
            <span className="font-semibold text-foreground">Shows:</span> {shows}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </header>
  );
}

export function PlaceholderCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border border-dashed border-line-strong bg-surface p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted">{children}</p>
    </div>
  );
}
