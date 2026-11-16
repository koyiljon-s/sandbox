"use client";

import { useQuery } from "@tanstack/react-query";
import type { LandMetadata, ParcelStatus } from "./land";

/** Shape of public/demo/land-snapshot.json, written by `npm run snapshot`. */
export type SnapshotParcel = {
  tokenId: string;
  x: number;
  y: number;
  polygonOwner?: `0x${string}`;
  ethereumOwner?: `0x${string}`;
  metadataChain?: "polygon" | "ethereum";
  metadata?: LandMetadata;
};

export type LandSnapshot = {
  createdAt: string;
  gridSize: number;
  counts: Record<string, number>;
  /** One character per parcel, indexed by token ID. */
  statuses: string;
  parcels: Record<string, SnapshotParcel>;
};

const CODES: Record<string, ParcelStatus> = { p: "polygon", e: "ethereum", c: "contract", u: "unminted" };

export function snapshotStatus(snapshot: LandSnapshot, tokenId: bigint): ParcelStatus | undefined {
  return CODES[snapshot.statuses[Number(tokenId)]];
}

/**
 * Loads the snapshot once and keeps it for the session. It comes from this
 * app's own server, so it still loads when the blockchain RPC is unreachable.
 */
export function useLandSnapshot() {
  return useQuery({
    queryKey: ["land-snapshot"],
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
    queryFn: async ({ signal }) => {
      const res = await fetch("/demo/land-snapshot.json", { signal });
      if (!res.ok) throw new Error(`Snapshot not found (${res.status}). Run "npm run snapshot".`);
      return (await res.json()) as LandSnapshot;
    },
  });
}

export function formatSnapshotDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
