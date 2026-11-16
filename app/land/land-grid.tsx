"use client";

import { useState, type FormEvent } from "react";
import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import { useShell } from "@/components/shell/app-shell";
import { LAND_MAX, LAND_MIN, STATUS_LABEL, parseParcelQuery, type ParcelStatus } from "@/lib/land";
import { DataSourceLabel, FallbackBanner } from "@/components/data-status";
import PRESETS from "@/lib/land-presets.json";
import { useLandWindow } from "./use-land";
import { ParcelDetails } from "./parcel-details";

/** Visible window: 640 parcels, read in one batch per chain. */
const COLS = 32;
const ROWS = 20;
const PAN_STEP = 8;

/* PRESETS: parcels checked on-chain while building this page. The snapshot
   saves full details for these, so they still work offline. */

const CELL_STYLES: Record<ParcelStatus, string> = {
  polygon: "bg-land-polygon/35 border-land-polygon/60 hover:bg-land-polygon/55",
  ethereum: "bg-land-ethereum/35 border-land-ethereum/60 hover:bg-land-ethereum/55",
  contract: "bg-surface-3 border-line-strong hover:bg-line-strong",
  unminted: "bg-surface border-line hover:bg-surface-2",
};

const clampX0 = (x0: number) => Math.min(LAND_MAX - COLS + 1, Math.max(LAND_MIN, x0));
const clampY0 = (y0: number) => Math.min(LAND_MAX - ROWS + 1, Math.max(LAND_MIN, y0));
/** Top-left corner of a window centred on (x, y). */
const windowAround = (x: number, y: number) => ({ x0: clampX0(x - COLS / 2), y0: clampY0(y - ROWS / 2) });

export function LandGrid() {
  const { panel, openPanel } = useShell();
  const [{ x0, y0 }, setOrigin] = useState(() => windowAround(PRESETS[0].x, PRESETS[0].y));
  const [query, setQuery] = useState("");
  const [queryError, setQueryError] = useState<string | null>(null);

  const { statuses, source, snapshotDate, isFetching, isError, retryLive } = useLandWindow(x0, y0, COLS, ROWS);

  const select = (x: number, y: number) =>
    openPanel({ id: `parcel:${x},${y}`, title: `LAND (${x}, ${y})`, body: <ParcelDetails key={`${x},${y}`} x={x} y={y} /> });

  const goTo = (x: number, y: number) => {
    setOrigin(windowAround(x, y));
    select(x, y);
  };

  const pan = (dx: number, dy: number) => setOrigin({ x0: clampX0(x0 + dx), y0: clampY0(y0 + dy) });

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const target = parseParcelQuery(query);
    if (!target) {
      setQueryError(`Enter coordinates like "-164, 41" (each from ${LAND_MIN} to ${LAND_MAX}) or a token ID.`);
      return;
    }
    setQueryError(null);
    goTo(target.x, target.y);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      {/* Search + presets */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <form onSubmit={onSearch} className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <label className="flex min-w-0 flex-1 items-center gap-2 border border-line-strong bg-surface px-3 focus-within:border-accent sm:w-80 sm:flex-none">
              <IconSearch size={18} stroke={1.75} className="shrink-0 text-subtle" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Coordinates (-164, 41) or token ID"
                aria-label="Find a parcel by coordinates or token ID"
                aria-invalid={!!queryError}
                className="min-w-0 flex-1 bg-transparent py-2.5 outline-none placeholder:text-subtle"
              />
            </label>
            <button type="submit" className="rounded-lg bg-accent px-4 font-semibold text-accent-ink hover:bg-accent-strong">
              Go
            </button>
          </div>
          {queryError && <p className="text-sm text-danger">{queryError}</p>}
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-subtle">Try:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => goTo(p.x, p.y)}
              className="rounded-lg border border-line-strong px-3 py-1.5 text-sm font-medium hover:bg-surface-2"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend + status */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
        <Legend className={CELL_STYLES.polygon} label={STATUS_LABEL.polygon} />
        <Legend className={CELL_STYLES.ethereum} label={STATUS_LABEL.ethereum} />
        <Legend className={CELL_STYLES.contract} label={STATUS_LABEL.contract} />
        <Legend className={CELL_STYLES.unminted} label={STATUS_LABEL.unminted} />
        <Legend className="bg-accent border-accent" label="Selected" />
        <span className="ml-auto">
          <DataSourceLabel source={source} isFetching={isFetching} snapshotDate={snapshotDate} hasData={!!statuses} />
        </span>
      </div>

      {source === "fallback" && statuses && <FallbackBanner snapshotDate={snapshotDate} onRetry={() => retryLive()} />}

      {/* Map */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3 text-sm text-muted">
          <span className="font-mono">
            x {x0} → {x0 + COLS - 1} · y {y0} → {y0 + ROWS - 1}
          </span>
          <div className="flex gap-1">
            <PanButton label="Pan left" onClick={() => pan(-PAN_STEP, 0)} disabled={x0 <= LAND_MIN} icon={<IconArrowLeft size={18} stroke={1.75} />} />
            <PanButton label="Pan up" onClick={() => pan(0, -PAN_STEP)} disabled={y0 <= LAND_MIN} icon={<IconArrowUp size={18} stroke={1.75} />} />
            <PanButton label="Pan down" onClick={() => pan(0, PAN_STEP)} disabled={y0 + ROWS - 1 >= LAND_MAX} icon={<IconArrowDown size={18} stroke={1.75} />} />
            <PanButton label="Pan right" onClick={() => pan(PAN_STEP, 0)} disabled={x0 + COLS - 1 >= LAND_MAX} icon={<IconArrowRight size={18} stroke={1.75} />} />
          </div>
        </div>

        <div className="relative overflow-x-auto border border-line bg-surface p-3">
          {isError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-surface/90 p-6 text-center">
              <IconAlertTriangle size={28} stroke={1.75} className="text-danger" />
              <p className="max-w-sm text-muted">
                Couldn&apos;t reach the blockchain, and no saved snapshot was found.
              </p>
              <button
                type="button"
                onClick={() => retryLive()}
                className="flex items-center gap-2 rounded-lg border border-line-strong px-4 py-2 font-semibold hover:bg-surface-2"
              >
                <IconRefresh size={18} stroke={1.75} /> Try again
              </button>
            </div>
          )}
          <div
            role="grid"
            aria-label="LAND map"
            aria-busy={!statuses}
            className="grid min-w-[640px] gap-0.5"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: ROWS * COLS }, (_, i) => {
              const x = x0 + (i % COLS);
              const y = y0 + Math.floor(i / COLS);
              const status = statuses?.[i];
              const selected = panel?.id === `parcel:${x},${y}`;
              const style = selected
                ? "border-accent bg-accent"
                : status
                  ? CELL_STYLES[status]
                  : "animate-pulse border-line bg-surface-2";
              return (
                <button
                  key={`${x},${y}`}
                  type="button"
                  aria-label={`Parcel ${x}, ${y}${status ? `, ${STATUS_LABEL[status]}` : ""}`}
                  aria-pressed={selected}
                  title={`(${x}, ${y})${status ? ` · ${STATUS_LABEL[status]}` : ""}`}
                  onClick={() => select(x, y)}
                  className={`aspect-square rounded-[3px] border ${style}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PanButton({ label, icon, onClick, disabled }: { label: string; icon: React.ReactNode; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex size-9 items-center justify-center rounded-lg border border-line-strong text-muted hover:bg-surface-2 hover:text-foreground disabled:opacity-40"
    >
      {icon}
    </button>
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
