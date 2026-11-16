import { LAND_MAX, LAND_MIN, type ParcelStatus } from "@/lib/land";

/** Visible map window: 640 parcels, read in one batch per chain. */
export const COLS = 32;
export const ROWS = 20;
export const PAN_STEP = 8;

/** Parcel cell colours by status (the map window sets the tone). */
export const CELL_STYLES: Record<ParcelStatus, string> = {
  polygon: "bg-land-polygon/35 border-land-polygon/60 hover:bg-land-polygon/55",
  ethereum: "bg-land-ethereum/35 border-land-ethereum/60 hover:bg-land-ethereum/55",
  contract: "bg-surface-3 border-line-strong hover:bg-line-strong",
  unminted: "bg-surface border-line hover:bg-surface-2",
};

export const clampX0 = (x0: number) => Math.min(LAND_MAX - COLS + 1, Math.max(LAND_MIN, x0));
export const clampY0 = (y0: number) => Math.min(LAND_MAX - ROWS + 1, Math.max(LAND_MIN, y0));
/** Top-left corner of a window centred on (x, y). */
export const windowAround = (x: number, y: number) => ({ x0: clampX0(x - COLS / 2), y0: clampY0(y - ROWS / 2) });
