import { ETH_LAND_HOLDER_CONTRACT, LAND_GRID_SIZE } from "./contracts";

/** Display coordinates run from -204 to 203 on both axes. */
export const LAND_MIN = -LAND_GRID_SIZE / 2;
export const LAND_MAX = LAND_GRID_SIZE / 2 - 1;

/**
 * Where a parcel lives. A parcel can exist on both chains: once moved to
 * Polygon, the Ethereum copy is held by ETH_LAND_HOLDER_CONTRACT. So the
 * Polygon owner, when there is one, is the current owner.
 */
export type ParcelStatus = "polygon" | "ethereum" | "contract" | "unminted";

export function parcelStatus(polygonOwner: string | undefined, ethereumOwner: string | undefined): ParcelStatus {
  if (polygonOwner) return "polygon";
  if (ethereumOwner && ethereumOwner.toLowerCase() === ETH_LAND_HOLDER_CONTRACT.toLowerCase()) return "contract";
  if (ethereumOwner) return "ethereum";
  return "unminted";
}

export const STATUS_LABEL: Record<ParcelStatus, string> = {
  polygon: "Owned on Polygon",
  ethereum: "Owned on Ethereum",
  contract: "Held by a contract",
  unminted: "Not minted",
};

export function clampCoord(n: number) {
  return Math.min(LAND_MAX, Math.max(LAND_MIN, Math.round(n)));
}

/**
 * Parses search input: "x, y", "(x, y)", "x y" or a token ID ("#100000" / "100000").
 * Returns centred coordinates, or null if the input isn't a valid parcel.
 */
export function parseParcelQuery(input: string): { x: number; y: number } | null {
  const q = input.trim();
  const pair = q.match(/^\(?\s*(-?\d+)\s*[, ]\s*(-?\d+)\s*\)?$/);
  if (pair) {
    const x = Number(pair[1]);
    const y = Number(pair[2]);
    return x >= LAND_MIN && x <= LAND_MAX && y >= LAND_MIN && y <= LAND_MAX ? { x, y } : null;
  }
  const id = q.match(/^#?(\d+)$/);
  if (id) {
    const n = Number(id[1]);
    if (n >= LAND_GRID_SIZE * LAND_GRID_SIZE) return null;
    return { x: (n % LAND_GRID_SIZE) + LAND_MIN, y: Math.floor(n / LAND_GRID_SIZE) + LAND_MIN };
  }
  return null;
}

/** The subset of the metadata JSON we display. All fields are untrusted. */
export type LandMetadata = {
  name?: string;
  description?: string;
  image?: string;
  external_url?: string;
  sandbox?: { name?: string; description?: string };
  properties?: { trait_type?: string; value?: string | number }[];
};

export function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
