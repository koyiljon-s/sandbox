"use client";

import { useShell } from "@/components/shell/app-shell";

/*
 * Placeholder grid with generated sample data, so the layout and side panel
 * can be tried before the real contract reads are wired in.
 */
const COLS = 32;
const ROWS = 20;
const X0 = -COLS / 2;
const Y0 = -ROWS / 2;

type ParcelKind = "estate" | "owned" | "empty";

function kindOf(x: number, y: number): ParcelKind {
  if (x >= -4 && x <= -1 && y >= -3 && y <= 0) return "estate";
  if (x >= 6 && x <= 8 && y >= 3 && y <= 5) return "estate";
  if ((Math.abs(x * 7 + y * 13) % 9) < 4) return "owned";
  return "empty";
}

const CELL_STYLES: Record<ParcelKind, string> = {
  estate: "bg-estate-soft border-estate/40 hover:bg-estate/40",
  owned: "bg-surface-3 border-line-strong hover:bg-line-strong",
  empty: "bg-surface border-line hover:bg-surface-2",
};

export function LandGrid() {
  const { panel, openPanel } = useShell();

  const select = (x: number, y: number, kind: ParcelKind) => {
    openPanel({
      id: `parcel:${x},${y}`,
      title: `Parcel (${x}, ${y})`,
      body: <ParcelDetails x={x} y={y} kind={kind} />,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
        <Legend className="bg-surface-3 border-line-strong" label="Owned" />
        <Legend className="bg-estate-soft border-estate/40" label="ESTATE" />
        <Legend className="bg-surface border-line" label="Unclaimed" />
        <Legend className="bg-accent border-accent" label="Selected" />
        <span className="ml-auto rounded-full bg-surface-2 px-3 py-1 text-xs">Sample data</span>
      </div>

      <div className="overflow-x-auto border border-line bg-surface p-3">
        <div
          role="grid"
          aria-label="LAND map"
          className="grid min-w-[640px] gap-0.5"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: ROWS * COLS }, (_, i) => {
            const x = X0 + (i % COLS);
            const y = Y0 + Math.floor(i / COLS);
            const kind = kindOf(x, y);
            const selected = panel?.id === `parcel:${x},${y}`;
            return (
              <button
                key={i}
                type="button"
                aria-label={`Parcel ${x}, ${y}, ${kind}`}
                aria-pressed={selected}
                onClick={() => select(x, y, kind)}
                className={`aspect-square rounded-[3px] border ${
                  selected ? "border-accent bg-accent" : CELL_STYLES[kind]
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`size-3.5 rounded-[3px] border ${className}`} />
      {label}
    </span>
  );
}

function ParcelDetails({ x, y, kind }: { x: number; y: number; kind: ParcelKind }) {
  const rows: [string, string][] = [
    ["Coordinates", `(${x}, ${y})`],
    ["Status", kind === "empty" ? "Unclaimed" : kind === "estate" ? "Part of an ESTATE" : "Owned"],
    ["Token ID", "Loaded from contract"],
    ["Owner", kind === "empty" ? "None" : "Loaded from contract"],
  ];

  return (
    <div className="flex flex-col gap-5">
      <dl className="flex flex-col divide-y divide-line border border-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-subtle">
        Placeholder details. The next step reads these values from the LAND contract.
      </p>
    </div>
  );
}
