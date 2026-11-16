"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import { CellGrid, FramedSection } from "@/components/frame";
import { FallbackBanner } from "@/components/data-status";
import { landTokenId } from "@/lib/contracts";
import { LAND_MAX, LAND_MIN, STATUS_LABEL, parseParcelQuery, type ParcelStatus } from "@/lib/land";
import PRESETS from "@/lib/land-presets.json";
import { useLandWindow } from "@/app/land/use-land";
import { ParcelDetails } from "@/app/land/parcel-details";
import { CELL_STYLES, COLS, PAN_STEP, ROWS, clampX0, clampY0, windowAround } from "@/app/land/land-grid";
import { RetroWindow } from "../retro-window";

/** Selected parcel: the typesafe-style pink. */
const SELECTED = "border-[#3d2d31] bg-[#f285a0]";

/**
 * The LAND page as a little desktop: map, parcel info, search and legend each
 * in their own window. Details show beside the map instead of in a side panel.
 */
export function LandDesktop() {
  const first = PRESETS[0];
  const [{ x0, y0 }, setOrigin] = useState(() => windowAround(first.x, first.y));
  // Start with a parcel selected, so Parcel Info is never empty on first load.
  const [selected, setSelected] = useState<{ x: number; y: number } | null>({ x: first.x, y: first.y });
  const [query, setQuery] = useState("");
  const [queryError, setQueryError] = useState<string | null>(null);

  const { statuses, source, snapshotDate, isFetching, isError, retryLive } = useLandWindow(x0, y0, COLS, ROWS);

  const goTo = (x: number, y: number) => {
    setOrigin(windowAround(x, y));
    setSelected({ x, y });
  };
  const pan = (dx: number, dy: number) => setOrigin({ x0: clampX0(x0 + dx), y0: clampY0(y0 + dy) });

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const target = parseParcelQuery(query);
    if (!target) {
      setQueryError(`Try "-164, 41" (${LAND_MIN} to ${LAND_MAX}) or a token ID.`);
      return;
    }
    setQueryError(null);
    goTo(target.x, target.y);
  }

  const mapStatus = source === "fallback" ? "snapshot" : isFetching || !statuses ? "loading…" : "live";
  const count = (s: ParcelStatus) => statuses?.filter((v) => v === s).length;

  return (
    <>
      <FramedSection>
        {source === "fallback" && statuses && (
          <div className="border-t border-line p-4 sm:px-10">
            <FallbackBanner snapshotDate={snapshotDate} onRetry={() => retryLive()} />
          </div>
        )}

        {/* The desktop */}
        <div className="tone-dark border-t border-line bg-background bg-[radial-gradient(var(--line-strong)_1px,transparent_1px)] [background-size:14px_14px] p-4 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Map */}
            <RetroWindow title="LAND Map 2.0" version={mapStatus} tone="dark" className="self-start">
              <div className="relative overflow-x-auto p-3">
                {isError && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/90 p-6 text-center">
                    <IconAlertTriangle size={28} stroke={1.75} className="text-danger" />
                    <p className="text-muted">Blockchain unreachable, and no snapshot found.</p>
                    <button
                      type="button"
                      onClick={() => retryLive()}
                      className="flex items-center gap-2 border border-foreground px-4 py-2 font-medium hover:bg-surface-2"
                    >
                      <IconRefresh size={18} stroke={1.75} /> Try again
                    </button>
                  </div>
                )}
                <div
                  role="grid"
                  aria-label="LAND map"
                  aria-busy={!statuses}
                  className="grid min-w-[560px] gap-0.5"
                  style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: ROWS * COLS }, (_, i) => {
                    const x = x0 + (i % COLS);
                    const y = y0 + Math.floor(i / COLS);
                    const status = statuses?.[i];
                    const isSelected = selected?.x === x && selected?.y === y;
                    const style = isSelected
                      ? SELECTED
                      : status
                        ? CELL_STYLES[status]
                        : "animate-pulse border-line bg-surface-2";
                    return (
                      <button
                        key={`${x},${y}`}
                        type="button"
                        aria-label={`Parcel ${x}, ${y}${status ? `, ${STATUS_LABEL[status]}` : ""}`}
                        aria-pressed={isSelected}
                        title={`(${x}, ${y})${status ? ` · ${STATUS_LABEL[status]}` : ""}`}
                        onClick={() => setSelected({ x, y })}
                        className={`aspect-square border ${style}`}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2">
                <span className="label-mono text-muted">
                  x {x0}→{x0 + COLS - 1} · y {y0}→{y0 + ROWS - 1}
                </span>
                <div className="flex gap-1">
                  <PanButton label="Pan left" onClick={() => pan(-PAN_STEP, 0)} disabled={x0 <= LAND_MIN} icon={<IconArrowLeft size={16} stroke={2} />} />
                  <PanButton label="Pan up" onClick={() => pan(0, -PAN_STEP)} disabled={y0 <= LAND_MIN} icon={<IconArrowUp size={16} stroke={2} />} />
                  <PanButton label="Pan down" onClick={() => pan(0, PAN_STEP)} disabled={y0 + ROWS - 1 >= LAND_MAX} icon={<IconArrowDown size={16} stroke={2} />} />
                  <PanButton label="Pan right" onClick={() => pan(PAN_STEP, 0)} disabled={x0 + COLS - 1 >= LAND_MAX} icon={<IconArrowRight size={16} stroke={2} />} />
                </div>
              </div>
            </RetroWindow>

            <div className="flex flex-col gap-6">
              {/* Search */}
              <RetroWindow title="Find" tone="pink">
                <form onSubmit={onSearch} className="flex flex-col gap-3 p-4">
                  <div className="flex">
                    <label className="flex min-w-0 flex-1 items-center gap-2 border border-foreground bg-surface-3 px-3 focus-within:bg-background">
                      <IconSearch size={16} stroke={2} className="shrink-0" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="-164, 41 or token ID"
                        aria-label="Find a parcel by coordinates or token ID"
                        aria-invalid={!!queryError}
                        className="min-w-0 flex-1 bg-transparent py-2 font-mono text-sm outline-none placeholder:text-muted"
                      />
                    </label>
                    <button type="submit" className="border border-l-0 border-foreground bg-foreground px-4 font-medium text-background">
                      Go
                    </button>
                  </div>
                  {queryError && <p className="text-sm font-medium">{queryError}</p>}
                  <div className="flex flex-wrap gap-1.5">
                    {PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => goTo(p.x, p.y)}
                        className="label-mono border border-foreground px-2 py-1 hover:bg-foreground hover:text-background"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </form>
              </RetroWindow>

              {/* Parcel details, beside the map */}
              <RetroWindow
                title="Parcel Info"
                version={selected ? `#${landTokenId(selected.x, selected.y)}` : undefined}
                className="tone-grey"
              >
                <div className="p-4">
                  {selected ? (
                    <ParcelDetails key={`${selected.x},${selected.y}`} x={selected.x} y={selected.y} />
                  ) : (
                    <p className="font-mono text-sm text-muted">Click a parcel.</p>
                  )}
                </div>
              </RetroWindow>

              {/* Legend */}
              <RetroWindow title="Legend.txt" className="tone-white">
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2 p-4">
                  <LegendItem className={CELL_STYLES.polygon} label="Polygon" />
                  <LegendItem className={CELL_STYLES.ethereum} label="Ethereum" />
                  <LegendItem className={CELL_STYLES.unminted} label="Not minted" />
                  <LegendItem className={SELECTED} label="Selected" />
                </ul>
              </RetroWindow>
            </div>
          </div>
        </div>
      </FramedSection>

      {/* What's in view, as big numbers */}
      <FramedSection label="In view" title={`${(COLS * ROWS).toLocaleString()} parcels on screen`} tone="pink">
        <CellGrid className="md:grid-cols-3">
          <BigNumber value={count("polygon")} label="on Polygon" />
          <BigNumber value={count("ethereum")} label="on Ethereum" />
          <BigNumber value={count("unminted")} label="not minted" />
        </CellGrid>
      </FramedSection>
    </>
  );
}

function PanButton({ label, icon, onClick, disabled }: { label: string; icon: ReactNode; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center border border-foreground hover:bg-foreground hover:text-background disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground"
    >
      {icon}
    </button>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <li className="label-mono flex items-center gap-2 text-muted">
      {/* Swatches use the map's dark tone (on a dark backing), so they match what's on the map. */}
      <span className="tone-dark size-3.5 shrink-0 bg-background">
        <span className={`block size-full border ${className}`} />
      </span>
      {label}
    </li>
  );
}

function BigNumber({ value, label }: { value: number | undefined; label: string }) {
  return (
    <div className="flex flex-col gap-2 bg-background p-6 sm:p-10">
      <span className="text-[clamp(3rem,7vw,6rem)] leading-none font-medium tracking-[-0.05em] tabular-nums">
        {value === undefined ? "—" : value.toLocaleString()}
      </span>
      <span className="label-mono text-muted">{label}</span>
    </div>
  );
}
