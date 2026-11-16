import { useSyncExternalStore } from "react";
import { LAND_MAX, LAND_MIN, type ParcelStatus } from "@/lib/land";

/** A visible map window. Each one is read in one batch per chain. */
export type MapSize = { cols: number; rows: number; step: number };

/** 640 parcels on larger screens. */
export const DESKTOP_MAP: MapSize = { cols: 32, rows: 20, step: 8 };
/** 144 parcels on phones, so each cell (~25px) is big enough to tap. */
export const MOBILE_MAP: MapSize = { cols: 12, rows: 12, step: 6 };

const WIDE = "(min-width: 640px)";

/**
 * The map size for the current screen. The server renders the desktop size;
 * phones switch right after hydration (useSyncExternalStore handles that
 * without a hydration mismatch).
 */
export function useMapSize(): MapSize {
  const wide = useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(WIDE);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(WIDE).matches,
    () => true,
  );
  return wide ? DESKTOP_MAP : MOBILE_MAP;
}

/** Parcel cell colours by status (the map window sets the tone). */
export const CELL_STYLES: Record<ParcelStatus, string> = {
  polygon: "bg-land-polygon/35 border-land-polygon/60 hover:bg-land-polygon/55",
  ethereum: "bg-land-ethereum/35 border-land-ethereum/60 hover:bg-land-ethereum/55",
  contract: "bg-surface-3 border-line-strong hover:bg-line-strong",
  unminted: "bg-surface border-line hover:bg-surface-2",
};

/** Keeps the window's top-left corner inside the map. */
export const clampOrigin = (x0: number, y0: number, size: MapSize) => ({
  x0: Math.min(LAND_MAX - size.cols + 1, Math.max(LAND_MIN, x0)),
  y0: Math.min(LAND_MAX - size.rows + 1, Math.max(LAND_MIN, y0)),
});

/** Top-left corner of a window centred on (x, y). */
export const windowAround = (x: number, y: number, size: MapSize) =>
  clampOrigin(Math.round(x - size.cols / 2), Math.round(y - size.rows / 2), size);
